import React, { useState, useEffect, useRef } from "react";
import "./Play.css";
import More_movies from "../More_movies/More_movies";
import axios from "../../axios";
import { API_KEY, img_Path } from "../../constants/constants";
import { useLocation } from "react-router-dom";
import { auth } from "../../firebase";
import { toggleMovie } from "../../services/listService";
import { useList } from "../../context/ListContext";

const Play = () => {
	const [loading, setLoading] = useState(true);
	const [cast, setCast] = useState(null);
	const [crew, setCrew] = useState(null);
	const [length, setLength] = useState(null);
	const [ep, setEp] = useState(null);
	const location = useLocation();
	const movie = location.state?.movie;
	const type = location.state?.movie.media_type || location.state?.type;
	const id = movie.id;
	const topRef = useRef(null);

	const { list, setList } = useList();
	const isAdded = list.some((item) => item.id === movie.id);

	if (!movie) {
		return <h2>Movie not found</h2>;
	}

	useEffect(() => {
		setLoading(true);

		axios.get(`${type}/${id}/credits?api_key=${API_KEY}`).then((res) => {
			// console.log(res.data.cast)
			// console.log(res.data.crew)

			setCast(res.data.cast);
			setCrew(res.data.crew);

			setLoading(false);
		});
	}, [type, id]);

	const director = crew?.find((person) => person.job === "Director");
	const producer = crew?.find((person) => person.job === "Producer");

	useEffect(() => {
		setLoading(true);

		axios.get(`${type}/${id}?api_key=${API_KEY}`).then((res) => {
			console.log(res.data);
			setLength(res.data.runtime || res.data.number_of_seasons);
			setEp(res.data.number_of_episodes);

			setLoading(false);
		});
	}, [type, id]);

	const handleList = async () => {
		const user = auth.currentUser;

		if (!user) {
			alert("Please login first");
			return;
		}

		const movieData = {
			...movie,
			media_type: type,
		};

		const added = await toggleMovie(user.uid, movieData);

		if (added) {
			setList((prev) => [...prev, movieData]);
		} else {
			setList((prev) => prev.filter((item) => item.id !== movie.id));
		}
	};

	const scrollToTop = () => {
		topRef.current?.scrollIntoView({
			behaviour: "smooth",
			block: "start",
		});
	};

	return (
		<div className="play" ref={topRef}>
			<div className="play-wrapper">
				<img className="play-img" src={`${img_Path}${movie.backdrop_path}`} />
			</div>

			<div className="play-details">
				<h1 className="play-name">{movie.title || movie.name}</h1>

				<button
					className={`list-btn ${isAdded ? "active" : ""}`}
					onClick={handleList}>
					<i className={isAdded ? "fa fa-bookmark" : "fa fa-bookmark-o"}></i>

					{isAdded ? " Added" : " List"}
				</button>

				<div className="play-info">
					<span className="rating">
						<i className="fa fa-star"></i>
						{movie.vote_average?.toFixed(1)}
					</span>

					{type === "tv" && (
						<h3 className="play-info">
							{length} Seasons • {ep} Episodes
						</h3>
					)}

					{type === "movie" && <h3 className="play-info">{length} mins</h3>}

					<h3 className="play-info">
						{(movie.release_date || movie.first_air_date)?.slice(0, 4)}
					</h3>
				</div>

				<h3 className="play-overview">{movie.overview}</h3>
			</div>

			<div className="cast">
				<div className="play-header">
					<h2 className="line">|</h2>
					<h2 className="head">Cast</h2>
				</div>

				{cast && (
					<div className="actor-sec">
						<div className="actors">
							{cast?.slice(0, 6).map((actor) => (
								<div className="actor" key={actor.id}>
									<div className="wrap">
										<img
											className="cast-img"
											src={`${img_Path}${actor.profile_path}`}
											alt="actor"
										/>
									</div>
									<h3 className="cast-name">
										{actor.name} <p>as</p> <p>( {actor.character} )</p>
									</h3>
								</div>
							))}
						</div>
					</div>
				)}

				{director || producer ? <hr /> : null}

				{director?.id === producer?.id ? (
					director && (
						<div className="director">
							<div className="wrap">
								<img
									className="cast-img"
									src={`${img_Path}${director.profile_path}`}
									alt="Director"
								/>
							</div>
							<h3 className="cast-name">
								{director.name}
								<p>[ Director & Producer ]</p>
							</h3>
						</div>
					)
				) : (
					<div className="crew">
						{director && (
							<div className="director">
								<div className="wrap">
									<img
										className="cast-img"
										src={`${img_Path}${director.profile_path}`}
										alt="Director"
									/>
								</div>
								<h3 className="cast-name">
									{director.name}
									<p>[ Director ]</p>
								</h3>
							</div>
						)}

						{producer && (
							<div className="producer">
								<div className="wrap">
									<img
										className="cast-img"
										src={`${img_Path}${producer.profile_path}`}
										alt="Producer"
									/>
								</div>
								<h3 className="cast-name">
									{producer.name}
									<p>[ Producer ]</p>
								</h3>
							</div>
						)}
					</div>
				)}
			</div>

			<More_movies
				category="Similar "
				url={`/${type}/${id}/similar`}
				type={type}
			/>
			{scrollToTop()}
		</div>
	);
};

export default Play;
