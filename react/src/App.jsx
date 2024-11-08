import ReactDOM from "react-dom/client";
import SearchComponent from "./components/searchMovies";
import MovieDetails from "./components/movieDetails";
import CallbackComponent from "./components/callBack";
import Login from "./components/login";
import Logout from "./components/logout";
import ProtectedRoute from "./components/protectedRoute";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <div>
        <Logout />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/auth/intra/callback" element={<CallbackComponent />} />
          <Route
            path="/search"
            element={<ProtectedRoute element={SearchComponent} />}
          />
          <Route
            path="/movie/:id"
            element={<ProtectedRoute element={MovieDetails} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
