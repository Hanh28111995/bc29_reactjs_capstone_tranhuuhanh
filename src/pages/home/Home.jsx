import React from 'react'
import Carousel from 'modules/carousel/Carousel'
import MovieList from 'modules/movie-list/MovieList'
import './index.scss'

export default function Home() {
  return (
    <div className='homePage'>
      <Carousel />
      <MovieList />
    </div>
  )
}
