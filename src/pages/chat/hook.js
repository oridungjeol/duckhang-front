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

/**
 * 이미지를 업로드 하기 위해 formData 객체를 전달하고 저장된 image url을 리턴받습니다.
 * @param {*} image
 * @returns image url
 */
export async function uploadImage(image) {
  try {
    const response = await axios.post(
      `http://localhost/api/chat/upload/image`,
      image,
      {
        withCredentials: true,
      },
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

/**
 * 특정 room_id의 사기 키워드를 탐지
 * @param {*} room_id
 */
export async function getcheckFraud(room_id) {
  try {
    const response = await axios.get(
      `http://localhost/api/chat/fraud/${room_id}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.log("사기 키워드 탐지 중 오류 발생: ", error);
  }
}
