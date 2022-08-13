import React from 'react'
import Carousel from '../../modules/carousel/Carousel'
import MovieList from '../../modules/movie-list/MovieList'

export default function Home() {
  return (
    <div className="py-5">
      <Carousel/>
       <MovieList/>
      </div>
  )
}
