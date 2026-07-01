"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const script = document.createElement("script");

    script.src =
      `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;

    script.async = true;

    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;

        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(35.0618, 127.7495),
          level: 9,
        };

        new window.kakao.maps.Map(container, options);
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="h-[500px] w-full rounded-3xl"
    />
  );
}