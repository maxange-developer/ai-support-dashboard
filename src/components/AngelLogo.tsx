"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AngelLogoProps {
  size?: "header" | "footer";
  className?: string;
  href?: string;
}

export default function AngelLogo({ size = "header", className = "", href = "/" }: AngelLogoProps) {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);

    if (!mq.matches) {
      const t = setTimeout(() => setExpanded(true), 800);
      const onScroll = () => {
        if (window.scrollY > 80) setExpanded(true);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        clearTimeout(t);
        window.removeEventListener("scroll", onScroll);
        mq.removeEventListener("change", update);
      };
    }
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) setExpanded(true);
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      className={`angel-logo angel-logo--${size} ${expanded && !isMobile ? "is-expanded" : ""} ${className}`}
    >
      <span className="angel-logo__letter">A</span>
      <span className="angel-logo__middle" aria-hidden="true">NGEL</span>
      <span className="angel-logo__letter angel-logo__accent">1</span>
      <span className="sr-only">Angel1 home</span>
    </Link>
  );
}
