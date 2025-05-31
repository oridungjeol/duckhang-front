import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function Success() {
  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const requestData = {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };

    async function confirm() {
      try {
        const response = await fetch("http://localhost/api/payment/confirm", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const json = await response.json();

        if (!response.ok) {
          const errorMessage = json.message || "결제 확인 실패";
          setError(errorMessage);
          navigate(
            `/fail?message=${encodeURIComponent(errorMessage)}&code=${
              json.code || "UNKNOWN"
            }`
          );
          return;
        }

        setPaymentInfo(json);
      } catch (err) {
        const errorMessage = "네트워크 오류가 발생했습니다.";
        setError(errorMessage);
        console.error("결제 확인 중 오류 발생:", err);
        navigate(
          `/fail?message=${encodeURIComponent(errorMessage)}&code=NETWORK_ERROR`
        );
      } finally {
        setIsLoading(false);
      }
    }

    confirm();
  }, [navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="result wrapper">
        <div className="box_section loading-container">
          <div className="loading-spinner"></div>
          <h2>결제 확인 중...</h2>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result wrapper">
        <div className="box_section">
          <h2>결제 실패</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
          <circle cx="50" cy="50" r="45" fill="#5580e6" />
          <path
            d="M30 52L45 67L70 42"
            stroke="white"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="box_section">
          <h2>결제가 완료되었습니다.</h2>
          <p>{`주문번호: ${paymentInfo.orderId}`}</p>
          <p>{`결제금액: ${Number(
            paymentInfo.totalAmount
          ).toLocaleString()}원`}</p>
          <p>{`결제수단: ${paymentInfo.method}`}</p>
          <p>{`결제일시: ${formatDate(paymentInfo.approvedAt)}`}</p>
        </div>
      </div>
      <button
        onClick={() => {
          const room_id = searchParams.get("room_id");
          const room_name = searchParams.get("room_name");
          const board_id = searchParams.get("board_id");
          const type = searchParams.get("type");
          const orderId = searchParams.get("orderId");
          const amount = searchParams.get("amount");

          // 게시글 정보를 가져와서 보증금 정보를 포함
          fetch(`http://localhost/api/board/rental/${board_id}`, {
            credentials: "include",
          })
            .then((response) => response.json())
            .then((boardData) => {
              navigate(`/chat/${room_id}`, {
                state: {
                  room_id,
                  name: room_name,
                  board_id,
                  type,
                  orderId,
                  deposit: boardData.deposit,
                },
              });
            })
            .catch((error) => {
              console.error("게시글 정보 가져오기 실패:", error);
              // 에러가 발생해도 기본 정보만이라도 전달
              navigate(`/chat/${room_id}`, {
                state: {
                  room_id,
                  name: room_name,
                  board_id,
                  type,
                  orderId,
                },
              });
            });
        }}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#ffca1a",
          color: "#4a4a3c",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "all 0.3s ease",
        }}
      >
        채팅방으로 돌아가기
      </button>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export default Success;
