import { Swiper, SwiperSlide } from "swiper/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import "./login.css";
import mapIcon from "../../images/map.png";
import kakaoLoginImg from "../../images/kakao_login_large_wide.png";
import Text from "./text";

import "swiper/css";
import "swiper/css/pagination";

import { Pagination } from "swiper/modules";

const handleKakaoLogin = () => {
  window.location.href = 'http://localhost/oauth2/authorization/kakao';
};

const Login = () => {
  return (
    <>
      <Swiper pagination={true} modules={[Pagination]} className="mySwiper">
        <SwiperSlide className="swiper-page">
          <div className="swiper-group">
            <Text />
            <div className="swiper-text">덕행에서 나의 최애를 찾아보세요!</div>
          </div>
        </SwiperSlide>
        <SwiperSlide className="swiper-page">
          <div className="swiper-group">
            <div className="text-group">
              <h1 className="swiper-title">Fandom. Fast. Real-time.</h1>
              <span className="swiper-text">
                실시간 채팅으로 굿즈 거래도 덕질처럼 빠르게!
              </span>
              <DotLottieReact
                src="https://lottie.host/78375728-d51f-463b-9b2a-6bea2de0325a/CW0GZA4FVT.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide className="swiper-page">
          <div className="swiper-group">
            <div className="text-group">
              <h1 className="swiper-title">Fandom. Fast. Real-time.</h1>
              <span className="swiper-text">
                위치 공유를 통한 직거래 편의성 향상
              </span>
              <div className="map-icon">
                <img src={mapIcon} alt="지도" />
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide className="swiper-page">
          <h1 className="swiper-title title-margin">duckhang</h1>
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
    <div className="login-page">
      <Login />
    </div>
  );
}
