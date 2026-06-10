import React, { useState, useEffect } from "react";
import "./Navbar.css";
import avatar from "../../assets/avatar.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import Login from "../../pages/Login/Login";
import axios from "../../axios";
import { API_KEY, poster_Path } from "../../constants/constants";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";

const Navbar = () => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();
	const location = useLocation();
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [hideNavbar, setHideNavbar] = useState(false);
	const [showLogin, setShowLogin] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
		});

		return unsubscribe;
	}, []);

	const handleNavigate = (path) => {
		navigate(path);
		setMenuOpen(false);
	};

	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}

		const timer = setTimeout(async () => {
			const response = await axios.get(
				`/search/multi?api_key=${API_KEY}&query=${query}`,
			);
			// console.log(response.data.results);
			const filtered = response.data.results
				.filter((item) => item.poster_path)
				.filter(
					(item) => item.media_type === "movie" || item.media_type === "tv",
				)
				.filter((item) => {
					const date = item.release_date || item.first_air_date;
					const year = date ? new Date(date).getFullYear() : 0;
					return year >= 2015;
				})
				.sort((a, b) => b.popularity - a.popularity)
				.slice(0, 10);

			setResults(filtered);

			console.log(filtered);
		}, 300);

		return () => clearTimeout(timer);
	}, [query]);

	const handleEnter = (e) => {
		if (e.key === "Enter" && query.trim()) {
			navigate(`/search?q=${query}`);
			window.location.reload();
		}
	};

	useEffect(() => {
		let lastScrollY = window.scrollY;

		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			if (currentScrollY > lastScrollY && currentScrollY > 100) {
				// scrolling down
				setHideNavbar(true);
			} else {
				// scrolling up
				setHideNavbar(false);
			}

			lastScrollY = currentScrollY;
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<div className={`fade ${hideNavbar ? "hide" : ""}`}>
			<div className="navbar">
				<img
					className="logo"
					src="logo.png"
					alt="Logo"
					onClick={() => handleNavigate("/")}
				/>

				<div className="searchbar">
					<i className="fa fa-search" />
					<input
						type="text"
						value={query}
						placeholder="Search"
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleEnter}
					/>

					{query && (
						<button
							className="clear-search"
							onClick={() => {
								setQuery("");
								setResults([]);
							}}>
							×
						</button>
					)}

					{results.length > 0 && (
						<div className="search-dropdown">
							{results.map((item) => (
								<div
									key={item.id}
									className="search-item"
									onClick={() =>
										navigate("/Play", {
											state: {
												movie: item,
												type: item.media_type,
											},
										})
									}>
									<img
										className="search-img"
										src={
											item.poster_path
												? `${poster_Path}${item.poster_path}`
												: null
										}
										alt="img"
									/>
									<h3 className="search-name">{item.title || item.name}</h3>
									<h5 className="search-year">
										{(item.release_date || item.first_air_date)?.slice(0, 4) ||
											"N/A"}
									</h5>
								</div>
							))}

							<div
								className="see-more"
								onClick={() => navigate(`/search?q=${query}`)}>
								See more...
							</div>
						</div>
					)}
				</div>

				<div className={`menu ${menuOpen ? "open" : ""}`}>
					<li
						className={location.pathname === "/" ? "active" : ""}
						onClick={() => handleNavigate("/")}>
						Home
					</li>

					<li
						className={location.pathname === "/Movies" ? "active" : ""}
						onClick={() => handleNavigate("/Movies")}>
						Movies
					</li>

					<li
						className={location.pathname === "/Tv" ? "active" : ""}
						onClick={() => handleNavigate("/Tv")}>
						Tv
					</li>

					<li
						className={location.pathname === "/List" ? "active" : ""}
						onClick={() => handleNavigate("/List")}>
						My List
					</li>
				</div>

				<div className="nav-right">
					<button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
						{menuOpen ? "✕" : "☰"}
					</button>

					<div className="user-container">
						<div
							className="user"
							onClick={() => {
								if (user) {
									setShowUserMenu((prev) => !prev);
								} else {
									setShowLogin(true);
								}
							}}>
							<img className="avatar" src={avatar} alt="avatar" />

							<p>{user ? user.email.split("@")[0] : "Login"}</p>
						</div>

						{user && showUserMenu && (
							<div className="user-menu">
								<button
									onClick={async () => {
										await signOut(auth);
										setShowUserMenu(false);
									}}>
									Sign Out
								</button>
							</div>
						)}
					</div>
				</div>

				{showLogin && <Login closeLogin={() => setShowLogin(false)} />}
			</div>
		</div>
	);
};

export default Navbar;
