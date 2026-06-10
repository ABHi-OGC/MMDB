import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../../axios";
import { API_KEY } from "../../constants/constants";
import More_movies from "../More_movies/More_movies";

const Search = () => {
	const location = useLocation();
	const [results, setResults] = useState([]);
	const query = new URLSearchParams(location.search).get("q");

	return (
		<div className="search">
			<More_movies category={`Search result for : ${query}`} query={query} />
		</div>
	);
};

export default Search;
