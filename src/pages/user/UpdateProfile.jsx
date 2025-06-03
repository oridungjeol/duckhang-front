import React, { useState } from 'react';
import axios from 'axios';
import './UpdateProfile.css';

const UpdateProfile = () => {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('nickname', nickname);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      await axios.post('/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // 인증 쿠키가 필요하다면 사용
      });
      setMessage('프로필이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error(error);
      setMessage('프로필 수정에 실패했습니다.');
    }
  };

  return (
    <div className="profile-update-container">
      <h2>프로필 수정</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <label>
          사용자 ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </label>
        <label>
          닉네임:
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
        <label>
          프로필 이미지:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files[0])}
          />
        </label>
        <button type="submit">수정하기</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default UpdateProfile;
