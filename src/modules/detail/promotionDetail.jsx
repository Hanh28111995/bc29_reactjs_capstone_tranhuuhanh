import React, { useContext } from "react";
import { Spin } from "antd";
import { useParams } from "react-router-dom";
import { useAsync } from "../../hooks/useAsync"; // Đã bổ sung import
import { fetchPromotionDetailAPI } from "services/general"; // Đã bổ sung import
import { LoadingContext } from "../../contexts/loading.context"; // Nếu có dùng global loading context


export default function PromotionDetail() {
  const param = useParams();
  
  // Khai báo loadingState nếu component có dùng chung context
  const [loadingState] = useContext(LoadingContext) || [{}]; 

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
        <p>Đã có lỗi khi tải thông tin khuyến mãi.</p> {/* Đã sửa text cho đúng context */}
        <p>{error?.message || 'Vui lòng thử lại sau.'}</p>
      </div>
    );
  }

  return (
    <Spin spinning={loadingState?.isLoading || false} size="large">
      <div className="homePage">
        <div className="container my-5 promotion-detail-container">
          {/* Tiêu đề promotion */}
          <div className="row mt-3">
            <div className="col-12">
              <h2 className="mb-3">{promotionDetail.title}</h2>                            
            </div>
          </div>

          {/* Banner */}
          <div className="row my-4">
            <div className="col-12 text-center">
              <img 
                src={promotionDetail.banner} 
                alt={promotionDetail.title} 
                className="img-fluid rounded shadow-sm"
                style={{ maxHeight: "450px", objectFit: "cover", width: "100%" }}
                loading="lazy" 
                decoding="async" 
              />
            </div>
          </div>

          {/* Nội dung chi tiết (Sửa từ description thành content theo đúng Model) */}
          <div className="row mt-3">
            <div className="col-12">
              <div 
                className="promotion-content"
                dangerouslySetInnerHTML={{ __html: promotionDetail.content }} 
              />
              {/* Hoặc nếu content của bạn là text thường thì dùng: <p>{promotionDetail.content}</p> */}
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
}