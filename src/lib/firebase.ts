// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC8kBMOss0ZxkVUmykxUm98grFR6W2FIlA",
    authDomain: "velvetquizzer.firebaseapp.com",
    projectId: "velvetquizzer",
    storageBucket: "velvetquizzer.firebasestorage.app",
    messagingSenderId: "908968180650",
    appId: "1:908968180650:web:ec787f8f627b0b3f3e09d3",
    measurementId: "G-JD7MDC0YLN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
// Initialize analytics only on client side
if (typeof window !== "undefined") {
    isSupported().then(yes => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

export { db, storage, analytics };
