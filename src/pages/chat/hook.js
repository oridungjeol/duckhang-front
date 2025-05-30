import axios from "axios";

/**
 * 유저가 속한 모든 채팅방의 정보 호출
 * @returns response.data
 */
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

/**
 * 해당 채팅방의 최근 50개 대화를 리턴
 * @param {*} data
 * @param {*} pageRef
 * @returns
 */
export async function getChattingData(data, pageRef) {
  try {
    const response = await axios.get(
      `http://localhost/api/chat/recent/${data.room_id}?page=${pageRef.current}&size=50&sort=createdAt,desc`,
      {
        withCredentials: true,
      }
    );
    console.log("message data: ", response);
    return response.data.reverse();
  } catch (error) {
    console.error("최근 채팅 기록 불러오기 중 오류 발생:", error);
  }
}

export async function uploadImage(image) {
  try {
    const response = await axios.post(
      `http://localhost/api/chat/upload/image`,
      image,
      { withCredentials: true },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("이미지 firebase에 업로드 중 오류 발생:", error);
  }
}
