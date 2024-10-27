import ReactDOM from "react-dom/client";
import SearchComponent from "./components/searchMovies";
import "./App.css";

export default function App() {
  return (
    <div className="center">
      <h1>HyperTube</h1>
      <SearchComponent />
    </div>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
