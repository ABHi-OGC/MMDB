import React from 'react'
import More_movies from '../../components/More_movies/More_movies'
import { Trending_Shows } from '../../constants/constants'

const Tv = () => {
  return (
    <div>
      <More_movies category="Shows" url={Trending_Shows} type="tv"/>
    </div>
  )
}

export default Tv
