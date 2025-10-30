import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

function App() {
  return (
    <div className="parent">
      <Header />
      <Sidebar />
      <MainContent />
    </div>
  );
}

export default App;
