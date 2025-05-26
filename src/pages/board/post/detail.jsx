import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createChatRoom } from '../hook';
import './detail.css';

export default function BoardDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  console.log(state);

  const createRoom = async () => {
    const name = '작성자의 이름';
    const board_id = parseInt(id);
    const type = 'rental'; // 임시로 고정값 설정

    const info = await createChatRoom(name, board_id, type);
    navigate(`/chat/${info.room_id}`, { state: info });
  }

  return (
    <div className="board-detail-container">
      <div className="board-detail-content">
        <div className="board-image">
          <img src="/placeholder-image.jpg" alt="게시글 이미지" />
        </div>
        
        <div className="board-info">
          <span className="board-title">{state.title}</span>
          
          <div className="board-meta">
            <span className="board-price">{state.price}</span>
            <span className="board-type">{state.type}</span>
          </div>
          
          <div className="board-description">
            <p>{state.description}</p>
          </div>
        </div>

        <button 
          className="chat-start-btn"
          onClick={() => {
            createRoom();
          }}
        >
          채팅 시작하기
        </button>
      </div>
    </div>
  );
} 