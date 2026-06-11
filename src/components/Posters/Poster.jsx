import React, { useRef, useState, useEffect } from "react";
import "./Poster.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axios from "../../axios";
import { API_KEY, poster_Path } from "../../constants/constants";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { toggleMovie } from "../../services/listService";
import { useList } from "../../context/ListContext";

const Poster = ({ category, url, type }) => {
	const [loading, setLoading] = useState(true);
	const [movies, setMovies] = useState([]);
	const [length, setLength] = useState({});

	const [showLeft, setShowLeft] = useState(false);
	const [showRight, setShowRight] = useState(true);

	const cardRef = useRef(null);
	const navigate = useNavigate();

	const { list, setList } = useList();

	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const scrollLeft = () => {
		const amount = isMobile ? 300 : 1200;

		cardRef.current?.scrollBy({
			left: -amount,
			behavior: "smooth",
		});
	};

	const scrollRight = () => {
		const amount = isMobile ? 300 : 1200;

		cardRef.current?.scrollBy({
			left: amount,
			behavior: "smooth",
		});
	};

	const handleScroll = () => {
		const el = cardRef.current;

		if (!el) return;

		setShowLeft(el.scrollLeft > 0);

		setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
	};

	useEffect(() => {
		const fetchMovies = async () => {
			try {
				setLoading(true);

				const response = await axios.get(`${url}?api_key=${API_KEY}`);

				const movieList = response.data.results;

				setMovies(movieList);

				const details = await Promise.all(
					movieList.map((movie) =>
						axios.get(
							`${type || movie.media_type}/${movie.id}?api_key=${API_KEY}`,
						),
					),
				);

				const runtimeMap = {};

				details.forEach((res, index) => {
					runtimeMap[movieList[index].id] =
						res.data.runtime || res.data.number_of_seasons || null;
				});

				setLength(runtimeMap);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchMovies();
	}, [url, type]);

	useEffect(() => {
		handleScroll();
	}, [movies]);

	const handleList = async (movie) => {
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
	};

	return (
		<div className="poster">
			{category && (
				<>
					<div className="header">
						<h2 className="line">|</h2>
						<h2>{category}</h2>
					</div>

					{!isMobile && showLeft && (
						<div className="scroll-l" onClick={scrollLeft}>
							{"<"}
						</div>
					)}

					{!isMobile && showRight && (
						<div className="scroll-r" onClick={scrollRight}>
							{">"}
						</div>
					)}
				</>
			)}

			<div className="card-wrapper" ref={cardRef} onScroll={handleScroll}>
				{loading
					? Array.from({ length: 20 }).map((_, index) => (
							<div className="card" key={index}>
								<Skeleton
									height={isMobile ? 180 : 300}
									borderRadius={10}
									width={isMobile ? 120 : 200}
								/>

								<div className="info">
									<Skeleton width={isMobile ? 80 : 100} height={20} />
								</div>
							</div>
						))
					: movies.map((movie) => {
							const isAdded = list.some((item) => item.id === movie.id);

							return (
								<div className="card" key={movie.id}>
									<button
										className={`list ${isAdded ? "active" : ""}`}
										onClick={() => handleList(movie)}>
										<i
											className={
												isAdded ? "fa fa-bookmark" : "fa fa-bookmark-o"
											}></i>
									</button>

									<div className="img-wrapper">
										<img
											className="cardImg"
											src={
												movie.poster_path
													? `${poster_Path}${movie.poster_path}`
													: ""
											}
											alt={movie.title || movie.name}
											onClick={() =>
												navigate("/Play", {
													state: {
														movie,
														type,
													},
												})
											}
										/>
									</div>

									<div className="info">
										<h3 className="title">{movie.title || movie.name}</h3>

										<div className="year-length">
											<h3 className="length">
												{(type || movie.media_type) === "movie"
													? `${length?.[movie.id] || "N/A "} m`
													: `S • ${length?.[movie.id] || "N/A"}`}
											</h3>

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
		</div>
	);
};

export default Poster;
