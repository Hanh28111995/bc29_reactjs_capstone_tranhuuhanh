import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../contexts/loading.context";
import { useAsync } from "../../hooks/useAsync";
import { Spin } from "antd";
import dayjs from "dayjs";
import { fetchPromotionListAPI } from "services/general";
import "./index.scss";

export default function PromotionList() {
  const navigate = useNavigate();
  const [, setLoadingState] = useContext(LoadingContext);  

  const {
    state: rawPromotionList = [],
    loading: isLoading,
    isError,
    error,
  } = useAsync({
    service: () => fetchPromotionListAPI(),
    queryKey: ["promotions"], // Đã sửa lại queryKey cho đúng
  });
  
  const promotionList = Array.isArray(rawPromotionList) ? rawPromotionList : [];

  useEffect(() => {
    setLoadingState({ isLoading });
  }, [isLoading, setLoadingState]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center mt-5">
        <p>Đã có lỗi khi tải danh sách promotion.</p>
        <p>{error?.message || "Vui lòng thử lại sau."}</p>
      </div>
    );
  }  

  return (
    <div className="container-fluid my-5 movie-list-container">            
      <div className="row mt-3 w-lg-75 movie-list-row">
        {promotionList.map((ele) => (
          <div className="col-3 mb-4" key={ele._id}>
            <div className="card movie-card h-100" onClick={() => navigate(`/promotion/${ele._id}`)} style={{ cursor: "pointer" }}>
              <div className="card-header-wrapper">
                {/* Đã sửa tag thành title */}
                <img 
                  className="card-img-top" 
                  src={ele.banner} 
                  alt={ele.title} 
                  width={300} 
                  height={200} 
                  style={{ objectFit: "cover" }}
                  loading="lazy" 
                  decoding="async" 
                />             
              </div>
              <div className="card-body-custom p-3">
                {/* Bổ sung hiển thị Title vì Model có trường này */}
                <h5 className="card-title text-truncate" title={ele.title}>
                  {ele.title}
                </h5>
                
                {/* Hiển thị ngày tháng an toàn hơn (phòng trường hợp schema cho phép null/undefined) */}
                <p className="movie-release text-muted mb-0">
                  {ele.startDate ? dayjs(ele.startDate).format('DD/MM/YYYY') : "Đang cập nhật"} 
                  {" - "} 
                  {ele.endDate ? dayjs(ele.endDate).format('DD/MM/YYYY') : "Không thời hạn"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}