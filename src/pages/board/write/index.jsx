import { useRef, useState } from "react";
import "./index.css";

export default function Write() {
  const [imageUrl, setImageUrl] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dealType, setDealType] = useState("purchase");
  const selectFile = useRef("");

  const handleFileChange = () => {
    const fileList = selectFile.current.files;
    if (fileList) {
      const urls = window.Array.from(fileList).map((file) =>
        window.URL.createObjectURL(file)
      );
      setImageUrl((prev) => [...urls, ...prev]);
      console.log(imageUrl);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  return (
    <>
      <form className="form-container">
        {/* <div className="form-group">
          <label className="image-button">
            사진 추가하기
            <input
              type="file"
              style={{ display: "none" }}
              ref={selectFile}
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div> */}
        <div className="form-group">
          <div className="preview-container">
            <label className="image-button">
              사진 추가하기
              <input
                type="file"
                style={{ display: "none" }}
                ref={selectFile}
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
            {imageUrl.map((url, index) => (
              <img className="preview-item" src={url} alt={index} />
            ))}
          </div>
        </div>

        <div className="form-group">
          <div className="radio-group">
            <label
              className={`radio-label ${
                dealType === "purchase" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="dealType"
                value="purchase"
                checked={dealType === "purchase"}
                onChange={(e) => setDealType(e.target.value)}
              />
              <span className="radio-text">구매</span>
            </label>
            <label
              className={`radio-label ${dealType === "sell" ? "active" : ""}`}
            >
              <input
                type="radio"
                name="dealType"
                value="sell"
                checked={dealType === "sell"}
                onChange={(e) => setDealType(e.target.value)}
              />
              <span className="radio-text">판매</span>
            </label>
            <label
              className={`radio-label ${
                dealType === "exchange" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="dealType"
                value="exchange"
                checked={dealType === "exchange"}
                onChange={(e) => setDealType(e.target.value)}
              />
              <span className="radio-text">교환</span>
            </label>
            <label
              className={`radio-label ${dealType === "rental" ? "active" : ""}`}
            >
              <input
                type="radio"
                name="dealType"
                value="rental"
                checked={dealType === "rental"}
                onChange={(e) => setDealType(e.target.value)}
              />
              <span className="radio-text">대여</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <input
            type="text"
            className="title-input"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={handleTitleChange}
            required
          />
        </div>

        <div className="form-group">
          <textarea
            className="content-input"
            placeholder="내용을 입력하세요"
            value={content}
            onChange={handleContentChange}
            required
          />
        </div>

        <div className="button-container">
          <input className="submit-button" type="submit" value="작성 완료" />
          <input className="cancel-button" type="button" value="취소" />
        </div>
      </form>
    </>
  );
}
