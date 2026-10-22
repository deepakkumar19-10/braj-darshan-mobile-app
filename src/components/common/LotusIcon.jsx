/**
 * Braj Darshan - Sacred Lotus (कमल) Vector Icon
 * Rendered natively via react-native-svg
 */

import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
} from 'react-native-svg';

export function LotusIcon({ size = 44, style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" style={style}>
      <Defs>
        <LinearGradient id="lotusPink" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#f472b6" />
          <Stop offset="50%" stopColor="#ec4899" />
          <Stop offset="100%" stopColor="#be185d" />
        </LinearGradient>
        <LinearGradient id="lotusCenter" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#fde047" />
          <Stop offset="100%" stopColor="#f59e0b" />
        </LinearGradient>
      </Defs>

      {/* Central Petal */}
      <Path
        d="M24 6 C21 16 19 28 24 38 C29 28 27 16 24 6 Z"
        fill="url(#lotusPink)"
      />

      {/* Left Inner Petal */}
      <Path
        d="M24 12 C16 18 13 28 19 36 C23 34 24 26 24 12 Z"
        fill="url(#lotusPink)"
        opacity={0.92}
      />

      {/* Right Inner Petal */}
      <Path
        d="M24 12 C32 18 35 28 29 36 C25 34 24 26 24 12 Z"
        fill="url(#lotusPink)"
        opacity={0.92}
      />

      {/* Left Outer Petal */}
      <Path
        d="M22 20 C11 22 8 32 16 38 C20 37 22 30 22 20 Z"
        fill="url(#lotusPink)"
        opacity={0.8}
      />

      {/* Right Outer Petal */}
      <Path
        d="M26 20 C37 22 40 32 32 38 C28 37 26 30 26 20 Z"
        fill="url(#lotusPink)"
        opacity={0.8}
      />

      {/* Golden Pistil Core */}
      <Circle cx="24" cy="34" r="3.5" fill="url(#lotusCenter)" />
    </Svg>
  );
}

export default LotusIcon;
