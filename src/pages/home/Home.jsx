import React, { useContext } from 'react'
import Carousel from 'modules/carousel/Carousel'
import MovieList from 'modules/movie-list/MovieList'
import './index.scss'
import { Spin} from 'antd';
import { LoadingContext } from 'contexts/loading.context';
import SEO from 'components/SEO';



export default function Home() {
  const [loadingState] = useContext(LoadingContext);

  return (
    <Spin spinning={loadingState.isLoading} size="large">
      <SEO 
        title="Trang chủ" 
        description="Chào mừng bạn đến với Movie Cybersoft - Hệ thống đặt vé xem phim trực tuyến."
        keywords="đặt vé xem phim, lịch chiếu phim, rạp chiếu phim, phim mới nhất"
      />
      <div className='homePage'>
        <Carousel />
        <MovieList />
      </div>
    </Spin>
  )
}
