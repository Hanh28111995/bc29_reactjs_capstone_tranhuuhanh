import React, { useContext } from 'react'
import Carousel from 'modules/carousel/Carousel'
import MovieList from 'modules/movie-list/MovieList'
import './index.scss'
import { Spin} from 'antd';



export default function Home() {
  const [loadingState] = useContext(LoadingContext);

  return (
    <Spin spinning={loadingState.isLoading} size="large" tip="Đang xử lý...">
      <div className='homePage'>
        <Carousel />
        <MovieList />
      </div>
    </Spin>
  )
}
