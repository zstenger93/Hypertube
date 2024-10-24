import ReactDOM from "react-dom/client";
import SearchComponent from "./components/searchMovies";

export default function App() {
  return (
    <div>
      <h1>HyperTube</h1>
      <SearchComponent />
    </div>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
