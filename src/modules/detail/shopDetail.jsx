import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Select, InputNumber, Button, message } from "antd";
import { useAsync } from "../../hooks/useAsync";
import { LoadingContext } from "../../contexts/loading.context";
import { fetchShopProductDetailAPI } from "services/general";
import { useTranslation } from "react-i18next";
import { ExclamationCircleFilled } from "@ant-design/icons";
import "./index.scss";


export default function ShopDetail() {
  const { t } = useTranslation();
  const param = useParams(); // Hoặc id_shop tùy thuộc route của bạn
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
    service: () => fetchShopProductDetailAPI(param.id),
    condition: !!param.id,
    dependencies: [param.id],
    queryKey: ["shopDetail", param.id],
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
      message.error(t("shop.requiredOptions"));
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
    message.success(t("shop.checkoutRedirect"));
    // navigate('/checkout', { state: orderData });
  };

  // Xử lý Thêm vào giỏ hàng
  const handleAddToCart = () => {
    const missingRequired = shopDetail.options?.some(
      (opt) => opt.required && !selectedOptions[opt.name]
    );

    if (missingRequired) {
      message.error(t("shop.requiredOptions"));
      return;
    }

    message.success(t("shop.addedToCart"));
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
        <p>{t("shop.detailLoadError")}</p>
        <p>{error?.message || t("common.tryAgain")}</p>
      </div>
    );
  }

  return (
    <Spin spinning={loadingState?.isLoading || false} size="large">
      <div className="homePage shop-detail-container my-5">
        <div className="shop-detail-panel row">
          <section className="col-md-7 shop-detail-info">
            <div className="shop-detail-banner">
              <img
                src={shopDetail.banner}
                alt={shopDetail.title}
                className="img-fluid"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="shop-description-box">
              <p
                className="shop-short-description"
                dangerouslySetInnerHTML={{
                  __html: shopDetail.description || t("common.updating"),
                }}
              />

              <div className="shop-detail-meta">
                <div className="shop-detail-meta-row">
                  <strong>{t("common.content")}</strong>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: shopDetail.content || t("common.updating"),
                    }}
                  />
                </div>

                <div className="shop-detail-meta-row">
                  <strong>{t("common.quantity")}</strong>
                  <span>
                    {shopDetail.limitPerCustomer > 0
                      ? t("shop.quantityLimit", {
                          count: shopDetail.limitPerCustomer,
                        })
                      : t("common.notLimited")}
                  </span>
                </div>

                <div className="shop-detail-meta-row">
                  <strong>{t("shop.expiryDays")}</strong>
                  <span>
                    {shopDetail.expiryDays
                      ? t("shop.expiryAfterPurchase", {
                          count: shopDetail.expiryDays,
                        })
                      : t("shop.noExpiry")}
                  </span>
                </div>
              </div>
            </div>

            <section className="shop-other-notes">
              <h4>{t("shop.otherNotes")}</h4>
              <div className="shop-other-note">
                <ExclamationCircleFilled aria-hidden="true" />
                <div
                  dangerouslySetInnerHTML={{
                    __html: shopDetail.description || t("common.updating"),
                  }}
                />
              </div>
            </section>
          </section>

          <aside className="col-md-5 shop-detail-order-column">
            <div className="shop-purchase-card">
              <h3 className="h4 fw-bold mb-3">{shopDetail.title}</h3>

              <div className="shop-online-price">
                <span className="text-muted">{t("shop.onlinePrice")}</span>
                <strong>
                  {shopDetail.price?.toLocaleString("vi-VN")} đ
                </strong>
              </div>

              {shopDetail.options && shopDetail.options.length > 0 && (
                <div className="shop-options">
                  {shopDetail.options.map((opt, index) => (
                    <div className="shop-option" key={index}>
                      <label>
                        {opt.name} {opt.required && <span className="text-danger">*</span>}
                      </label>
                      <Select
                        className="shop-option-select"
                        placeholder={t("shop.chooseOption", { name: opt.name })}
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

              <div className="shop-option shop-quantity">
                <label>{t("shop.quantityShort")}</label>
                <InputNumber
                  min={1}
                  max={shopDetail.stock > 0 ? shopDetail.stock : 99}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  className="shop-option-select"
                />
              </div>

              <div className="shop-total">
                <strong>{t("shop.totalAmount")}</strong>
                <strong>
                  {((shopDetail.price || 0) * quantity).toLocaleString("vi-VN")} đ
                </strong>
              </div>

              <div className="shop-detail-actions">
                <Button type="primary" onClick={handleBuyNow}>
                  {t("shop.buyNow")}
                </Button>
                <Button onClick={handleAddToCart}>
                  {t("shop.addToCart")}
                </Button>
                <Button onClick={() => navigate(-1)}>
                  {t("shop.backToList")}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Spin>
  );
}