import { useEffect, useRef } from "react";

import LiveMapLoader from "./liveMapLoader";

const LiveMap = () => {
  const mapRef = useRef(null);

  function createMap() {
    const mapContainer = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 3,
    };
    return new window.kakao.maps.Map(mapContainer, options);
  }

  function createMarkers(map, bounds) {
    const points = [
      new window.kakao.maps.LatLng(37.5665, 126.9780),
      new window.kakao.maps.LatLng(37.5665, 126.975)
    ];

    for (let i = 0; i < points.length; i++) {
      const marker = new window.kakao.maps.Marker({ position : points[i] });
      marker.setMap(map);

      bounds.extend(points[i]);
    }
  }

  useEffect(() => {
    LiveMapLoader().then(() => {
      window.kakao.maps.load(() => {
        const map = createMap();

        function setBounds() {
          map.setBounds(bounds);
        }
        const bounds = new window.kakao.maps.LatLngBounds();  

        createMarkers(map, bounds)

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