import React, { useEffect, useState } from 'react';
import { Tabs, Button, List, Card, Row, Col, Tag, Empty, Spin, Select } from 'antd';
import { useAsync } from 'hooks/useAsync';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchShowtimesAPI, fetchBranchesAPI } from 'services/general';
import Calendar from 'modules/showTime/Calendar';
import moment from 'moment';
import { fetchLocationListAPI } from 'services/general';
import './index.scss';

export default function MovieDetail() {
    const navigate = useNavigate()
    const param = useParams();
    const [selectedRegionName, setSelectedRegionName] = useState(null);
    const [selectCity, setSelectCity] = useState(null);
    const [selectedCinemaName, setSelectedCinemaName] = useState(null);
    const [branches, setBranches] = useState([]);
    const [localDate, setLocalDate] = useState(null);


    const { state: areasList = [] } = useAsync({ service: fetchLocationListAPI });
    const spans = { col1: 6, col2: 6, col3: 6 };

    const activeRegionData = areasList?.find(region => region.vungMien === selectedRegionName);

    const [dataShowTimes, setDataShowTimes] = useState([]);
    const [loadingInternal, setLoadingInternal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (selectedCinemaName && localDate && param.movieId && selectedRegionName) {
                setLoadingInternal(true); // Chỉ loading nội bộ component này
                try {
                    const res = await fetchShowtimesAPI({
                        branch: selectedCinemaName,
                        date: localDate,
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
            {/* <CinemaBooking dataSource={data} /> */}
            <Card style={{ borderRadius: '8px', minHeight: '600px', border: '1px solid #f0f0f0', overflow: 'hidden' }} className="forPC">

                <Row gutter={24} wrap={false} style={{ display: 'flex' }}>
                    <Col span={spans.col1}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Khu vực</h2>
                        <Tabs
                            tabPosition="left"
                            activeKey={selectedRegionName}
                            onChange={(name) => {
                                setSelectedRegionName(name);
                                setSelectCity(null);
                                setBranches([]);
                                setSelectedCinemaName(null);
                            }}
                            items={areasList.map((item) => ({
                                key: item.vungMien,
                                label: item.vungMien,
                            }))}
                        />
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
                                            try {
                                                const res = await fetchBranchesAPI({ location: city });
                                                const data = res.data?.content || res.data || [];
                                                setBranches(data);
                                            } catch (err) { setBranches([]); }
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
                                            const isPast = moment(item.startTime).isBefore(moment()); // Kiểm tra giờ đã qua chưa

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
                                                            {moment(item.startTime).format('HH:mm')}
                                                        </span>

                                                        {/* Thông tin phụ nhỏ bên dưới (Ngày hoặc Loại phòng) */}
                                                        <span style={{ fontSize: '10px', color: '#999' }}>
                                                            {moment(item.startTime).format('DD/MM')}
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
                                setSelectCity(null);
                                setBranches([]);
                                setSelectedCinemaName(null);
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
                                try {
                                    const res = await fetchBranchesAPI({ location: city });
                                    const data = res.data?.content || res.data || [];
                                    setBranches(data);
                                } catch (err) { setBranches([]); }
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
                                        const isPast = moment(item.startTime).isBefore(moment());
                                        return (
                                            <Button
                                                key={item._id}
                                                disabled={isPast}
                                                className="showtime-btn"
                                                onClick={() => navigate(`/booking/${item._id}`)}
                                            >
                                                <span className="time">{moment(item.startTime).format('HH:mm')}</span>
                                                <span className="date">{moment(item.startTime).format('DD/MM')}</span>
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
            

            <Calendar onDateChange={(date) => setLocalDate(date)} />
        </div>
    );
};
