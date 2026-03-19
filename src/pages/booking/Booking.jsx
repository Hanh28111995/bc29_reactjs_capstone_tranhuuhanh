import "./index.scss";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { fetchShowtimesCusAPI, searchCustomerAPI } from "services/customer";
import SeatsRendering from "modules/seatsRendering/seatsRendering";
import { useSelector } from "react-redux";
import { notification, Modal, Input, Button, Spin } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import moment from "moment";
import { MaLoaiNguoiDung } from "enums/common";

export default function Booking() {
  const [danhSachGhe, setdanhSachGhe] = useState([]);
  const params = useParams();
  const navigate = useNavigate();
  const userState = useSelector((state) => state.userReducer);
  const role = userState.userInfor?.user_inf?.role;
  const isStaff = role === MaLoaiNguoiDung.NhanVien || role === MaLoaiNguoiDung.QuanTri;

  const [customerInfo, setCustomerInfo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const { state: data = [] } = useAsync({
    service: () => fetchShowtimesCusAPI(userState.userInfor?.user_inf.role, params.id),
    codintion: !!userState.userInfor?.user_inf?.id,
    dependencies: [params.id && userState.userInfor?.user_inf?.role]
  });

  const handleSelect = (type, selectChair) => {
    console.log('selectChair:', selectChair);
    setdanhSachGhe((prev) => {
      const idx = prev.findIndex((ele) => ele.seatNumber === selectChair.seatNumber);
      if (type === "deselect") return prev.filter((ele) => ele.seatNumber !== selectChair.seatNumber);
      if (type === "select") {
        if (idx !== -1) return prev;
        return [...prev, selectChair];
      }
      return prev;
    });
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    setSearching(true);
    try {
      const res = await searchCustomerAPI(searchKeyword);
      setSearchResults(res.data.content || []);
    } catch {
      notification.error({ message: "Tìm kiếm thất bại" });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setCustomerInfo(customer);
    setModalOpen(false);
    setSearchKeyword("");
    setSearchResults([]);
  };

  const handleSubmitTicket = async () => {
    if (danhSachGhe.length === 0) return notification.warning({ message: "Vui lòng chọn ghế!" });
    navigate(`/booking/payment/${params.id}`, {
      state: {
        bookingData: danhSachGhe,
        movieInfor: data?.id_movie,
        theater: data?.theater,
        time: moment(data?.startTime).format('DD/MM/YYYY HH:mm'),
        customerInfo: isStaff ? customerInfo : userState.userInfor?.user_inf,
      }
    });
  };

  return (
    <div className="container-fluid bookingPage">
      <div className="booking-wrapper">
        <div className="booking-sidebar">
          <div className="poster-container">
            <img className="movie-banner" src={data?.id_movie?.banner} alt={data?.id_movie?.title} />
          </div>

          <div className="info-item">
            <label>Tên phim:</label>
            <p className="highlight">{data?.id_movie?.title}</p>
          </div>

          <div className="info-item">
            <label>Tên rạp:</label>
            <p className="highlight">
              {data?.theater?.branch} <br />
              <span>Phòng {data?.theater?.name}</span>
            </p>
          </div>

          <div className="info-item">
            <label>Thời gian:</label>
            <p className="highlight">{moment(data?.startTime).format('DD/MM/YYYY HH:mm')}</p>
          </div>

          <div className="info-summary">
            <p className="selected-seats">
              Ghế đã chọn: <span>{danhSachGhe.map(el => el.seatNumber).join(", ") || "Chưa chọn"}</span>
            </p>
            <p className="total-price">
              Tổng tiền: <b>{danhSachGhe.reduce((total, el) => total + (el.price || 0), 0).toLocaleString()} VNĐ</b>
            </p>
          </div>

          {/* Thông tin khách hàng */}
          <div className="info-item customer-info-box">
            <label>Thông tin khách hàng:</label>
            {isStaff ? (
              customerInfo ? (
                <div style={{ marginTop: 8 }}>
                  <p><b>{customerInfo.name || customerInfo.username}</b></p>
                  <p>{customerInfo.phone}</p>
                  <p>{customerInfo.email}</p>
                  <Button size="small" onClick={() => setModalOpen(true)}>Đổi khách hàng</Button>
                </div>
              ) : (
                <Button icon={<UserOutlined />} onClick={() => setModalOpen(true)} style={{ marginTop: 8 }} block>
                  Tìm khách hàng
                </Button>
              )
            ) : (
              <div style={{ marginTop: 8 }}>
                <p><b>{userState.userInfor?.user_inf?.name || userState.userInfor?.user_inf?.username}</b></p>
                <p>{userState.userInfor?.user_inf?.phone}</p>
                <p>{userState.userInfor?.user_inf?.email}</p>
              </div>
            )}
          </div>

          <button className="btn-submit-booking" onClick={handleSubmitTicket}>
            ĐẶT VÉ
          </button>
        </div>

        <div className="booking-seats-area">
          <div className="screen-divider">Màn hình</div>
          <SeatsRendering
            data={data?.seats || []}
            mode={role}
            onAction={handleSelect}
            selectedSeats={danhSachGhe}
          />
        </div>
      </div>

      {/* Modal tìm kiếm khách hàng */}
      <Modal
        title="Tìm kiếm khách hàng"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Input.Search
          placeholder="Nhập tên, SĐT hoặc email..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={handleSearch}
          enterButton={<Button icon={<SearchOutlined />} onClick={handleSearch}>Tìm</Button>}
        />
        <Spin spinning={searching}>
          <div style={{ marginTop: 12, maxHeight: 300, overflowY: 'auto' }}>
            {searchResults.map((customer) => (
              <div
                key={customer._id}
                onClick={() => handleSelectCustomer(customer)}
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <b>{customer.name || customer.username}</b>
                <span style={{ marginLeft: 8, color: '#888' }}>{customer.phone}</span>
                <span style={{ marginLeft: 8, color: '#888' }}>{customer.email}</span>
              </div>
            ))}
            {!searching && searchResults.length === 0 && searchKeyword && (
              <p style={{ textAlign: 'center', color: '#aaa', marginTop: 16 }}>Không tìm thấy khách hàng</p>
            )}
          </div>
        </Spin>
      </Modal>
    </div>
  );
}
