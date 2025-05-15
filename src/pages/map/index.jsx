import { useCallback, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp, Client } from "@stomp/stompjs";

import LiveMapLoader from "./liveMapLoader";
import stompClient from"../../utils/clientStompConnector";
import { activateStompClient } from "../../utils/clientStompConnector";

const LiveMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null)
  const markersRef = useRef({});
  const boundsRef = useRef(null)

  const myUserId = "asdf";
  const otherUserId = "zxcv";
  const roomId = 111;
  let stompClient;
  
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
    markersRef.current[myUserId] = myMarker;
    bounds.extend(myMarker.getPosition());

    const otherMarker = new window.kakao.maps.Marker({ position : new window.kakao.maps.LatLng(latitude-0.0001, longitude-0.0001) });
    otherMarker.setMap(map);
    markersRef.current[otherUserId] = otherMarker;
    bounds.extend(otherMarker.getPosition());

    map.setBounds(bounds);
  }, []);

  const updateMarkers = useCallback(() => {

    stompClient.connect({}, client => {
      console.log(client.connected)
      if (client.connected) {
      client.subscribe("/topic/map.latlng", (message) => {
        console.log("받은 메시지:", message.body);

        const parsed = JSON.parse(message.body);
        const { latitude, longitude, userId, roomId } = parsed;

        markersRef.current[userId].setPosition(new window.kakao.maps.LatLng(latitude, longitude))
      });
    }    });

  }, []);

  //초기 map 세팅
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
     stompClient = Stomp.over(socket);
    
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        LiveMapLoader().then(() => {
          window.kakao.maps.load(() => {
            createMap(latitude, longitude);

            createMarkers(latitude, longitude)

            stompClient.activate();

            updateMarkers();
          });
        });
      }
    );
  }, [createMap, createMarkers, updateMarkers]);

  const updateLocation = useCallback(() => {
    return setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log("5초마다 위치:", latitude, longitude);
      console.log(stompClient.connected)
      if (stompClient.connected) {
      
        stompClient.publish({
          destination: "/app/map.latlng",
          body: JSON.stringify({
            userId: otherUserId,
            roomId: roomId,
            latitude: latitude + (Math.random() - 0.5) * 0.001,
            longitude: longitude + (Math.random() - 0.5) * 0.001,
          }),
        });
      }
      },
      (error) => {
        console.error("위치 가져오기 실패", error);
      }
    );
    }, 5000);
  }, []);

  //5초마다 위치 업데이트
  useEffect(() => {
    const intervalId = updateLocation();
    return () => clearInterval(intervalId);
  }, [updateLocation]);

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