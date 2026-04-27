import { useEffect, useRef, useState } from "react";
import type { Segment } from "@/types/roulette";

interface Props {
  segments: Segment[];
  size?: number;
  spinning: boolean;
  targetIndex: number | null;
  onComplete: () => void;
  soundEnabled?: boolean;
}

const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

const arcPath = (cx: number, cy: number, r: number, start: number, end: number) => {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`;
};

export default function RouletteWheel({ segments, size = 360, spinning, targetIndex, onComplete, soundEnabled }: Props) {
  const [rotation, setRotation] = useState(0);
  const lastTickRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  const total = segments.reduce((sum, s) => sum + (s.weight || 1), 0) || 1;
  let acc = 0;
  const slices = segments.map((seg) => {
    const w = (seg.weight || 1) / total;
    const start = acc * 360;
    const end = (acc + w) * 360;
    const mid = (start + end) / 2;
    acc += w;
    return { seg, start, end, mid };
  });

  useEffect(() => {
    if (!spinning || targetIndex === null) return;
    const target = slices[targetIndex];
    if (!target) return;
    // Land target at top (0deg = top in our coord). We rotate clockwise.
    // Angle to bring slice mid to 0 (top): rotation such that (rotation + mid) % 360 === 360 (top).
    const turns = 6 + Math.random() * 2;
    const finalAngle = 360 * turns + (360 - target.mid);
    const start = rotation;
    const delta = finalAngle - (start % 360);
    const duration = 4800;
    const startTime = performance.now();

    let raf = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 4); // strong ease-out

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = ease(t);
      const current = start + delta * eased;
      setRotation(current);

      // soft tick sound on each slice crossing
      if (soundEnabled) {
        const sliceSize = 360 / slices.length;
        const tickIdx = Math.floor(current / sliceSize);
        if (tickIdx !== lastTickRef.current && t < 0.95) {
          lastTickRef.current = tickIdx;
          try {
            if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const ctx = audioRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 600 + (1 - t) * 200;
            gain.gain.setValueAtTime(0.04 * (1 - t), ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.05);
          } catch {}
        }
      }

      if (t < 1) raf = requestAnimationFrame(tick);
      else onComplete();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, targetIndex]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* pointer */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{ top: -6 }}
        aria-hidden
      >
        <svg width="28" height="32" viewBox="0 0 28 32">
          <path d="M14 30 L2 4 Q14 -2 26 4 Z" fill="hsl(var(--foreground))" opacity="0.85" />
          <circle cx="14" cy="6" r="3" fill="hsl(var(--background))" />
        </svg>
      </div>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "none" : "transform 0.3s ease" }}
        className="drop-shadow-[0_20px_50px_hsl(30_10%_18%_/0.18)]"
      >
        <defs>
          {slices.map(({ seg }, i) => (
            <clipPath id={`clip-${seg.id}`} key={`cp-${seg.id}-${i}`}>
              <path d={arcPath(cx, cy, r, slices[i].start, slices[i].end)} />
            </clipPath>
          ))}
        </defs>

        <circle cx={cx} cy={cy} r={r + 4} fill="hsl(var(--card))" />

        {slices.map(({ seg, start, end, mid }) => {
          const path = arcPath(cx, cy, r, start, end);
          const labelPos = polar(cx, cy, r * 0.62, mid);
          const sliceAngle = end - start;
          return (
            <g key={seg.id}>
              <path d={path} fill={seg.color} opacity={0.95} />
              {seg.mediaUrl && seg.mediaType === "image" && (
                <image
                  href={seg.mediaUrl}
                  x={cx - r}
                  y={cy - r}
                  width={r * 2}
                  height={r * 2}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#clip-${seg.id})`}
                  opacity={0.45}
                />
              )}
              <path d={path} fill="none" stroke="hsl(var(--background))" strokeWidth={2} />
              {sliceAngle > 12 && (
                <g transform={`translate(${labelPos.x} ${labelPos.y}) rotate(${mid})`}>
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="hsl(var(--background))"
                    fontSize={Math.min(15, sliceAngle * 0.7)}
                    fontWeight={600}
                    style={{ paintOrder: "stroke", stroke: "hsl(30 10% 18% / 0.25)", strokeWidth: 0.5 }}
                  >
                    {seg.emoji ? `${seg.emoji} ` : ""}{seg.label.slice(0, 14)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* center hub */}
        <circle cx={cx} cy={cy} r={28} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={6} fill="hsl(var(--foreground))" opacity={0.7} />
      </svg>
    </div>
  );
}