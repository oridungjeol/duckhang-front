import axios from "axios";

/**
 * 리뷰를 작성합니다.
 * @param {string} author_uuid 리뷰를 받는 사용자의 UUID
 * @param {object} reviewData 리뷰 데이터 (content, rating, orderId)
 * @returns {Promise<string>} 성공 메시지
 */
export const addReview = async (authorUuid, reviewData) => {
  try {
    console.log("리뷰 작성 요청 데이터:", {
      authorUuid,
      reviewData
    });
    console.log(typeof(parseFloat(reviewData.rating)))
    const requestData = {
      targetId: authorUuid,
      scope: parseFloat(reviewData.rating),
      content: reviewData.content,
      orderId: reviewData.orderId
    };


    console.log("서버로 전송할 데이터:", requestData);

    const response = await axios.post(
      "http://localhost/api/review",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        withCredentials: true
      }
    );

    console.log("서버 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("리뷰 작성 중 오류 발생:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      requestData: {
        authorUuid,
        reviewData
      }
    });
    throw error;
  }
};

/**
 * 사용자의 리뷰 목록을 가져옵니다.
 * @param {string} userId 사용자 UUID
 * @param {number} pageNumber 페이지 번호
 * @param {number} pageSize 페이지 크기
 * @returns {Promise<Array>} 리뷰 목록
 */
export async function getReviews(userId, pageNumber = 0, pageSize = 10) {
  try {
    const response = await axios.get(
      `http://localhost/api/review/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    console.log("리뷰 목록 API 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("리뷰 목록 불러오기 중 오류 발생:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return [];
  }
} 