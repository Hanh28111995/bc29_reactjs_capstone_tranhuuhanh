import React from 'react'
import Carousel from 'modules/carousel/Carousel'
import MovieList from 'modules/movie-list/MovieList'

export default function Home() {
  return (
    <div className="py-5" style={{width: '100%',
      minWidth: '576px'}} >
      <Carousel/>
       <MovieList/>
      </div>
  )
}
