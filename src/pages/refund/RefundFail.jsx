import React from "react";
import { useLocation } from "react-router-dom";

export default function RefundFail() {
  const location = useLocation();
  const message = location.state?.message || "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="result wrapper" style={{ flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "40px",
          marginBottom: "32px",
        }}
      >
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#e65555" />
          <path d="M35 35L65 65M65 35L35 65" stroke="white" strokeWidth="7" strokeLinecap="round" />
        </svg>
        <div className="box_section">
          <h2>환불에 실패했습니다.</h2>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
} 