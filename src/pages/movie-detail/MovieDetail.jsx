import React, { useEffect, useRef, useState } from "react";
import { Button, List, Card, Row, Col, Empty, Spin, Select, Input } from "antd";
import { useAsync, safeArray } from "hooks/useAsync";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { LockOutlined } from "@ant-design/icons";
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
import { useGeoLocationSelect } from "hooks/useGeoLocationSelect";

const getRegionName = (region) =>
  region?.vungMien || region?.name || region?.location || region?.city || region?.province || "";

const getRegionAreas = (region) => {
  const areas = region?.cumRap || region?.districts || region?.areas || region?.locations || [];
  return Array.isArray(areas)
    ? areas
        .map((area) => typeof area === "string" ? area : area?.name || area?.location || area?.district)
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

const getRegionCinemaCount = (region, cinemas) => {
  const areas = getRegionAreas(region).map(normalizeLocationText).filter(Boolean);
  const regionName = normalizeLocationText(getRegionName(region));

  return cinemas.filter((cinema) => {
    const address = normalizeLocationText(
      `${cinema?.location || ""} ${cinema?.region || ""} ${cinema?.address || ""}`,
    );
    return areas.length
      ? areas.some((area) => address.includes(area))
      : address.includes(regionName);
  }).length;
};

const AGE_RATING_CLASSES = {
  P: "age-rating-p",
  C13: "age-rating-c13",
  C16: "age-rating-c16",
  C18: "age-rating-c18",
};

function MovieCarousel({ movies, currentId, onSelect }) {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const didDrag = useRef(false);

  const onMouseDown = (e) => {
    isDragging.current = true;
    didDrag.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const x = e.pageX - ref.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 5) didDrag.current = true;
    ref.current.scrollLeft = scrollLeft.current - walk;
  };
  const onMouseUp = () => {
    isDragging.current = false;
    ref.current.style.cursor = "grab";
  };

  return (
    <div style={{ margin: "16px 0" }}>
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          cursor: "grab",
          paddingBottom: 8,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          userSelect: "none",
        }}
      >
        {movies.map((m) => (
          <div
            key={m._id}
            onClick={() => {
              if (!didDrag.current) onSelect(m._id);
            }}
            style={{
              flexShrink: 0,
              width: 110,
              borderRadius: 8,
              overflow: "hidden",
              border:
                m._id === currentId
                  ? "2px solid #1677ff"
                  : "2px solid transparent",
              transition: "border 0.2s",
              cursor: "pointer",
              background: "#f5f5f5",
            }}
          >
            <img
              src={m.banner}
              alt={m.title}
              width={110}
              height={150}
              draggable={false}
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: 150,
                objectFit: "contain",
                display: "block",
              }}
            />
            <div
              style={{
                padding: "5px 6px",
                fontSize: 11,
                fontWeight: m._id === currentId ? 600 : 400,
                color: m._id === currentId ? "#1677ff" : "#333",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                background: "#fff",
              }}
            >
              {m.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MovieDetail() {
  const navigate = useNavigate();
  const param = useParams();
  const userInfo = useSelector((state) => state.userReducer.userInfor);

  // =========================
  // STATE
  // =========================
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

  // =========================
  // LOAD MOVIE LIST
  // =========================
  useEffect(() => {
    fetchMovieListAPI().then((res) => {
      const list = res?.data?.content || res?.data || [];
      setMovieList(Array.isArray(list) ? list : []);
    });
  }, []);

  useEffect(() => {
    fetchBranchesAPI()
      .then((res) => {
        const data = res.data?.content || res.data?.data || res.data || [];
        setAllBranches(Array.isArray(data) ? data : []);
      })
      .catch(() => setAllBranches([]));
  }, []);

  // =========================
  // LOAD AREAS
  // =========================
  const {
    state: rawAreasList = [],
    loading: IsLoading,
    isError: IsError,
  } = useAsync({
    service: () => fetchLocationListAPI(),
    queryKey: ["areas-list", "active"],
  });

  const areasList = safeArray(rawAreasList);

  const spans = {
    col1: 6,
    col2: 6,
    col3: 6,
  };

  const activeRegionData = areasList?.find(
    (region) => getRegionName(region) === selectedRegionName,
  );

  // =========================
  // HELPERS
  // =========================
  const normalizeDateForApi = (dateStr) => {
    if (!dateStr) return dateStr;

    const m = String(dateStr).match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);

    if (!m) return dateStr;

    const [, d, mo, y] = m;

    return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(
      2,
      "0",
    )}`;
  };

  const loadBranchesByLocation = async (location) => {
    try {
      const res = await fetchBranchesAPI({ location });

      const data =
        res.data?.content ||
        res.data?.data ||
        res.data ||
        [];

      const list = Array.isArray(data) ? data : [];

      const unique = Array.from(
        new Map(
          list
            .filter((x) => x?.branch)
            .map((x) => [
              String(x.branch).trim(),
              {
                ...x,
                branch: String(x.branch).trim(),
              },
            ]),
        ).values(),
      );

      setBranches(unique);
    } catch (err) {
      console.error("Lỗi lấy danh sách chi nhánh:", err);
      setBranches([]);
    }
  };

  // =========================
  // GEO LOCATION
  // =========================
  const { decision } = useGeoLocationSelect({
    locations: areasList,

    cinemasProvider: async () => {
      const res = await fetchBranchesAPI();

      const data =
        res.data?.content ||
        res.data?.data ||
        res.data ||
        [];

      return Array.isArray(data) ? data : [];
    },

    askOnMount: true,

    onSelect: ({ regionName }) => {
      setSelectedRegionName(regionName || null);
      setSelectCity(null);

      setBranches([]);
      setSelectedCinemaName(null);
      setDataShowTimes([]);

      if (regionName) {
        loadBranchesByLocation(regionName);
      }
    },

    title: "Chia sẻ vị trí",
    content:
      "Bạn có muốn chia sẻ vị trí để tự động chọn khu vực không?",
  });

  // =========================
  // FALLBACK LOCATION
  // =========================
  useEffect(() => {
    if (decision !== "denied") return;

    if (
      !selectedRegionName &&
      Array.isArray(areasList) &&
      areasList.length > 0
    ) {
      const preferredRegion =
        areasList.find((r) => getRegionName(r) === "TP.HCM") ||
        areasList.find((r) =>
          String(getRegionName(r))
            .toLowerCase()
            .includes("hcm"),
        ) ||
        areasList[0];

      const regionName = getRegionName(preferredRegion) || null;

      setSelectedRegionName(regionName);
      setSelectCity(null);

      setBranches([]);
      setSelectedCinemaName(null);
      setDataShowTimes([]);

      if (regionName) {
        loadBranchesByLocation(regionName);
      }
    }
  }, [
    areasList,
    selectedRegionName,
    decision,
  ]);
  // =========================
  // MOVIE DETAIL
  // =========================
  useEffect(() => {
    const fetchMovie = async () => {
      if (!param.movieId) return;

      try {
        const res = await fetchMovieDetailAPI(
          param.movieId,
        );

        setMovieDetail(
          res.data?.content ||
            res.data ||
            null,
        );
      } catch (err) {
        console.error(
          "Lỗi lấy chi tiết phim:",
          err,
        );
      }
    };

    fetchMovie();
  }, [param.movieId]);

  // =========================
  // SHOWTIMES
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      if (
        !selectedCinemaName ||
        !localDate ||
        !param.movieId ||
        !selectedRegionName
      ) {
        setDataShowTimes([]);
        return;
      }

      setDataShowTimes([]);
      setLoadingInternal(true);

      try {
        const res = await fetchShowtimesAPI({
          branch: selectedCinemaName,
          date: normalizeDateForApi(localDate),
          idMovie: param.movieId,
          location: selectedRegionName,
        });

        const data =
          res.data?.content ||
          res.data ||
          [];

        setDataShowTimes(
          Array.isArray(data) ? data : [],
        );
      } catch (err) {
        console.error(
          "Lỗi lấy suất chiếu:",
          err,
        );

        setDataShowTimes([]);
      } finally {
        setLoadingInternal(false);
      }
    };

    fetchData();
  }, [
    selectedCinemaName,
    localDate,
    param.movieId,
    selectedRegionName,
  ]);

  // =========================
  // LOADING / ERROR
  // =========================
  if (IsLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (IsError) {
    return (
      <div className="text-center mt-5">
        <p>
          Đã có lỗi khi tải dữ liệu trang chủ.
        </p>
      </div>
    );
  }

  // =========================
  // RENDER
  // =========================

  const groupedShowtimes = dataShowTimes.reduce((groups, showtime) => {
    const roomName = showtime.theater?.name || "Phòng chiếu";
    const group = groups.find((item) => item.name === roomName);
    if (group) group.showtimes.push(showtime);
    else groups.push({ name: roomName, showtimes: [showtime] });
    return groups;
  }, []);
  const visibleBranches = branches.filter((item) =>
    item.branch?.toLowerCase().includes(branchSearch.trim().toLowerCase()),
  );

  return (
    <div className="detailPage py-3 container" style={{ flex: "1" }}>
      <SEO
        title={movieDetail?.tenPhim || "Chi tiết phim"}
        description={
          movieDetail?.moTa || "Xem lịch chiếu và đặt vé cho bộ phim này."
        }
        image={movieDetail?.hinhAnh}
      />
      <div className="movie-detail-tabs" role="tablist" aria-label="Chọn chế độ xem">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "booking"}
          className={activeTab === "booking" ? "is-active" : ""}
          onClick={() => setActiveTab("booking")}
        >
          MUA VÉ XEM PHIM
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "schedule"}
          className={activeTab === "schedule" ? "is-active" : ""}
          onClick={() => setActiveTab("schedule")}
        >
          LỊCH CHIẾU PHIM
        </button>
      </div>
      {activeTab === "booking" ? (
        <>
      <Calendar onDateChange={(date) => setLocalDate(date)} />
      <div className="showtime-picker">
        <section className="picker-column cinema-main-column">
          <div className="picker-heading">
            <h2>Rạp</h2>
          </div>

          <section className="favorite-cinema-row">
            <div>
              <h3>Rạp yêu thích</h3>
              <p>
                {userInfo
                  ? "Danh sách rạp yêu thích của bạn sẽ hiển thị tại đây."
                  : "Đăng nhập để xem và quản lý rạp yêu thích."}
              </p>
            </div>
            {!userInfo && (
              <Button icon={<LockOutlined />} onClick={() => navigate("/login")}>
                Đăng nhập
              </Button>
            )}
          </section>

          <section className="cinema-system-row">
            <div className="system-heading">
              <h3>Vùng</h3>
              <Input
                aria-label="Tìm rạp"
                placeholder="Tìm rạp"
                allowClear
                value={branchSearch}
                onChange={(event) => setBranchSearch(event.target.value)}
              />
            </div>
            <div className="system-cinema-content">
              <div className="location-list">
                {areasList.map((region, index) => {
                  const regionName = getRegionName(region);
                  if (!regionName) return null;

                  return (
                    <button
                      type="button"
                      key={region._id || regionName || index}
                      className={`location-option${selectedRegionName === regionName ? " is-active" : ""}`}
                      onClick={async () => {
                        setSelectedRegionName(regionName);
                        setSelectCity(null);
                        setBranches([]);
                        setSelectedCinemaName(null);
                        setDataShowTimes([]);
                        await loadBranchesByLocation(regionName);
                      }}
                    >
                      <span>{regionName}</span>
                      <span className="location-count">{getRegionCinemaCount(region, allBranches)}</span>
                    </button>
                  );
                })}
              </div>
              <div className="cinema-list">
                {visibleBranches.length ? visibleBranches.map((item) => (
                  <button
                    type="button"
                    key={item._id || item.branch}
                    className={`cinema-option${selectedCinemaName === item.branch ? " is-active" : ""}`}
                    onClick={() => setSelectedCinemaName(item.branch)}
                  >
                    <span>{item.branch}</span>
                    {item.address && <small>{item.address}</small>}
                  </button>
                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={selectCity ? "Không có rạp trong khu vực này" : "Chọn khu vực"} />}
              </div>
            </div>
          </section>
        </section>
        <section className="picker-column movie-column">
          <div className="picker-heading"><h2>Phim</h2></div>
          <div className="movie-list">
            {movieList.map((movie) => (
              <button
                type="button"
                key={movie._id}
                className={`movie-option${param.movieId === movie._id ? " is-active" : ""}`}
                onClick={() => movie._id !== param.movieId && navigate(`/movie/selectT/${movie._id}`)}
              >
                {AGE_RATING_CLASSES[movie.ageRating?.toUpperCase()] && (
                  <span className={`age-rating ${AGE_RATING_CLASSES[movie.ageRating.toUpperCase()]}`}>
                    {movie.ageRating.toUpperCase()}
                  </span>
                )} {movie.title}
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="selection-summary">
        <span>Ngày <strong>{localDate || "Chọn ngày"}</strong></span>
        <span>Rạp <strong>{selectedCinemaName || "Chọn rạp"}</strong></span>
        <span>Phim <strong>{movieDetail?.tenPhim || "Đang tải phim"}</strong></span>
      </div>
      <section className="showtime-results">
        <div className="results-heading">
          <h2>Giờ chiếu</h2>
          <p>Thời gian chiếu phim có thể chênh lệch 15 phút do chiến dịch quảng cáo.</p>
        </div>
        <Spin spinning={loadingInternal}>
          {!selectedCinemaName ? <Empty description="Chọn rạp để xem lịch chiếu" /> : groupedShowtimes.length ? (
            groupedShowtimes.map((group) => (
              <div className="room-schedule" key={group.name}>
                <h3>{selectedCinemaName} <span>{group.name}</span></h3>
                <div className="schedule-table-wrap">
                  <table className="schedule-table">
                    <thead><tr><th>Phòng chiếu</th><th>Giờ chiếu</th><th>Ghế còn trống</th></tr></thead>
                    <tbody>
                      {group.showtimes.map((showtime) => {
                        const seats = Array.isArray(showtime.seats) ? showtime.seats : [];
                        const availableSeats = seats.filter((seat) => !seat.isBooked).length;
                        const isPast = dayjs(showtime.startTime?.replace("Z", "")).isBefore(dayjs());
                        return (
                          <tr key={showtime._id}>
                            <td>{group.name}</td>
                            <td><Button disabled={isPast} onClick={() => navigate(`/booking/${showtime._id}`)}>{dayjs(showtime.startTime?.replace("Z", "")).format("HH:mm")}</Button></td>
                            <td>{availableSeats} / {seats.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : <Empty description={localDate ? "Ngày này không có suất chiếu" : "Chọn ngày xem suất chiếu"} />}
        </Spin>
      </section>
      {/* <CinemaBooking dataSource={data} /> */}
      <Card
        style={{
          borderRadius: "8px",
          minHeight: "600px",
          border: "1px solid #f0f0f0",
          overflow: "hidden",
        }}
        className="forPC"
      >
        <Row gutter={24} wrap={false} style={{ display: "flex" }}>
          <Col span={spans.col1}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Khu vực
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {areasList?.length > 0 ? (
                areasList.map((item, index) => (
                  <Button
                    key={item._id || item.vungMien || index}
                    type={
                      selectedRegionName === item.vungMien
                        ? "primary"
                        : "default"
                    }
                    onClick={async () => {
                      setSelectedRegionName(item.vungMien);
                      setBranches([]);
                      setSelectedCinemaName(null);
                      const firstCity = item?.cumRap?.[0] || null;
                      setSelectCity(firstCity);
                      if (firstCity) {
                        await loadBranchesByLocation(firstCity);
                      }
                    }}
                  >
                    {item.vungMien}
                  </Button>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có dữ liệu"
                />
              )}
            </div>
          </Col>

          <Col span={spans.col2} style={{ borderLeft: "0px solid #f0f0f0" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Thành phố
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {activeRegionData ? (
                activeRegionData.cumRap?.map((city, index) => (
                  <Button
                    key={index}
                    type={selectCity === city ? "primary" : "default"}
                    onClick={async () => {
                      setSelectCity(city);
                      setSelectedCinemaName(null);
                      await loadBranchesByLocation(city);
                    }}
                  >
                    {city}
                  </Button>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chọn vùng"
                />
              )}
            </div>
          </Col>

          <Col span={spans.col3} style={{ borderLeft: "1px solid #f0f0f0" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Chi nhánh
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {selectCity ? (
                branches.map((item, index) => (
                  <Button
                    key={index}
                    type={
                      selectedCinemaName === item.branch ? "primary" : "default"
                    }
                    onClick={() => setSelectedCinemaName(item.branch)}
                  >
                    {item.branch}
                  </Button>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chọn TP"
                />
              )}
            </div>
          </Col>

          <Col
            flex={selectedCinemaName ? "1" : "0 0 80px"}
            style={{
              borderLeft: "1px solid #f0f0f0",
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)", // Hiệu ứng mượt
              backgroundColor: selectedCinemaName ? "#fff" : "#fafafa",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "16px",
                textAlign: "center",
                opacity: selectedCinemaName ? 1 : 0, // Ẩn tiêu đề khi co lại
                display: selectedCinemaName ? "block" : "none", // Ẩn tiêu đề khi co lại
              }}
            >
              Suất chiếu
            </h2>

            <Spin spinning={loadingInternal}>
              <div style={{ padding: "0 10px" }}>
                {selectedCinemaName ? (
                  <List
                    grid={{ gutter: 12, column: "auto" }} // Hiển thị dạng lưới, 3 cột mỗi hàng
                    dataSource={dataShowTimes}
                    locale={{
                      emptyText: (
                        <Empty description="Hôm nay đã hết suất chiếu" />
                      ),
                    }}
                    renderItem={(item) => {
                      const isPast = dayjs(
                        item.startTime?.replace("Z", ""),
                      ).isBefore(dayjs());

                      return (
                        <List.Item style={{ marginBottom: "12px" }}>
                          <Button
                            block
                            disabled={isPast}
                            style={{
                              height: "auto",
                              padding: "8px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              borderRadius: "6px",
                              borderColor: isPast ? "#f0f0f0" : "#d9d9d9",
                              boxShadow: "0 2px 0 rgba(0,0,0,0.02)",
                            }}
                            onClick={() => {
                              navigate(`/booking/${item._id}`);
                            }}
                          >
                            {/* Giờ chiếu to, đậm */}
                            <span
                              style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: isPast ? "#bfbfbf" : "#1890ff",
                              }}
                            >
                              {dayjs(item.startTime?.replace("Z", "")).format(
                                "HH:mm",
                              )}
                            </span>

                            {/* Thông tin phụ nhỏ bên dưới (Ngày hoặc Loại phòng) */}
                            <span style={{ fontSize: "10px", color: "#999" }}>
                              {dayjs(item.startTime?.replace("Z", "")).format(
                                "DD/MM",
                              )}
                            </span>
                          </Button>
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <div
                    style={{
                      // writingMode: 'vertical-rl',
                      color: "#ddd",
                      fontSize: "20px",
                      fontWeight: "bold",
                      margin: "20px auto",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        // marginBottom: '16px',
                        textAlign: "center",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, 50%)",
                      }}
                    >
                      Suất chiếu
                    </h2>
                  </div>
                )}
              </div>
            </Spin>
          </Col>
        </Row>
      </Card>

      {/* Giao diện MOBILE (Hiện khi màn hình nhỏ) */}

      <Card
        style={{ borderRadius: "8px", marginBottom: "16px" }}
        className="forPhone"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Hàng 1: Khu vực */}
          <div>
            <label className="mobile-label">Khu vực</label>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn khu vực"
              value={selectedRegionName}
              onChange={(name) => {
                setSelectedRegionName(name);
                setBranches([]);
                setSelectedCinemaName(null);
                const regionData = areasList?.find(
                  (region) => region.vungMien === name,
                );
                const firstCity = regionData?.cumRap?.[0] || null;
                setSelectCity(firstCity);
                if (firstCity) {
                  loadBranchesByLocation(firstCity);
                }
              }}
              options={areasList.map((item) => ({
                label: item.vungMien,
                value: item.vungMien,
              }))}
            />
          </div>

          {/* Hàng 2: Thành phố */}
          <div>
            <label className="mobile-label">Thành phố</label>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn thành phố"
              value={selectCity}
              disabled={!selectedRegionName}
              onChange={async (city) => {
                setSelectCity(city);
                setSelectedCinemaName(null);
                await loadBranchesByLocation(city);
              }}
              options={activeRegionData?.cumRap?.map((city) => ({
                label: city,
                value: city,
              }))}
            />
          </div>

          {/* Hàng 3: Chi nhánh */}
          <div>
            <label className="mobile-label">Chi nhánh</label>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn chi nhánh"
              value={selectedCinemaName}
              disabled={!selectCity}
              onChange={(branch) => setSelectedCinemaName(branch)}
              options={branches.map((item) => ({
                label: item.branch,
                value: item.branch,
              }))}
            />
          </div>

          {/* Hàng 4: Suất chiếu (Dạng Grid cho dễ chọn trên mobile) */}
          <div>
            <label className="mobile-label">Suất chiếu</label>
            <Spin spinning={loadingInternal}>
              {selectedCinemaName ? (
                <div className="mobile-showtime-grid">
                  {dataShowTimes.length > 0 ? (
                    dataShowTimes.map((item) => {
                      const isPast = dayjs(
                        item.startTime?.replace("Z", ""),
                      ).isBefore(dayjs());
                      return (
                        <Button
                          key={item._id}
                          disabled={isPast}
                          className="showtime-btn"
                          onClick={() => navigate(`/booking/${item._id}`)}
                        >
                          <span className="time">
                            {dayjs(item.startTime?.replace("Z", "")).format(
                              "HH:mm",
                            )}
                          </span>
                          <span className="date">
                            {dayjs(item.startTime?.replace("Z", "")).format(
                              "DD/MM",
                            )}
                          </span>
                        </Button>
                      );
                    })
                  ) : (
                    <Empty description="Hết suất chiếu" />
                  )}
                </div>
              ) : (
                <div className="empty-placeholder">
                  Vui lòng chọn đầy đủ thông tin
                </div>
              )}
            </Spin>
          </div>
        </div>
      </Card>

        </>
      ) : (
        <section className="schedule-tab-content">
          <Calendar onDateChange={(date) => setLocalDate(date)} />
          <div className="results-heading">
            <h2>Lịch chiếu phim</h2>
            <p>
              {localDate || "Chưa chọn ngày"}
              {selectedCinemaName ? ` · ${selectedCinemaName}` : " · Chưa chọn rạp"}
            </p>
          </div>
          <Spin spinning={loadingInternal}>
            {groupedShowtimes.length ? (
              groupedShowtimes.map((group) => (
                <div className="room-schedule" key={group.name}>
                  <h3>{selectedCinemaName} <span>{group.name}</span></h3>
                  <div className="schedule-tab-list">
                    {group.showtimes.map((showtime) => {
                      const seats = Array.isArray(showtime.seats) ? showtime.seats : [];
                      const availableSeats = seats.filter((seat) => !seat.isBooked).length;
                      const isPast = dayjs(showtime.startTime?.replace("Z", "")).isBefore(dayjs());
                      return (
                        <div className="schedule-tab-row" key={showtime._id}>
                          <span>{dayjs(showtime.startTime?.replace("Z", "")).format("HH:mm")}</span>
                          <span>{availableSeats} / {seats.length} ghế trống</span>
                          <Button
                            disabled={isPast}
                            onClick={() => navigate(`/booking/${showtime._id}`)}
                          >
                            Chọn suất
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <Empty description="Chọn rạp và ngày ở tab Mua vé xem phim để xem lịch chiếu" />
            )}
          </Spin>
        </section>
      )}

    </div>
  );
}
