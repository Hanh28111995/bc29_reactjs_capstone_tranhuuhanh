import { initializeApp } from "firebase/app" ;   
import { getAnalytics } from "firebase/analytics" ;   
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = { 
  apiKey : "AIzaSyAR8J67wcFkROshBMv3zIOBy_A-C9mNJqk" , 
  authDomain : "nodejs-upload-demo.firebaseapp.com" , 
  projectId : "nodejs-upload-demo" , 
  storageBucket : "nodejs-upload-demo.firebasestorage.app" , 
  messagingSenderId : "141386655103" , 
  appId : "1:141386655103:web:3a77b4a8843f72e0e0264a" , 
  measurementId : "G-2YRD6SFVSL" 
};

// Initialize Firebase
const app = initializeApp ( firebaseConfig );
const analytics = getAnalytics ( app );

// Initialize Auth and Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();