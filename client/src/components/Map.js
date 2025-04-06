import React, { useEffect, useRef } from 'react';
import { parseLocationString } from '../utils/locationParser';

const Map = ({ locationString }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 初始化地圖
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 45.5122, lng: -122.6587 }, // Portland
      zoom: 10,
    });

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
    directionsRendererRef.current.setMap(mapInstance.current);
  }, []);

  useEffect(() => {
    if (!locationString || !directionsRendererRef.current) return;

    try {
      const { origin, destination, waypoints } = parseLocationString(locationString);

      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRendererRef.current.setDirections(result);
          } else {
            console.error('無法取得路線:', status);
          }
        }
      );
    } catch (err) {
      console.warn('路線格式錯誤:', err.message);
    }
  }, [locationString]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default Map;