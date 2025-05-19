import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/user/login"
import Profile from "./pages/user/profile"
import Board from "./pages/board";
import Chat from "./pages/chat";
import Map from "./pages/map";

import "./App.css";

function App() {
  function setScreenSize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  useEffect(() => {
    setScreenSize();
  });

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 layout">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/user/:uuid" element={<Profile />} />
          <Route path="/board" element={<Board />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
