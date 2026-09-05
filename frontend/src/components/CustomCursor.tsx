import { useEffect, useRef, useState } from 'react';
import { ThemeMode } from '../types';

interface CustomCursorProps {
  theme?: ThemeMode;
}

export default function CustomCursor({ theme = 'cyber' }: CustomCursorProps) {
  const isMinimal = theme === 'minimalist';

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only suppress on pure mobile touch devices without fine mouse pointer
    const isPureTouch =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches &&
      !window.matchMedia('(pointer: fine)').matches;

    if (isPureTouch) {
      setIsTouch(true);
      return;
    }

    document.documentElement.classList.add('has-custom-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button, a, input, select, textarea, label, [role="button"], .cursor-pointer, [tabindex]')
        );
        setHovered(isInteractive);
      }
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);
    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const updateRing = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.22;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.22;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(updateRing);
    };

    rafId.current = requestAnimationFrame(updateRing);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [visible]);

  if (isTouch) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden transition-opacity duration-150 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Precision Center Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
            hovered ? 'scale-0' : 'scale-100'
          } ${
            isMinimal
              ? 'w-1.5 h-1.5 bg-[#2C2924]'
              : 'w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]'
          }`}
        />
      </div>

      {/* Trailing Physical Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 ease-out flex items-center justify-center ${
            hovered
              ? clicked
                ? 'w-10 h-10 scale-90'
                : 'w-12 h-12 scale-100'
              : clicked
              ? 'w-6 h-6 scale-90'
              : 'w-8 h-8 scale-100'
          } ${
            isMinimal
              ? hovered
                ? 'border-[#2C2924] bg-[#2C2924]/10 shadow-sm'
                : 'border-[#2C2924]/40 bg-[#2C2924]/5'
              : hovered
              ? 'border-cyan-400 bg-cyan-400/15 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
              : 'border-cyan-400/40 bg-cyan-400/5 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
          }`}
        >
          {hovered && (
            <div
              className={`w-1 h-1 rounded-full transition-colors ${
                isMinimal ? 'bg-[#2C2924]' : 'bg-cyan-400'
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
