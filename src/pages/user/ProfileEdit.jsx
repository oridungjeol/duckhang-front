import { useState } from 'react';
import axios from 'axios';

export default function ProfileEdit({ profile, onClose, onSave }) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profile.profileImageUrl);

  // 이미지 미리보기
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 저장
  const handleSave = async () => {
    const formData = new FormData();
    formData.append('userId', profile.uuid);
    formData.append('nickname', nickname);
    if (imageFile) formData.append('profileImage', imageFile);

    await axios.post('http://localhost/api/user/update', formData, {
      withCredentials: true
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
    onSave();
  };

  return (
    <div className="user-profile">
      <div className="header-background" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-80px' }}>
        <label style={{ cursor: 'pointer' }}>
          <div style={{
            width: 180, height: 180, borderRadius: '50%', background: '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <img
              src={previewUrl || '/duckhaeng_logo.png'}
              alt="profile"
              style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', background: '#ffcc00', border: '4px solid white' }}
            />
          </div>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
        </label>
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          style={{ fontWeight: 700, fontSize: 24, marginBottom: 8, textAlign: 'center', border: '1px solid #ccc', borderRadius: 8, padding: 8 }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
        <button onClick={handleSave} style={{ padding: '10px 24px', background: '#FF9A42', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700 }}>저장</button>
        <button onClick={onClose} style={{ padding: '10px 24px', background: '#eee', color: '#333', border: 'none', borderRadius: 8, fontWeight: 700 }}>취소</button>
      </div>
    </div>
  );
}
