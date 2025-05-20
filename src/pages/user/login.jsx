import Header from "../../components/header";
import "./login.css";
import kakaoLoginImg from '../../images/kakao_login_large_wide.png';

const handleKakaoLogin = () => {
  window.location.href = 'http://localhost/oauth2/authorization/kakao';
};

const Login = () => {
  return (
    <div className="login-wrap">
      <div>
        로그인 방법 선택
      </div>
      <div className="social">
        <button className="kakao-login-button" onClick={handleKakaoLogin}>
          <img src={kakaoLoginImg} alt="카카오 로그인"/>
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div>
      <Header/>
      <Login/>
    </div>
  );
}