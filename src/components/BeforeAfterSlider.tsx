"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  className?: string;
}

export default function BeforeAfterSlider({
  before,
  after,
  beforeAlt,
  afterAlt,
  className = "",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 5));
    if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 5));
  };

  return (
    <div
      ref={containerRef}
      className={`group relative aspect-[4/3] w-full select-none overflow-hidden rounded-xl2 shadow-lift sm:aspect-[16/10] ${className}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* AFTER (base layer, fully visible) */}
      <div className="absolute inset-0">
        <Image src={after} alt={afterAlt} fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover" />
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700 shadow-soft">
          After
        </span>
      </div>

      {/* BEFORE (clipped layer, revealed on the left of the handle) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={before}
          alt={beforeAlt}
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-soft">
          Before
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute top-0 h-full w-[2px] bg-white/90"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <button
          type="button"
          aria-label="Drag to compare before and after"
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-white text-green-700 shadow-lift transition-transform active:cursor-grabbing active:scale-95"
        >
          <MoveHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
