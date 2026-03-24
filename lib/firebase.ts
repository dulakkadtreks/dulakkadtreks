// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfAQxQvRnILDm8sPjj21QtbMB3OzKUc3w",
  authDomain: "dullakad-treks-2.firebaseapp.com",
  projectId: "dullakad-treks-2",
  storageBucket: "dullakad-treks-2.firebasestorage.app",
  messagingSenderId: "261585921102",
  appId: "1:261585921102:web:4f4d31debf6baa0c78cf1f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);