"use client";

import type { FC } from "react";
import { motion } from "framer-motion";

type CatPose = "sit" | "sleep" | "walk" | "peek" | "coin";

interface CatDecorProps {
  pose?: CatPose;
  size?: number;
  className?: string;
  animate?: boolean;
  flip?: boolean;
}

function SitCat() {
  return (
    <svg viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="30" cy="52" rx="16" ry="14" fill="#F9A03F" />
      {/* Tail */}
      <path d="M46,54 Q58,48 54,38 Q51,32 55,28" stroke="#F9A03F" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* Head */}
      <circle cx="30" cy="28" r="16" fill="#F9A03F" />
      {/* Ears */}
      <polygon points="16,18 10,4 22,14" fill="#F9A03F" />
      <polygon points="44,18 50,4 38,14" fill="#F9A03F" />
      <polygon points="17,17 13,7 23,14" fill="#FDDBB4" />
      <polygon points="43,17 47,7 37,14" fill="#FDDBB4" />
      {/* Tummy patch */}
      <ellipse cx="30" cy="54" rx="9" ry="8" fill="#FDDBB4" />
      {/* Eyes */}
      <circle cx="23" cy="27" r="3.5" fill="#2C1A0E" />
      <circle cx="37" cy="27" r="3.5" fill="#2C1A0E" />
      <circle cx="24" cy="25.5" r="1.2" fill="white" />
      <circle cx="38" cy="25.5" r="1.2" fill="white" />
      {/* Nose */}
      <ellipse cx="30" cy="32" rx="2" ry="1.5" fill="#FF8A80" />
      {/* Mouth */}
      <path d="M27,34.5 Q30,37.5 33,34.5" stroke="#2C1A0E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="12" y1="30" x2="24" y2="32" stroke="#D4A96A" strokeWidth="0.8" strokeOpacity="0.7" />
      <line x1="12" y1="34" x2="24" y2="34" stroke="#D4A96A" strokeWidth="0.8" strokeOpacity="0.7" />
      <line x1="36" y1="32" x2="48" y2="30" stroke="#D4A96A" strokeWidth="0.8" strokeOpacity="0.7" />
      <line x1="36" y1="34" x2="48" y2="34" stroke="#D4A96A" strokeWidth="0.8" strokeOpacity="0.7" />
      {/* Paws */}
      <ellipse cx="20" cy="63" rx="6" ry="4" fill="#F9A03F" />
      <ellipse cx="40" cy="63" rx="6" ry="4" fill="#F9A03F" />
      {/* Blush */}
      <ellipse cx="18" cy="33" rx="4" ry="2.5" fill="#FFB3A8" opacity="0.45" />
      <ellipse cx="42" cy="33" rx="4" ry="2.5" fill="#FFB3A8" opacity="0.45" />
    </svg>
  );
}

function SleepCat() {
  return (
    <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body loaf */}
      <ellipse cx="40" cy="28" rx="32" ry="16" fill="#F9A03F" />
      {/* Tail */}
      <path d="M72,26 Q82,18 78,10" stroke="#F9A03F" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Head */}
      <circle cx="22" cy="20" r="15" fill="#F9A03F" />
      {/* Ears */}
      <polygon points="10,10 4,0 16,8" fill="#F9A03F" />
      <polygon points="28,10 34,0 22,8" fill="#F9A03F" />
      <polygon points="11,9 7,2 16,7" fill="#FDDBB4" />
      <polygon points="27,9 31,2 22,7" fill="#FDDBB4" />
      {/* Sleeping eyes */}
      <path d="M13,20 Q17,17 21,20" stroke="#2C1A0E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M22,20 Q26,17 30,20" stroke="#2C1A0E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="22" cy="24" rx="1.8" ry="1.3" fill="#FF8A80" />
      {/* ZZZ */}
      <text x="34" y="10" fontSize="9" fill="#97cc7e" fontWeight="bold" opacity="0.9">z</text>
      <text x="40" y="5" fontSize="7" fill="#97cc7e" fontWeight="bold" opacity="0.7">z</text>
      <text x="46" y="1" fontSize="5.5" fill="#97cc7e" fontWeight="bold" opacity="0.5">z</text>
    </svg>
  );
}

function WalkCat() {
  return (
    <svg viewBox="0 0 70 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tail up */}
      <path d="M12,36 Q4,20 10,8" stroke="#F9A03F" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="36" cy="38" rx="20" ry="13" fill="#F9A03F" />
      {/* Head */}
      <circle cx="54" cy="26" r="14" fill="#F9A03F" />
      {/* Ears */}
      <polygon points="44,16 40,4 52,12" fill="#F9A03F" />
      <polygon points="60,14 64,2 54,10" fill="#F9A03F" />
      <polygon points="45,15 42,6 51,12" fill="#FDDBB4" />
      <polygon points="59,13 62,5 54,10" fill="#FDDBB4" />
      {/* Eyes */}
      <circle cx="49" cy="25" r="3.5" fill="#2C1A0E" />
      <circle cx="60" cy="24" r="3.5" fill="#2C1A0E" />
      <circle cx="50" cy="23.5" r="1.2" fill="white" />
      <circle cx="61" cy="22.5" r="1.2" fill="white" />
      {/* Nose */}
      <ellipse cx="54" cy="29" rx="2" ry="1.5" fill="#FF8A80" />
      {/* Mouth */}
      <path d="M51,31.5 Q54,34 57,31.5" stroke="#2C1A0E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="38" y1="27" x2="47" y2="29" stroke="#D4A96A" strokeWidth="0.8" strokeOpacity="0.7" />
      <line x1="38" y1="31" x2="47" y2="31" stroke="#D4A96A" strokeWidth="0.8" strokeOpacity="0.7" />
      <line x1="61" y1="29" x2="70" y2="27" stroke="#D4A96A" strokeWidth="0.8" strokeOpacity="0.7" />
      {/* Legs */}
      <ellipse cx="22" cy="50" rx="5.5" ry="3.5" fill="#F9A03F" />
      <ellipse cx="34" cy="52" rx="5.5" ry="3.5" fill="#F9A03F" />
      <ellipse cx="46" cy="52" rx="5.5" ry="3.5" fill="#F9A03F" />
      {/* Tummy */}
      <ellipse cx="36" cy="38" rx="10" ry="7" fill="#FDDBB4" />
      {/* Blush */}
      <ellipse cx="44" cy="30" rx="3.5" ry="2" fill="#FFB3A8" opacity="0.45" />
      <ellipse cx="63" cy="29" rx="3.5" ry="2" fill="#FFB3A8" opacity="0.45" />
    </svg>
  );
}

function PeekCat() {
  return (
    <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bottom edge bar */}
      <rect x="0" y="28" width="50" height="12" rx="6" fill="#e0f0d6" />
      {/* Head peeking */}
      <circle cx="25" cy="24" r="16" fill="#F9A03F" />
      {/* Ears */}
      <polygon points="12,14 7,2 18,12" fill="#F9A03F" />
      <polygon points="38,14 43,2 32,12" fill="#F9A03F" />
      <polygon points="13,13 9,4 18,11" fill="#FDDBB4" />
      <polygon points="37,13 41,4 32,11" fill="#FDDBB4" />
      {/* Wide curious eyes */}
      <circle cx="19" cy="22" r="4.5" fill="white" />
      <circle cx="31" cy="22" r="4.5" fill="white" />
      <circle cx="19" cy="23" r="2.8" fill="#2C1A0E" />
      <circle cx="31" cy="23" r="2.8" fill="#2C1A0E" />
      <circle cx="20" cy="21.5" r="1" fill="white" />
      <circle cx="32" cy="21.5" r="1" fill="white" />
      {/* Nose */}
      <ellipse cx="25" cy="27" rx="2" ry="1.5" fill="#FF8A80" />
      {/* Paws on ledge */}
      <ellipse cx="16" cy="31" rx="5" ry="3" fill="#F9A03F" />
      <ellipse cx="34" cy="31" rx="5" ry="3" fill="#F9A03F" />
      {/* Blush */}
      <ellipse cx="13" cy="25" rx="3.5" ry="2" fill="#FFB3A8" opacity="0.5" />
      <ellipse cx="37" cy="25" rx="3.5" ry="2" fill="#FFB3A8" opacity="0.5" />
    </svg>
  );
}

function CoinCat() {
  return (
    <svg viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coin */}
      <circle cx="20" cy="52" r="16" fill="#FACC15" />
      <circle cx="20" cy="52" r="12" fill="#FDE047" stroke="#EAB308" strokeWidth="1.5" />
      <text x="20" y="56.5" textAnchor="middle" fontSize="12" fill="#B45309" fontWeight="bold">$</text>
      {/* Body */}
      <ellipse cx="44" cy="50" rx="16" ry="13" fill="#F9A03F" />
      {/* Tail */}
      <path d="M60,48 Q70,40 66,30" stroke="#F9A03F" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Head */}
      <circle cx="46" cy="30" r="15" fill="#F9A03F" />
      {/* Ears */}
      <polygon points="34,20 29,8 41,16" fill="#F9A03F" />
      <polygon points="58,20 63,8 51,16" fill="#F9A03F" />
      <polygon points="35,19 31,9 41,15" fill="#FDDBB4" />
      <polygon points="57,19 61,9 51,15" fill="#FDDBB4" />
      {/* Happy eyes */}
      <path d="M37,30 Q41,25 45,30" stroke="#2C1A0E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M47,30 Q51,25 55,30" stroke="#2C1A0E" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="46" cy="34" rx="2" ry="1.5" fill="#FF8A80" />
      {/* Mouth */}
      <path d="M42,37 Q46,41 50,37" stroke="#2C1A0E" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="34" cy="34" rx="4" ry="2.5" fill="#FFB3A8" opacity="0.5" />
      <ellipse cx="58" cy="34" rx="4" ry="2.5" fill="#FFB3A8" opacity="0.5" />
      {/* Paws holding coin */}
      <ellipse cx="26" cy="52" rx="5" ry="4" fill="#F9A03F" />
      <ellipse cx="38" cy="56" rx="5" ry="4" fill="#F9A03F" />
      {/* Tummy */}
      <ellipse cx="44" cy="52" rx="8" ry="7" fill="#FDDBB4" />
      {/* Sparkles */}
      <text x="55" y="16" fontSize="10" fill="#FACC15" opacity="0.9">✦</text>
      <text x="24" y="20" fontSize="7" fill="#FACC15" opacity="0.7">✦</text>
    </svg>
  );
}

const poseComponents: Record<CatPose, FC> = {
  sit: SitCat,
  sleep: SleepCat,
  walk: WalkCat,
  peek: PeekCat,
  coin: CoinCat,
};

export default function CatDecor({ pose = "sit", size = 80, className = "", animate = true, flip = false }: CatDecorProps) {
  const CatSvg = poseComponents[pose];
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 8 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, height: "auto", transform: flip ? "scaleX(-1)" : undefined }}
    >
      <CatSvg />
    </motion.div>
  );
}
