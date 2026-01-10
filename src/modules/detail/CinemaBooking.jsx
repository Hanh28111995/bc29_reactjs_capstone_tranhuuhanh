import React, { useEffect, useState } from 'react';
import { Tabs, Button, List, Card, Row, Col, Tag } from 'antd';
import moment from 'moment';

const CinemaBooking = ({ dataSource = [] }) => {
  // 1. Khởi tạo state là chuỗi rỗng để tránh lỗi "reading undefined"
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCinema, setSelectedCinema] = useState(null);

  // 2. Tự động chọn vùng miền đầu tiên khi có dữ liệu từ API
  useEffect(() => {
    if (dataSource.length > 0) {
      setSelectedRegion(dataSource[0]._id);
    }
  }, [dataSource]);

  // 3. Logic tìm vùng miền đang chọn - Dùng trực tiếp item._id
  const activeRegionData = dataSource.find(item => item._id === selectedRegion);

  return (
    <Card style={{ backgroundColor: '#fff', borderRadius: '8px' }}>
      <Row gutter={24}>
        {/* CỘT BÊN TRÁI: RẠP */}
        <Col span={12} style={{ borderRight: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Rạp</h2>
          <Tabs
            tabPosition="left"
            activeKey={selectedRegion}
            onChange={(key) => setSelectedRegion(key)}
            items={dataSource.map((item) => ({
              key: item._id, // Key bây giờ là chuỗi ID trực tiếp
              label: `${item.vungMien} (${item.cumRap.length})`,
              children: (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px' }}>
                  {item.cumRap.map((rap, index) => (
                    <Button
                      key={index}
                      type={selectedCinema === rap ? 'primary' : 'default'}
                      onClick={() => setSelectedCinema(rap)}
                      style={{
                        height: 'auto',
                        padding: '8px 16px',
                        backgroundColor: selectedCinema === rap ? '#1890ff' : '#eee',
                        border: 'none',
                        color: selectedCinema === rap ? '#fff' : '#333'
                      }}
                    >
                      {rap}
                    </Button>
                  ))}
                </div>
              ),
            }))}
          />
        </Col>

        {/* CỘT BÊN PHẢI: PHIM */}
        <Col span={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Phim</h2>
          </div>

          <List
            dataSource={[
              { id: 1, title: 'THIÊN ĐƯỜNG MÁU', age: '16' },
              { id: 2, title: 'AVATAR: LỬA VÀ TRO TÀN', age: '13' },
              { id: 3, title: 'TOM & JERRY: CHIẾC LA BÀN KỲ BÍ', age: 'P' },
            ]}
            renderItem={(item) => (
              <List.Item
                style={{ cursor: 'pointer', padding: '12px', borderBottom: '1px solid #f0f0f0' }}
                onClick={() => console.log("Chọn phim:", item.title)}
              >
                <Tag color={item.age === 'P' ? 'green' : 'magenta'}>{item.age}</Tag>
                <span style={{ fontWeight: 'bold' }}>{item.title}</span>
              </List.Item>
            )}
          />
        </Col>
      </Row>

      {/* FOOTER */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#d6cfb5',
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}>
        <span>Ngày: <b>{moment().format('DD/MM/YYYY')}</b></span>
        <span>Rạp: {selectedCinema ? <Tag color="blue">{selectedCinema}</Tag> : "Chưa chọn"}</span>
      </div>
    </Card>
  );
};

export default CinemaBooking;