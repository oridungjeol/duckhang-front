import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import './header.css';

const Header = () => {
  const [username, setUsername] = useState(null);
  const [uuid, setUuid] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.nickname || '사용자');
        setUuid(decoded.sub);
      } catch (error) {
        console.error('JWT 디코딩 실패:', error);
        setUsername(null);
        setUuid(null);
      }
    } else {
      setUsername(null);
      setUuid(null);
    }
  }, []);

  const handleClick = () => {
    if (username) {
      navigate(`/user/${uuid}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="custom-header">
      <div className="header-right">
        <button className="login-button" onClick={handleClick}>
          {username ? `${username}님` : '로그인'}
        </button>
      </div>
    </header>
  );
};

export default Header;
