import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import "./detail.css";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// 채팅방 생성 함수 (예시)
// 실제로는 별도 api/chat.js 파일 등에 정의되어야 함
async function createChatRoom(name, board_id, type, author_uuid) {
  const response = await axios.post("/chat/create", {
    name,
    board_id,
    type,
    author_uuid,
  });
  return response.data;
}

export default function BoardDetail() {
  const { type, board_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  // 한글 타입명 매핑 (화면 표시용)
  const boardTypeKorean = {
    PURCHASE: "구매",
    SELL: "판매",
    RENTAL: "대여",
    EXCHANGE: "교환",
    DELEGATE: "대리",
    HELPER: "헬퍼",
    MATE: "메이트",
  };

  useEffect(() => {
    if (!type || !board_id) {
      setError("잘못된 접근입니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchBoard = async () => {
      // location.state에서 boardType을 먼저 확인
      const boardType = location.state?.boardType;

      if (boardType) {
        // boardType이 전달된 경우 해당 타입으로 직접 요청
        try {
          const response = await axios.get(`/board/${boardType}/${board_id}`);
          setBoard(response.data);

          // JWT 토큰에서 현재 사용자의 UUID 가져오기
          const token = Cookies.get("accessToken");
          if (token) {
            try {
              const decoded = jwtDecode(token);
              const currentUserUuid = decoded.sub;
              setIsAuthor(currentUserUuid === response.data.author_uuid);
            } catch (error) {
              console.error("JWT 디코딩 실패:", error);
              setIsAuthor(false);
            }
          } else {
            setIsAuthor(false);
          }
          return;
        } catch (err) {
          console.error("게시글 조회 실패:", err);
          setError("존재하지 않는 게시글입니다.");
          return;
        }
      }

      let boardTypes = [];
      if (type === "deal") {
        boardTypes = ["PURCHASE", "SELL", "RENTAL", "EXCHANGE"];
      } else if (type === "person") {
        boardTypes = ["DELEGATE", "HELPER", "MATE"];
      }

      for (const boardType of boardTypes) {
        try {
          const response = await axios.get(`/board/${boardType}/${board_id}`);
          setBoard(response.data);

          const token = Cookies.get("accessToken");

          if (token) {
            try {
              const decoded = jwtDecode(token);
              const currentUserUuid = decoded.sub;
              console.log("Current User UUID:", currentUserUuid);
              console.log("Author UUID:", response.data.author_uuid);
              setIsAuthor(currentUserUuid === response.data.author_uuid);
              console.log(
                "Is Author:",
                currentUserUuid === response.data.author_uuid
              );
            } catch (error) {
              console.error("JWT 디코딩 실패:", error);
              setIsAuthor(false);
            }
          } else {
            console.log("No token found");
            setIsAuthor(false);
          }
          return;
        } catch (err) {
          continue;
        }
      }

      setError("존재하지 않는 게시글입니다.");
    };

    fetchBoard().finally(() => setLoading(false));
  }, [type, board_id, location.state]);

  const createRoom = async () => {
    if (!board) return;

    try {
      const info = await createChatRoom(
        board.title,
        parseInt(board.id),
        board.type,
        board.author_uuid
      );

      navigate(`/chat/${info.room_id}`, { state: board.id });
    } catch (err) {
      console.error("채팅방 생성 오류:", err);
      alert("채팅방을 생성할 수 없습니다.");
    }
  };

  const handleEdit = () => {
    navigate(`/board/write/${type}/${board_id}`, { state: { board } });
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await axios.delete(`/board/${board.type}/${board_id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      });

      if (response.status === 200) {
        alert("게시글이 삭제되었습니다.");
        navigate(`/board/${type}`); // 원래 카테고리 페이지로 이동
      }
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      if (error.response?.status === 403) {
        alert("삭제 권한이 없습니다.");
      } else {
        alert("게시글 삭제에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="board-detail-container">
        <div className="loading-container">
          <div className="duck-loading">
            <div className="duck-body"></div>
            <div className="duck-head"></div>
            <div className="duck-beak"></div>
            <div className="duck-leg left"></div>
            <div className="duck-leg right"></div>
          </div>
          <div className="loading-text">게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-detail-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="board-detail-container">
        <div className="no-content">
          <p>게시글이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="board-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ←
      </button>
      <div className="board-detail-content">
        <div className="board-image">
          <img
            src={board.imageUrl || "/placeholder-image.jpg"}
            alt="게시글 이미지"
            onError={(e) => {
              e.target.onerror = null; // 무한 반복 방지
              e.target.src = "/placeholder-image.jpg";
            }}
          />
        </div>

        <div className="board-info">
          <div className="board-header">
            <div className="title-container">
              <h1 className="board-title">{board.title}</h1>
              <div className="title-divider"></div>
              <span className="board-author">작성자: {board.nickname}</span>
              {isAuthor && (
                <button className="delete-btn" onClick={handleDelete}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="board-meta">
            {board.type !== "EXCHANGE" && (
              <span className="board-price">
                {board.price
                  ? `${board.price.toLocaleString()} 원`
                  : "가격 미정"}
              </span>
            )}
            <div className={`deal-type-badge ${board.type.toLowerCase()}`}>
              {boardTypeKorean[board.type] || board.type}
            </div>
          </div>

          <div className="board-description">
            <h3>상세 내용</h3>
            <p>{board.content}</p>
          </div>

          {board.createdAt && (
            <div className="board-timestamp">
              작성일: {new Date(board.createdAt).toLocaleDateString("ko-KR")}
            </div>
          )}
        </div>

        <div className="board-actions">
          {isAuthor && (
            <button className="edit-btn" onClick={handleEdit}>
              수정하기
            </button>
          )}
          {!isAuthor && (
            <button className="chat-start-btn" onClick={createRoom}>
              채팅 시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
