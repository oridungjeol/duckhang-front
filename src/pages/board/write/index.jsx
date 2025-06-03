import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./index.css";

export default function CreateBoardForm() {
  const navigate = useNavigate();
  const [dealType, setDealType] = useState("purchase");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageError, setImageError] = useState(false);

  const handleDealTypeChange = (type) => {
    setDealType(type);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageError(true);
      return;
    }
    setImageError(false);
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setImageError(true);
      return;
    }
    setImageError(false);

    try {
      // FormData 생성
      const formData = new FormData();
      
      // DTO 객체 생성
      const requestDto = {
        title,
        content,
        price: (dealType === "purchase" || dealType === "sell" || dealType === "rental") ? parseInt(price) || 0 : 0,
        deposit: dealType === "rental" ? parseInt(deposit) || 0 : 0
      };

      // JSON 형태로 dto 추가
      formData.append("dto", new Blob([JSON.stringify(requestDto)], {
        type: "application/json"
      }));

      // 이미지 파일이 있는 경우 추가 (RequestDto의 imageUrl 필드에 매핑)
      if (imageFile) {
        formData.append("imageUrl", imageFile);
      }

      const response = await axios.post(`/board/${dealType}`, formData, {
        headers: {
          // Content-Type을 명시적으로 설정하지 않음 (브라우저가 자동으로 boundary 설정)
          'Authorization': `Bearer ${Cookies.get('accessToken')}`
        }
      });

      if (response.status === 200) {
        alert("작성 완료!");
        navigate('/board/deal');
      }
    } catch (err) {
      console.error("게시글 작성 오류:", err);
      alert("게시글 작성 실패: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      {/* 거래유형 버튼 */}
      <div className="radio-group">
        {["purchase", "sell", "rental", "exchange"].map((type) => (
          <label
            key={type}
            className={`radio-label ${dealType === type ? "active" : ""}`}
            onClick={() => handleDealTypeChange(type)}
          >
            <input type="radio" name="dealType" value={type} />
            <span className="radio-text">
              {type === "purchase"
                ? "구매"
                : type === "sell"
                ? "판매"
                : type === "rental"
                ? "대여"
                : "교환"}
            </span>
          </label>
        ))}
      </div>

      {/* 제목 */}
      <div className="form-group">
        <input
          className="title-input"
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* 내용 */}
      <div className="form-group">
        <textarea
          className="content-input"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      {/* 가격 */}
      {(dealType === "purchase" || dealType === "sell" || dealType === "rental") && (
        <div className="form-group">
          <input
            className="title-input"
            type="number"
            placeholder="가격을 입력하세요"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
          />
        </div>
      )}

      {/* 보증금 */}
      {dealType === "rental" && (
        <div className="form-group">
          <input
            className="title-input"
            type="number"
            placeholder="보증금을 입력하세요"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            required
            min="0"
          />
        </div>
      )}

      {/* 이미지 업로드 */}
      <div className="form-group">
        <label htmlFor="image-upload" className="image-upload-label"></label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <div className="error-message" style={{ display: imageError ? 'block' : 'none' }}>이미지를 업로드해주세요</div>
      </div>

      {/* 이미지 미리보기 */}
      {previewUrl && (
        <div className="preview-container">
          <img src={previewUrl} alt="preview" className="preview-item" />
        </div>
      )}

      {/* 버튼 */}
      <div className="button-container">
        <input className="submit-button" type="submit" value="작성 완료" />
        <input
          className="cancel-button"
          type="button"
          value="취소"
          onClick={() => window.history.back()}
        />
      </div>
    </form>
  );
}
