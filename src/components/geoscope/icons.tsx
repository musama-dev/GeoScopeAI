import { useId } from "react";

/**
 * Glossy "Apple emoji" style weather glyphs used across the dashboard.
 * These replace flat monochrome icons so the UI matches the reference design.
 */

type G = { className?: string | undefined; title?: string | undefined };

function Svg({ className = "h-6 w-6", children, title }: G & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function SunGlyph({ className, title }: G) {
  const a = useId();
  return (
    <Svg className={className} title={title}>
      <defs>
        <radialGradient id={a} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="45%" stopColor="#FFD43B" />
          <stop offset="100%" stopColor="#FF9F1C" />
        </radialGradient>
      </defs>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="30.6"
          y="1.5"
          width="2.8"
          height="9"
          rx="1.4"
          fill="#FFB020"
          transform={`rotate(${i * 45} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="15.5" fill={`url(#${a})`} />
      <ellipse cx="26.5" cy="25.5" rx="6" ry="4" fill="#FFFFFF" opacity="0.45" />
    </Svg>
  );
}

export function MoonGlyph({ className, title }: G) {
  const a = useId();
  return (
    <Svg className={className} title={title}>
      <defs>
        <radialGradient id={a} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFDF3" />
          <stop offset="100%" stopColor="#D9DEE8" />
        </radialGradient>
      </defs>
      <path
        d="M42 8a24 24 0 1 0 14 33A26 26 0 0 1 42 8Z"
        fill={`url(#${a})`}
        stroke="#C6CDDA"
        strokeWidth="0.8"
      />
      <circle cx="30" cy="26" r="3" fill="#C9D0DC" opacity="0.7" />
      <circle cx="24" cy="38" r="2" fill="#C9D0DC" opacity="0.6" />
      <circle cx="35" cy="42" r="2.4" fill="#C9D0DC" opacity="0.5" />
    </Svg>
  );
}

function CloudShape({ id, dark = false }: { id?: string; dark?: boolean }) {
  const autoId = useId();
  const gradientId = id ?? autoId;
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dark ? "#C9D2E0" : "#FFFFFF"} />
          <stop offset="100%" stopColor={dark ? "#8C9AB1" : "#C7D3E6"} />
        </linearGradient>
      </defs>
      <path
        d="M20 46a11 11 0 0 1-.6-22 15 15 0 0 1 28.2 4.2A9.9 9.9 0 0 1 46 46Z"
        fill={`url(#${gradientId})`}
      />
    </>
  );
}

export function CloudGlyph({ className, title }: G) {
  return (
    <Svg className={className} title={title}>
      <CloudShape />
    </Svg>
  );
}

export function OvercastGlyph({ className, title }: G) {
  return (
    <Svg className={className} title={title}>
      <CloudShape dark />
    </Svg>
  );
}

export function PartlyGlyph({ className, title }: G) {
  const s = useId();
  return (
    <Svg className={className} title={title}>
      <defs>
        <radialGradient id={s} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="50%" stopColor="#FFD43B" />
          <stop offset="100%" stopColor="#FF9F1C" />
        </radialGradient>
      </defs>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="22.2"
          y="2"
          width="2.4"
          height="7"
          rx="1.2"
          fill="#FFB020"
          transform={`rotate(${i * 45} 23.4 23)`}
        />
      ))}
      <circle cx="23.4" cy="23" r="10.5" fill={`url(#${s})`} />
      <CloudShape />
    </Svg>
  );
}

export function WaterDrop({ className = "h-4 w-4" }: { className?: string; strokeWidth?: number }) {
  return (
    <img
      src="/images/water-drop.png"
      alt="Water Drop"
      className={`object-contain inline-block shrink-0 ${className}`}
    />
  );
}

function Drops({ count = 3 }: { color?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <image
          key={i}
          href="/images/water-drop.png"
          x={20 + i * 9}
          y={46}
          width={11}
          height={13}
        />
      ))}
    </>
  );
}

export function RainGlyph({ className, title }: G) {
  return (
    <Svg className={className} title={title}>
      <CloudShape dark />
      <Drops />
    </Svg>
  );
}

export function DrizzleGlyph({ className, title }: G) {
  return (
    <Svg className={className} title={title}>
      <CloudShape />
      <Drops count={2} />
    </Svg>
  );
}

export function SnowGlyph({ className, title }: G) {
  return (
    <Svg className={className} title={title}>
      <CloudShape />
      {[22, 32, 42].map((x) => (
        <g key={x} stroke="#7FC9FF" strokeWidth="2" strokeLinecap="round">
          <line x1={x} y1="48" x2={x} y2="56" />
          <line x1={x - 3.4} y1="50" x2={x + 3.4} y2="54" />
          <line x1={x - 3.4} y1="54" x2={x + 3.4} y2="50" />
        </g>
      ))}
    </Svg>
  );
}

export function FogGlyph({ className, title }: G) {
  return (
    <Svg className={className} title={title}>
      <CloudShape />
      {[50, 55, 60].map((y, i) => (
        <rect
          key={y}
          x={14 + i * 3}
          y={y}
          width={36 - i * 6}
          height="3"
          rx="1.5"
          fill="#AEB9CC"
          opacity={0.8 - i * 0.2}
        />
      ))}
    </Svg>
  );
}

export function StormGlyph({ className, title }: G) {
  return (
    <Svg className={className} title={title}>
      <CloudShape dark />
      <path d="M32 46 22 60h8l-3 10 14-16h-9l4-8Z" fill="#FFC93C" />
    </Svg>
  );
}

export function SunriseGlyph({ className, title }: G) {
  const a = useId();
  return (
    <Svg className={className} title={title}>
      <defs>
        <radialGradient id={a} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#FFE27A" />
          <stop offset="100%" stopColor="#FF9F1C" />
        </radialGradient>
      </defs>
      <path d="M20 40a12 12 0 0 1 24 0Z" fill={`url(#${a})`} />
      <path d="M32 6v9M14 16l6 6M50 16l-6 6" stroke="#FFB020" strokeWidth="3" strokeLinecap="round" />
      <rect x="10" y="44" width="44" height="3.4" rx="1.7" fill="#8FA3BF" />
      <path d="M32 60V50m-5 5 5-5 5 5" stroke="#3FA7FF" strokeWidth="3" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function SunsetGlyph({ className, title }: G) {
  const a = useId();
  return (
    <Svg className={className} title={title}>
      <defs>
        <radialGradient id={a} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#FFD08A" />
          <stop offset="100%" stopColor="#FF7A1C" />
        </radialGradient>
      </defs>
      <path d="M20 40a12 12 0 0 1 24 0Z" fill={`url(#${a})`} />
      <path d="M32 6v9M14 16l6 6M50 16l-6 6" stroke="#FF9F1C" strokeWidth="3" strokeLinecap="round" />
      <rect x="10" y="44" width="44" height="3.4" rx="1.7" fill="#8FA3BF" />
      <path d="M32 50v10m-5-5 5 5 5-5" stroke="#7A5CFF" strokeWidth="3" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function SolarNoonGlyph({ className, title }: G) {
  const a = useId();
  return (
    <Svg className={className} title={title}>
      <defs>
        <radialGradient id={a} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="100%" stopColor="#FFA800" />
        </radialGradient>
      </defs>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="30.8"
          y="4"
          width="2.4"
          height="8"
          rx="1.2"
          fill="#FFC53D"
          transform={`rotate(${i * 45} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="13" fill={`url(#${a})`} />
      <ellipse cx="27" cy="26" rx="5" ry="3.4" fill="#fff" opacity="0.5" />
    </Svg>
  );
}

/** Realistic Transparent Moon Disc with Full and Half Moon image modes. */
export function MoonDisc({
  illumination,
  waxing,
  className = "h-16 w-16",
}: {
  illumination: number;
  waxing: boolean;
  className?: string;
}) {
  const isHalf = illumination >= 20 && illumination <= 75;
  const moonImg = isHalf ? "/images/moon-half.png" : "/images/moon-full.png";

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={moonImg}
        alt="Moon Phase"
        className="h-full w-full object-contain filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.2)] transition-transform duration-300"
        style={{
          transform: isHalf && !waxing ? "scaleX(-1)" : "none",
        }}
      />
    </div>
  );
}

export function WeatherGlyph({
  code,
  isDay = true,
  className = "h-6 w-6",
}: {
  code: number;
  isDay?: boolean;
  className?: string;
}) {
  if (code === 0 || code === 1)
    return isDay ? <SunGlyph className={className} /> : <MoonGlyph className={className} />;
  if (code === 2) return <PartlyGlyph className={className} />;
  if (code === 3) return <OvercastGlyph className={className} />;
  if (code === 45 || code === 48) return <FogGlyph className={className} />;
  if (code >= 51 && code <= 57) return <DrizzleGlyph className={className} />;
  if (code >= 61 && code <= 67) return <RainGlyph className={className} />;
  if (code >= 71 && code <= 77) return <SnowGlyph className={className} />;
  if (code >= 80 && code <= 82) return <RainGlyph className={className} />;
  if (code >= 85 && code <= 86) return <SnowGlyph className={className} />;
  if (code >= 95) return <StormGlyph className={className} />;
  return <CloudGlyph className={className} />;
}
