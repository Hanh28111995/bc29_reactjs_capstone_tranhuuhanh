import React from 'react'
import Carousel from 'modules/carousel/Carousel'
import MovieList from 'modules/itemLists/MovieList'
import './index.scss'
import SEO from 'components/SEO';



export default function Home() {  

  return (    
      <div className='homePage'>
        <Carousel />
        <MovieList />
      </div>    
  )
}
