/**
 * Braj Darshan - UI kit
 * The building blocks of the app. Look: the Nov 2026 "clean Braj" redesign (Claude Design canvas
 * "Braj Darshan app redesign"): off-white ground, white cards with hairline borders, saffron
 * accent, navy headings, Mukta font, pill chips, round back button.
 * Every screen should be composed from these so spacing, type, icons, touch
 * targets and colours stay identical everywhere.
 *
 * Rules baked in:
 * - Touch targets are at least 48px and every press is guarded against double taps.
 * - Status is shown with an icon and a word, never colour alone.
 * - Icons come only from <Icon>, never emoji.
 */

import React from 'react';
import { Pressable, StyleSheet, View, Image, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFor } from '../../theme/fonts';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';
import { Icon } from '../common/Icon';
import { usePressGuard } from '../../hooks/usePressGuard';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export const GUTTER = 16;

// Flat cards: a hairline border does the separating; only iOS keeps a whisper of shadow.
function cardShadow(isDark) {
  if (isDark) return null;
  return Platform.select({
    ios: {
      shadowColor: '#2D2018',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    android: null,
  });
}

/* ----------------------------------------------------------------- Buttons */

export function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'text'
  icon,
  disabled = false,
  style,
  accessibilityLabel,
}) {
  const { colors, isDark } = useTheme();
  const guarded = usePressGuard(onPress);
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const fg = isPrimary ? (isDark ? '#1E1B18' : '#FFFFFF') : colors.primary;

  return (
    <Pressable
      onPress={guarded}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        isPrimary && { backgroundColor: pressed ? colors.primaryDark : colors.primary },
        isSecondary && {
          backgroundColor: pressed ? colors.primaryLight : colors.surface,
          borderWidth: 1.5,
          borderColor: colors.primary,
        },
        variant === 'text' && styles.buttonText,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={fg} /> : null}
      <AppText variant="bodyBold" color={fg} numberOfLines={1}>
        {title}
      </AppText>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, accessibilityLabel, color, size = 22, filled = false, style }) {
  const { colors } = useTheme();
  const guarded = usePressGuard(onPress);
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: filled ? 'rgba(255,255,255,0.92)' : colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
        filled && styles.iconButtonOnPhoto,
        style,
      ]}
    >
      {/* Round in both places; buttons on photos keep a white face, so their icon stays dark in both themes. */}
      <Icon name={icon} size={size} color={color || (filled ? '#17324D' : colors.navy)} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------- Cards */

export function Card({ children, onPress, style, accessibilityLabel, padded = true }) {
  const { colors, isDark } = useTheme();
  const guarded = usePressGuard(onPress);
  const base = [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.border },
    cardShadow(isDark),
    padded && styles.cardPadded,
    style,
  ];
  if (!onPress) {
    return <View style={base}>{children}</View>;
  }
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}
    >
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------- Chips */

export function Chip({ label, selected = false, onPress, icon }) {
  const { colors, isDark } = useTheme();
  const guarded = usePressGuard(onPress, 250);
  const onFill = isDark ? '#1E1B18' : '#FFFFFF';
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={selected ? onFill : colors.muted} /> : null}
      <AppText
        variant="caption"
        weight={selected ? '700' : '500'}
        color={selected ? onFill : colors.text}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Status */

/**
 * status: result of getTempleStatus() — { isOpen, isKnown, badgeHi, badgeEn }.
 */
export function StatusBadge({ status, size = 'md' }) {
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  if (!status) return null;
  const tone = !status.isKnown ? 'info' : status.isOpen ? 'open' : 'closed';
  const palette = {
    open: { fg: colors.success, bg: colors.successLight, icon: null },
    closed: { fg: colors.warning, bg: colors.warningBg, icon: null },
    info: { fg: colors.textSecondary, bg: colors.infoBg, icon: 'clock' },
  }[tone];
  const time = (String(status.nextEvent || '').match(/\d{1,2}:\d{2} [AP]M/) || [])[0];
  let label;
  if (tone === 'open') {
    label = isHindi ? (time ? `खुला · ${time} तक` : 'दर्शन खुले हैं') : (time ? `Open · until ${time}` : 'Open now');
  } else if (tone === 'closed') {
    label = isHindi ? (time ? `बंद · ${time} पर खुलेगा` : 'पट बंद हैं') : (time ? `Closed · opens ${time}` : 'Closed now');
  } else {
    label = isHindi ? 'समय मंदिर से पुष्टि करें' : 'Check timings locally';
  }
  return (
    <View style={[styles.badge, size === 'sm' && styles.badgeSm, { backgroundColor: palette.bg }]}>
      {palette.icon ? (
        <Icon name={palette.icon} size={size === 'sm' ? 14 : 16} color={palette.fg} />
      ) : (
        <View style={[styles.badgeDot, { backgroundColor: palette.fg }]} />
      )}
      <AppText variant={size === 'sm' ? 'small' : 'caption'} weight="600" color={palette.fg}>
        {label}
      </AppText>
    </View>
  );
}

export function RepresentativeTag({ style }) {
  const { isHindi } = useLanguage();
  return (
    <View style={[styles.repTag, style]}>
      <AppText variant="small" color="#FFFFFF" weight="500">
        {isHindi ? 'प्रतीकात्मक चित्र' : 'Representative photo'}
      </AppText>
    </View>
  );
}

/**
 * A short note on a tinted panel. tone: 'info' (grey, default), 'warning' (gold: dates and
 * timings to confirm), 'water' (teal: Yamuna and kund safety), 'saffron' (brand), 'danger' (red).
 */
export function InfoNote({ children, icon = 'info', style, tone = 'info' }) {
  const { colors, isDark } = useTheme();
  const t = {
    info: { bg: colors.infoBg, fg: colors.textSecondary, icon: colors.muted },
    warning: { bg: colors.goldLight, fg: isDark ? colors.text : '#4A3418', icon: isDark ? colors.gold : '#8A4A05' },
    water: { bg: colors.purnimaLight, fg: isDark ? colors.text : '#13434A', icon: colors.purnima },
    saffron: { bg: colors.primaryLight, fg: isDark ? colors.text : '#4A3418', icon: colors.primary },
    danger: { bg: colors.warningBg, fg: isDark ? colors.text : '#6A2A22', icon: colors.warning },
  }[tone] || { bg: colors.infoBg, fg: colors.textSecondary, icon: colors.muted };
  return (
    <View style={[styles.infoNote, { backgroundColor: t.bg }, style]}>
      <Icon name={icon} size={18} color={t.icon} />
      <AppText variant="caption" color={t.fg} style={styles.flex}>
        {children}
      </AppText>
    </View>
  );
}

/* ---------------------------------------------------------------- Headings */

export function SectionHeader({ title, actionLabel, onAction, style }) {
  const { colors } = useTheme();
  const guarded = usePressGuard(onAction);
  return (
    <View style={[styles.sectionHeader, style]}>
      <AppText variant="h3" weight="700" color={colors.navy} style={styles.flex}>
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable onPress={guarded} hitSlop={12} accessibilityRole="button">
          <AppText variant="caption" weight="700" color={colors.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Back control: a round 44pt button with a chevron. "वापस" / "Back" is its screen-reader label.
 */
export function BackButton({ onPress, label }) {
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const guarded = usePressGuard(onPress);
  const text = label || (isHindi ? 'वापस' : 'Back');
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={text}
      hitSlop={6}
      style={({ pressed }) => [
        styles.backButton,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Icon name="chevronLeft" size={24} color={colors.navy} />
    </Pressable>
  );
}

/**
 * Top of every screen, following the iOS navigation bar + large title pattern.
 * Tab screens (no onBack): title and actions share one row.
 * Detail screens: a slim bar with Back on the left and actions on the right,
 * then the large title on its own line, so long titles never squeeze in beside buttons.
 */
export function TopBar({ title, subtitle, onBack, right, eyebrow }) {
  const { colors } = useTheme();
  if (onBack) {
    return (
      <View style={styles.topBarDetail}>
        <BackButton onPress={onBack} />
        <View style={styles.flex}>
          {eyebrow ? (
            <AppText variant="small" weight="600" color={colors.primary}>
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="h2" weight="700" color={colors.navy}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color={colors.muted}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right ? <View style={styles.topBarRight}>{right}</View> : null}
      </View>
    );
  }
  return (
    <View style={styles.topBar}>
      <View style={styles.flex}>
        {eyebrow ? (
          <AppText variant="caption" weight="600" color={colors.primary}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="h1" weight="700" color={colors.navy} numberOfLines={2}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.muted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? <View style={styles.topBarRight}>{right}</View> : null}
    </View>
  );
}

/**
 * Language switch: both choices are always visible ("हिं | EN") and the current
 * one is filled, so it reads as a language setting at a glance. Tap anywhere to switch.
 */
export function LanguageToggle() {
  const { colors, isDark } = useTheme();
  const { isHindi, toggleLanguage } = useLanguage();
  const guarded = usePressGuard(toggleLanguage, 400);
  const onFg = isDark ? '#1E1B18' : '#FFFFFF';
  // Both segments always get a background: on Android a late background drops the rounded corners.
  const seg = (active) => [styles.langSeg, { backgroundColor: active ? colors.primary : colors.surface }];
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="switch"
      accessibilityState={{ checked: !isHindi }}
      accessibilityLabel={isHindi ? 'भाषा: हिंदी। अंग्रेज़ी के लिए दबाएँ' : 'Language: English. Tap for Hindi'}
      hitSlop={4}
      style={({ pressed }) => [
        styles.langToggle,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={seg(isHindi)}>
        <AppText variant="caption" weight="700" color={isHindi ? onFg : colors.muted} maxFontSizeMultiplier={1.2}>
          हिं
        </AppText>
      </View>
      <View style={seg(!isHindi)}>
        <AppText variant="caption" weight="700" color={!isHindi ? onFg : colors.muted} maxFontSizeMultiplier={1.2}>
          EN
        </AppText>
      </View>
    </Pressable>
  );
}

/* ---------------------------------------------------------------- Search */

/**
 * Search box used on every list: magnifier, text field and a clear button once
 * something is typed. Filtering itself stays with the screen.
 */
export function SearchField({ value, onChangeText, placeholder, onSubmitEditing, onFocus, style, autoFocus = false }) {
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  return (
    <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      <Icon name="search" size={22} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        returnKeyType="search"
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.searchInput, { color: colors.text }, fontFor('400')]}
        accessibilityLabel={placeholder || (isHindi ? 'खोजें' : 'Search')}
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
        maxFontSizeMultiplier={1.4}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={isHindi ? 'खोज साफ़ करें' : 'Clear search'}
          style={styles.searchClear}
        >
          <Icon name="close" size={20} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Lower-cased, trimmed text for search matching (Hindi has no case, so it is unaffected). */
export function normalizeSearch(text) {
  return String(text || '').trim().toLowerCase();
}

/** True when any of the fields contains the query (pass it through normalizeSearch first). */
export function matchesSearch(query, ...fields) {
  if (!query) return true;
  return fields.some((f) => f && String(f).toLowerCase().includes(query));
}

/* ----------------------------------------------------------- Quick action */

export function QuickAction({ icon, label, onPress, tone = 'saffron' }) {
  const { colors } = useTheme();
  const guarded = usePressGuard(onPress);
  const tint = {
    saffron: { bg: colors.primaryLight, fg: colors.primary },
    teal: { bg: colors.purnimaLight, fg: colors.purnima },
    red: { bg: colors.warningBg, fg: colors.warning },
  }[tone];
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.75 }]}
    >
      <View style={[styles.quickTile, { backgroundColor: tint.bg }]}>
        <Icon name={icon} size={26} color={tint.fg} />
      </View>
      <AppText variant="small" weight="500" color={colors.text} align="center" numberOfLines={2}>
        {label}
      </AppText>
    </Pressable>
  );
}

/* ------------------------------------------------------------- List row */

export function ListRow({ icon, title, subtitle, onPress, right, iconTone }) {
  const { colors } = useTheme();
  const guarded = usePressGuard(onPress);
  const content = (
    <>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: iconTone || colors.primaryLight }]}>
          <Icon name={icon} size={22} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.flex}>
        <AppText variant="body" weight="600" color={colors.navy}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.muted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right !== undefined ? right : onPress ? <Icon name="chevronRight" size={20} color={colors.muted} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      {content}
    </Pressable>
  );
}

/* ---------------------------------------------------------------- Photos */

/**
 * Dark-to-clear gradient so white text placed on a photo is always readable.
 * from: 'bottom' (default) or 'top'; strength 0–1.
 */
export function Scrim({ from = 'bottom', strength = 0.85, style }) {
  const id = `scrim-${from}`;
  return (
    <Svg style={[StyleSheet.absoluteFill, style]} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1={from === 'bottom' ? '1' : '0'} x2="0" y2={from === 'bottom' ? '0' : '1'}>
          <Stop offset="0" stopColor="#120C08" stopOpacity={strength} />
          <Stop offset="0.75" stopColor="#120C08" stopOpacity={strength * 0.4} />
          <Stop offset="1" stopColor="#120C08" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/**
 * A photo that fills its frame. Missing photos get a warm branded placeholder
 * instead of an empty grey box. fadeDuration 0: no 300ms Android fade-in delay.
 */
export function Photo({ source, style, representative, children, accessibilityLabel, scrim = false, fallbackIcon = 'temple' }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.photo, { backgroundColor: colors.surfaceContainer }, style]}>
      {source ? (
        <Image
          source={source}
          style={styles.photoImage}
          resizeMode="cover"
          fadeDuration={0}
          accessible={Boolean(accessibilityLabel)}
          accessibilityLabel={accessibilityLabel}
        />
      ) : (
        <View style={[styles.photoFallback, { backgroundColor: colors.primaryLight }]}>
          <Icon name={fallbackIcon} size={44} color={colors.primaryContainer} />
        </View>
      )}
      {scrim ? <Scrim /> : null}
      {representative ? <RepresentativeTag style={styles.photoTag} /> : null}
      {children}
    </View>
  );
}

/* ---------------------------------------------------------------- Layout */

export function useBottomInset(extra = 0) {
  const insets = useSafeAreaInsets();
  // The tab bar sits below the screen in the layout, so only breathing room
  // (and the gesture-bar inset on screens without the tab bar) is needed.
  return insets.bottom + 32 + extra;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  button: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { minHeight: 48, paddingHorizontal: 8 },
  disabled: { opacity: 0.45 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonOnPhoto: { borderWidth: 0 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPadded: { padding: 16 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeSm: { paddingHorizontal: 10, paddingVertical: 3, gap: 5 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  repTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30, 24, 18, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: 12,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langToggle: {
    height: 44,
    padding: 3,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  langSeg: {
    height: 36,
    minWidth: 40,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 16,
    paddingRight: 6,
  },
  searchInput: { flex: 1, fontSize: 16, minHeight: 52, paddingVertical: 0 },
  searchClear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  quickAction: { width: '25%', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 2 },
  quickTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingVertical: 10,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { overflow: 'hidden' },
  // Explicit size: absoluteFill alone lets Android draw the image at its own size (only a corner showed).
  photoImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  photoFallback: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  photoTag: { position: 'absolute', left: 10, bottom: 10 },
});
