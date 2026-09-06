"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

const NOIMAGE = "/noimage.svg";

// 画像の読み込みに失敗したら noimage にフォールバックする next/image ラッパー。
// プロキシ(/api/notion-image)経由の画像がCDN側で404/壊れになった場合でも
// スケルトンを残さず noimage を表示する。
export default function FallbackImage({
  src,
  alt,
  className,
  onError,
  onLoad,
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  // src が変わったら（スライダーの切り替えなど）状態をリセット
  useEffect(() => {
    setImgSrc(src);
    setIsLoaded(false);
  }, [src]);

  return (
    <div className="absolute inset-0">
      <div
        aria-hidden="true"
        className={`absolute inset-0 overflow-hidden bg-[#FFFFF0] ${isLoaded ? "hidden" : ""}`}
      >
        <div className="absolute inset-y-0 -left-full w-full animate-image-shimmer bg-gradient-to-r from-[#FFFFF0] via-[#FCBC2A]/25 to-[#FFFFF0] motion-reduce:animate-none" />
      </div>
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        className={`${className ?? ""} transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={(event) => {
          onLoad?.(event);
          setIsLoaded(true);
        }}
        onError={(event) => {
          onError?.(event);
          setImgSrc(NOIMAGE);
          setIsLoaded(true);
        }}
      />
    </div>
  );
}
