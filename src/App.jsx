import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Movies from "./pages/Movies/Movies";
import Tv from "./pages/Tv/Tv";
import List from "./pages/List/List";
import Play from "./components/Play/Play";
import Login from "./pages/Login/Login";
import Search from "./components/Search/Search";
import Navbar from "./components/Navbar/Navbar";

const App = () => {
	return (
		<div>
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/Movies" element={<Movies />} />
				<Route path="/Tv" element={<Tv />} />
				<Route path="/List" element={<List />} />
				<Route path="/Play" element={<Play />} />
				<Route path="/Login" element={<Login />} />
				<Route path="/search" element={<Search />} />
			</Routes>
		</div>
	);
};

export default App;
