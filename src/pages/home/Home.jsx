import React from "react";
import Carousel from "modules/carousel/Carousel";
import MovieList from "modules/itemLists/MovieList";
import "./index.scss";
import { fetchMovieListAPI } from "services/general";
import { getBannerListAPI } from "services/banner";
import { useAsync } from "hooks/useAsync";

export default function Home() {
  const {
    state: rawBanner = [],
    loading: isBannerLoading,
    isError: isBannerError,
  } = useAsync({
    service: () => getBannerListAPI(),
    queryKey: ["banners-list", "user"],
  });

  const {
    state: rawMovieList = [],
    loading: isMovieLoading,
    isError: isMovieError,
  } = useAsync({
    service: () => fetchMovieListAPI(),
    queryKey: ["movies-list", "user" ],
  });

  const isLoading = isBannerLoading || isMovieLoading;
  const isError = isBannerError || isMovieError;

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center mt-5">
        <p>Đã có lỗi khi tải dữ liệu trang chủ.</p>
      </div>
    );
  }

  return (
    <div className="homePage">
      <Carousel rawBanner={rawBanner} />
      <MovieList rawMovieList={rawMovieList}/>
    </div>
  );
}
