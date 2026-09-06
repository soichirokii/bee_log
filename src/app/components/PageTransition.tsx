"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingIndicator from "./LoadingIndicator";

const PRIORITY_IMAGE_SELECTOR = '[data-page-transition-image="true"] img';
const IMAGE_LOAD_TIMEOUT_MS = 8000;

export default function PageTransition() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);

    // lazy な画像まで待つと、画面外画像が読まれずローディングが終わらなくなる。
    // 初期表示に必要な priority 画像だけを待ち、失敗時は error とタイムアウトで必ず解除する。
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(PRIORITY_IMAGE_SELECTOR)
    );
    const pendingImages = images.filter((image) => !image.complete);

    if (pendingImages.length === 0) {
      setShow(false);
      return;
    }

    let isActive = true;
    let timeoutId: number | undefined;
    const remainingImages = new Set(pendingImages);

    const finish = () => {
      if (!isActive) return;
      isActive = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      pendingImages.forEach((image) => {
        image.removeEventListener("load", handleLoad);
        image.removeEventListener("error", handleLoad);
      });
      setShow(false);
    };

    const handleLoad = (event: Event) => {
      const image = event.currentTarget as HTMLImageElement;
      remainingImages.delete(image);
      if (remainingImages.size === 0) finish();
    };

    pendingImages.forEach((image) => {
      image.addEventListener("load", handleLoad);
      image.addEventListener("error", handleLoad);
      if (image.complete) {
        remainingImages.delete(image);
      }
    });

    if (remainingImages.size === 0) {
      finish();
    } else {
      timeoutId = window.setTimeout(finish, IMAGE_LOAD_TIMEOUT_MS);
    }

    return () => {
      isActive = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      pendingImages.forEach((image) => {
        image.removeEventListener("load", handleLoad);
        image.removeEventListener("error", handleLoad);
      });
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 bg-[#FFFFF0] flex flex-col items-center justify-center z-[999]"
    >
      <LoadingIndicator />
    </div>
  );
}
