import React from 'react'
import More_movies from '../../components/More_movies/More_movies'
import {Trending_Movies } from '../../constants/constants'

const Movies = () => {
  return (
    <div>
      <More_movies category="Movies" url={Trending_Movies} type="movie"/>
    </div>
  )
}

export default Movies
