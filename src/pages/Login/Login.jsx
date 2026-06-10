import React, { useState } from "react";
import "./Login.css";
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";

const Login = ({ closeLogin }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [success, setSuccess] = useState(null);

	const handleAuth = async (e) => {
		e.preventDefault();

		if (!email || !password) {
			setMessage("Please fill in all fields.");
			setSuccess(false);
			return;
		}

		try {
			setLoading(true);

			if (isLogin) {
				await signInWithEmailAndPassword(auth, email, password);
				setMessage("Logged in successfully!");
				setSuccess(true);
			} else {
				await createUserWithEmailAndPassword(auth, email, password);
				setMessage("Account created successfully!");
				setSuccess(true);
			}

			setTimeout(() => {
				closeLogin();
			}, 1000);
		} catch (error) {
			setMessage(
				isLogin ? "Invalid email or password." : "Could not create account.",
			);
			setSuccess(false);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="overlay">
			<form className="login" onSubmit={handleAuth}>
				<button type="button" className="close" onClick={closeLogin}>
					✕
				</button>

				<h2 className="login-title">{isLogin ? "Log In" : "Sign Up"}</h2>

				<input
					className="login-input"
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<input
					className="login-input"
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				{message && (
					<p className={`login-message ${success ? "success" : "error"} `}>
						{message}
					</p>
				)}

				<button type="submit" className="login-button" disabled={loading}>
					{loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
				</button>

				<p className="switch-auth" onClick={() => setIsLogin(!isLogin)}>
					{isLogin
						? "Don't have an account? Sign Up"
						: "Already have an account? Log In"}
				</p>
			</form>
		</div>
	);
};

export default Login;
