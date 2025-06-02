import { useLocation, useNavigate } from "react-router-dom";

export default function RefundSuccess() {
  console.log('RefundSuccess component rendered');
  const location = useLocation();
  const navigate = useNavigate();
  const { room_id, room_name } = location.state || {};

  const handleReturnToChat = () => {
    console.log('handleReturnToChat called');
    try {
      // 부모 창의 모달 닫기
      if (window.parent) {
        console.log('Sending closeRefundModal message to parent');
        window.parent.postMessage('closeRefundModal', window.location.origin);
      }
      // 채팅방으로 이동
      navigate(`/chat/room/${room_id}`, {
        state: {
          room_id: room_id,
          name: room_name
        }
      });
    } catch (error) {
      console.error('Error in handleReturnToChat:', error);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>환불이 완료되었습니다</h1>
      <button onClick={handleReturnToChat} style={{ marginTop: "1rem" }}>
        채팅방으로 돌아가기
      </button>
    </div>
  );
} 