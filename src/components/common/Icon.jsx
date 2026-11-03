/**
 * Braj Darshan - Icon
 * One filled icon family for the whole app: Material Design Icons (the style the
 * Figma and Stitch designs use), drawn with react-native-svg from the path data in
 * iconPaths.js. Use semantic names (<Icon name="map" />), never emoji.
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { ICON_PATHS } from './iconPaths';

export const ICONS = ICON_PATHS;

// `filled` swaps an outline icon for its solid version where one exists (e.g. a saved heart).
const FILLED = { heart: 'heartFilled' };

export function Icon({ name, size = 24, color, filled = false, style }) {
  const { colors } = useTheme();
  const key = filled && FILLED[name] ? FILLED[name] : name;
  const d = ICON_PATHS[key];
  if (!d) {
    if (__DEV__) {
      console.warn(`Icon: unknown icon name "${name}"`);
    }
    return null;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <Path d={d} fill={color || colors.text} />
    </Svg>
  );
}

export default Icon;
