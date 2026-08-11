import React, { useContext } from "react";
import "./../home/index.scss";
import { Spin } from "antd";
import { useParams } from "react-router-dom";

export default function PromotionDetail() {
  const param = useParams();

  const {
    state: promotionDetail = {},
    loading: isLoading,
    isError,
    error,
  } = useAsync({
    service: () => fetchPromotionDetailAPI(param.promotionId),
    condition: !!param.promotionId,
    dependencies: [param.promotionId],
    queryKey: ["promotionDetail", param.promotionId],
  });

  if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <Spin size="large" />
        </div>
      );
    }
  
    if (isError) {
      return (
        <div className="text-center mt-5">
          <p>Đã có lỗi khi tải thông tin phim.</p>
          <p>{error?.message || 'Vui lòng thử lại sau.'}</p>
        </div>
      );
    }

  return (
    <Spin spinning={loadingState.isLoading} size="large">
      <div className="homePage">
        <div className="container-fluid my-5 movie-list-container">
          <div className="row mt-3  w-lg-75 movie-list-row">
            <h3>{promotionDetail.title}</h3>
          </div>
          <img src={promotionDetail.banner} alt={promotionDetail.tag} width={300} height={350} loading="lazy" decoding="async" />
          <div className="row mt-3  w-lg-75 movie-list-row">
            <p>{promotionDetail.description}</p>
          </div>
        </div>
      </div>
    </Spin>
  );
} 
