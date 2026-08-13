import React, { useContext } from 'react'
import Carousel from 'modules/carousel/Carousel'
import MovieList from 'modules/itemLists/MovieList'
import './index.scss'
import { Spin} from 'antd';
import { LoadingContext } from 'contexts/loading.context';
import SEO from 'components/SEO';



export default function Home() {
  const [loadingState] = useContext(LoadingContext);

  return (
    <Spin spinning={loadingState.isLoading} size="large">
      <div className='homePage'>
        <Carousel />
        <MovieList />
      </div>
     </Spin>
  )
}
