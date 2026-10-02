import { useAsync, safeArray } from "hooks/useAsync";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Carousel,
  Empty,
  Spin,
  Tabs,
} from "antd";
import {
  fetchBranchesAPI,
  fetchLocationListAPI,
  fetchMovieListAPI,
  fetchShowBannerAPI,
  fetchShowtimesAPI,
} from "services/general";
import { AimOutlined, EnvironmentOutlined, LinkOutlined, SyncOutlined } from "@ant-design/icons";
import "./index.scss";
import { useGeoLocationSelect } from "hooks/useGeoLocationSelect";
import SEO from "components/SEO";
import Calendar from "modules/showtimeModules/Calendar";
import dayjs from "dayjs";
import { getDistance } from "constants/common";

const getRegionName = (region) => region?.vungMien || region?.name || region?.location || region?.city || "";

const getRegionAreas = (region) => {
  const areas = region?.cumRap || region?.districts || region?.areas || [];
  return Array.isArray(areas)
    ? areas.map((area) => typeof area === "string" ? area : area?.name || area?.location || area?.district).filter(Boolean)
    : [];
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const normalizePlaceName = (value) => {
  const normalized = normalizeText(value)
    .replace(/^(thanh pho|tp|quan|huyen|phuong|p|thi xa|thi tran|district|city|province)\s+/, "")
    .trim();

  if (normalized.includes("ho chi minh") || normalized === "hcm" || normalized === "tphcm" || normalized === "sai gon") {
    return "ho chi minh";
  }
  if (normalized === "ha noi" || normalized === "hanoi") return "ha noi";
  return normalized;
};

const getCinemasInRegion = (region, cinemas) => {
  const areas = getRegionAreas(region).map(normalizePlaceName).filter(Boolean);
  const regionName = normalizePlaceName(getRegionName(region));
  return cinemas.filter((cinema) => {
    const addressParts = `${cinema?.address || ""},${cinema?.region || ""},${cinema?.location || ""}`
      .split(/[,;|]/)
      .map(normalizePlaceName)
      .filter(Boolean);

    return addressParts.includes(regionName) || areas.some((area) => addressParts.includes(area));
  });
};

const parseCoordinates = (coordinates) => {
  try {
    const value = typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates;
    if (Array.isArray(value) && value.length >= 2) return value.map(Number);
    if (value?.latitude != null && value?.longitude != null) return [Number(value.latitude), Number(value.longitude)];
  } catch {
    return null;
  }
  return null;
};

const normalizeDateForApi = (date) => {
  if (!date) return "";
  const match = String(date).match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : date;
};

function MovieTheater() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [manuallySelectedCinemaId, setManuallySelectedCinemaId] = useState(null);
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [cinemaSchedules, setCinemaSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");

  const { state: rawLocations = [], loading: loadingLocations, isError: locationsError } = useAsync({
    service: fetchLocationListAPI,
    queryKey: ["areas-list", "cinema-page"],
  });
  const { state: rawCinemas = [], loading: loadingCinemas, isError: cinemasError } = useAsync({
    service: fetchBranchesAPI,
    queryKey: ["branches-list", "cinema-page"],
  });
  const { state: rawBanners = [], loading: loadingBanners } = useAsync({
    service: fetchShowBannerAPI,
    queryKey: ["cinema-banners", "active"],
  });
  const {
    state: rawMovies = [],
    loading: loadingMovies,
    isError: moviesError,
  } = useAsync({
    service: fetchMovieListAPI,
    queryKey: ["movies-list", "cinema-page"],
  });

  const locations = useMemo(() => {
    const list = safeArray(rawLocations?.locations || rawLocations?.regions || rawLocations);
    return list;
  }, [rawLocations]);
  const cinemas = useMemo(() => {
    const list = safeArray(rawCinemas?.cinemas || rawCinemas?.branches || rawCinemas);
    return list.map((cinema) => ({
      ...cinema,
      branch: cinema.branch || cinema.cinemaName || cinema.name,
    })).filter((cinema) => cinema.branch);
  }, [rawCinemas]);
  const banners = useMemo(() => {
    const list = safeArray(rawBanners?.banners || rawBanners?.items || rawBanners);
    return list.map((item) => item.banner || item.image || item.url).filter(Boolean);
  }, [rawBanners]);
  const movies = useMemo(() => safeArray(rawMovies?.movies || rawMovies?.items || rawMovies), [rawMovies]);
  const currentRegionName = getRegionName(selectedRegion);
  const currentRegionCinemas = useMemo(
    () => getCinemasInRegion(selectedRegion, cinemas),
    [selectedRegion, cinemas],
  );

  const { decision, isLocating, locate } = useGeoLocationSelect({
    locations,
    cinemas,
    askOnMount: true,
    onSelect: ({ region, coords }) => {
      setSelectedRegion(region || null);
      setManuallySelectedCinemaId(null);
      setUserCoordinates(coords || null);
    },
    title: "Chia sẻ vị trí",
    content: "Bạn có muốn chọn rạp gần vị trí hiện tại không?",
  });

  useEffect(() => {
    if (decision !== "denied" || selectedCinema || !locations.length || !cinemas.length) return;
    const defaultRegion = locations.find((region) => normalizeText(getRegionName(region)).includes("hcm")) || locations[0];
    const firstCinema = getCinemasInRegion(defaultRegion, cinemas)[0] || null;
    setSelectedRegion(defaultRegion || null);
    setSelectedCinema(firstCinema);
  }, [decision, selectedCinema, locations, cinemas]);

  useEffect(() => {
    if (!selectedRegion || !userCoordinates || !currentRegionCinemas.length) return;

    let closestCinema = null;
    let closestDistance = Infinity;
    currentRegionCinemas.forEach((cinema) => {
      const coordinates = parseCoordinates(cinema.coordinates);
      if (!coordinates) return;
      const distance = getDistance(
        userCoordinates.latitude,
        userCoordinates.longitude,
        coordinates[0],
        coordinates[1],
      );
      if (distance < closestDistance) {
        closestCinema = cinema;
        closestDistance = distance;
      }
    });

    setSelectedCinema(closestCinema || currentRegionCinemas[0]);
  }, [selectedRegion, userCoordinates, currentRegionCinemas]);

  useEffect(() => {
    if (!selectedCinema || !selectedDate || !movies.length) {
      setCinemaSchedules([]);
      return undefined;
    }

    let cancelled = false;
    setLoadingSchedules(true);
    const currentMovies = movies.filter((movie) =>
      movie.showing !== false && (!selectedMovieId || movie._id === selectedMovieId)
    );

    Promise.all(currentMovies.map(async (movie) => {
      try {
        const response = await fetchShowtimesAPI({
          branch: selectedCinema.branch,
          date: normalizeDateForApi(selectedDate),
          idMovie: movie._id,
          location: currentRegionName,
        });
        const showtimes = safeArray(response?.data?.content || response?.data);
        return showtimes.length ? [{ movie, showtimes }] : [];
      } catch {
        return [];
      }
    }))
      .then((results) => {
        if (!cancelled) setCinemaSchedules(results.flat());
      })
      .finally(() => {
        if (!cancelled) setLoadingSchedules(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCinema, selectedDate, movies, selectedMovieId, currentRegionName]);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setManuallySelectedCinemaId(null);
    setUserCoordinates(null);
    const firstCinema = getCinemasInRegion(region, cinemas)[0] || null;
    setSelectedCinema(firstCinema);
  };

  const openDirections = () => {
    if (!selectedCinema) return;
    setActiveTab("location");
    const coordinates = parseCoordinates(selectedCinema.coordinates);
    const destination = coordinates
      ? `${coordinates[0]},${coordinates[1]}`
      : selectedCinema.address;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination || "")}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const amenities = selectedCinema
    ? selectedCinema.amenities || selectedCinema.facilities || selectedCinema.utilities || []
    : [];
  const amenityList = Array.isArray(amenities)
    ? amenities
    : String(amenities || "").split(",").map((item) => item.trim()).filter(Boolean);
  const directionsText = selectedCinema
    ? selectedCinema.directions || selectedCinema.direction || selectedCinema.howToGetThere || selectedCinema.route || selectedCinema.guide || ""
    : "";

  const parkingText = selectedCinema
    ? selectedCinema.parking || selectedCinema.parkingInfo || selectedCinema.parkingLot || selectedCinema.parkingSpaces || ""
    : "";

  const normalizeUtilityText = (value) => {
    if (!value) return "";
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            return Object.entries(item)
              .map(([key, val]) => `${key}: ${val}`)
              .join("; ");
          }
          return "";
        })
        .filter(Boolean)
        .join("\n");
    }
    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join("\n");
    }
    return String(value);
  };

  if (loadingLocations || loadingCinemas || loadingBanners) {
    return <div className="cinema-page-loading"><Spin size="large" /></div>;
  }

  if (locationsError || cinemasError) {
    return <div className="container py-5"><Empty description="Không thể tải thông tin rạp lúc này." /></div>;
  }

  const coordinates = parseCoordinates(selectedCinema?.coordinates);
  const mapSource = coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates[1] - 0.015}%2C${coordinates[0] - 0.01}%2C${coordinates[1] + 0.015}%2C${coordinates[0] + 0.01}&layer=mapnik&marker=${coordinates[0]}%2C${coordinates[1]}`
    : null;

  const tabItems = [
    {
      key: "schedule",
      label: "Lịch chiếu phim",
      children: (
        <div className="cinema-schedule-tab">
          <div className="cinema-movie-carousel-section">
            <h2>Chọn phim</h2>
            {moviesError ? (
              <Empty description="Không thể tải danh sách phim lúc này." />
            ) : (
              <Spin spinning={loadingMovies}>
                {movies.length > 0 ? (
                  <Carousel
                    className="cinema-movie-carousel"
                    dots={false}
                    arrows={movies.length > 4}
                    slidesToShow={Math.min(movies.length, 4)}
                    slidesToScroll={1}
                    responsive={[
                      { breakpoint: 900, settings: { slidesToShow: Math.min(movies.length, 3) } },
                      { breakpoint: 600, settings: { slidesToShow: Math.min(movies.length, 2) } },
                      { breakpoint: 400, settings: { slidesToShow: 1 } },
                    ]}
                  >
                    {movies.map((movie) => {
                      const movieId = movie._id;
                      const movieTitle = movie.tenPhim || movie.title || "Phim";
                      const movieImage = movie.banner || movie.poster || movie.image;
                      const isSelected = selectedMovieId === movieId;

                      return (
                        <div className="cinema-movie-carousel-slide" key={movieId}>
                          <button
                            type="button"
                            className={`cinema-movie-card${isSelected ? " is-selected" : ""}`}
                            aria-pressed={isSelected}
                            onClick={() => setSelectedMovieId(isSelected ? null : movieId)}
                          >
                            {movieImage ? (
                              <img src={movieImage} alt={movieTitle} loading="lazy" />
                            ) : (
                              <span className="cinema-movie-card-placeholder">{movieTitle}</span>
                            )}
                            <span className="cinema-movie-card-title">{movieTitle}</span>
                          </button>
                        </div>
                      );
                    })}
                  </Carousel>
                ) : !loadingMovies ? (
                  <Empty description="Chưa có phim để hiển thị." />
                ) : null}
              </Spin>
            )}
          </div>
          <Calendar onDateChange={setSelectedDate} isActive={activeTab === "schedule"} />
          <div className="age-rating-legend">
            <span><b className="age-rating-p">P</b> Mọi đối tượng</span>
            <span><b className="age-rating-c13">13</b> 13 tuổi trở lên</span>
            <span><b className="age-rating-c16">16</b> 16 tuổi trở lên</span>
            <span><b className="age-rating-c18">18</b> 18 tuổi trở lên</span>
          </div>
          <Spin spinning={loadingSchedules}>
            {cinemaSchedules.length ? cinemaSchedules.map(({ movie, showtimes }) => (
              <article className="cinema-movie-schedule" key={movie._id}>
                <h3>{movie.title || movie.tenPhim}</h3>
                <div className="cinema-movie-format">2D <span>Phụ đề tiếng Anh</span></div>
                <div className="cinema-times-grid">
                  {showtimes.map((showtime) => {
                    const seats = safeArray(showtime.seats);
                    const available = seats.filter((seat) => !seat.isBooked).length;
                    const isPast = dayjs(showtime.startTime).isBefore(dayjs());
                    return (
                      <div className="cinema-time-cell" key={showtime._id}>
                        <small>{showtime.theater?.name || "Phòng chiếu"}</small>
                        <Button disabled={isPast} onClick={() => window.location.assign(`/booking/${showtime._id}`)}>
                          {dayjs(showtime.startTime).format("HH:mm")}
                        </Button>
                        <small>{available} / {seats.length} Ghế ngồi</small>
                      </div>
                    );
                  })}
                </div>
              </article>
            )) : <Empty description={selectedDate ? "Chưa có suất chiếu trong ngày này" : "Chọn ngày để xem lịch chiếu"} />}
          </Spin>
        </div>
      ),
    },
    {
      key: "location",
      label: "Vị trí của rạp",
      children: selectedCinema ? (
        <div className="cinema-location-tab">
          <p><EnvironmentOutlined /> {selectedCinema.address || "Chưa có địa chỉ rạp."}</p>
          {mapSource ? <iframe title={`Bản đồ ${selectedCinema.branch}`} src={mapSource} loading="lazy" /> : <Empty description="Rạp chưa có tọa độ bản đồ." />}
        </div>
      ) : <Empty description="Chưa chọn rạp." />,
    },
    {
      key: "directions",
      label: "Hướng dẫn đi tới rạp",
      children: selectedCinema ? (
        <div className="cinema-directions-tab">
          <p>{directionsText || selectedCinema.address || "Chưa có hướng dẫn đi tới rạp."}</p>
          <Button icon={<LinkOutlined />} onClick={openDirections}>Mở chỉ đường</Button>
        </div>
      ) : <Empty description="Chưa chọn rạp." />,
    },
    {
      key: "amenities",
      label: "Tiện ích đi kèm",
      children: selectedCinema ? (
        <div className="cinema-utility-list">
          {parkingText && (
            <div className="cinema-utility-row">
              <div className="cinema-utility-icon cinema-utility-icon-car">🚗</div>
              <div className="cinema-utility-content">
                <div className="cinema-utility-title">Nơi đỗ xe</div>
                <p>{normalizeUtilityText(parkingText)}</p>
              </div>
            </div>
          )}

          {amenityList.length > 0 && (
            <div className="cinema-utility-row">
              <div className="cinema-utility-icon cinema-utility-icon-info">i</div>
              <div className="cinema-utility-content">
                <div className="cinema-utility-title">Tiện ích đi kèm</div>
                <p>{normalizeUtilityText(amenityList)}</p>
              </div>
            </div>
          )}

          {!parkingText && amenityList.length === 0 && (
            <Empty description="Chưa có thông tin tiện ích cho rạp này." />
          )}
        </div>
      ) : <Empty description="Chưa chọn rạp." />,
    },
  ];

  return (
    <main className="cinema-detail-page">
      <SEO title={selectedCinema?.branch || "Hệ thống rạp"} description={selectedCinema?.address || "Thông tin hệ thống rạp chiếu phim."} />
      <nav className="cinema-region-nav" aria-label="Chọn vùng">
        {locations.map((region, index) => (
          <button
            type="button"
            key={region._id || getRegionName(region) || index}
            className={getRegionName(selectedRegion) === getRegionName(region) ? "is-active" : ""}
            onClick={() => handleRegionSelect(region)}
          >
            {getRegionName(region)}
          </button>
        ))}
      </nav>

      {banners.length > 0 && (
        <section className="cinema-banner-wrap" aria-label="Banner và chọn rạp">
          <Carousel autoplay={false} dots={banners.length > 1} arrows={banners.length > 1}>
            {banners.map((source, index) => <img key={`${source}-${index}`} src={source} alt="Ưu đãi rạp chiếu phim" />)}
          </Carousel>
          {currentRegionCinemas.length > 0 && (
            <nav className="cinema-branch-nav" aria-label={`Rạp tại ${currentRegionName}`}>
              {currentRegionCinemas.map((cinema) => (
                <button
                  type="button"
                  key={cinema._id || cinema.branch}
                  className={manuallySelectedCinemaId === (cinema._id || cinema.branch) ? "is-active" : ""}
                  aria-current={manuallySelectedCinemaId === (cinema._id || cinema.branch) ? "true" : undefined}
                  onClick={() => {
                    setSelectedCinema(cinema);
                    setManuallySelectedCinemaId(cinema._id || cinema.branch);
                  }}
                >
                  {cinema.branch}
                </button>
              ))}
            </nav>
          )}
        </section>
      )}

      <div className="cinema-detail-container">
        {selectedCinema ? (
          <>
            <header className="cinema-detail-header">              
              <div className="cinema-detail-info">
                <div className="cinema-detail-title-row">
                  <h1>{selectedCinema.branch}</h1>
                  <Button icon={isLocating ? <SyncOutlined spin /> : <AimOutlined />} onClick={locate} loading={isLocating}>
                    Rạp gần tôi
                  </Button>
                </div>
                <p>{selectedCinema.address || "Chưa cập nhật địa chỉ"}</p>
                <div className="cinema-detail-meta">
                  <span>Hệ thống: {selectedCinema.cinemaName || "Rạp chiếu phim"}</span>
                  {coordinates && <span>Vị trí đã xác định</span>}
                </div>
              </div>
            </header>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
          </>
        ) : (
          <div className="cinema-no-selection">
            <Empty description={decision === "pending" ? "Đang xác định rạp gần bạn..." : "Chưa có rạp trong khu vực này."} />
            <Button icon={<AimOutlined />} onClick={locate} loading={isLocating}>Tìm rạp gần tôi</Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default MovieTheater;