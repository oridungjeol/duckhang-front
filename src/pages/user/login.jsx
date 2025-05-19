import React from 'react';
import './login.css';
import kakaoLoginImg from '../../images/kakao_login_large_wide.png';

const LoginPage = () => {
  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
  };

  return (
    <div class="login-container">
        <div className="login-box">
            <button className="kakao-login-button" onClick={handleKakaoLogin}>
                <img src={kakaoLoginImg} alt="카카오 로그인" />
            </button>
        </div>
    </div>
  );
};

export default LoginPage;
