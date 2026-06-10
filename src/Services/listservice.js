import {
	doc,
	setDoc,
	deleteDoc,
	getDoc,
	collection,
	getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

export const toggleMovie = async (uid, movie) => {
	const movieRef = doc(db, "users", uid, "myList", movie.id.toString());

	const snapshot = await getDoc(movieRef);

	if (snapshot.exists()) {
		await deleteDoc(movieRef);
		return false;
	}

	const movieData = {
		id: movie.id,
		title: movie.title || movie.name,
		poster_path: movie.poster_path,
		backdrop_path: movie.backdrop_path,
		vote_average: movie.vote_average,
		release_date: movie.release_date,
		first_air_date: movie.first_air_date,
		media_type: movie.media_type,
		overview: movie.overview,
	};

	Object.keys(movieData).forEach((key) => {
		if (movieData[key] === undefined) {
			delete movieData[key];
		}
	});

	await setDoc(movieRef, movieData);

	return true;
};

export const fetchList = async (uid) => {
	const listRef = collection(db, "users", uid, "myList");

	const snapshot = await getDocs(listRef);

	return snapshot.docs.map((doc) => doc.data());
};
