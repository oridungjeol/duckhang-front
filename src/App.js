import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/user/login";
import Profile from "./pages/user/profile";
import Board from "./pages/board";
import BoardDetail from "./pages/board/post/detail";
import Chat from "./pages/chat";
import ChatRoom from "./pages/chat/chatroom";
import Map from "./pages/map";
import Write from "./pages/board/write";

import Checkout from "./pages/pay";
import Success from "./pages/pay/Success";
import Fail from "./pages/pay/Fail";
import TestRefundPage from "./pages/pay/TestRefundPage";
import RefundSuccess from "./pages/refund/RefundSuccess";
import RefundFail from "./pages/refund/RefundFail";

import "./App.css";

function App() {
  function setScreenSize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  useEffect(() => {
    setScreenSize();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 layout">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/user/:uuid" element={<Profile />} />
          <Route path="/board/:type" element={<Board />} />
          <Route path="/board/:type/write" element={<Write />} />
          <Route path="/board/:type/:board_id" element={<BoardDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:room_id" element={<ChatRoom />} />
          <Route path="/map" element={<Map />} />

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/fail" element={<Fail />} />
          <Route path="/test-refund" element={<TestRefundPage />} />
          <Route path="/refund-success" element={<RefundSuccess />} />
          <Route path="/refund-fail" element={<RefundFail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
