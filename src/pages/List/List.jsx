import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import More_movies from "../../components/More_movies/More_movies";
import { useList } from "../../context/ListContext";

const List = () => {
	const { list } = useList();

	return (
		<>
			<Navbar />

			<More_movies category="My List" movies={list} />
		</>
	);
};

export default List;
