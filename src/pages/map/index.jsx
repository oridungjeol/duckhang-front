import { useEffect, useRef } from "react";

import LiveMapLoader from "./liveMapLoader";
import stompClient from"./clientStompConnector";
import { activateStompClient } from "./clientStompConnector";

const LiveMap = () => {
  const mapRef = useRef(null);

  const markers = {};
  const myUserId = "asdf";
  const otherUserId = "zxcv";
  const roomId = 111;

  function createMap(latitude, longitude) {
    const mapContainer = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(latitude, longitude),
      level: 3,
    };
    return new window.kakao.maps.Map(mapContainer, options);
  }

  function createMarkers(map, bounds, latitude, longitude) {
    const myMarker = new window.kakao.maps.Marker({ position : new window.kakao.maps.LatLng(latitude, longitude) });
    markers[myUserId] = myMarker;
    myMarker.setMap(map);
    bounds.extend(myMarker.getPosition());

    const otherMarker = new window.kakao.maps.Marker({ position : new window.kakao.maps.LatLng(latitude-0.0001, longitude-0.0001) });
    markers[otherUserId] = otherMarker;
    otherMarker.setMap(map);
    bounds.extend(otherMarker.getPosition());
  }

  function updateMarkers() {
    activateStompClient((client) => {
      client.subscribe("/topic/map.latlng", (message) => {
        console.log("받은 메시지:", message.body);

        const parsed = JSON.parse(message.body);
        const { latitude, longitude, userId, roomId } = parsed;

        markers[userId].setPosition(new window.kakao.maps.LatLng(latitude, longitude))
      });
    });
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        LiveMapLoader().then(() => {
          window.kakao.maps.load(() => {
            const map = createMap(latitude, longitude);

            function setBounds() {
              map.setBounds(bounds);
            }
            const bounds = new window.kakao.maps.LatLngBounds();  

            createMarkers(map, bounds, latitude, longitude)

            setBounds()

            stompClient.activate();

            updateMarkers();
          });
        });
      }
    );
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log("5초마다 위치:", latitude, longitude);

          // STOMP 웹소켓으로 서버에 위치 전송
          stompClient.publish({
            destination: "/topic/map.latlng",
            body: JSON.stringify({
              userId: otherUserId,
              roomId: roomId,
              latitude: latitude + (Math.random() - 0.5) * 0.001,
              longitude: longitude + (Math.random() - 0.5) * 0.001,
            }),
          });
          updateMarkers();
        },
        (error) => {
          console.error("위치 가져오기 실패", error);
        }
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  function sendLatLngData() {
    stompClient.publish({
      destination: `/topic/map.latlng`,
      body: JSON.stringify({ 
        latitude: 37.5665, 
        longitude: 126.975,
        userId: "zxcv",
        roomId: roomId
      }),
    });
  }

  return (
    <>
      <div 
        ref={mapRef} 
        style={{ width: "100%", height: "500px" }} 
      >
      </div>
        <button onClick={() => {sendLatLngData()}}>click me</button>
    </>
  );
};

export default LiveMap;