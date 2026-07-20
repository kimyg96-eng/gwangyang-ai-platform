"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CulturalAsset } from "@/types/culturalAsset";

/* =========================================================
 * Kakao Maps 최소 타입 정의
 * 별도의 @types/kakao.maps 패키지 없이 사용할 수 있도록 구성
 * ========================================================= */

type KakaoLatLng = object;

interface KakaoMap {
  panTo(position: KakaoLatLng): void;
  setLevel(level: number): void;
  relayout(): void;
  setCenter(position: KakaoLatLng): void;
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
}

interface KakaoInfoWindow {
  setContent(content: string | HTMLElement): void;
  open(map: KakaoMap, marker: KakaoMarker): void;
  close(): void;
}

interface KakaoMapOptions {
  center: KakaoLatLng;
  level: number;
}

interface KakaoMarkerOptions {
  position: KakaoLatLng;
  title?: string;
}

interface KakaoInfoWindowOptions {
  zIndex?: number;
}

interface KakaoMapsEvent {
  addListener(
    target: KakaoMarker,
    eventName: "click",
    handler: () => void
  ): void;

  removeListener(
    target: KakaoMarker,
    eventName: "click",
    handler: () => void
  ): void;
}

interface KakaoMapsApi {
  load(callback: () => void): void;

  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;

  Map: new (
    container: HTMLElement,
    options: KakaoMapOptions
  ) => KakaoMap;

  Marker: new (options: KakaoMarkerOptions) => KakaoMarker;

  InfoWindow: new (
    options?: KakaoInfoWindowOptions
  ) => KakaoInfoWindow;

  event: KakaoMapsEvent;
}

interface KakaoApi {
  maps: KakaoMapsApi;
}

declare global {
  interface Window {
    kakao?: KakaoApi;
  }
}

type KakaoMapProps = {
  assets: CulturalAsset[];
  selectedAsset: CulturalAsset | null;
  onSelectAsset: (asset: CulturalAsset) => void;
};

type MarkerEntry = {
  marker: KakaoMarker;
  clickHandler: () => void;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

const KAKAO_MAP_SCRIPT_ID = "kakao-map-sdk";
const DEFAULT_CENTER = {
  latitude: 35.0618,
  longitude: 127.7495,
};
const DEFAULT_LEVEL = 8;
const SELECTED_LEVEL = 5;

let kakaoSdkPromise: Promise<void> | null = null;

function getCoordinates(asset: CulturalAsset): Coordinates | null {
  if (
    asset.latitude === null ||
    asset.latitude === undefined ||
    asset.longitude === null ||
    asset.longitude === undefined
  ) {
    return null;
  }

  const latitude = Number(asset.latitude);
  const longitude = Number(asset.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function createInfoWindowContent(asset: CulturalAsset): HTMLDivElement {
  const container = document.createElement("div");
  container.style.padding = "10px 14px";
  container.style.fontSize = "13px";
  container.style.lineHeight = "1.5";
  container.style.minWidth = "160px";

  const title = document.createElement("strong");
  title.textContent = asset.name;

  const lineBreak = document.createElement("br");

  const location = document.createElement("span");
  location.style.color = "#64748b";
  location.textContent = asset.location ?? "";

  container.append(title, lineBreak, location);

  return container;
}

function loadKakaoMapScript(apiKey: string): Promise<void> {
  if (kakaoSdkPromise) {
    return kakaoSdkPromise;
  }

  kakaoSdkPromise = new Promise<void>((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(resolve);
      return;
    }

    const handleLoadedScript = () => {
      const kakaoMaps = window.kakao?.maps;

      if (!kakaoMaps) {
        reject(new Error("Kakao Maps SDK를 초기화하지 못했습니다."));
        return;
      }

      kakaoMaps.load(resolve);
    };

    const existingScript = document.getElementById(
      KAKAO_MAP_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", handleLoadedScript, {
        once: true,
      });

      existingScript.addEventListener(
        "error",
        () => {
          reject(
            new Error("Kakao Maps SDK 스크립트 로드에 실패했습니다.")
          );
        },
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.id = KAKAO_MAP_SCRIPT_ID;
    script.src =
      "https://dapi.kakao.com/v2/maps/sdk.js" +
      `?appkey=${encodeURIComponent(apiKey)}` +
      "&autoload=false";
    script.async = true;

    script.addEventListener("load", handleLoadedScript, {
      once: true,
    });

    script.addEventListener(
      "error",
      () => {
        reject(
          new Error("Kakao Maps SDK 스크립트 로드에 실패했습니다.")
        );
      },
      { once: true }
    );

    document.head.appendChild(script);
  }).catch((error: unknown) => {
    kakaoSdkPromise = null;
    throw error;
  });

  return kakaoSdkPromise;
}

export default function KakaoMap({
  assets,
  selectedAsset,
  onSelectAsset,
}: KakaoMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const infoWindowRef = useRef<KakaoInfoWindow | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());

  const [isMapReady, setIsMapReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const clearMarkers = useCallback(() => {
    const kakaoMaps = window.kakao?.maps;

    if (!kakaoMaps) {
      markerMapRef.current.clear();
      return;
    }

    markerMapRef.current.forEach(({ marker, clickHandler }) => {
      kakaoMaps.event.removeListener(
        marker,
        "click",
        clickHandler
      );
      marker.setMap(null);
    });

    markerMapRef.current.clear();
  }, []);

  const openInfoWindow = useCallback(
    (asset: CulturalAsset, marker: KakaoMarker) => {
      const map = mapInstanceRef.current;
      const infoWindow = infoWindowRef.current;

      if (!map || !infoWindow) {
        return;
      }

      infoWindow.setContent(createInfoWindowContent(asset));
      infoWindow.open(map, marker);
    },
    []
  );

  /*
   * Kakao Maps SDK 로드 및 지도 최초 생성
   */
  useEffect(() => {
    if (!apiKey) {
      return;
    }

    let cancelled = false;
    let relayoutTimer: number | null = null;

    const initializeMap = async () => {
      try {
        await loadKakaoMapScript(apiKey);

        if (cancelled) {
          return;
        }

        const container = mapContainerRef.current;
        const kakaoMaps = window.kakao?.maps;

        if (!container || !kakaoMaps) {
          throw new Error(
            "Kakao 지도 초기화에 필요한 객체가 없습니다."
          );
        }

        const center = new kakaoMaps.LatLng(
          DEFAULT_CENTER.latitude,
          DEFAULT_CENTER.longitude
        );

        const map = new kakaoMaps.Map(container, {
          center,
          level: DEFAULT_LEVEL,
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new kakaoMaps.InfoWindow({
          zIndex: 1,
        });

        relayoutTimer = window.setTimeout(() => {
          map.relayout();
          map.setCenter(center);
        }, 300);

        if (!cancelled) {
          setRuntimeError(null);
          setIsMapReady(true);
        }
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Kakao 지도를 불러오는 중 오류가 발생했습니다.";

        console.error("Failed to initialize Kakao Map:", error);
        setRuntimeError(message);
      }
    };

    void initializeMap();

    return () => {
      cancelled = true;

      if (relayoutTimer !== null) {
        window.clearTimeout(relayoutTimer);
      }

      clearMarkers();
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      mapInstanceRef.current = null;
    };
  }, [apiKey, clearMarkers]);

  /*
   * 문화자산 마커 생성 및 갱신
   */
  useEffect(() => {
    const map = mapInstanceRef.current;
    const kakaoMaps = window.kakao?.maps;

    if (!isMapReady || !map || !kakaoMaps) {
      return;
    }

    clearMarkers();

    assets.forEach((asset) => {
      const coordinates = getCoordinates(asset);

      if (!coordinates) {
        return;
      }

      const position = new kakaoMaps.LatLng(
        coordinates.latitude,
        coordinates.longitude
      );

      const marker = new kakaoMaps.Marker({
        position,
        title: asset.name,
      });

      const clickHandler = () => {
        onSelectAsset(asset);
        map.panTo(position);
        map.setLevel(SELECTED_LEVEL);
        openInfoWindow(asset, marker);
      };

      marker.setMap(map);

      kakaoMaps.event.addListener(
        marker,
        "click",
        clickHandler
      );

      markerMapRef.current.set(asset.id, {
        marker,
        clickHandler,
      });
    });

    return clearMarkers;
  }, [
    assets,
    clearMarkers,
    isMapReady,
    onSelectAsset,
    openInfoWindow,
  ]);

  /*
   * 목록에서 선택된 문화자산으로 지도 이동
   */
  useEffect(() => {
    const map = mapInstanceRef.current;
    const kakaoMaps = window.kakao?.maps;

    if (!isMapReady || !map || !kakaoMaps || !selectedAsset) {
      return;
    }

    const coordinates = getCoordinates(selectedAsset);

    if (!coordinates) {
      return;
    }

    const position = new kakaoMaps.LatLng(
      coordinates.latitude,
      coordinates.longitude
    );

    map.panTo(position);
    map.setLevel(SELECTED_LEVEL);

    const markerEntry = markerMapRef.current.get(selectedAsset.id);

    if (markerEntry) {
      openInfoWindow(selectedAsset, markerEntry.marker);
    }
  }, [isMapReady, openInfoWindow, selectedAsset]);

  const configurationError = apiKey
    ? null
    : "NEXT_PUBLIC_KAKAO_MAP_KEY 환경변수가 설정되지 않았습니다.";

  const mapError = configurationError ?? runtimeError;

  if (mapError) {
    return (
      <div
        className="flex h-[500px] w-full items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-6 text-center text-sm text-red-700"
        role="alert"
      >
        {mapError}
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-[500px] w-full rounded-3xl border border-slate-200 bg-slate-100"
      aria-label="광양 문화자산 위치 지도"
    />
  );
}