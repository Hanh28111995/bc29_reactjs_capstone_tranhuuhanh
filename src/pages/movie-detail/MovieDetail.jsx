import React, { useEffect, useRef, useState } from 'react';
import { Button, List, Card, Row, Col, Empty, Spin, Select } from 'antd';
import { useAsync, safeArray } from 'hooks/useAsync';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchShowtimesAPI, fetchBranchesAPI, fetchMovieDetailAPI, fetchMovieListAPI } from 'services/general';
import Calendar from 'modules/showTime/Calendar';
import dayjs from 'dayjs';
import { fetchLocationListAPI } from 'services/general';
import './index.scss';
import SEO from 'components/SEO';
import { useGeoLocationSelect } from 'hooks/useGeoLocationSelect';

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
        ref.current.style.cursor = 'grabbing';
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
        ref.current.style.cursor = 'grab';
    };

    return (
        <div style={{ margin: '16px 0' }}>
            <div
                ref={ref}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    cursor: 'grab',
                    paddingBottom: 8,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    userSelect: 'none',
                }}
            >
                {movies.map((m) => (
                    <div
                        key={m._id}
                        onClick={() => { if (!didDrag.current) onSelect(m._id); }}
                        style={{
                            flexShrink: 0,
                            width: 110,
                            borderRadius: 8,
                            overflow: 'hidden',
                            border: m._id === currentId ? '2px solid #1677ff' : '2px solid transparent',
                            transition: 'border 0.2s',
                            cursor: 'pointer',
                            background: '#f5f5f5',
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
                            style={{ width: '100%', height: 150, objectFit: 'contain', display: 'block' }}
                        />
                        <div style={{
                            padding: '5px 6px',
                            fontSize: 11,
                            fontWeight: m._id === currentId ? 600 : 400,
                            color: m._id === currentId ? '#1677ff' : '#333',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            background: '#fff',
                        }}>
                            {m.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MovieDetail() {
    const navigate = useNavigate()
    const param = useParams();
    const [selectedRegionName, setSelectedRegionName] = useState(null);
    const [selectCity, setSelectCity] = useState(null);
    const [selectedCinemaName, setSelectedCinemaName] = useState(null);
    const [branches, setBranches] = useState([]);
    const [localDate, setLocalDate] = useState(null);
    const [movieDetail, setMovieDetail] = useState(null);
    const [movieList, setMovieList] = useState([]);

    useEffect(() => {
        fetchMovieListAPI().then((res) => {
            const list = res?.data?.content || res?.data || [];
            setMovieList(Array.isArray(list) ? list : []);
        });
    }, []);


    const { state: rawAreasList } = useAsync({ service: fetchLocationListAPI });
    const areasList = safeArray(rawAreasList);
    const spans = { col1: 6, col2: 6, col3: 6 };

    const activeRegionData = areasList?.find(region => region.vungMien === selectedRegionName);

    const [dataShowTimes, setDataShowTimes] = useState([]);
    const [loadingInternal, setLoadingInternal] = useState(false);

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
            const data = res.data?.content || res.data?.data || res.data || [];
            const list = Array.isArray(data) ? data : [];
            const unique = Array.from(
                new Map(
                    list
                        .filter((x) => x?.branch)
                        .map((x) => [String(x.branch).trim(), { branch: String(x.branch).trim() }]),
                ).values(),
            );
            setBranches(unique);
        } catch (err) {
            setBranches([]);
        }
    };

    const { decision } = useGeoLocationSelect({
        locations: areasList,
        cinemasProvider: async () => {
            const res = await fetchBranchesAPI();
            const data = res.data?.content || res.data?.data || res.data || [];
            return Array.isArray(data) ? data : [];
        },
        askOnMount: true,
        onSelect: ({ regionName, district }) => {
            setSelectedRegionName(regionName || null);
            setSelectCity(district || null);
            setBranches([]);
            setSelectedCinemaName(null);
            if (district) {
                loadBranchesByLocation(district);
            }
        },
        title: "Chia sẻ vị trí",
        content: "Bạn có muốn chia sẻ vị trí để tự động chọn khu vực không?",
    });

    useEffect(() => {
        if (decision !== "denied") return;
        if (!selectedRegionName && Array.isArray(areasList) && areasList.length > 0) {
            const preferredRegion =
                areasList.find((r) => r?.vungMien === "TP.HCM") ||
                areasList.find((r) => String(r?.vungMien || "").toLowerCase().includes("hcm")) ||
                areasList[0];
            const firstRegion = preferredRegion;
            const regionName = firstRegion?.vungMien || null;
            const firstCity = firstRegion?.cumRap?.[0] || null;

            setSelectedRegionName(regionName);
            setSelectCity(firstCity);
            setBranches([]);
            setSelectedCinemaName(null);

            if (firstCity) {
                loadBranchesByLocation(firstCity);
            }
        }
    }, [areasList, selectedRegionName, decision]);

    useEffect(() => {
        const fetchMovie = async () => {
            if (param.movieId) {
                try {
                    const res = await fetchMovieDetailAPI(param.movieId);
                    setMovieDetail(res.data?.content || res.data || null);
                } catch (err) {
                    console.error("Lỗi lấy chi tiết phim:", err);
                }
            }
        };
        fetchMovie();
    }, [param.movieId]);

    useEffect(() => {
        const fetchData = async () => {
            if (selectedCinemaName && localDate && param.movieId && selectedRegionName) {
                setLoadingInternal(true); // Chỉ loading nội bộ component này
                try {
                    const res = await fetchShowtimesAPI({
                        branch: selectedCinemaName,
                        date: normalizeDateForApi(localDate),
                        idMovie: param.movieId,
                        location: selectedRegionName,
                    });
                    setLoadingInternal(false);
                    setDataShowTimes(res.data?.content || res.data || []);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoadingInternal(false);
                }
            }
        };

        fetchData();
    }, [selectedCinemaName, localDate, param.movieId, selectedRegionName]);

    return (
        <div className="detailPage py-3 container" style={{ flex: '1' }}>
            <SEO 
                title={movieDetail?.tenPhim || "Chi tiết phim"} 
                description={movieDetail?.moTa || "Xem lịch chiếu và đặt vé cho bộ phim này."}
                image={movieDetail?.hinhAnh}
            />
            {/* <CinemaBooking dataSource={data} /> */}
            <Card style={{ borderRadius: '8px', minHeight: '600px', border: '1px solid #f0f0f0', overflow: 'hidden' }} className="forPC">

                <Row gutter={24} wrap={false} style={{ display: 'flex' }}>
                    <Col span={spans.col1}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Khu vực</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {areasList?.length > 0 ? (
                                areasList.map((item, index) => (
                                    <Button
                                        key={item._id || item.vungMien || index}
                                        type={selectedRegionName === item.vungMien ? 'primary' : 'default'}
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
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" />
                            )}
                        </div>
                    </Col>

                    <Col span={spans.col2} style={{ borderLeft: '0px solid #f0f0f0' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>Thành phố</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {activeRegionData ? (
                                activeRegionData.cumRap?.map((city, index) => (
                                    <Button
                                        key={index}
                                        type={selectCity === city ? 'primary' : 'default'}
                                        onClick={async () => {
                                            setSelectCity(city);
                                            setSelectedCinemaName(null);
                                            await loadBranchesByLocation(city);
                                        }}
                                    >
                                        {city}
                                    </Button>
                                ))
                            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chọn vùng" />}
                        </div>
                    </Col>

                    <Col span={spans.col3} style={{ borderLeft: '1px solid #f0f0f0' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>Chi nhánh</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {selectCity ? (
                                branches.map((item, index) => (
                                    <Button
                                        key={index}
                                        type={selectedCinemaName === item.branch ? 'primary' : 'default'}
                                        onClick={() => setSelectedCinemaName(item.branch)}
                                    >
                                        {item.branch}
                                    </Button>
                                ))
                            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chọn TP" />}
                        </div>
                    </Col>

                    <Col
                        flex={selectedCinemaName ? "1" : "0 0 80px"}
                        style={{
                            borderLeft: '1px solid #f0f0f0',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', // Hiệu ứng mượt
                            backgroundColor: selectedCinemaName ? '#fff' : '#fafafa',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <h2 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            textAlign: 'center',
                            opacity: selectedCinemaName ? 1 : 0,// Ẩn tiêu đề khi co lại            
                            display: selectedCinemaName ? 'block' : 'none',// Ẩn tiêu đề khi co lại            
                        }}>
                            Suất chiếu
                        </h2>

                        <Spin spinning={loadingInternal}>
                            <div style={{ padding: '0 10px' }}>
                                {selectedCinemaName ? (
                                    <List
                                        grid={{ gutter: 12, column: 'auto' }} // Hiển thị dạng lưới, 3 cột mỗi hàng
                                        dataSource={dataShowTimes}
                                        locale={{ emptyText: <Empty description="Hôm nay đã hết suất chiếu" /> }}
                                        renderItem={(item) => {
                                            const isPast = dayjs(item.startTime?.replace('Z', '')).isBefore(dayjs());

                                            return (
                                                <List.Item style={{ marginBottom: '12px' }}>
                                                    <Button
                                                        block
                                                        disabled={isPast}
                                                        style={{
                                                            height: 'auto',
                                                            padding: '8px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            borderRadius: '6px',
                                                            borderColor: isPast ? '#f0f0f0' : '#d9d9d9',
                                                            boxShadow: '0 2px 0 rgba(0,0,0,0.02)'
                                                        }}
                                                        onClick={() => {
                                                            navigate(`/booking/${item._id}`);
                                                        }}
                                                    >
                                                        {/* Giờ chiếu to, đậm */}
                                                        <span style={{
                                                            fontSize: '16px',
                                                            fontWeight: 'bold',
                                                            color: isPast ? '#bfbfbf' : '#1890ff'
                                                        }}>
                                                            {dayjs(item.startTime?.replace('Z', '')).format('HH:mm')}
                                                        </span>

                                                        {/* Thông tin phụ nhỏ bên dưới (Ngày hoặc Loại phòng) */}
                                                        <span style={{ fontSize: '10px', color: '#999' }}>
                                                            {dayjs(item.startTime?.replace('Z', '')).format('DD/MM')}
                                                        </span>
                                                    </Button>
                                                </List.Item>
                                            );
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        // writingMode: 'vertical-rl',
                                        color: '#ddd',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        margin: '20px auto',
                                    }}>
                                        <h2 style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            // marginBottom: '16px',
                                            textAlign: 'center',
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, 50%)',
                                        }}>
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

            <Card style={{ borderRadius: '8px', marginBottom: '16px' }} className="forPhone">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Hàng 1: Khu vực */}
                    <div>
                        <label className="mobile-label">Khu vực</label>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Chọn khu vực"
                            value={selectedRegionName}
                            onChange={(name) => {
                                setSelectedRegionName(name);
                                setBranches([]);
                                setSelectedCinemaName(null);
                                const regionData = areasList?.find((region) => region.vungMien === name);
                                const firstCity = regionData?.cumRap?.[0] || null;
                                setSelectCity(firstCity);
                                if (firstCity) {
                                    loadBranchesByLocation(firstCity);
                                }
                            }}
                            options={areasList.map(item => ({ label: item.vungMien, value: item.vungMien }))}
                        />
                    </div>

                    {/* Hàng 2: Thành phố */}
                    <div>
                        <label className="mobile-label">Thành phố</label>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Chọn thành phố"
                            value={selectCity}
                            disabled={!selectedRegionName}
                            onChange={async (city) => {
                                setSelectCity(city);
                                setSelectedCinemaName(null);
                                await loadBranchesByLocation(city);
                            }}
                            options={activeRegionData?.cumRap?.map(city => ({ label: city, value: city }))}
                        />
                    </div>

                    {/* Hàng 3: Chi nhánh */}
                    <div>
                        <label className="mobile-label">Chi nhánh</label>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Chọn chi nhánh"
                            value={selectedCinemaName}
                            disabled={!selectCity}
                            onChange={(branch) => setSelectedCinemaName(branch)}
                            options={branches.map(item => ({ label: item.branch, value: item.branch }))}
                        />
                    </div>

                    {/* Hàng 4: Suất chiếu (Dạng Grid cho dễ chọn trên mobile) */}
                    <div>
                        <label className="mobile-label">Suất chiếu</label>
                        <Spin spinning={loadingInternal}>
                            {selectedCinemaName ? (
                                <div className="mobile-showtime-grid">
                                    {dataShowTimes.length > 0 ? dataShowTimes.map((item) => {
                                        const isPast = dayjs(item.startTime?.replace('Z', '')).isBefore(dayjs());
                                        return (
                                            <Button
                                                key={item._id}
                                                disabled={isPast}
                                                className="showtime-btn"
                                                onClick={() => navigate(`/booking/${item._id}`)}
                                            >
                                                <span className="time">{dayjs(item.startTime?.replace('Z', '')).format('HH:mm')}</span>
                                                <span className="date">{dayjs(item.startTime?.replace('Z', '')).format('DD/MM')}</span>
                                            </Button>
                                        );
                                    }) : <Empty description="Hết suất chiếu" />}
                                </div>
                            ) : (
                                <div className="empty-placeholder">Vui lòng chọn đầy đủ thông tin</div>
                            )}
                        </Spin>
                    </div>
                </div>
            </Card>
            

            {/* Carousel phim — đổi movie */}
            {movieList.length > 0 && (
                <MovieCarousel
                    movies={movieList}
                    currentId={param.movieId}
                    onSelect={(id) => navigate(`/movie/selectT/${id}`)}
                />
            )}

            <Calendar onDateChange={(date) => setLocalDate(date)} />
        </div>
    );
};
