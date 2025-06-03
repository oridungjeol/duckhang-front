import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './UpdateProfile.css';

const UpdateProfile = () => {
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState('');
  const userId = Cookies.get('uuid');
  const navigate = useNavigate(); // ⬅️ 위치 그대로 유지

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('nickname', nickname);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      await axios.post('/user/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setMessage('프로필이 성공적으로 수정되었습니다.');
      navigate(`/user/${userId}`);
    } catch (error) {
      setMessage('프로필 수정에 실패했습니다.');
    }
  };

  return (
    <div className="profile-update-outer">
      <div className="profile-update-card">
        <h2>프로필 수정</h2>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-image-upload">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="미리보기"
                className="profile-preview"
              />
            )}
            <label className="profile-image-upload-label">
              프로필 이미지 선택
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div className="form-group">
            <label>닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="profile-input"
            />
          </div>
          <button 
            type="submit" 
            className="profile-update-btn">
            수정하기
          </button>
          {message && <p className="profile-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
