/**
 * Braj Darshan - Morpankh (Peacock Feather) Sacred Vector Icon
 * Rendered natively via react-native-svg
 */

import React from 'react';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Path,
  Ellipse,
} from 'react-native-svg';

export function MorpankhIcon({ size = 52, style }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={style}
    >
      <Defs>
        <RadialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
          <Stop offset="0%" stopColor="#fffbeb" />
          <Stop offset="60%" stopColor="#fef3c7" />
          <Stop offset="100%" stopColor="#fde68a" />
        </RadialGradient>
        <LinearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#f59e0b" />
          <Stop offset="50%" stopColor="#d97706" />
          <Stop offset="100%" stopColor="#b45309" />
        </LinearGradient>
        <LinearGradient id="featherGreen" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#047857" />
          <Stop offset="50%" stopColor="#10b981" />
          <Stop offset="100%" stopColor="#34d399" />
        </LinearGradient>
        <RadialGradient id="eyeBlue" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="45%" stopColor="#0284c7" />
          <Stop offset="100%" stopColor="#1e3a8a" />
        </RadialGradient>
        <RadialGradient id="eyeCenter" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#4c1d95" />
          <Stop offset="70%" stopColor="#1e1b4b" />
          <Stop offset="100%" stopColor="#0f172a" />
        </RadialGradient>
      </Defs>

      {/* Background Circle with Soft Golden Glow */}
      <Circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#bgGrad)"
        stroke="url(#goldBorder)"
        strokeWidth="2.5"
      />

      {/* Subtle Radiance Ring */}
      <Circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        opacity={0.6}
      />

      {/* Peacock Feather Vanes */}
      <Path
        d="M32 10 C21 16 16 28 22 41 C24 45 28 42 29 38 C31 32 30 22 32 10 Z"
        fill="url(#featherGreen)"
      />
      <Path
        d="M32 10 C43 16 48 28 42 41 C40 45 36 42 35 38 C33 32 34 22 32 10 Z"
        fill="url(#featherGreen)"
      />

      {/* Central Spine */}
      <Path
        d="M18 53 C23 44 28 32 32 10"
        fill="none"
        stroke="#92400e"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Outer Golden Halo of Eye */}
      <Ellipse cx="32" cy="26" rx="9" ry="11" fill="#f59e0b" />

      {/* Outer Sapphire Blue Eye */}
      <Ellipse cx="32" cy="26" rx="7.2" ry="9" fill="url(#eyeBlue)" />

      {/* Cyan Ring */}
      <Ellipse cx="32" cy="26" rx="5" ry="6.6" fill="#22d3ee" />

      {/* Deep Velvet Center */}
      <Ellipse cx="32" cy="27" rx="3.2" ry="4.4" fill="url(#eyeCenter)" />

      {/* Divine Tilak Golden Drop */}
      <Circle cx="32" cy="25" r="1.4" fill="#fef08a" />
    </Svg>
  );
}

export default MorpankhIcon;
