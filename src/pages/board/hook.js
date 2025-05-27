import axios from "axios";

/**
 * 새로운 채팅방을 생성합니다.
 * @param {*} name 채팅방 이름
 * @param {*} board_id 게시글 고유 번호
 * @param {*} type 게시글 타입
 * @returns 채팅방 정보
 */
export async function createChatRoom(name, board_id, type, author_uuid) {
  const data = {
    name: name,
    board_id: board_id,
    type: type,
    author_uuid: author_uuid,
  };

  try {
    const response = await axios.post(
      `http://localhost/api/chat/create`,
      data,
      {
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("채팅방 생성 중 오류 발생:", error);
  }
}
