// Firebase v9 modular web SDK (CDN imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCF99YpkKjxKCuotVbxb0kkP1d_kgmT5cs",
  authDomain: "solve-wise.firebaseapp.com",
  databaseURL: "https://solve-wise-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "solve-wise",
  storageBucket: "solve-wise.firebasestorage.app",
  messagingSenderId: "800061630250",
  appId: "1:800061630250:web:67fd3815d11ff2b34a6053"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);