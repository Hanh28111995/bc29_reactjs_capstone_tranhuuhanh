import React, { useEffect, useState } from 'react';
import { Tabs, Button, List, Card, Row, Col, Tag, Empty, Space } from 'antd';
import moment from 'moment';
import { fetchShowtimesAPI, fetchBranchesAPI } from 'services/general';
import { useAsync } from 'hooks/useAsync';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function CinemaBooking(props) {

  const param = useParams();
  const [selectedRegionName, setSelectedRegionName] = useState(null);
  const [selectCity, setSelectCity] = useState(null);
  const [selectedCinemaName, setSelectedCinemaName] = useState(null);
  const [branches, setBranches] = useState([]);


  const activeRegionData = props.dataSource?.find(region => region.vungMien === selectedRegionName);

  // 1. Khai báo hook useAsync trước
  const { state: dataShowTimes = [], loading: loadingShowtimes } = useAsync({
    dependencies: [selectedCinemaName, props.date, param.movieId, selectedRegionName],
    condition: !!(selectedCinemaName && props.date && param.movieId && selectedRegionName),
    service: () => fetchShowtimesAPI({
      branch: selectedCinemaName,
      date: props.date,
      idMovie: param.movieId,
      location: selectedRegionName,
    }),
  });

  // 2. Sau đó mới định nghĩa các biến phụ thuộc vào dataShowTimes  
  const spans = { col1: 6, col2: 6, col3: 6 };


  return (
    <Card style={{ borderRadius: '8px', minHeight: '600px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
      <Row gutter={24} wrap={false} style={{ display: 'flex' }}>

        {/* CỘT 1, 2, 3 giữ nguyên */}
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
            items={props.dataSource.map((item) => ({
              key: item.vungMien,
              label: item.vungMien,
            }))}
          />
        </Col>

        <Col span={spans.col2} style={{ borderLeft: '1px solid #f0f0f0' }}>
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

          <Space>
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
                            console.log("Chọn suất chiếu:", item._id);
                            // Điều hướng sang trang chọn ghế tại đây
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
                  writingMode: 'vertical-rl',
                  color: '#ddd',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: '20px auto',
                }}>
                  <h2 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    textAlign: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}>
                    Suất chiếu
                  </h2>
                </div>
              )}
            </div>
          </Space>
        </Col>

      </Row>
    </Card>
  );
};

