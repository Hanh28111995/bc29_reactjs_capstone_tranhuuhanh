import { Modal } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDistance } from "constants/common";

const reverseGeocode = async ({ latitude, longitude }) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
  );
  return res.json();
};

const normalizeCityName = (city) => {
  if (!city) return "";
  if (city.includes("Ho Chi Minh")) return "TP.HCM";
  if (city.includes("Hanoi") || city.includes("Ha Noi")) return "Hà Nội";
  return city;
};

const stripDistrictPrefix = (s) => String(s || "").replace("Quận", "").trim();

const findRegion = (locations, city) => {
  if (!Array.isArray(locations) || locations.length === 0) return null;
  const normalizedCity = normalizeCityName(city);
  const exact = locations.find((loc) => loc?.vungMien === normalizedCity);
  if (exact) return exact;
  return (
    locations.find((loc) => {
      const v = String(loc?.vungMien || "");
      const v2 = v.replace("TP.", "").trim();
      return (
        normalizedCity.includes(v2) ||
        v.includes(normalizedCity) ||
        normalizedCity.includes(v)
      );
    }) || null
  );
};

const findDistrict = ({ region, addressDistrict, cinemas, coords, city }) => {
  const districts = region?.cumRap;
  if (!Array.isArray(districts) || districts.length === 0) return "";

  if (coords && Array.isArray(cinemas) && cinemas.length > 0) {
    const cityName = normalizeCityName(city);
    const cinemasInCity = cinemas.filter((c) =>
      String(c?.address || "").includes(cityName),
    );
    if (cinemasInCity.length > 0) {
      let closest = null;
      let min = Infinity;
      cinemasInCity.forEach((cinema) => {
        try {
          const raw = cinema?.coordinates;
          if (!raw) return;
          let coordsArr = raw;
          if (typeof raw === "string") {
            coordsArr = JSON.parse(raw);
          }
          if (!Array.isArray(coordsArr) || coordsArr.length < 2) return;
          const [lat2, lon2] = coordsArr;
          const dist = getDistance(coords.latitude, coords.longitude, lat2, lon2);
          if (dist < min) {
            min = dist;
            closest = cinema;
          }
        } catch (e) {
          return;
        }
      });
      if (closest?.address) {
        const match = districts.find((distName) =>
          String(closest.address).includes(distName),
        );
        if (match) return match;
      }
    }
  }

  const d = String(addressDistrict || "");
  if (d) {
    const dNorm = stripDistrictPrefix(d);
    const match = districts.find((x) => {
      const xStr = String(x || "");
      const xNorm = stripDistrictPrefix(xStr);
      return (
        d.includes(xStr) ||
        xStr.includes(d) ||
        (dNorm && (dNorm.includes(xNorm) || xNorm.includes(dNorm)))
      );
    });
    if (match) return match;
  }

  return districts[0] || "";
};

export const useGeoLocationSelect = ({
  locations,
  cinemas,
  cinemasProvider,
  askOnMount = true,
  onSelect,
  title = "Chia sẻ vị trí",
  content = "Bạn có muốn chia sẻ vị trí để tự động chọn khu vực không?",
}) => {
  const askedRef = useRef(false);
  const [decision, setDecision] = useState("pending");
  const [isLocating, setIsLocating] = useState(false);

  const locate = useCallback(async () => {
    if (!navigator.geolocation) {
      setDecision("denied");
      throw new Error("Trình duyệt không hỗ trợ định vị");
    }

    setIsLocating(true);
    try {
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
        );
      });

      const data = await reverseGeocode({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const addr = data?.address || {};
      const cityRaw = addr.city || addr.state || "";
      const city = normalizeCityName(cityRaw);
      const district =
        addr.district || addr.city_district || addr.suburb || addr.county || "";

      const region = findRegion(locations, city);
      if (region) {
        let cinemasList = cinemas;
        if (
          typeof cinemasProvider === "function" &&
          (!Array.isArray(cinemasList) || cinemasList.length === 0)
        ) {
          try {
            cinemasList = await cinemasProvider();
          } catch (e) {
            cinemasList = cinemas;
          }
        }

        const selectedDistrict = findDistrict({
          region,
          addressDistrict: district,
          cinemas: cinemasList,
          coords,
          city,
        });
        onSelect?.({
          region,
          regionName: region.vungMien,
          district: selectedDistrict,
          coords: { latitude: coords.latitude, longitude: coords.longitude },
          raw: { city, district, address: addr },
        });
        setDecision("granted");
        return { region, district: selectedDistrict, coords };
      }

      setDecision("denied");
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [cinemas, cinemasProvider, locations, onSelect]);

  useEffect(() => {
    if (!askOnMount || askedRef.current) return;
    if (!Array.isArray(locations) || locations.length === 0) return;

    askedRef.current = true;
    Modal.confirm({
      title,
      content,
      okText: "Cho phép",
      cancelText: "Không",
      onOk: locate,
      onCancel: () => setDecision("denied"),
    });
  }, [askOnMount, locate, locations, title, content]);

  return { decision, isLocating, locate };
};
