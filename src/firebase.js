import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwXEHDcfWWUKaMqZqnlnbeLXzKUp1o9mo",
  authDomain: "homs-hotel-manager.firebaseapp.com",
  projectId: "homs-hotel-manager",
  storageBucket: "homs-hotel-manager.firebasestorage.app",
  messagingSenderId: "284581147553",
  appId: "1:284581147553:web:5f75a1d796c300815951e0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
