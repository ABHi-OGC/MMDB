import React, { useRef, useState, useEffect, useMemo } from "react";
import "./More_movies.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axios from "../../axios";
import { API_KEY, poster_Path } from "../../constants/constants";
import Navbar from "../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { toggleMovie } from "../../services/listService";
import { useList } from "../../context/ListContext";

const cache = new Map();

const More_movies = ({ category, url, type, query, movies }) => {
	const [loading, setLoading] = useState(true);
	const [more_movies, setMore_movies] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const btnRef = useRef(null);
	const navigate = useNavigate();
	const [length, setLength] = useState({});

	const { list, setList } = useList();

	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const activeMovies = movies || more_movies;

	const moviesPerPage = movies ? movies.length || 1 : 20;

	const currentMovies = useMemo(() => {
		const last = currentPage * moviesPerPage;
		const first = last - moviesPerPage;
		return activeMovies.slice(first, last);
	}, [activeMovies, currentPage, moviesPerPage]);

	const totalPages = Math.ceil(activeMovies.length / moviesPerPage);

	useEffect(() => {
		const fetchRuntime = async () => {
			if (!currentMovies.length) return;

			try {
				const details = await Promise.all(
					currentMovies.map((movie) =>
						axios.get(
							`${type || movie.media_type}/${movie.id}?api_key=${API_KEY}`,
						),
					),
				);

				const runtimeMap = {};

				details.forEach((res, index) => {
					runtimeMap[currentMovies[index].id] =
						res.data.runtime || res.data.number_of_seasons || null;
				});

				setLength((prev) => ({
					...prev,
					...runtimeMap,
				}));
			} catch (err) {
				console.error(err);
			}
		};

		fetchRuntime();
	}, [currentMovies, type]);

	useEffect(() => {
		let isMounted = true;

		const fetchMovies = async () => {
			try {
				setLoading(true);

				if (movies) {
					setMore_movies(movies);
					setLoading(false);
					return;
				}

				const cacheKey = `${url}-${query}-${type}`;

				if (cache.has(cacheKey)) {
					setMore_movies(cache.get(cacheKey));
					setLoading(false);
					return;
				}

				let allMovies = [];

				if (query) {
					let page = 1;
					let totalPages = 1;

					while (page <= totalPages && page <= 10) {
						const response = await axios.get(
							`/search/multi?api_key=${API_KEY}&query=${query}&page=${page}`,
						);

						allMovies.push(...response.data.results);
						totalPages = response.data.total_pages;
						page++;
					}

					allMovies = allMovies
						.filter((m) => m.poster_path)
						.filter((m) => m.media_type === "movie" || m.media_type === "tv");
				} else {
					for (let i = 1; i <= 10; i++) {
						const response = await axios.get(
							`${url}?api_key=${API_KEY}&page=${i}`,
						);

						allMovies.push(...response.data.results);
					}
				}

				const uniqueMovies = Array.from(
					new Map(allMovies.map((m) => [m.id, m])).values(),
				);

				cache.set(cacheKey, uniqueMovies);

				if (!isMounted) return;

				setMore_movies(uniqueMovies);

				// no heavy runtime calls (prevents lag/flicker)
			} catch (err) {
				console.error(err);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		setCurrentPage(1);
		fetchMovies();

		return () => {
			isMounted = false;
		};
	}, [url, type, query, movies]);

	const handleList = async (movie) => {
		try {
			const user = auth.currentUser;

			if (!user) {
				alert("Please login first");
				return;
			}

			const movieData = {
				...movie,
				media_type: type || movie.media_type,
			};

			const added = await toggleMovie(user.uid, movieData);

			if (added) {
				setList((prev) => [...prev, movieData]);
			} else {
				setList((prev) => prev.filter((item) => item.id !== movie.id));
			}
		} catch (err) {
			console.log(err);
		}
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// empty state FIXED
	if (movies && !loading && activeMovies.length === 0) {
		return (
			<div className="more_movies">
				<div className="movie-header">
					<h2 className="movie-line">|</h2>
					<h2 className="movie-category">{category}</h2>
				</div>

				<h2 style={{ textAlign: "center", marginTop: "100px" }}>
					Your list is empty.
				</h2>
			</div>
		);
	}

	return (
		<div className="more_movies" ref={btnRef}>
			{category && (
				<div className="movie-header">
					<h2 className="movie-line">|</h2>
					<h2 className="movie-category">{category}</h2>
				</div>
			)}

			<div className="movie-wrapper">
				{loading
					? Array.from({
							length: movies ? movies.length || 1 : 20,
						}).map((_, index) => (
							<div className="card" key={index}>
								<Skeleton
									height={isMobile ? 180 : 300}
									width={isMobile ? 120 : 200}
									borderRadius={10}
								/>
								<div className="info">
									<Skeleton width={isMobile ? 80 : 100} height={20} />
								</div>
							</div>
						))
					: currentMovies.map((movie) => {
							const isAdded = list.some((item) => item.id === movie.id);

							return (
								<div className="card" key={movie.id}>
									<button
										className={`list ${isAdded ? "active" : ""}`}
										onClick={() => handleList(movie)}>
										<i
											className={
												isAdded ? "fa fa-bookmark" : "fa fa-bookmark-o"
											}
										/>
									</button>

									<div className="img-wrapper">
										<img
											className="cardImg"
											src={
												movie.poster_path
													? `${poster_Path}${movie.poster_path}`
													: ""
											}
											onClick={() =>
												navigate("/Play", {
													state: {
														movie: movie,
														type,
													},
												})
											}
											alt="card"
										/>
									</div>

									<div className="info">
										<h3 className="title">{movie.title || movie.name}</h3>

										<div className="year-length">
											{!movies && (
												<h3 className="length">
													{(type || movie.media_type) === "movie"
														? `${length?.[movie.id] || "N/A"}m`
														: `S • ${length?.[movie.id] || "N/A"}`}
												</h3>
											)}

											<h3 className="year">
												{(movie.release_date || movie.first_air_date)?.slice(
													0,
													4,
												) || "N/A"}
											</h3>
										</div>
									</div>
								</div>
							);
						})}
			</div>

			{/* pagination only for API pages */}
			{!movies && (
				<div className="page">
					<button
						disabled={currentPage === 1}
						onClick={() => {
							setCurrentPage((p) => p - 1);
							scrollToTop();
						}}>
						{"<"}
					</button>

					{[...Array(totalPages)].map((_, index) => {
						const pageNumber = index + 1;

						if (
							pageNumber >= currentPage - 2 &&
							pageNumber <= currentPage + 2
						) {
							return (
								<button
									key={index}
									className={currentPage === pageNumber ? "active-page" : ""}
									onClick={() => {
										setCurrentPage(pageNumber);
										scrollToTop();
									}}>
									{pageNumber}
								</button>
							);
						}

						return null;
					})}

					<button
						disabled={currentPage === totalPages}
						onClick={() => {
							setCurrentPage((p) => p + 1);
							scrollToTop();
						}}>
						{">"}
					</button>
				</div>
			)}
		</div>
	);
};

export default More_movies;
