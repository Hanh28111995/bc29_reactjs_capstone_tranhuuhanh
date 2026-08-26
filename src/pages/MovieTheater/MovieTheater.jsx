import { useAsync, safeArray } from "hooks/useAsync";
import React, { useEffect, useState } from "react";
import {
  fetchBranchesAPI,
  fetchLocationListAPI,
} from "../../services/general";
import { Button } from "antd";
import { AimOutlined, SyncOutlined } from "@ant-design/icons";
import "./index.scss";
import { useGeoLocationSelect } from "hooks/useGeoLocationSelect";
import SEO from "components/SEO";

function MovieTheater() {
  // =========================
  // STATES
  // =========================

  const [selectedVungMien, setSelectedVungMien] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [myLocation, setMyLocation] = useState({
    district: "",
    city: "",
    road: "",
    suburb: "",
  });

  // =========================
  // LOCATIONS
  // =========================

  const {
    state: rawLocations = [],
    loading: isLocationsLoading,
    isError: isLocationsError,
    error: locationsError,
  } = useAsync({
    dependencies: [],
    service: fetchLocationListAPI,
    queryKey: ['areas-list', "active"]
  });

  const locations = safeArray(rawLocations);

  // =========================
  // CINEMAS
  // =========================

  const {
    state: rawCinemas = [],
    loading: isCinemasLoading,
    isError: isCinemasError,
    error: cinemasError,
  } = useAsync({
    dependencies: [],
    service: fetchBranchesAPI,
    queryKey: ['branches-list', "active"]
  });

  const allCinemas = safeArray(rawCinemas);

  // =========================
  // GỘP LOADING
  // =========================

  const isLoading = isLocationsLoading || isCinemasLoading;

  // =========================
  // GỘP ERROR
  // =========================

  const isError = isLocationsError || isCinemasError;

  const error = locationsError || cinemasError;

  // =========================
  // GEO LOCATION
  // =========================

  const { decision, isLocating, locate } = useGeoLocationSelect({
    locations,
    cinemas: allCinemas,
    askOnMount: true,

    onSelect: ({ region, district, raw }) => {
      setSelectedVungMien(region);
      setSelectedDistrict(district || "");

      const locationInfo = {
        road: raw?.address?.road || "",
        suburb:
          raw?.address?.suburb ||
          raw?.address?.neighbourhood ||
          "",
        district: raw?.district || "",
        city: raw?.city || "",
      };

      setMyLocation(locationInfo);
    },

    title: "Chia sẻ vị trí",
    content:
      "Bạn có muốn chia sẻ vị trí để tự động chọn khu vực không?",
  });

  // =========================
  // DEFAULT LOCATION
  // =========================

  useEffect(() => {
    if (decision !== "denied") return;
    if (selectedVungMien) return;
    if (!Array.isArray(locations) || locations.length === 0) return;

    const preferred =
      locations.find((r) => r?.vungMien === "TP.HCM") ||
      locations.find((r) =>
        String(r?.vungMien || "")
          .toLowerCase()
          .includes("hcm"),
      ) ||
      locations[0];

    setSelectedVungMien(preferred || null);

    const firstDistrict = preferred?.cumRap?.[0] || "";

    setSelectedDistrict(firstDistrict);
  }, [decision, locations, selectedVungMien]);

  // =========================
  // FILTER CINEMAS
  // =========================

  const filteredCinemas = allCinemas.filter((cinema) => {
    if (!selectedDistrict) return true;

    return String(cinema?.address || "")
      .toLowerCase()
      .includes(String(selectedDistrict).toLowerCase());
  });

  // =========================
  // LOADING
  // =========================

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (isError) {
    return (
      <div className="text-center mt-5">
        <p>Đã có lỗi khi tải danh sách rạp.</p>

        <p>
          {error?.message || "Vui lòng thử lại sau."}
        </p>
      </div>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className="container px-0">
      <SEO
        title="Hệ thống rạp"
        description="Tìm kiếm hệ thống rạp chiếu phim theo khu vực."
      />

      {/* =========================
          FILTER
      ========================= */}

      <div className="d-flex gap-3 my-4 align-items-center">
        {/* VÙNG MIỀN */}

        <select
          className="form-select"
          value={selectedVungMien?._id || ""}
          onChange={(e) => {
            const vung = locations.find(
              (item) => item._id === e.target.value,
            );

            setSelectedVungMien(vung || null);
            setSelectedDistrict("");
          }}
        >
          <option value="">Chọn Tỉnh thành</option>

          {locations.map((loc) => (
            <option key={loc._id} value={loc._id}>
              {loc.vungMien}
            </option>
          ))}
        </select>

        {/* QUẬN / HUYỆN */}

        <select
          className="form-select"
          disabled={!selectedVungMien}
          value={selectedDistrict}
          onChange={(e) =>
            setSelectedDistrict(e.target.value)
          }
        >
          <option value="">Chọn Khu vực</option>

          {selectedVungMien?.cumRap?.map((dist, index) => (
            <option key={index} value={dist}>
              {dist}
            </option>
          ))}
        </select>

        {/* VỊ TRÍ */}

        <Button
          type="default"
          shape="round"
          icon={
            isLocating ? (
              <SyncOutlined spin />
            ) : (
              <AimOutlined />
            )
          }
          onClick={locate}
          loading={isLocating}
          disabled={isLocating}
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #dadce0",
            color: "#1a73e8",
            height: "40px",
          }}
        >
          {isLocating
            ? "Đang xác định..."
            : "Vị trí của tôi"}
        </Button>
      </div>

      {/* =========================
          CURRENT LOCATION
      ========================= */}

      {myLocation.district && (
        <div className="alert alert-info py-2">
          Vị trí của bạn:{" "}
          {myLocation.road && `${myLocation.road}, `}
          {myLocation.suburb && `${myLocation.suburb}, `}
          {myLocation.district}
        </div>
      )}

      {/* =========================
          CINEMA LIST
      ========================= */}

      <div className="row mt-4">
        {filteredCinemas.length > 0 ? (
          filteredCinemas.map((cinema) => (
            <div
              key={cinema._id}
              className="col-md-6 mb-3"
            >
              <div className="card p-3 shadow-sm">
                <h5 className="text-primary">
                  {cinema.branch}
                </h5>

                <p className="small text-muted mb-0">
                  <i className="fas fa-map-pin me-2"></i>

                  {cinema.address || "Chưa có địa chỉ"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center w-100">
            Không tìm thấy rạp nào ở khu vực này.
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieTheater;