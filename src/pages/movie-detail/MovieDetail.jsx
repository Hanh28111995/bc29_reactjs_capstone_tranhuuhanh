import React, { useEffect, useRef, useState } from "react";
import { Button, List, Card, Row, Col, Empty, Spin, Select, Input } from "antd";
import { useAsync, safeArray } from "hooks/useAsync";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { LockOutlined, SearchOutlined } from "@ant-design/icons";
import {
  fetchShowtimesAPI,
  fetchBranchesAPI,
  fetchMovieDetailAPI,
  fetchMovieListAPI,
} from "services/general";
import Calendar from "modules/showtimeModules/Calendar";
import dayjs from "dayjs";
import { fetchLocationListAPI } from "services/general";
import "./index.scss";
import SEO from "components/SEO";
import { useTranslation } from "react-i18next";

// ---------- Helpers ----------
const getRegionName = (region) =>
  region?.vungMien || region?.name || region?.location || region?.city || region?.province || "";

const getRegionAreas = (region) => {
  const areas = region?.cumRap || region?.districts || region?.areas || region?.locations || [];
  return Array.isArray(areas)
    ? areas
        .map((area) => (typeof area === "string" ? area : area?.name || area?.location || area?.district))
        .filter(Boolean)
    : [];
};

const normalizeLocationText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getRegionCinemas = (region, cinemas) => {
  const areas = getRegionAreas(region).map(normalizeLocationText).filter(Boolean);
  const regionName = normalizeLocationText(getRegionName(region));
  return cinemas.filter((cinema) => {
    const address = normalizeLocationText(
      `${cinema?.location || ""} ${cinema?.region || ""} ${cinema?.address || ""}`,
    );
    return areas.length ? areas.some((area) => address.includes(area)) : address.includes(regionName);
  });
};

const getRegionCinemaCount = (region, cinemas) => getRegionCinemas(region, cinemas).length;

const getResponseArray = (response, collectionKeys = []) => {
  const candidates = [
    response?.data?.content,
    response?.data?.data,
    response?.data,
    response?.content,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    for (const key of collectionKeys) {
      if (Array.isArray(candidate?.[key])) return candidate[key];
    }
  }

  return [];
};

const AGE_RATING_CLASSES = {
  P: "age-rating-p",
  C13: "age-rating-c13",
  C16: "age-rating-c16",
  C18: "age-rating-c18",
};

const formatShowtime = (startTime) =>
  startTime ? dayjs(startTime).format("HH:mm") : "--:--";

const formatDate = (startTime) =>
  startTime ? dayjs(startTime).format("DD/MM") : "";

export default function MovieDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const param = useParams();
  const userInfo = useSelector((state) => state.userReducer.userInfor);

  // ---------- STATE ----------
  const [selectedRegionName, setSelectedRegionName] = useState(null);
  const [selectCity, setSelectCity] = useState(null);
  const [selectedCinemaName, setSelectedCinemaName] = useState(null);
  const [branches, setBranches] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [localDate, setLocalDate] = useState(null);
  const [movieDetail, setMovieDetail] = useState(null);
  const [movieList, setMovieList] = useState([]);
  const [dataShowTimes, setDataShowTimes] = useState([]);
  const [loadingInternal, setLoadingInternal] = useState(false);
  const [activeTab, setActiveTab] = useState("booking");
  const [branchSearch, setBranchSearch] = useState("");
  const [scheduleSort, setScheduleSort] = useState("popular");
  const [regionShowtimes, setRegionShowtimes] = useState([]);
  const [loadingRegionShowtimes, setLoadingRegionShowtimes] = useState(false);

  const paramMovieId = param.movieId || movieList[0]?._id || null;

  // ---------- LOAD MOVIE LIST: /general/movie/all ----------
  useEffect(() => {
    fetchMovieListAPI().then((res) => {
      setMovieList(getResponseArray(res, ["movies", "movieList", "items"]));
    }).catch(() => setMovieList([]));
  }, []);

  // ---------- LOAD ALL BRANCHES ----------
  useEffect(() => {
    fetchBranchesAPI()
      .then((res) => {
        setAllBranches(getResponseArray(res, ["cinemas", "branches", "cinemaBranches", "items"]));
      })
      .catch(() => setAllBranches([]));
  }, []);

  // ---------- LOAD AREAS ----------
  const { state: rawAreasList = [], loading: IsLoading, isError: IsError } = useAsync({
    service: () => fetchLocationListAPI(),
    queryKey: ["areas-list", "active"],
  });

  const areasList = safeArray(rawAreasList);
  const activeRegionData = areasList?.find((region) => getRegionName(region) === selectedRegionName);

  useEffect(() => {
    if (!selectedRegionName) {
      setBranches([]);
      return;
    }

    const region = areasList.find((item) => getRegionName(item) === selectedRegionName);
    setBranches(getRegionCinemas(region, allBranches));
  }, [selectedRegionName, areasList, allBranches]);

  const spans = { col1: 6, col2: 6, col3: 6 };

  // ---------- HELPERS ----------
  const normalizeDateForApi = (dateStr) => {
    if (!dateStr) return dateStr;
    const m = String(dateStr).match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (!m) return dateStr;
    const [, d, mo, y] = m;
    return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const loadBranchesByLocation = async (location) => {
    try {
      const res = await fetchBranchesAPI({ location });
      const list = getResponseArray(res, ["cinemas", "branches", "cinemaBranches", "items"]);
      const unique = Array.from(
        new Map(list.filter((x) => x?.branch).map((x) => [String(x.branch).trim(), { ...x, branch: String(x.branch).trim() }])).values(),
      );
      setBranches(unique);
    } catch (err) {
      console.error("Lỗi lấy danh sách chi nhánh:", err);
      setBranches([]);
    }
  };

  // đảm bảo chọn đủ 4 mới fetch showtime
  const canFetchShowtimes = Boolean(selectedRegionName && selectedCinemaName && localDate && paramMovieId);

  // ---------- SHOWTIMES ----------
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab !== "booking" || !canFetchShowtimes) {
        setDataShowTimes([]);
        return;
      }
      setDataShowTimes([]);
      setLoadingInternal(true);
      try {
        const res = await fetchShowtimesAPI({
          branch: selectedCinemaName,
          date: normalizeDateForApi(localDate),
          idMovie: paramMovieId,
          location: selectedRegionName,
        });
        setDataShowTimes(getResponseArray(res, ["showtimes", "items"]));
      } catch (err) {
        console.error("Lỗi lấy suất chiếu:", err);
        setDataShowTimes([]);
      } finally {
        setLoadingInternal(false);
      }
    };
    fetchData();
  }, [activeTab, selectedCinemaName, localDate, paramMovieId, canFetchShowtimes]);

  useEffect(() => {
    if (activeTab !== "schedule" || !selectedRegionName || !localDate || !paramMovieId) {
      setRegionShowtimes([]);
      return undefined;
    }

    const region = areasList.find((item) => getRegionName(item) === selectedRegionName);
    const regionCinemas = getRegionCinemas(region, allBranches);
    if (!regionCinemas.length) {
      setRegionShowtimes([]);
      return undefined;
    }

    let cancelled = false;
    setLoadingRegionShowtimes(true);

    Promise.all(regionCinemas.map(async (cinema) => {
      try {
        const response = await fetchShowtimesAPI({
          branch: cinema.branch,
          date: normalizeDateForApi(localDate),
          idMovie: paramMovieId,
          location: selectedRegionName,
        });
        return getResponseArray(response, ["showtimes", "items"]).map((showtime) => ({
          ...showtime,
          cinemaBranch: cinema.branch,
        }));
      } catch {
        return [];
      }
    }))
      .then((results) => {
        if (!cancelled) setRegionShowtimes(results.flat());
      })
      .finally(() => {
        if (!cancelled) setLoadingRegionShowtimes(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedRegionName, localDate, paramMovieId, allBranches, areasList]);

  // ---------- MOVIE DETAIL ----------
  useEffect(() => {
    if (!paramMovieId) return;
    fetchMovieDetailAPI(paramMovieId)
      .then((res) => setMovieDetail(res.data?.content || res.data || null))
      .catch(() => {});
  }, [paramMovieId]);

  // ---------- LOADING / ERROR ----------
  if (IsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <p>{t("common.loading")}</p>
      </div>
    );
  }
  if (IsError) {
    return (
      <div className="text-center mt-5">
        <p>{t("common.loadError")}</p>
      </div>
    );
  }

  // ---------- RENDER ----------
  const groupedShowtimes = dataShowTimes.reduce((groups, showtime) => {
    const roomName = showtime.theater?.name || t("movieSearch.screeningRoom");
    const group = groups.find((item) => item.name === roomName);
    if (group) group.showtimes.push(showtime);
    else groups.push({ name: roomName, showtimes: [showtime] });
    return groups;
  }, []);

  const visibleBranches = branches.filter((item) =>
    item.branch?.toLowerCase().includes(branchSearch.trim().toLowerCase()),
  );

  const scheduleMovies = [...movieList].sort((first, second) => {
    const firstValue = Number(scheduleSort === "popular" ? first.views || first.viewCount || 0 : first.rating || 0);
    const secondValue = Number(scheduleSort === "popular" ? second.views || second.viewCount || 0 : second.rating || 0);
    return secondValue - firstValue;
  });

  const groupedRegionShowtimes = regionShowtimes.reduce((cinemas, showtime) => {
    const branch = showtime.cinemaBranch || showtime.theater?.branch || t("cinema.cinemaSystem");
    let cinema = cinemas.find((entry) => entry.branch === branch);
    if (!cinema) {
      cinema = { branch, rooms: [] };
      cinemas.push(cinema);
    }

    const roomName = showtime.theater?.name || t("movieSearch.screeningRoom");
    let room = cinema.rooms.find((entry) => entry.name === roomName);
    if (!room) {
      room = { name: roomName, showtimes: [] };
      cinema.rooms.push(room);
    }
    room.showtimes.push(showtime);
    return cinemas;
  }, []);

  const renderShowtimeGrid = () => {
    if (!canFetchShowtimes) {
      return <Empty description={t("movieSearch.selectDateCinemaRegionMovie")} />;
    }
    if (dataShowTimes.length === 0) {
      return <Empty description={t("movieSearch.noShowtimesForMovieDate")} />;
    }
    return (
      <List grid={{ gutter: 12, column: "auto" }} dataSource={dataShowTimes} renderItem={(item) => {
        const isPast = dayjs(item.startTime).isBefore(dayjs());
        return (
          <List.Item>
            <Button block disabled={isPast} style={{ height: "auto", padding: "8px", borderRadius: 6 }}
              onClick={() => navigate(`/booking/${item._id}`)}>
              <span style={{ fontSize: 16, fontWeight: "bold", color: isPast ? "#bfbfbf" : "#1890ff" }}>
                {formatShowtime(item.startTime)}
              </span>
              <span style={{ fontSize: 10, color: "#999", display: "block" }}>{formatDate(item.startTime)}</span>
            </Button>
          </List.Item>
        );
      }} />
    );
  };

  return (
    <div className="detailPage py-3 container" style={{ flex: 1 }}>
      <SEO title={movieDetail?.title || t("movies.details")} description={movieDetail?.describe || t("movieSearch.seoDescription")} image={movieDetail?.banner} />
      <div className="movie-detail-tabs" role="tablist" aria-label={t("movieSearch.viewMode")}>
        <button type="button" role="tab" aria-selected={activeTab === "booking"} className={activeTab === "booking" ? "is-active" : ""} onClick={() => setActiveTab("booking")}>{t("movieSearch.buyMovieTickets")}</button>
        <button type="button" role="tab" aria-selected={activeTab === "schedule"} className={activeTab === "schedule" ? "is-active" : ""} onClick={() => setActiveTab("schedule")}>{t("movieSearch.schedule")}</button>
      </div>

      {activeTab === "booking" ? (
        <>
          <Calendar onDateChange={(date) => setLocalDate(date)} />
          <div className="showtime-picker">
            <section className="picker-column cinema-main-column">
              <div className="picker-heading"><h2>{t("movieSearch.cinemaLabel")}</h2></div>
              <section className="favorite-cinema-row">
                <div>
                  <h3>{t("movieSearch.favoriteCinemas")}</h3>
                  <p>{userInfo ? t("movieSearch.favoriteCinemasPrompt") : t("movieSearch.loginForFavorites")}</p>
                </div>
                {!userInfo && <Button icon={<LockOutlined />} onClick={() => navigate("/login")}>{t("auth.login")}</Button>}
              </section>
              <section className="cinema-system-row">
                <div className="system-heading">
                  <Input aria-label={t("movieSearch.cinemaSearch")} prefix={<SearchOutlined />} placeholder={t("movieSearch.cinemaSearch")} allowClear value={branchSearch} onChange={(e) => setBranchSearch(e.target.value)} />
                </div>
                <div className="system-cinema-content">
                  <div className="location-list">
                    {areasList.map((region, index) => {
                      const regionName = getRegionName(region);
                      if (!regionName) return null;
                      return (
                        <button type="button" key={region._id || regionName || index}
                          className={`location-option${selectedRegionName === regionName ? " is-active" : ""}`}
                          onClick={() => { setSelectedRegionName(regionName); setSelectCity(null); setSelectedCinemaName(null); setDataShowTimes([]); }}>
                          <span>{regionName}</span>
                          <span className="location-count">{getRegionCinemaCount(region, allBranches)}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="cinema-list">
                    {selectedRegionName ? (
                      visibleBranches.length ? visibleBranches.map((item) => (
                        <button type="button" key={item._id || item.branch}
                          className={`cinema-option${selectedCinemaName === item.branch ? " is-active" : ""}`}
                          onClick={() => setSelectedCinemaName(item.branch)}>
                          <span>{item.branch}</span>
                          {item.address && <small>{item.address}</small>}
                        </button>
                      )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("movieSearch.noCinemas")} />
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("shop.selectRegion")} />}
                  </div>
                </div>
              </section>
            </section>
            <section className="picker-column movie-column">
              <div className="picker-heading"><h2>{t("movieSearch.movieLabel")}</h2></div>
              <div className="movie-list">
                {movieList.length ? movieList.map((movie) => (
                  <button type="button" key={movie._id}
                    className={`movie-option${paramMovieId === movie._id ? " is-active" : ""}`}
                    onClick={() => paramMovieId !== movie._id && navigate(`/movie/selectT/${movie._id}`)}>
                    {AGE_RATING_CLASSES[movie.ageRating?.toUpperCase()] && (
                      <span className={`age-rating ${AGE_RATING_CLASSES[movie.ageRating.toUpperCase()]}`}>{movie.ageRating.toUpperCase()}</span>
                    )} {movie.title}
                  </button>
                )) : <Empty description={t("movieSearch.noNowShowing")} />}
              </div>
            </section>
          </div>

          <div className="selection-summary">
            <span>{t("movieSearch.date")} <strong>{localDate || t("movieSearch.selectDay")}</strong></span>
            <span>{t("movieSearch.cinemaLabel")} <strong>{selectedCinemaName || t("shop.selectCinema")}</strong></span>
            <span>{t("movieSearch.movieLabel")} <strong>{movieDetail?.title || t("movieSearch.loadingMovie")}</strong></span>
          </div>

          <section className="showtime-results">
            <div className="results-heading"><h2>{t("movieSearch.showtime")}</h2><p>{t("movieSearch.showtimeDelay")}</p></div>
            <Spin spinning={loadingInternal}>
              {canFetchShowtimes ? (
                groupedShowtimes.length ? groupedShowtimes.map((group) => (
                  <div className="room-schedule" key={group.name}>
                    <h3>{selectedCinemaName} <span>{group.name}</span></h3>
                    <div className="schedule-table-wrap">
                      <table className="schedule-table">
                        <thead><tr><th>{t("movieSearch.screeningRoom")}</th><th>{t("movieSearch.showtime")}</th><th>{t("movieSearch.availableSeats")}</th></tr></thead>
                        <tbody>
                          {group.showtimes.map((showtime) => {
                            const seats = Array.isArray(showtime.seats) ? showtime.seats : [];
                            const availableSeats = seats.filter((s) => !s.isBooked).length;
                            const isPast = dayjs(showtime.startTime).isBefore(dayjs());
                            return (
                              <tr key={showtime._id}>
                                <td>{group.name}</td>
                                <td><Button disabled={isPast} onClick={() => navigate(`/booking/${showtime._id}`)}>{formatShowtime(showtime.startTime)}</Button></td>
                                <td>{availableSeats} / {seats.length}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )) : <Empty description={t("cinema.noShowtimes")} />
              ) : <Empty description={t("movieSearch.selectDateCinemaMovie")} />}
            </Spin>
          </section>

          <Card style={{ borderRadius: 8, minHeight: 600, border: "1px solid #f0f0f0", overflow: "hidden" }} className="forPC">
            <Row gutter={24} wrap={false} style={{ display: "flex" }}>
              <Col span={spans.col1}>
                <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>{t("cinema.region")}</h2>
                {areasList?.length > 0 ? areasList.map((item, index) => (
                  <Button key={item._id || item.vungMien || index} type={selectedRegionName === item.vungMien ? "primary" : "default"}
                    onClick={async () => { setSelectedRegionName(item.vungMien); setBranches([]); setSelectedCinemaName(null); const firstCity = item?.cumRap?.[0] || null; setSelectCity(firstCity); if (firstCity) await loadBranchesByLocation(firstCity); }}>
                    {item.vungMien}
                  </Button>
                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("movieSearch.noData")} />}
              </Col>
              <Col span={spans.col2} style={{ borderLeft: "0px solid #f0f0f0" }}>
                <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>{t("cinema.city")}</h2>
                {activeRegionData ? activeRegionData.cumRap?.map((city, index) => (
                  <Button key={index} type={selectCity === city ? "primary" : "default"}
                    onClick={async () => { setSelectCity(city); setSelectedCinemaName(null); await loadBranchesByLocation(city); }}>
                    {city}
                  </Button>
                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("cinema.chooseRegion")} />}
              </Col>
              <Col span={spans.col3} style={{ borderLeft: "1px solid #f0f0f0" }}>
                <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>{t("cinema.cinema")}</h2>
                {selectCity ? branches.map((item, index) => (
                  <Button key={index} type={selectedCinemaName === item.branch ? "primary" : "default"}
                    onClick={() => setSelectedCinemaName(item.branch)}>
                    {item.branch}
                  </Button>
                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("cinema.selectCinema")} />}
              </Col>
              <Col flex={selectedCinemaName ? "1" : "0 0 80px"} style={{ borderLeft: "1px solid #f0f0f0", transition: "all 0.5s", backgroundColor: selectedCinemaName ? "#fff" : "#fafafa", display: "flex", flexDirection: "column" }}>
                <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, textAlign: "center", opacity: selectedCinemaName ? 1 : 0, display: selectedCinemaName ? "block" : "none" }}>{t("movieSearch.showtime")}</h2>
                <Spin spinning={loadingInternal}>
                  {renderShowtimeGrid()}
                </Spin>
              </Col>
            </Row>
          </Card>

          {/* MOBILE */}
          <Card style={{ borderRadius: 8, marginBottom: 16 }} className="forPhone">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="mobile-label">{t("cinema.region")}</label>
                <Select style={{ width: "100%" }} placeholder={t("shop.selectRegion")} value={selectedRegionName}
                  onChange={(name) => { setSelectedRegionName(name); setBranches([]); setSelectedCinemaName(null); const regionData = areasList?.find((r) => r.vungMien === name); const firstCity = regionData?.cumRap?.[0] || null; setSelectCity(firstCity); if (firstCity) loadBranchesByLocation(firstCity); }}
                  options={areasList.map((item) => ({ label: item.vungMien, value: item.vungMien }))} />
              </div>
              <div>
                <label className="mobile-label">{t("cinema.city")}</label>
                <Select style={{ width: "100%" }} placeholder={t("movieSearch.selectCity")} value={selectCity} disabled={!selectedRegionName}
                  onChange={async (city) => { setSelectCity(city); setSelectedCinemaName(null); await loadBranchesByLocation(city); }}
                  options={activeRegionData?.cumRap?.map((city) => ({ label: city, value: city }))} />
              </div>
              <div>
                <label className="mobile-label">{t("cinema.cinema")}</label>
                <Select style={{ width: "100%" }} placeholder={t("cinema.selectCinema")} value={selectedCinemaName} disabled={!selectCity}
                  onChange={(branch) => setSelectedCinemaName(branch)}
                  options={branches.map((item) => ({ label: item.branch, value: item.branch }))} />
              </div>
              <div>
                <label className="mobile-label">{t("movieSearch.showtime")}</label>
                <Spin spinning={loadingInternal}>
                  {renderShowtimeGrid()}
                </Spin>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <section className="schedule-tab-content">
          <section className="schedule-movie-showcase">
            <div className="schedule-section-heading">
              <h2>{t("movieSearch.movieScreenings")}</h2>
              <div className="schedule-sort-controls" aria-label={t("movieSearch.sortMovies")}>
                <button
                  type="button"
                  className={scheduleSort === "popular" ? "is-active" : ""}
                  onClick={() => setScheduleSort("popular")}
                >
                  {t("movieSearch.mostPopular")}
                </button>
                <button
                  type="button"
                  className={scheduleSort === "rating" ? "is-active" : ""}
                  onClick={() => setScheduleSort("rating")}
                >
                  {t("movieSearch.bestRated")}
                </button>
              </div>
            </div>
            <div className="schedule-poster-rail">
              {scheduleMovies.map((movie) => (
                <button
                  type="button"
                  key={movie._id}
                  className={`schedule-poster-card${paramMovieId === movie._id ? " is-active" : ""}`}
                  onClick={() => paramMovieId !== movie._id && navigate(`/movie/selectT/${movie._id}`)}
                >
                  <img src={movie.banner} alt={movie.title} loading="lazy" />
                  <span className="schedule-poster-title">
                    {AGE_RATING_CLASSES[movie.ageRating?.toUpperCase()] && (
                      <span className={`age-rating ${AGE_RATING_CLASSES[movie.ageRating.toUpperCase()]}`}>
                        {movie.ageRating.toUpperCase()}
                      </span>
                    )}
                    <span>{movie.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="region-schedule-section">
            <div className="results-heading">
              <h2>{t("movieSearch.showtime")}</h2>
              <p>{t("movieSearch.showtimeDelay")}</p>
            </div>
            <div className="schedule-region-list" role="tablist" aria-label={t("cinema.regionLabel")}>
              {areasList.map((region, index) => {
                const regionName = getRegionName(region);
                if (!regionName) return null;
                return (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedRegionName === regionName}
                    key={region._id || regionName || index}
                    className={selectedRegionName === regionName ? "is-active" : ""}
                    onClick={() => {
                      setSelectedRegionName(regionName);
                      setSelectCity(null);
                      setSelectedCinemaName(null);
                    }}
                  >
                    {regionName} ({getRegionCinemaCount(region, allBranches)})
                  </button>
                );
              })}
            </div>
            <Calendar onDateChange={(date) => setLocalDate(date)} />

            <Spin spinning={loadingRegionShowtimes}>
              {groupedRegionShowtimes.length ? groupedRegionShowtimes.map((cinema) => (
                <section className="region-cinema-group" key={cinema.branch}>
                  <h3>{cinema.branch}</h3>
                  {cinema.rooms.map((room) => (
                    <div className="region-room-schedule" key={`${cinema.branch}-${room.name}`}>
                      <div className="region-room-heading">
                        <strong>{room.name}</strong>
                        <span>{localDate || t("movieSearch.notSelectedDate")}</span>
                      </div>
                      <div className="region-screening-grid">
                        {room.showtimes.map((showtime) => {
                          const seats = Array.isArray(showtime.seats) ? showtime.seats : [];
                          const availableSeats = seats.filter((seat) => !seat.isBooked).length;
                          const isPast = dayjs(showtime.startTime).isBefore(dayjs());
                          return (
                            <div className="region-screening-cell" key={showtime._id}>
                              <span>{showtime.theater?.name || room.name}</span>
                              <Button
                                disabled={isPast}
                                onClick={() => navigate(`/booking/${showtime._id}`)}
                              >
                                {formatShowtime(showtime.startTime)}
                              </Button>
                              <small>{availableSeats} / {seats.length} {t("cinema.seats")}</small>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </section>
              )) : (
                <Empty
                  description={selectedRegionName
                    ? t("movieSearch.noShowtimesForSelection")
                    : t("movieSearch.selectRegionForShowtimes")}
                />
              )}
            </Spin>
          </section>
        </section>
      )}
    </div>
  );
}