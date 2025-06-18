// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADoA9LHqjwcxGfs1KUna_NPh2Y3HICqDo",
  authDomain: "snbt-203e6.firebaseapp.com",
  projectId: "snbt-203e6",
  storageBucket: "snbt-203e6.firebasestorage.app",
  messagingSenderId: "96595435580",
  appId: "1:96595435580:web:cd36fbc4d81f6810f7a339",
  measurementId: "G-BWZ1HMGS79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;