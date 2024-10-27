import ReactDOM from "react-dom/client";
import SearchComponent from "./components/searchMovies";
import MovieDetails from "./components/movieDetails";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchComponent />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
