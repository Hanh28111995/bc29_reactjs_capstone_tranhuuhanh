import React from 'react';
import Detail from 'modules/detail/Detail';
import TrailerContent from 'modules/detail/TrailerContent';
import "./index.scss";

import { useParams } from 'react-router-dom';
import { fetchMovieDetailAPI } from 'services/general';
import { useAsync } from 'hooks/useAsync';

export default function MovieDtail() {
  const param = useParams();

  const { state: movieDetail = [] } = useAsync({
    dependencies: [],
    service: () => fetchMovieDetailAPI(param.movieId),
  })

  return (
    <div className="trailerPage pb-3" >
      <TrailerContent trailer={movieDetail.trailer} />
      <Detail movie={movieDetail} />
    </div>

  )
}
