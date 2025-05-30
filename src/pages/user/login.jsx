import { Swiper, SwiperSlide } from "swiper/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import "./login.css";
import kakaoLoginImg from "../../images/kakao_login_large_wide.png";

import "swiper/css";
import "swiper/css/pagination";
import "./login.css";

import { Pagination } from "swiper/modules";

const handleKakaoLogin = () => {
  window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
};

const Login = () => {
  return (
    <>
      <Swiper pagination={true} modules={[Pagination]} className="mySwiper">
        <SwiperSlide className="swiper-page">
          <div className="swiper-group">
            <div className="swiper-title">Find What Ever You Like!</div>
            <div className="swiper-text">덕행에서 나의 최애를 찾아보세요!</div>
            <DotLottieReact
              src="https://lottie.host/78375728-d51f-463b-9b2a-6bea2de0325a/CW0GZA4FVT.lottie"
              loop
              autoplay
            />
          </div>
        </SwiperSlide>
        <SwiperSlide className="swiper-page">Slide 1</SwiperSlide>
        <SwiperSlide className="swiper-page">
          <div className="login-wrap">
            <div className="social">
              <button className="kakao-login-button" onClick={handleKakaoLogin}>
                <img src={kakaoLoginImg} alt="카카오 로그인" />
              </button>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </>
  );
};

export default function LoginPage() {
  return (
    <div>
      <Login />
    </div>
  );
}
