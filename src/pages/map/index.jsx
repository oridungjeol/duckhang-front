import { useEffect, useRef } from "react";

import LiveMapLoader from "./liveMapLoader";

const LiveMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    LiveMapLoader().then(() => {
      window.kakao.maps.load(() => {
        const mapContainer = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 3,
        };
        const map = new window.kakao.maps.Map(mapContainer, options);

        const points = [
          new window.kakao.maps.LatLng(37.5665, 126.9780),
          new window.kakao.maps.LatLng(37.5665, 126.975)
        ];

        function setBounds() {
          map.setBounds(bounds);
        }

        const bounds = new window.kakao.maps.LatLngBounds();  

        for (let i = 0; i < points.length; i++) {
          const marker = new window.kakao.maps.Marker({ position : points[i] });
          marker.setMap(map);

          bounds.extend(points[i]);
        }

        setBounds()
      });
    });
  }, []);

  return (
    <>
      <div 
        ref={mapRef} 
        style={{ width: "100%", height: "500px" }} 
      >
      </div>
    </>
  );
};

export default LiveMap;