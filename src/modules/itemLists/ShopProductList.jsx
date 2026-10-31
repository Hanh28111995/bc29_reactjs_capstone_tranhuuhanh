import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAsync } from "../../hooks/useAsync";
import { Select, Input, Button, Spin } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import {
  fetchLocationListAPI,
  fetchBranchesAPI,
  fetchShopFilterAPI,
} from "services/general";
import { useTranslation } from "react-i18next";
import "./index.scss";

const DEFAULT_FILTERS = {
  area: undefined,
  theater: undefined,
  productName: "",
  priceSort: "default",
  productType: "all",
};

export default function ShopProduct() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    state: rawLocations = [],
    loading: isLocationsLoading,
    error: locationsError,
  } = useAsync({
    service: () => fetchLocationListAPI(),
    queryKey: ["areas-list", "active"],
    trackLoading: false,
  });

  const locations = Array.isArray(rawLocations) ? rawLocations : [];

  const {
    state: rawBranches = [],
    loading: isBranchesLoading,
    error: branchesError,
  } = useAsync({
    service: () => fetchBranchesAPI(),
    queryKey: ["branches-list", "active"],
    trackLoading: false,
  });

  const allBranches = Array.isArray(rawBranches) ? rawBranches : [];

  const {
    state: rawProductList = [],
    loading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useAsync({
    service: () => fetchShopFilterAPI(appliedFilters),
    queryKey: ["shop-products-list", "active", appliedFilters],
    condition: hasSearched,
    trackLoading: false,
  });

  const productList = Array.isArray(rawProductList)
    ? rawProductList
    : rawProductList?.data?.content ||
      rawProductList?.data ||
      rawProductList?.content ||
      [];

  const isLoading = isLocationsLoading || isBranchesLoading;
  const isError = hasSearched && isProductsError;
  const error = productsError;
  const setupError = locationsError || branchesError;

  const filteredBranches = filters.area
    ? allBranches.filter((branch) => {
        const selectedArea = locations.find((loc) => loc._id === filters.area);

        if (!selectedArea) return false;

        return selectedArea.cumRap?.some((area) =>
          branch.address?.includes(area),
        );
      })
    : allBranches;

  const handleFilterSubmit = () => {
    setAppliedFilters({
      ...filters,
    });
    setHasSearched(true);
  };

  if (isError) {
    return (
      <div className="store-page">
        <div className="store-state store-state-error">
          <h2>{t("shop.loadError")}</h2>
          <p>{error?.message || t("common.tryAgain")}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="store-page">
      <section className="container-fluid my-5 promotion-list-container store-search-band">
        <div className="store-search-layout">
          <div className="store-content">
            <div className="store-filter-panel">
              <div className="store-filters-grid store-location-row">
                <label className="store-filter-field">
                  <span>{t("shop.region")}</span>
                  <Select
                    placeholder={t("shop.selectRegion")}
                    allowClear
                    value={filters.area}
                    onChange={(value) =>
                      setFilters({
                        ...filters,
                        area: value,
                        theater: undefined,
                      })
                    }
                    options={locations.map((loc) => ({
                      label: loc.vungMien,
                      value: loc._id,
                    }))}
                  />
                </label>

                <label className="store-filter-field">
                  <span>{t("shop.cinema")}</span>
                  <Select
                    placeholder={t("shop.selectCinema")}
                    disabled={!filters.area}
                    allowClear
                    value={filters.theater}
                    onChange={(value) =>
                      setFilters({
                        ...filters,
                        theater: value,
                      })
                    }
                    options={filteredBranches.map((branch) => ({
                      label: branch.branch,
                      value: branch._id,
                    }))}
                  />
                </label>
              </div>

              <div className="store-filters-grid store-options-row">
                <label className="store-filter-field">
                  <span>{t("shop.productName")}</span>
                  <Input
                    placeholder={t("shop.enterName")}
                    value={filters.productName}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        productName: e.target.value,
                      })
                    }
                    onPressEnter={handleFilterSubmit}
                  />
                </label>

                <label className="store-filter-field">
                  <span>{t("shop.priceSort")}</span>
                  <Select
                    value={filters.priceSort}
                    onChange={(value) =>
                      setFilters({
                        ...filters,
                        priceSort: value,
                      })
                    }
                    options={[
                      { label: t("shop.default"), value: "default" },
                      { label: t("shop.priceAscending"), value: "asc" },
                      { label: t("shop.priceDescending"), value: "desc" },
                    ]}
                  />
                </label>

                <label className="store-filter-field">
                  <span>{t("shop.productType")}</span>
                  <Select
                    value={filters.productType}
                    onChange={(value) =>
                      setFilters({
                        ...filters,
                        productType: value,
                      })
                    }
                    options={[
                      { label: t("shop.all"), value: "all" },
                      { label: t("shop.normal"), value: "normal" },
                      { label: t("shop.preorder"), value: "preorder" },
                      { label: t("shop.outOfStock"), value: "outofstock" },
                    ]}
                  />
                </label>

                <Button
                  type="primary"
                  className="store-filter-button"
                  onClick={handleFilterSubmit}
                  loading={isProductsLoading || isLoading}
                >
                  {t("shop.filter")}
                </Button>
              </div>

              <nav className="store-category-tabs" aria-label={t("shop.productType")}>
                <span>{t("shop.movieCombo")}</span>
                <span>{t("shop.combo")}</span>
                <span>{t("shop.giftCard")}</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <section className="store-results">
        {hasSearched && setupError && (
          <p className="store-setup-error">
            {t("shop.setupError")} {setupError.message}
          </p>
        )}

        {isProductsLoading ? (
          <div className="store-state">
            <Spin size="large" />
            <p>{t("shop.loadingProducts")}</p>
          </div>
        ) : hasSearched && productList.length > 0 ? (
          <div className="store-product-grid">
            {productList.map((product) => (
              <Link
                className="store-product-card"
                key={product._id}
                to={`/shop/${product._id}`}
              >
                <div className="store-product-image">
                  {product.banner ? (
                    <img
                      src={product.banner}
                      alt={product.title || t("shop.productFallback")}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="store-product-image-placeholder">
                      <ShopOutlined />
                    </div>
                  )}
                  <span className="store-product-badge">LOTTE CINEMA</span>
                </div>
                <div className="store-product-info">
                  <h3 title={product.title}>{product.title || t("shop.productFallback")}</h3>
                  <div className="store-product-price">
                    {typeof product.price === "number"
                      ? `${product.price.toLocaleString("vi-VN")} đ`
                      : t("shop.noPrice")}
                  </div>
                  <span className="store-product-link">{t("shop.details")}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="store-state store-empty-state">
            <div className="store-empty-icon">
              <ShopOutlined />
            </div>
            <h3>{t("shop.emptyTitle")}</h3>
            <p>{t("shop.emptyDescription")}</p>
            <Button
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setAppliedFilters(DEFAULT_FILTERS);
                setHasSearched(false);
              }}
            >
              {t("shop.clearFilters")}
            </Button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
