import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./index.css";

export default function EditBoardForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { type, board_id } = useParams();
  const { board } = location.state || {};

  const [dealType, setDealType] = useState(board?.type?.toLowerCase() || "purchase");
  const [title, setTitle] = useState(board?.title || "");
  const [content, setContent] = useState(board?.content || "");
  const [price, setPrice] = useState(board?.price || "");
  const [deposit, setDeposit] = useState(board?.deposit || "");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [isCurrentImageDeleted, setIsCurrentImageDeleted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 컴포넌트 마운트 시 기존 이미지 설정
  useEffect(() => {
    console.log("Board data:", board); // 디버깅용
    console.log("Image URL:", board?.imageUrl); // 필드명 수정
    
    if (board?.imageUrl) {
      setCurrentImage(board.imageUrl);
      console.log("Final Image URL:", board.imageUrl); // 디버깅용
    }
  }, [board]);

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
    
    // 새 이미지를 선택하면 기존 이미지는 자동으로 교체됨을 표시
    setIsCurrentImageDeleted(true);
  };

  // 기존 이미지 삭제 (프론트에서만)
  const handleDeleteCurrentImage = () => {
    setCurrentImage("");
    setIsCurrentImageDeleted(true);
  };

  // 새 이미지 삭제
  const handleDeleteNewImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    // 기존 이미지가 있고 삭제되지 않았다면 다시 표시
    if (board?.imageUrl && !isCurrentImageDeleted) {
      setCurrentImage(board.imageUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile && !currentImage) {
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

      const response = await axios.put(`/board/${dealType}/${board_id}`, formData, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`
        }
      });

      if (response.status === 200) {
        alert("수정 완료!");
        navigate(`/board/${type}/${board_id}`);
      }
    } catch (err) {
      console.error("게시글 수정 오류:", err);
      alert("게시글 수정 실패: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      {/* 거래유형 버튼 */}
      <div className="radio-group">
        <label className="radio-label active">
          <input type="radio" name="dealType" value={dealType} checked readOnly />
          <span className="radio-text">
            {dealType === "purchase"
              ? "구매"
              : dealType === "sell"
              ? "판매"
              : dealType === "rental"
              ? "대여"
              : "교환"}
          </span>
        </label>
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
        <label htmlFor="image-upload" className="image-upload-label">
          {!previewUrl && currentImage && !isCurrentImageDeleted ? (
            <>
              <img 
                src={currentImage} 
                alt="기존 이미지" 
                className="preview-item"
                onError={(e) => {
                  console.error("이미지 로드 실패:", currentImage);
                  e.target.style.display = 'none';
                }}
              />
              <button 
                type="button" 
                className="delete-image-btn"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteCurrentImage();
                }}
                title="기존 이미지 삭제"
              >
                ×
              </button>
            </>
          ) : null}
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <div className="error-message" style={{ display: imageError ? 'block' : 'none' }}>이미지를 업로드해주세요</div>
      </div>

      {/* 이미지 미리보기 */}
      <div className="preview-container">
        {/* 새로 선택한 이미지 표시 */}
        {previewUrl && (
          <div className="preview-item-wrapper">
            <img src={previewUrl} alt="새 이미지 미리보기" className="preview-item" />
            <button 
              type="button" 
              className="delete-image-btn"
              onClick={handleDeleteNewImage}
              title="새 이미지 삭제"
            >
              ×
            </button>
            <span className="image-label">새 이미지</span>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="button-container">
        <input className="submit-button" type="submit" value="수정 완료" />
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
