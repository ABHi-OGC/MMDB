import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { fetchList } from "../services/listService";

const ListContext = createContext();

export const ListProvider = ({ children }) => {
	const [list, setList] = useState([]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				const movies = await fetchList(user.uid);
				setList(movies);
			} else {
				setList([]);
			}
		});

		return unsubscribe;
	}, []);

	return (
		<ListContext.Provider value={{ list, setList }}>
			{children}
		</ListContext.Provider>
	);
};

export const useList = () => useContext(ListContext);
