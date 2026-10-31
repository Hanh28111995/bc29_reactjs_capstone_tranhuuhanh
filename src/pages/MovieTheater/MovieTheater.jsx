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
  fetchCinemaDetailAPI,
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
  const {
    state: rawCinemaDetail,
    loading: loadingCinemaDetail,
    isError: cinemaDetailError,
  } = useAsync({
    service: () => fetchCinemaDetailAPI(selectedCinema?._id),
    queryKey: ["cinema-detail", selectedCinema?._id],
    enabled: Boolean(selectedCinema?._id),
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
  const cinemaInfo = useMemo(() => {
    const details = rawCinemaDetail?.cinema || rawCinemaDetail?.content || rawCinemaDetail;
    return details && typeof details === "object"
      ? { ...selectedCinema, ...details }
      : selectedCinema;
  }, [selectedCinema, rawCinemaDetail]);

  const { decision, isLocating, locate } = useGeoLocationSelect({
    locations,
    cinemas,
    askOnMount: true,
    onSelect: ({ region, coords }) => {
      setSelectedRegion(region || null);
      setManuallySelectedCinemaId(null);
      setUserCoordinates(coords || null);
    },
    title: t("cinema.shareLocation"),
    content: t("cinema.nearbyPrompt"),
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

  const amenities = cinemaInfo
    ? cinemaInfo.amenities
    : [];
  const amenityList = Array.isArray(amenities)
    ? amenities
    : String(amenities || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  const directionsText = cinemaInfo
    ? cinemaInfo.directions || cinemaInfo.direction || cinemaInfo.howToGetThere || cinemaInfo.route || cinemaInfo.guide || ""
    : "";

  const parkingText = cinemaInfo
    ? cinemaInfo.parking
    : "";

  const formatDirections = (value) => {
    if (Array.isArray(value) || (value && typeof value === "object")) {
      return normalizeUtilityText(value)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    }

    return String(value || "")
      .replace(/\s+(?=\+\s)/g, "\n")
      .replace(/\s+(?=-\s*(?:Tuyến|Phí)\b)/gi, "\n")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  };

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

  const directionsLines = formatDirections(directionsText);

  const openDirections = () => {
    if (!selectedCinema) return;

    setActiveTab("location");
    const coordinates = parseCoordinates(cinemaInfo?.coordinates || selectedCinema.coordinates);
    const destination = coordinates
      ? `${coordinates[0]},${coordinates[1]}`
      : selectedCinema.address;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination || selectedCinema.branch || "")}`;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  if (loadingLocations || loadingCinemas || loadingBanners) {
    return <div className="cinema-page-loading"><Spin size="large" /></div>;
  }

  if (locationsError || cinemasError) {
    return <div className="container py-5"><Empty description={t("cinema.loadError")} /></div>;
  }

  const coordinates = parseCoordinates(cinemaInfo?.coordinates || selectedCinema?.coordinates);
  const mapSource = coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates[1] - 0.015}%2C${coordinates[0] - 0.01}%2C${coordinates[1] + 0.015}%2C${coordinates[0] + 0.01}&layer=mapnik&marker=${coordinates[0]}%2C${coordinates[1]}`
    : null;

  const tabItems = [
    {
      key: "schedule",
      label: t("cinema.showtimes"),
      children: (
        <div className="cinema-schedule-tab">
          <Calendar onDateChange={setSelectedDate} isActive={activeTab === "schedule"} />
          <div className="age-rating-legend">
            <span><b className="age-rating-p">P</b> {t("cinema.allAudiences")}</span>
            <span><b className="age-rating-c13">13</b> {t("cinema.age13")}</span>
            <span><b className="age-rating-c16">16</b> {t("cinema.age16")}</span>
            <span><b className="age-rating-c18">18</b> {t("cinema.age18")}</span>
          </div>
          <div className="cinema-movie-carousel-section">
            <h2>{t("cinema.chooseMovie")}</h2>
            {moviesError ? (
              <Empty description={t("cinema.moviesLoadError")} />
            ) : (
              <Spin spinning={loadingMovies}>
                {movies.length > 0 ? (
                  <Carousel
                    className="cinema-movie-carousel"
                    dots={false}
                    arrows={movies.length > 4}
                    infinite={false}
                    variableWidth
                  >
                    {movies.map((movie) => {
                      const movieId = movie._id;
                      const movieTitle = movie.tenPhim || movie.title || t("history.movie");
                      const movieImage = movie.banner || movie.poster || movie.image;
                      const isSelected = selectedMovieId === movieId;

                      return (
                        <div
                          className="cinema-movie-carousel-slide"
                          key={movieId}
                          style={{ width: "clamp(126px, 14vw, 150px)" }}
                        >
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
                  <Empty description={t("cinema.noMovies")} />
                ) : null}
              </Spin>
            )}
          </div>
          <Spin spinning={loadingSchedules}>
            {cinemaSchedules.length ? cinemaSchedules.map(({ movie, showtimes }) => (
              <article className="cinema-movie-schedule" key={movie._id}>
                <h3>{movie.title || movie.tenPhim}</h3>
                <div className="cinema-movie-format">2D <span>{t("cinema.subtitleEnglish")}</span></div>
                <div className="cinema-times-grid">
                  {showtimes.map((showtime) => {
                    const seats = safeArray(showtime.seats);
                    const available = seats.filter((seat) => !seat.isBooked).length;
                    const isPast = dayjs(showtime.startTime).isBefore(dayjs());
                    return (
                      <div className="cinema-time-cell" key={showtime._id}>
                        <small>{showtime.theater?.name || t("cinema.screeningRoom")}</small>
                        <Button disabled={isPast} onClick={() => window.location.assign(`/booking/${showtime._id}`)}>
                          {dayjs(showtime.startTime).format("HH:mm")}
                        </Button>
                        <small>{available} / {seats.length} {t("cinema.seats")}</small>
                      </div>
                    );
                  })}
                </div>
              </article>
            )) : <Empty description={selectedDate ? t("cinema.noShowtimes") : t("cinema.chooseDate")} />}
          </Spin>
        </div>
      ),
    },
    {
      key: "location",
      label: t("cinema.location"),
      children: selectedCinema ? (
        <div className="cinema-location-tab">
          <p><EnvironmentOutlined /> {selectedCinema.address || t("cinema.noAddress")}</p>
          <Button icon={<LinkOutlined />} onClick={openDirections}>{t("cinema.openDirections")}</Button>
          {mapSource ? <iframe title={`${t("cinema.location")} ${selectedCinema.branch}`} src={mapSource} loading="lazy" /> : <Empty description={t("cinema.noCoordinates")} />}
        </div>
      ) : <Empty description={t("cinema.noCinemaSelected")} />,
    },
    {
      key: "directions",
      label: t("cinema.directions"),
      children: selectedCinema ? (
        <div className="cinema-info-table cinema-directions-tab">
          <div className="cinema-info-row">
            <div className="cinema-info-label">
              <EnvironmentOutlined />
              <strong>{t("cinema.directions")}</strong>
            </div>
            <div className="cinema-info-content">
              {directionsLines.length ? (
                <div className="cinema-info-lines">
                  {directionsLines.map((line, index) => (
                    <p key={`${index}-${line}`}>{line.replace(/^[+-]\s*/, "")}</p>
                  ))}
                </div>
              ) : (
                <p>{selectedCinema.address || t("cinema.noDirections")}</p>
              )}
            </div>
          </div>
        </div>
      ) : <Empty description={t("cinema.noCinemaSelected")} />,
    },
    {
      key: "amenities",
      label: t("cinema.amenities"),
      children: selectedCinema ? (
        <Spin spinning={loadingCinemaDetail}>
          <div className="cinema-info-table cinema-utility-list">
            {parkingText && (
              <div className="cinema-info-row">
                <div className="cinema-info-label">
                  <span className="cinema-utility-icon cinema-utility-icon-car" aria-hidden="true">🚘</span>
                  <strong>{t("cinema.parking")}</strong>
                </div>
                <div className="cinema-info-content">
                  <p>{normalizeUtilityText(parkingText)}</p>
                </div>
              </div>
            )}

            {amenityList.length > 0 && (
              <div className="cinema-info-row">
                <div className="cinema-info-label">
                  <span className="cinema-utility-icon cinema-utility-icon-info" aria-hidden="true">i</span>
                  <strong>{t("cinema.amenities")}</strong>
                </div>
                <div className="cinema-info-content">
                  <p>{normalizeUtilityText(amenityList)}</p>
                </div>
              </div>
            )}

            {!parkingText && amenityList.length === 0 && (
              <Empty description={cinemaDetailError
                ? t("cinema.amenitiesLoadError")
                : t("cinema.noAmenities")} />
            )}
          </div>
        </Spin>
      ) : <Empty description={t("cinema.noCinemaSelected")} />,
    },
  ];

  return (
    <main className="cinema-detail-page">
      <SEO title={selectedCinema?.branch || t("cinema.cinemaSystem")} description={selectedCinema?.address || t("cinema.cinemaDescription")} />
      <nav className="cinema-region-nav" aria-label={t("cinema.regionLabel")}>
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
        <section className="cinema-banner-wrap" aria-label={t("cinema.bannerAndCinemaLabel")}>
          <Carousel autoplay={false} dots={banners.length > 1} arrows={banners.length > 1}>
            {banners.map((source, index) => <img key={`${source}-${index}`} src={source} alt={t("cinema.moviePromotions")} />)}
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
                    {t("cinema.nearMe")}
                  </Button>
                </div>
                <p>{selectedCinema.address || t("cinema.noAddressUpdated")}</p>
                <div className="cinema-detail-meta">
                  <span>{t("cinema.system")}: {selectedCinema.cinemaName || t("cinema.cinemaSystem")}</span>
                  {coordinates && <span>{t("cinema.locationDetected")}</span>}
                </div>
              </div>
            </header>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
          </>
        ) : (
          <div className="cinema-no-selection">
            <Empty description={decision === "pending" ? t("cinema.locatingCinema") : t("cinema.noCinemaInRegion")} />
            <Button icon={<AimOutlined />} onClick={locate} loading={isLocating}>{t("cinema.nearMe")}</Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default MovieTheater;