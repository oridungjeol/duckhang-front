import axios from "axios";

export async function getChatRoomList() {
  try {
    const response = await axios.get(`http://localhost/api/chat/chatroom`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("채팅방 정보 불러오기 중 오류 발생:", error);
    return [];
  }
}

// export async function getChattingData(data, pageRef) {
//   try {
//     const response = await axios.get(
//       `http://localhost/api/chat/recent/${data.room_id}?page=${pageRef.current}&size=50&sort=createdAt,desc`,
//       {
//         withCredentials: true,
//       }
//     );
//     console.log("message data: ", response);
//     setMessages(response.data.reverse());
//   } catch (error) {
//     console.error("최근 채팅 기록 불러오기 중 오류 발생:", error);
//   }
// }
