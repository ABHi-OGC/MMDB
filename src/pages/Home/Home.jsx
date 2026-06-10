import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import Titlecards from "../../components/Titlecards/Titlecards";
import Poster from "../../components/Posters/Poster";
import {
	Trending,
	Trending_Movies,
	Trending_Shows,
	Top_Tv,
	Top_Movies,
	Pop_Movies,
	Pop_Tv,
} from "../../constants/constants";

const Home = () => {
	return (
		<div className="home">
			{/* <Navbar/> */}
			<Titlecards />
			<Poster category="Trending" url={Trending} />
			<Poster category="Top Rated Movies" url={Top_Movies} type="movie" />
			<Poster category="Top Rated Shows" url={Top_Tv} type="tv" />
			<Poster category="Popular Movies" url={Pop_Movies} type="movie" />
			<Poster category="Popular Shows" url={Pop_Tv} type="tv" />
		</div>
	);
};

export default Home;
