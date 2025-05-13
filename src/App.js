import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import User from "./pages/user";
import Board from "./pages/board";
import Chat from "./pages/chat";
import Map from "./pages/map";
import MyPage from "./pages/mypage";
import Checkout from "./pages/pay";
import Success from "./pages/pay/Success";
import Fail from "./pages/pay/Fail";

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
          <Route path="/board" element={<Board />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/map" element={<Map />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/fail" element={<Fail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
