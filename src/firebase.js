// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBSHPgcFYtg_cW_k4EL2vG1MMA1Jrk-Bdk",
	authDomain: "mmdb-49677.firebaseapp.com",
	projectId: "mmdb-49677",
	storageBucket: "mmdb-49677.firebasestorage.app",
	messagingSenderId: "89165850397",
	appId: "1:89165850397:web:0a767fa12dcad3a931a3f4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
