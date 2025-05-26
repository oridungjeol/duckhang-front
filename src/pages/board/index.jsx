import { useNavigate } from 'react-router-dom';

import { createChatRoom } from './hook';

export default function Board() {
  const navigate = useNavigate();

  const createRoom = async () => {
    const name = '작성자의 이름';
    const board_id = 102;
    const type = 'rental';

    const info = await createChatRoom(name, board_id, type);

    navigate(`/chat/${info.room_id}`, { state: info });
  }

  return (
    <div>
      board
      <button onClick={() => {
        createRoom();
      }}>채팅 시작하기</button>
    </div>
  );
}