"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

const NOIMAGE = "/noimage.svg";

// 画像の読み込みに失敗したら noimage にフォールバックする next/image ラッパー。
// プロキシ(/api/notion-image)経由の画像がCDN側で404/壊れになった場合でも
// グレーのままにせず noimage を表示する。
export default function FallbackImage({ src, alt, ...props }: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  // src が変わったら（スライダーの切り替えなど）状態をリセット
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(NOIMAGE)}
    />
  );
}
