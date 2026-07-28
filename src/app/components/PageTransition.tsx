"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingIndicator from "./LoadingIndicator";

export default function PageTransition() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 1000);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#FFFFF0] flex flex-col items-center justify-center z-[999] pointer-events-none">
      <LoadingIndicator />
    </div>
  );
}