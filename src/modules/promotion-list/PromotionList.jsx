import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../contexts/loading.context";
import { useAsync } from "../../hooks/useAsync";
import { Radio, Spin } from "antd";
import dayjs from "dayjs";
import { fetchPromotionListAPI } from "services/general";
import "./../movie-list/index.scss";

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
    queryKey: ["movies"],
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
        <p>Đã có lỗi khi tải danh sách phim.</p>
        <p>{error?.message || "Vui lòng thử lại sau."}</p>
      </div>
    );
  }  

  return (
    <div className="container-fluid my-5 movie-list-container">            
      <div className="row mt-3  w-lg-75 movie-list-row">
        {promotionList.map((ele) => (
          <div className="col-3" key={ele._id}>
            <div className="card movie-card" onClick={() => navigate(`/promotion/${ele._id}`)}>
              <div className="card-header-wrapper">
                <img className="card-img-top" src={ele.banner} alt={ele.tag} width={300} height={350} loading="lazy" decoding="async" />                
              </div>
              <div className="card-body-custom">                
                <h4 className="movie-release">
                   {dayjs(ele.startDate).format('DD/MM/YYYY')} - {dayjs(ele.endDate).format('DD/MM/YYYY')}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}