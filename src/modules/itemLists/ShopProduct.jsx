import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../contexts/loading.context";
import { useAsync } from "../../hooks/useAsync";
import { Radio, Spin, Select, Input, Button, Row, Col } from "antd";
import dayjs from "dayjs";
import {
  fetchPromotionListAPI,
  fetchLocationListAPI,
  fetchBranchesAPI,
} from "services/general";
import "./index.scss";

export default function ShopProduct(props) {
  const navigate = useNavigate();
  const [, setLoadingState] = useContext(LoadingContext);
  const [promotionList, setPromotionList] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    area: undefined,
    theater: undefined,
    productName: "",
    priceSort: "default",
    productType: "all",
  });

  // Fetch locations (Khu vực)
  const { state: rawLocations = [] } = useAsync({
    service: () => fetchLocationListAPI(),
    queryKey: ["locations"],
  });
  const locations = Array.isArray(rawLocations) ? rawLocations : [];

  // Fetch branches (Rạp)
  const { 
    state: rawBranches = [], 
    loading: isLoading,
    isError,
    errror,
   } = useAsync({
    service: () => fetchBranchesAPI(),
    queryKey: ["branches"],
  });
  const allBranches = Array.isArray(rawBranches) ? rawBranches : [];

  // Filter branches theo khu vực
  const filteredBranches = filters.area
    ? allBranches.filter((branch) => {
        const selectedArea = locations.find((loc) => loc._id === filters.area);
        if (!selectedArea) return false;
        return selectedArea.cumRap?.some((area) =>
          branch.address?.includes(area),
        );
      })
    : allBranches;

  useEffect(() => {
    setLoadingState({ isLoading });
  }, [isLoading, setLoadingState]);

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
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
      {/* Filter Section */}
      <div
        className="container-fluid mb-4 p-4"
        style={{ backgroundColor: "#f5f5f5", borderRadius: "8px" }}
      >
        <Row gutter={[16, 16]}>
          {/* Khu vực */}
          <Col xs={24} sm={12} lg={4}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Khu vực
              </label>
              <Select
                placeholder="Chọn khu vực"
                style={{ width: "100%" }}
                allowClear
                value={filters.area}
                onChange={(value) =>
                  setFilters({ ...filters, area: value, theater: undefined })
                }
                options={locations.map((loc) => ({
                  label: loc.vungMien,
                  value: loc._id,
                }))}
              />
            </div>
          </Col>

          {/* Rạp */}
          <Col xs={24} sm={12} lg={4}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Rạp
              </label>
              <Select
                placeholder="Chọn rạp"
                style={{ width: "100%" }}
                disabled={!filters.area}
                allowClear
                value={filters.theater}
                onChange={(value) => setFilters({ ...filters, theater: value })}
                options={filteredBranches.map((branch) => ({
                  label: branch.branch,
                  value: branch._id,
                }))}
              />
            </div>
          </Col>

          {/* Tên sản phẩm */}
          <Col xs={24} sm={12} lg={4}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Tên sản phẩm
              </label>
              <Input
                placeholder="Nhập tên..."
                value={filters.productName}
                onChange={(e) =>
                  setFilters({ ...filters, productName: e.target.value })
                }
              />
            </div>
          </Col>

          {/* Sắp xếp giá */}
          <Col xs={24} sm={12} lg={4}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Sắp xếp giá
              </label>
              <Select
                placeholder="Mặc định"
                style={{ width: "100%" }}
                value={filters.priceSort}
                onChange={(value) =>
                  setFilters({ ...filters, priceSort: value })
                }
                options={[
                  { label: "Mặc định", value: "default" },
                  { label: "Giá tăng dần", value: "asc" },
                  { label: "Giá giảm dần", value: "desc" },
                ]}
              />
            </div>
          </Col>

          {/* Loại sản phẩm */}
          <Col xs={24} sm={12} lg={4}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Loại sản phẩm
              </label>
              <Select
                placeholder="Tất cả"
                style={{ width: "100%" }}
                value={filters.productType}
                onChange={(value) =>
                  setFilters({ ...filters, productType: value })
                }
                options={[
                  { label: "Tất cả", value: "all" },
                  { label: "Normal", value: "normal" },
                  { label: "Pre-order", value: "preorder" },
                  { label: "Hết hàng", value: "outofstock" },
                ]}
              />
            </div>
          </Col>

          {/* Nút Lọc */}
          <Col
            xs={24}
            sm={12}
            lg={4}
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <Button
              type="primary"
              danger
              block
              style={{ height: "40px", fontWeight: "600" }}
              onClick={() => {
                // Handle filter logic here
                console.log("Applied filters:", filters);
                fetchShopFilterAPI(filters)
                  .then((response) => {
                    console.log("Filtered products:", response);
                    setPromotionList(response);
                  })
                  .catch((error) => {
                    console.error("Error fetching filtered products:", error);
                  });
              }}
            >
              Lọc
            </Button>
          </Col>
        </Row>
      </div>
      <div className="row mt-3  w-lg-75 movie-list-row">
        {promotionList.map((ele) => (
          <div className="col-3" key={ele._id}>
            <div
              className="card movie-card"
              onClick={() => navigate(`/promotion/${ele._id}`)}
            >
              <div className="card-header-wrapper">
                <img
                  className="card-img-top"
                  src={ele.banner}
                  alt={ele.tag}
                  width={300}
                  height={350}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="card-body-custom">
                <h4 className="movie-release">
                  {dayjs(ele.startDate).format("DD/MM/YYYY")} -{" "}
                  {dayjs(ele.endDate).format("DD/MM/YYYY")}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
