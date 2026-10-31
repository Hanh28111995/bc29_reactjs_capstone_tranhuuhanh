import "./index.scss";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { fetchShowtimesCusAPI, searchCustomerAPI } from "services/customer";
import SeatsRendering from "modules/seatsRendering/seatsRendering";
import { useSelector } from "react-redux";
import { notification, Modal, Input, Button, Spin, Space } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { MaLoaiNguoiDung } from "enums/common";
import { useTranslation } from "react-i18next";

export default function Booking() {
  const { t } = useTranslation();
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

  const {
    state: rawData = {},
    loading: dataLoading,
    isError: showtimeError,
    error: showtimeQueryError,
  } = useAsync({
    service: () => fetchShowtimesCusAPI(userState.userInfor?.user_inf?.role, params.id),
    condition: !!userState.userInfor?.user_inf?.role && !!params.id,
    dependencies: [userState.userInfor?.user_inf?.role, params.id],
    queryKey: ["showtimeDetail", userState.userInfor?.user_inf?.role, params.id],
  });  

  const data = !Array.isArray(rawData)
    ? (rawData?.showtimes ?? rawData?.showtime ?? rawData)
    : null;

  if (showtimeError) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <p>{t("booking.showtimeLoadError")}</p>
          <p>{showtimeQueryError?.message || t("common.tryAgain")}</p>
        </div>
      </div>
    );
  }

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
      const res = await searchCustomerAPI(role, searchKeyword);
      setSearchResults(res.data.content || []);
    } catch {
      notification.error({ message: t("booking.searchFailed") });
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

  const handleSubmitTicket = async (mode = "buy") => {
    if (danhSachGhe.length === 0) return notification.warning({ message: t("booking.chooseSeats") });
    navigate(`/booking/payment/${params.id}`, {
      state: {
        bookingData: danhSachGhe,
        movieInfor: data?.id_movie,
        theater: data?.theater,
        time: data?.startTime,
        customerInfo: isStaff ? customerInfo : userState.userInfor?.user_inf,
        mode, // "buy" | "reserve"
      }
    });
  };

  return (
    <div className="container-fluid bookingPage">
      <div className="booking-wrapper">
        <div className="booking-sidebar">
          {/* <div className="poster-container">
            <img className="movie-banner" src={data?.id_movie?.banner} alt={data?.id_movie?.title} />
          </div> */}

          <div className="info-item">
            <label>{t("booking.movie")}</label>
            <p className="highlight">{data?.id_movie?.title}</p>
          </div>

          <div className="info-item">
            <label>{t("booking.cinema")}</label>
            <p className="highlight">
              {data?.theater?.branch} <br />
              <span>{t("booking.room", { name: data?.theater?.name })}</span>
            </p>
          </div>

          <div className="info-item">
            <label>{t("booking.time")}</label>
            <p className="highlight">{dayjs(data?.startTime?.replace('Z', '')).format('DD/MM/YYYY HH:mm')}</p>
          </div>

          <div className="info-summary">
            <p className="selected-seats">
              {t("booking.selectedSeats")} <span>{danhSachGhe.map(el => el.seatNumber).join(", ") || t("booking.noSeatSelected")}</span>
            </p>
            <p className="total-price">
              {t("booking.total")} <b>{danhSachGhe.reduce((total, el) => total + (el.price || 0), 0).toLocaleString()} {t("booking.currency")}</b>
            </p>
          </div>

          {/* Thông tin khách hàng */}
          <div className="info-item customer-info-box">
            <label>{t("booking.customerInfo")}</label>
            {isStaff ? (
              customerInfo ? (
                <div style={{ marginTop: 8 }}>
                  <p><b>{customerInfo.name || customerInfo.username}</b></p>
                  <p>{customerInfo.phone}</p>
                  <p>{customerInfo.email}</p>
                  <Button size="small" onClick={() => setModalOpen(true)}>{t("booking.changeCustomer")}</Button>
                </div>
              ) : (
                <Button icon={<UserOutlined />} onClick={() => setModalOpen(true)} style={{ marginTop: 8 }} block>
                  {t("booking.findCustomer")}
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

          <Space direction="vertical" style={{ width: '100%' }}>
            <button className="btn-submit-booking" onClick={() => handleSubmitTicket("buy")}>
              {t("booking.buyTickets")}
            </button>
            {!isStaff && (
              <button className="btn-submit-booking btn-reserve" onClick={() => handleSubmitTicket("reserve")}>
                {t("booking.reserveTickets")}
              </button>
            )}
          </Space>
        </div>

        <div className="booking-seats-area">
          <div className="screen-divider">{t("booking.screen")}</div>
          <Spin spinning={dataLoading}>
            <SeatsRendering
              data={data?.seats || []}
              mode={role}
              onAction={handleSelect}
              selectedSeats={danhSachGhe}
            />
          </Spin>
        </div>
      </div>

      <Modal
        title={t("booking.customerSearch")}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Input.Search
          placeholder={t("booking.customerPlaceholder")}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={handleSearch}
          enterButton={<Button icon={<SearchOutlined />} onClick={handleSearch}>{t("booking.search")}</Button>}
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
              <p style={{ textAlign: 'center', color: '#aaa', marginTop: 16 }}>{t("booking.customerNotFound")}</p>
            )}
          </div>
        </Spin>
      </Modal>
    </div>
  );
}
