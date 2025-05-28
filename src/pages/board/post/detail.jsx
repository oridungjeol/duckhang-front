import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createChatRoom } from '../hook';
import './detail.css';

export default function BoardDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();

  console.log(state);

  const createRoom = async () => {
    const author_uuid = state.author_uuid;
    const name = state.title;
    const board_id = state.id;
    const type =  state.type;

    const info = await createChatRoom(name, board_id, type, author_uuid);
    console.log("info: ",info);
    navigate(`/chat/${info.room_id}`, { state: info });
  }

  return (
    <div className="board-detail-container">
      <div className="board-detail-content">
        <div className="board-image">
          <img src="/placeholder-image.jpg" alt="게시글 이미지" />
        </div>
        
        <div className="board-info">
          <span className="board-title">{state.title} | {state.nickname}</span>
          
          <div className="board-meta">
            <span className="board-price">{state.price}</span>
            <span className="board-type">{state.type}</span>
          </div>
          
          <div className="board-description">
            <p>{state.content}</p>
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