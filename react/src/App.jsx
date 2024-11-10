import ReactDOM from "react-dom/client";
import SearchComponent from "./components/searchMovies";
import MovieDetails from "./components/movieDetails";
import CallbackComponent from "./components/callBack";
import Login from "./components/login";
import ProtectedRoute from "./components/protectedRoute";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDdCQbBKuVCKAR67luHVd_WyxpEGVvRfNI",
  authDomain: "hypertube-2287a.firebaseapp.com",
  databaseURL:
    "https://hypertube-2287a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hypertube-2287a",
  storageBucket: "hypertube-2287a.firebasestorage.app",
  messagingSenderId: "85856277402",
  appId: "1:85856277402:web:9f580905d21756fbb52023",
  measurementId: "G-NXKPNJX895",
};

export default function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/auth/intra/callback" element={<CallbackComponent />} />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchComponent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movie/:id"
            element={
              <ProtectedRoute>
                <MovieDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
