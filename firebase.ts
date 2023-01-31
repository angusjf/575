import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCnQDtVPzIM950_CNzSNS0Ys_GvWjLSo8c",
  authDomain: "app-3cc36.firebaseapp.com",
  databaseURL:
    "https://app-3cc36-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "app-3cc36",
  storageBucket: "app-3cc36.appspot.com",
  messagingSenderId: "863494049683",
  appId: "1:863494049683:web:180b22da978243230a6266",
};

export const firebaseApp = initializeApp(firebaseConfig);
