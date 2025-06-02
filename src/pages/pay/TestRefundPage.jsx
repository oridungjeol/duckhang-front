import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RefundButton from "../../components/RefundButton";

export default function TestRefundPage() {
  const location = useLocation();
  const [refundData, setRefundData] = useState(null);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const encodedData = searchParams.get('data');
      
      if (encodedData) {
        const decodedData = JSON.parse(decodeURIComponent(encodedData));
        console.log("Decoded Refund Data:", decodedData); // 디버깅용 로그
        setRefundData(decodedData);
      }
    } catch (error) {
      console.error("Error parsing refund data:", error);
    }
  }, [location.search]);

  const handleRefundComplete = () => {
    // 부모 창에 환불 완료 메시지 전송
    window.parent.postMessage('refundComplete', window.location.origin);
  };

  if (!refundData) {
    return <div>환불 정보를 불러오는 중...</div>;
  }

  const { orderId, room_id, room_name, board_id, type, deposit } = refundData;

  if (!orderId || !room_id || !room_name || !board_id || !type) {
    return <div>필요한 정보가 누락되었습니다. {JSON.stringify(refundData)}</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <RefundButton 
        orderId={orderId} 
        room_id={room_id}
        room_name={room_name}
        board_id={board_id}
        type={type}
        refundInfo={{ deposit }}
        onRefundComplete={handleRefundComplete}
      />
    </div>
  );
}