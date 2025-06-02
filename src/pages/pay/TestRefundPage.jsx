import { useLocation } from "react-router-dom";
import RefundButton from "../../components/RefundButton";

export default function TestRefundPage() {
  const location = useLocation();
  const { orderId, room_id, room_name, board_id, type } = location.state || {};


  if (!orderId || !room_id || !room_name || !board_id || !type) {
    return <div>필요한 정보가 누락되었습니다. {JSON.stringify({ orderId, room_id, room_name, board_id, type })}</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <RefundButton 
        orderId={orderId} 
        room_id={room_id}
        room_name={room_name}
        board_id={board_id}
        type={type}
      />

    </div>
  );
}