import ReactDOM from "react-dom/client";
import SearchComponent from "./components/searchMovies";
import MovieDetails from "./components/movieDetails";
import CallbackComponent from "./components/callBack";
import Login from "./components/login";
import ProtectedRoute from "./components/protectedRoute";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WatchMovie from "./components/watchMovie";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Profile from "./components/profile";

export default function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/auth/intra/callback" element={<CallbackComponent />} />
          <Route path="/search" element={<SearchComponent />} />
          <Route
            path="/movie/:id"
            element={
              <ProtectedRoute>
                <MovieDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movie/:id/watch"
            element={
              <ProtectedRoute>
                <WatchMovie />
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
