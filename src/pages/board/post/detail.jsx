import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './detail.css';

// 채팅방 생성 함수 (예시)
// 실제로는 별도 api/chat.js 파일 등에 정의되어야 함
async function createChatRoom(name, board_id, type, author_uuid) {
  const response = await axios.post('/chat/create', {
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

  // 한글 타입명 매핑 (화면 표시용)
  const boardTypeKorean = {
    'PURCHASE': '구매',
    'SELL': '판매',
    'RENTAL': '대여',
    'EXCHANGE': '교환',
    'DELEGATE': '대리',
    'HELPER': '헬퍼',
    'MATE': '메이트',
  };

  useEffect(() => {
    if (!type || !board_id) {
      setError('잘못된 접근입니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const tryFetchBoard = async () => {
      let boardTypes = [];

      if (type === 'deal') {
        boardTypes = ['PURCHASE', 'SELL', 'RENTAL', 'EXCHANGE'];
      } else if (type === 'person') {
        boardTypes = ['DELEGATE', 'HELPER', 'MATE'];
      }

      for (const boardType of boardTypes) {
        try {
          const response = await axios.get(`/board/${boardType}/${board_id}`);
          setBoard(response.data);
          return; // 성공 시 루프 종료
        } catch (err) {
          continue; // 다음 타입 시도
        }
      }

      setError('존재하지 않는 게시글입니다.');
    };

    tryFetchBoard().finally(() => setLoading(false));
  }, [type, board_id]);

  const createRoom = async () => {
    if (!board) return;

    try {
      const info = await createChatRoom(
        board.title,
        parseInt(board.id),
        board.type,
        board.author_uuid
      );
      navigate(`/chat/${info.room_id}`, { state: info });
    } catch (err) {
      console.error('채팅방 생성 오류:', err);
      alert('채팅방을 생성할 수 없습니다.');
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
      <div className="board-detail-content">
        <div className="board-image">
          <img
            src={board.imageUrl || '/placeholder-image.jpg'}
            alt="게시글 이미지"
            onError={(e) => {
              e.target.onerror = null; // 무한 반복 방지
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>

        <div className="board-info">
          <div className="board-header">
            <h1 className="board-title">{board.title}</h1>
            <span className="board-author">작성자: {board.nickname}</span>
          </div>

          <div className="board-meta">
            {board.type !== 'EXCHANGE' && (
              <span className="board-price">
                {board.price ? `${board.price.toLocaleString()} 원` : '가격 미정'}
              </span>
            )}
            <span className="board-type-badge">
              {boardTypeKorean[board.type] || board.type}
            </span>
          </div>

          <div className="board-description">
            <h3>상세 내용</h3>
            <p>{board.content}</p>
          </div>

          {board.createdAt && (
            <div className="board-timestamp">
              작성일: {new Date(board.createdAt).toLocaleDateString('ko-KR')}
            </div>
          )}
        </div>

        <div className="board-actions">
          <button className="chat-start-btn" onClick={createRoom}>
            채팅 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
