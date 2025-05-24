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
