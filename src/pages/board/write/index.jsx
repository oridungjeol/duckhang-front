import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

export default function CreateBoardForm() {
  const navigate = useNavigate();
  const [dealType, setDealType] = useState("purchase");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [imageUrl, setImageUrl] = useState([]);

  const handleDealTypeChange = (type) => {
    setDealType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const image = imageUrl.length > 0 ? imageUrl[0] : "";
    const baseData = { title, content, imageUrl: image };
    let requestData = {};

    switch (dealType) {
      case "purchase":
      case "sell":
        requestData = { ...baseData, price };
        break;
      case "rental":
        requestData = { ...baseData, price, deposit };
        break;
      case "exchange":
        requestData = baseData;
        break;
      default:
        alert("거래 유형을 선택해주세요.");
        return;
    }

    try {
      const response = await fetch(`http://localhost/api/board/${dealType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error("작성 실패");
      
      alert("작성 완료!");
      navigate('/board/deal');
    } catch (err) {
      alert("에러 발생: " + err.message);
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

      {/* 이미지 업로드 (단순 URL 입력 예시) */}
      <div className="form-group">
        <input
          className="title-input"
          type="text"
          placeholder="이미지 URL을 입력하세요"
          onChange={(e) => setImageUrl([e.target.value])}
        />
      </div>

      {/* 이미지 미리보기 */}
      {imageUrl.length > 0 && (
        <div className="preview-container">
          {imageUrl.map((url, i) => (
            <img key={i} src={url} alt="preview" className="preview-item" />
          ))}
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
