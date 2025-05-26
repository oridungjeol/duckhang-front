import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

import LiveMapLoader from "./liveMapLoader";

const LiveMap = () => {
  const location = useLocation();
  const data = location.state;

  const mapRef = useRef(null);
  const mapInstance = useRef(null)
  const markersRef = useRef({});
  const boundsRef = useRef(null)

  let otherUser_id = "zxcv";  //상대방 uuid로 변경 필요
  let stompClient;

  let latitude;
  let longitude;

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
      console.log("Connected: " + frame);

      stompClient.subscribe(`/topic/map.latlng/${data.room_id}`, function (message) {
        const data = JSON.parse(message.body);
        console.log(data);

        if (markersRef.current[data.user_id]) { //마커가 존재한다면
          markersRef.current[data.user_id].setPosition(new window.kakao.maps.LatLng(data.latitude, data.longitude))
        }
      });

      const sendInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            stompClient.send(`/app/map.latlng/${data.room_id}`, {}, JSON.stringify({
              latitude: latitude + (Math.random() - 0.5) * 0.001,
              longitude: longitude + (Math.random() - 0.5) * 0.001,
              user_id: data.uuid,
              room_id: data.room_id,
            }));

          },
          (error) => {
            console.error("위치 가져오기 실패", error);
          }
        );
      }, 5000);

      return () => {
        clearInterval(sendInterval);
        if (stompClient?.connected) {
          stompClient.disconnect(() => {
            console.log("라우터 이동으로 연결 해제됨");
          });
        }
      };
    });
  }, [location.pathname]);
  
  const createMap = useCallback((latitude, longitude) => {
  const mapContainer = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(latitude, longitude),
      level: 3,
    };
    mapInstance.current = new window.kakao.maps.Map(mapContainer, options);
    boundsRef.current = new window.kakao.maps.LatLngBounds();
  }, []);

  const createMarkers = useCallback((latitude, longitude) => {
    const map = mapInstance.current;
    const bounds = boundsRef.current;

    const myMarker = new window.kakao.maps.Marker({ position : new window.kakao.maps.LatLng(latitude, longitude) });
    myMarker.setMap(map);
    markersRef.current[data.uuid] = myMarker;
    bounds.extend(myMarker.getPosition());

    const otherMarker = new window.kakao.maps.Marker({ position : new window.kakao.maps.LatLng(latitude, longitude) });
    otherMarker.setMap(map);
    markersRef.current[otherUser_id] = otherMarker;
    bounds.extend(otherMarker.getPosition());

    map.setBounds(bounds);
  });

  //초기 map 세팅
  useEffect(() => {
    console.log("useEffect 실행");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude);

        LiveMapLoader().then(() => {
          console.log("livemaploader 실행됨");
          window.kakao.maps.load(() => {
            createMap(latitude, longitude);
            createMarkers(latitude, longitude)
          });
        });
      }
    );
  }, []);

  return (
    <>
      <div 
        ref={mapRef} 
        style={{ width: "100%", height: "100vh" }} 
      >
      </div>
    </>
  );
};

export default LiveMap;