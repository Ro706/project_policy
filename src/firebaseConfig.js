import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDbXx6j3w_MigZ5BsWhiXDV90cha77Xzp0",
  authDomain: "auth-e8c14.firebaseapp.com",
  projectId: "auth-e8c14",
  storageBucket: "auth-e8c14.appspot.com",
  messagingSenderId: "305141231231",
  appId: "1:305141231231:web:1231231231231231231231"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;