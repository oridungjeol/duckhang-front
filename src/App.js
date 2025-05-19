import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import User from "./pages/user";
import Board from "./pages/board";
import Chat from "./pages/chat";
import ChatRoom from "./pages/chat/chatroom";
import Map from "./pages/map";
import MyPage from "./pages/mypage";
import LoginPage from "./pages/user";

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
          <Route path="/" element={<User />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user/:uuid" element={<MyPage />} />
          <Route path="/board" element={<Board />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:rood_id" element={<ChatRoom />} />
          <Route path="/map" element={<Map />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
