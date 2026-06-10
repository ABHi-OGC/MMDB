import React, { useState, useEffect, useRef } from "react";
import "./Titlecards.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axios from "../../axios";
import { API_KEY, img_Path, Trending } from "../../constants/constants";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { toggleMovie } from "../../services/listService";
import { useList } from "../../context/ListContext";

const Titlecards = () => {
	const [loading, setLoading] = useState(true);
	const [titles, setTitles] = useState([]);
	const [index, setIndex] = useState(1);
	const [transitionEnabled, setTransitionEnabled] = useState(true);

	const [imagesLoaded, setImagesLoaded] = useState(false);

	const intervalRef = useRef(null);
	const navigate = useNavigate();

	const { list, setList } = useList();

	// cloned slides for infinite loop
	const slides = titles.length
		? [titles[titles.length - 1], ...titles, titles[0]]
		: [];

	// fetch movies
	useEffect(() => {
		setLoading(true);
		setImagesLoaded(false);

		axios.get(`${Trending}?api_key=${API_KEY}`).then((res) => {
			setTitles(res.data.results.slice(0, 5));
			setLoading(false);
		});
	}, []);

	// interval control (safe)
	const startAutoSlide = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);

		intervalRef.current = setInterval(() => {
			if (!document.hidden) {
				setIndex((prev) => prev + 1);
			}
		}, 3000);
	};

	const stopAutoSlide = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	// auto slide lifecycle
	useEffect(() => {
		if (!titles.length) return;

		startAutoSlide();

		const handleVisibility = () => {
			stopAutoSlide();
			if (!document.hidden) startAutoSlide();
		};

		document.addEventListener("visibilitychange", handleVisibility);

		return () => {
			stopAutoSlide();
			document.removeEventListener("visibilitychange", handleVisibility);
		};
	}, [titles]);

	// infinite loop fix
	useEffect(() => {
		if (!titles.length) return;

		if (index === slides.length - 1) {
			setTimeout(() => {
				setTransitionEnabled(false);
				setIndex(1);
			}, 800);
		}

		if (index === 0) {
			setTimeout(() => {
				setTransitionEnabled(false);
				setIndex(slides.length - 2);
			}, 800);
		}
	}, [index, slides.length, titles.length]);

	// re-enable transition
	useEffect(() => {
		if (!transitionEnabled) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTransitionEnabled(true);
				});
			});
		}
	}, [transitionEnabled]);

	const handleList = async (movie) => {
		const user = auth.currentUser;

		if (!user) {
			alert("Please login first");
			return;
		}

		const movieData = {
			...movie,
			media_type: movie.media_type,
		};

		const added = await toggleMovie(user.uid, movieData);

		if (added) {
			setList((prev) => [...prev, movieData]);
		} else {
			setList((prev) => prev.filter((item) => item.id !== movie.id));
		}
	};

	const nextSlide = () => {
		setIndex((prev) => prev + 1);
		startAutoSlide();
	};

	const prevSlide = () => {
		setIndex((prev) => prev - 1);
		startAutoSlide();
	};

	const activeDot = (index - 1 + titles.length) % titles.length;

	return (
		<div className="slider-container">
			<div
				className="title-wrapper"
				style={{
					transform: `translateX(-${index * 100}%)`,
					transition: transitionEnabled ? "transform 0.8s ease-in-out" : "none",
				}}>
				{loading
					? Array.from({ length: 5 }).map((_, i) => (
							<div className="titlecards" key={i}>
								<Skeleton height={550} width="100%" />
							</div>
						))
					: slides.map((title, i) => {
							const isActive = i === index;
							const isAdded = list.some((item) => item.id === title.id);

							return (
								<div key={i} className="titlecards" aria-hidden={!isActive}>
									{/* SKELETON FIXED (image-level loading) */}
									{!imagesLoaded && <Skeleton height={550} width="100%" />}

									<img
										className="banner"
										src={`${img_Path}${title.backdrop_path}`}
										alt="banner"
										onLoad={() => setImagesLoaded(true)}
										style={{
											display: imagesLoaded ? "block" : "none",
										}}
									/>

									<div className="details">
										<h1>{title.title || title.name}</h1>

										<h3>
											<i className="fa fa-star"></i>
											{title.vote_average?.toFixed(1)} •{" "}
											{(title.release_date || title.first_air_date)?.slice(
												0,
												4,
											)}
										</h3>

										<h3>{title.overview}</h3>
									</div>

									<div className="btns">
										<button
											className="btn-1"
											onMouseEnter={stopAutoSlide}
											onMouseLeave={startAutoSlide}
											onClick={() =>
												navigate("/Play", {
													state: { movie: title },
												})
											}>
											More
										</button>

										<button
											className={`btn-2 ${isAdded ? "active" : ""}`}
											onClick={() => handleList(title)}
											onMouseEnter={stopAutoSlide}
											onMouseLeave={startAutoSlide}>
											<i
												className={
													isAdded ? "fa fa-bookmark" : "fa fa-bookmark-o"
												}
											/>{" "}
											{isAdded ? "Added" : "List"}
										</button>
									</div>
								</div>
							);
						})}
			</div>

			{/* controls */}
			<div className="slide-bar">
				<button className="slide-btn left" onClick={prevSlide}>
					❮
				</button>

				<div className="dots">
					{titles.map((_, i) => (
						<button
							key={i}
							className={activeDot === i ? "dot active" : "dot"}
							onClick={() => {
								setIndex(i + 1);
								startAutoSlide();
							}}
						/>
					))}
				</div>

				<button className="slide-btn right" onClick={nextSlide}>
					❯
				</button>
			</div>
		</div>
	);
};

export default Titlecards;
