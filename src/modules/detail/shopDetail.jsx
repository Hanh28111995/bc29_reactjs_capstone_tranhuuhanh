import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Select, InputNumber, Button, message } from "antd";
import { useAsync } from "../../hooks/useAsync";
import { LoadingContext } from "../../contexts/loading.context";
import { fetchShopProductAPI } from "services/general";

export default function ShopDetail() {
  const { shopId } = useParams(); // Hoặc id_shop tùy thuộc route của bạn
  const navigate = useNavigate();
  const [loadingState] = useContext(LoadingContext) || [{}];

  // State lưu trữ lựa chọn options của người dùng và số lượng
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);

  const {
    state: shopDetail = {},
    loading: isLoading,
    isError,
    error,
  } = useAsync({
    service: () => fetchShopProductAPI(shopId),
    condition: !!shopId,
    dependencies: [shopId],
    queryKey: ["shopDetail", shopId],
  });

  // Xử lý thay đổi giá trị option
  const handleOptionChange = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Xử lý Mua ngay
  const handleBuyNow = () => {
    // Kiểm tra các option bắt buộc (required: true)
    const missingRequired = shopDetail.options?.some(
      (opt) => opt.required && !selectedOptions[opt.name]
    );

    if (missingRequired) {
      message.error("Vui lòng chọn đầy đủ các tùy chọn bắt buộc!");
      return;
    }

    const orderData = {
      shopId: shopDetail._id,
      id_shop: shopDetail.id_shop,
      title: shopDetail.title,
      price: shopDetail.price,
      selectedOptions,
      quantity,
    };

    console.log("Buy Now data:", orderData);
    message.success("Chuyển đến trang thanh toán...");
    // navigate('/checkout', { state: orderData });
  };

  // Xử lý Thêm vào giỏ hàng
  const handleAddToCart = () => {
    const missingRequired = shopDetail.options?.some(
      (opt) => opt.required && !selectedOptions[opt.name]
    );

    if (missingRequired) {
      message.error("Vui lòng chọn đầy đủ các tùy chọn bắt buộc!");
      return;
    }

    message.success("Đã thêm sản phẩm vào giỏ hàng!");
  };

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
        <p>Đã có lỗi khi tải thông tin sản phẩm.</p>
        <p>{error?.message || "Vui lòng thử lại sau."}</p>
      </div>
    );
  }

  return (
    <Spin spinning={loadingState?.isLoading || false} size="large">
      <div className="homePage container my-5">
        <div className="row">
          {/* Cột bên trái: Banner và Mô tả / Nội dung chi tiết */}
          <div className="col-md-7">
            <div className="mb-4 text-center">
              <img
                src={shopDetail.banner}
                alt={shopDetail.title}
                className="img-fluid rounded shadow-sm"
                style={{ width: "100%", maxHeight: "450px", objectFit: "cover" }}
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Mô tả ngắn / Content */}
            <div className="shop-description-box p-3 bg-light rounded">
              <p className="mb-3" dangerouslySetInnerHTML={{ __html: shopDetail.description }} />
              
              <hr />

              <div className="row mb-2">
                <div className="col-4 fw-bold">Nội dung</div>
                <div className="col-8" dangerouslySetInnerHTML={{ __html: shopDetail.content || "Đang cập nhật" }} />
              </div>

              <div className="row mb-2">
                <div className="col-4 fw-bold">Số lượng mua</div>
                <div className="col-8">
                  {shopDetail.limitPerCustomer > 0 
                    ? `Tối đa ${shopDetail.limitPerCustomer} sản phẩm/khách` 
                    : "Không giới hạn"}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-4 fw-bold">Hạn sử dụng</div>
                <div className="col-8">
                  {shopDetail.expiryDays ? `★ ${shopDetail.expiryDays} ngày sau khi mua` : "Không thời hạn"}
                </div>
              </div>
            </div>
          </div>

          {/* Cột bên phải: Thông tin đặt hàng, Options, Giá và Button */}
          <div className="col-md-5">
            <div className="shop-purchase-card p-4 border rounded shadow-sm bg-white">
              <h3 className="h4 fw-bold mb-3">{shopDetail.title}</h3>

              <div className="d-flex justify-content-between align-items-center mb-4 py-2 border-bottom">
                <span className="text-muted">Giá bán online</span>
                <span className="fs-4 fw-bold text-danger">
                  {shopDetail.price?.toLocaleString("vi-VN")} đ
                </span>
              </div>

              {/* Render danh sách options động từ Model */}
              {shopDetail.options && shopDetail.options.length > 0 && (
                <div className="options-container mb-3">
                  {shopDetail.options.map((opt, index) => (
                    <div className="mb-3" key={index}>
                      <label className="form-label fw-semibold">
                        {opt.name} {opt.required && <span className="text-danger">*</span>}
                      </label>
                      <Select
                        className="w-100"
                        placeholder={`-- Chọn ${opt.name} --`}
                        onChange={(value) => handleOptionChange(opt.name, value)}
                        options={opt.choices?.map((choice) => ({
                          label: choice,
                          value: choice,
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Chọn số lượng (SL) */}
              <div className="mb-4">
                <label className="form-label fw-semibold">SL</label>
                <div className="w-100">
                  <InputNumber
                    min={1}
                    max={shopDetail.stock > 0 ? shopDetail.stock : 99}
                    value={quantity}
                    onChange={(val) => setQuantity(val || 1)}
                    className="w-100"
                  />
                </div>
              </div>

              {/* Tổng số tiền */}
              <div className="d-flex justify-content-between align-items-center mb-4 py-2 border-top border-bottom">
                <span className="fw-bold fs-5">Tổng số</span>
                <span className="fs-4 fw-bold text-danger">
                  {((shopDetail.price || 0) * quantity).toLocaleString("vi-VN")} đ
                </span>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <Button type="primary" size="large" className="bg-dark text-white fw-bold" onClick={handleBuyNow}>
                  Mua ngay
                </Button>
                <Button size="large" className="fw-semibold" onClick={handleAddToCart}>
                  Thêm vào giỏ
                </Button>
                <Button size="large" onClick={() => navigate(-1)}>
                  Quay lại danh sách
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
}