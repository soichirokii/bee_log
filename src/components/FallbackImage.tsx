"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

const NOIMAGE = "/noimage.svg";

// 画像の読み込みに失敗したら noimage にフォールバックする next/image ラッパー。
// プロキシ(/api/notion-image)経由の画像がCDN側で404/壊れになった場合でも
// ローディング面を残さず noimage を表示する。
export default function FallbackImage({
  src,
  alt,
  className,
  onError,
  onLoad,
  priority,
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // src が変わったら（スライダーの切り替えなど）状態をリセット
  useEffect(() => {
    setImgSrc(src);
    setIsLoaded(false);
  }, [src]);

  // hydration 前にブラウザキャッシュから読み込み済みになった画像も表示する。
  useEffect(() => {
    const image = imageRef.current;
    if (imgSrc !== src || !image?.complete) return;
    if (image.naturalWidth === 0 && imgSrc !== NOIMAGE) {
      setImgSrc(NOIMAGE);
    }
    setIsLoaded(true);
  }, [imgSrc, src]);

  return (
    <div
      className="absolute inset-0"
      data-page-transition-image={priority ? "true" : undefined}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[#FFFFF0] ${isLoaded ? "hidden" : ""}`}
      />
      <Image
        {...props}
        ref={imageRef}
        src={imgSrc}
        alt={alt}
        priority={priority}
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
