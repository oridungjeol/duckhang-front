import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './mypage.css';

function Mypage() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/user/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('사용자 없음');
        return res.json();
      })
      .then(data => {
        setUserData(data);
        setNotFound(false);
      })
      .catch(err => {
        console.error(err);
        setNotFound(true);
      });
  }, [userId]);

  if (notFound) return <div className="mypage-container">사용자 없음</div>;
  if (!userData) return <div className="mypage-container">Loading...</div>;

  return (
    <div className="mypage-container">
      <img
        className="profile-img"
        src={`http://localhost:8080/user/${userData.userId}`}
        alt="프로필"
      />
      <div className="user-info">
        <div className="nickname">{userData.nickname}</div>
        <div className="stars">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < userData.scope ? 'star-filled' : 'star-empty'}>
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Mypage;
