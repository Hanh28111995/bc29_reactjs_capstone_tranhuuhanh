import React from 'react';
import Detail from 'modules/detail/Detail';
import TrailerContent from 'modules/detail/TrailerContent';
import { Spin } from 'antd';
import "./index.scss";

import { useParams } from 'react-router-dom';
import { useAsync } from 'hooks/useAsync';
import { fetchMovieDetailAPI } from 'services/general';
import { useTranslation } from "react-i18next";

export default function MovieDtail() {
  const { t } = useTranslation();
  const param = useParams();

  const {
    state: movieDetail = {},
    loading: isLoading,
    isError,
    error,
  } = useAsync({
    service: () => fetchMovieDetailAPI(param.movieId),
    condition: !!param.movieId,
    dependencies: [param.movieId],
    queryKey: ["movieDetail", param.movieId, "active"],
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
        <p>{t("movies.loadError")}</p>
        <p>{error?.message || t("common.tryAgain")}</p>
      </div>
    );
  }

  return (
    <div className="trailerPage pb-3">
      <TrailerContent trailer={movieDetail.trailer} />
      <Detail movie={movieDetail} />
    </div>
  );
}
