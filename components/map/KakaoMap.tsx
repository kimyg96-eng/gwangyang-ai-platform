"use client";

import { useEffect, useRef } from "react";
import type { CulturalAsset } from "@/types/culturalAsset";

declare global {
  interface Window {
    kakao: any;
  }
}

type KakaoMapProps = {
  assets: CulturalAsset[];
  selectedAsset: CulturalAsset | null;
  onSelectAsset: (asset: CulturalAsset) => void;
};

export default function KakaoMap({
  assets,
  selectedAsset,
  onSelectAsset,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const markerMapRef = useRef<Record<string, any>>({});

  const openInfoWindow = (asset: CulturalAsset, marker: any) => {
    const map = mapInstanceRef.current;
    if (!map || !infoWindowRef.current) return;

    infoWindowRef.current.setContent(`
      <div style="padding:10px 14px; font-size:13px; line-height:1.5; min-width:160px;">
        <strong>${asset.name}</strong><br/>
        <span style="color:#64748b;">${asset.location ?? ""}</span>
      </div>
    `);

    infoWindowRef.current.open(map, marker);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        if (!container) return;

        const center = new window.kakao.maps.LatLng(35.0618, 127.7495);

        const map = new window.kakao.maps.Map(container, {
          center,
          level: 8,
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new window.kakao.maps.InfoWindow({
          zIndex: 1,
        });

        markerMapRef.current = {};

        assets.forEach((asset) => {
          if (!asset.latitude || !asset.longitude) return;

          const position = new window.kakao.maps.LatLng(
            Number(asset.latitude),
            Number(asset.longitude)
          );

          const marker = new window.kakao.maps.Marker({
            position,
            title: asset.name,
          });

          marker.setMap(map);
          markerMapRef.current[asset.id] = marker;

          window.kakao.maps.event.addListener(marker, "click", () => {
            onSelectAsset(asset);
            map.panTo(position);
            map.setLevel(5);
            openInfoWindow(asset, marker);
          });
        });

        setTimeout(() => {
          map.relayout();
          map.setCenter(center);
        }, 300);
      });
    };

    document.head.appendChild(script);
  }, [assets, onSelectAsset]);

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map || !selectedAsset) return;
    if (!selectedAsset.latitude || !selectedAsset.longitude) return;
    if (!window.kakao) return;

    const position = new window.kakao.maps.LatLng(
      Number(selectedAsset.latitude),
      Number(selectedAsset.longitude)
    );

    map.panTo(position);
    map.setLevel(5);

    const marker = markerMapRef.current[selectedAsset.id];
    if (marker) {
      openInfoWindow(selectedAsset, marker);
    }
  }, [selectedAsset]);

  return (
    <div
      ref={mapRef}
      className="h-[500px] w-full rounded-3xl border border-slate-200 bg-slate-100"
    />
  );
}