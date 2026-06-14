import type { MascotSlot } from "./Mascot";

type Mood = "normal" | "happy" | "sad" | "shocked" | "sleeping" | "aura";

function slotToMood(slot: MascotSlot): Mood {
  switch (slot) {
    case "celebrate": return "aura";
    case "eating":
    case "tap":
    case "walking":
      return "happy";
    case "sleeping": return "sleeping";
    case "shocked": return "shocked";
    default: return "normal";
  }
}

export default function SvgFallback({ slot }: { slot: MascotSlot }) {
  const mood = slotToMood(slot);
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-label="Lucky cat mascot">
      {/* Glow aura */}
      {mood === "aura" && (
        <circle cx="60" cy="55" r="50" fill="url(#auraGrad)" opacity="0.35">
          <animate attributeName="r" values="46;52;46" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0.1;0.35" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <defs>
        <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Tail */}
      <path d="M88,76 Q108,62 100,44 Q96,36 103,32" stroke="#F9A03F" strokeWidth="7" fill="none" strokeLinecap="round">
        {(slot === "idle" || slot === "walking") && (
          <animateTransform attributeName="transform" type="rotate" values="-4 88 76;4 88 76;-4 88 76" dur="1.8s" repeatCount="indefinite" />
        )}
      </path>

      {/* Body */}
      <ellipse cx="60" cy="78" rx="28" ry="24" fill="#F9A03F" />

      {/* Hoodie body */}
      <path d="M32,78 Q32,58 60,56 Q88,58 88,78 Q88,102 60,102 Q32,102 32,78Z" fill="#5BA85F" />

      {/* Hoodie pocket */}
      <rect x="46" y="82" width="28" height="16" rx="8" fill="#4A9650" />

      {/* Head */}
      <circle cx="60" cy="44" r="26" fill="#F9A03F" />

      {/* Ears */}
      <polygon points="36,26 27,6 47,20" fill="#F9A03F" />
      <polygon points="84,26 93,6 73,20" fill="#F9A03F" />
      <polygon points="38,24 32,10 46,20" fill="#FDDBB4" />
      <polygon points="82,24 88,10 74,20" fill="#FDDBB4" />

      {/* Hoodie hood */}
      <path d="M34,50 Q34,28 60,26 Q86,28 86,50" fill="#5BA85F" />

      {/* Clover emblem on hood */}
      <g transform="translate(60,34)">
        <circle cx="0" cy="-5" r="4.5" fill="#3D8B44" />
        <circle cx="-5" cy="2" r="4.5" fill="#3D8B44" />
        <circle cx="5" cy="2" r="4.5" fill="#3D8B44" />
        <rect x="-1.5" y="2" width="3" height="8" rx="1.5" fill="#3D8B44" />
      </g>

      {/* Cheek blush */}
      {(mood === "happy" || mood === "aura") && (
        <>
          <ellipse cx="44" cy="50" rx="6" ry="4" fill="#FFB3A8" opacity="0.5" />
          <ellipse cx="76" cy="50" rx="6" ry="4" fill="#FFB3A8" opacity="0.5" />
        </>
      )}

      {/* Eyes */}
      {mood === "sleeping" ? (
        <>
          <path d="M44,42 Q50,38 56,42" stroke="#5D3A1A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M64,42 Q70,38 76,42" stroke="#5D3A1A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <text x="60" y="36" textAnchor="middle" fontSize="9" fill="#FFD700">z z</text>
        </>
      ) : mood === "shocked" ? (
        <>
          <circle cx="50" cy="42" r="6" fill="white" />
          <circle cx="70" cy="42" r="6" fill="white" />
          <circle cx="50" cy="43" r="3" fill="#2C1A0E" />
          <circle cx="70" cy="43" r="3" fill="#2C1A0E" />
          <circle cx="51.5" cy="41.5" r="1" fill="white" />
          <circle cx="71.5" cy="41.5" r="1" fill="white" />
        </>
      ) : mood === "happy" || mood === "aura" ? (
        <>
          <path d="M44,42 Q50,36 56,42" stroke="#2C1A0E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M64,42 Q70,36 76,42" stroke="#2C1A0E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="50" cy="42" r="4" fill="#2C1A0E" />
          <circle cx="70" cy="42" r="4" fill="#2C1A0E" />
          <circle cx="51.5" cy="40.5" r="1.4" fill="white" />
          <circle cx="71.5" cy="40.5" r="1.4" fill="white" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="60" cy="50" rx="3" ry="2.2" fill="#FF8A80" />

      {/* Mouth */}
      {mood === "shocked" ? (
        <ellipse cx="60" cy="58" rx="5" ry="6" fill="#2C1A0E" />
      ) : mood === "happy" || mood === "aura" ? (
        <path d="M54,54 Q60,62 66,54" stroke="#2C1A0E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ) : mood === "sleeping" ? (
        <path d="M56,54 Q60,57 64,54" stroke="#2C1A0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M55,54 Q60,58 65,54" stroke="#2C1A0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}

      {/* Whiskers */}
      <line x1="28" y1="46" x2="46" y2="49" stroke="#D4A96A" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="28" y1="52" x2="46" y2="52" stroke="#D4A96A" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="74" y1="49" x2="92" y2="46" stroke="#D4A96A" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="74" y1="52" x2="92" y2="52" stroke="#D4A96A" strokeWidth="1" strokeOpacity="0.7" />

      {/* Sweat drop for shocked */}
      {mood === "shocked" && (
        <path d="M82,32 Q84,25 87,32 Q87,36 84.5,36 Q82,36 82,32Z" fill="#64B5F6" opacity="0.85" />
      )}

      {/* Gold sparkles for aura */}
      {mood === "aura" && (
        <>
          <text x="20" y="32" fontSize="12" fill="#FFD700" opacity="0.85">✦</text>
          <text x="96" y="28" fontSize="10" fill="#FFD700" opacity="0.85">✦</text>
          <text x="14" y="65" fontSize="8" fill="#FFD700" opacity="0.7">✦</text>
        </>
      )}
    </svg>
  );
}
