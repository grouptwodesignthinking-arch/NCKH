import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useT } from '../i18n';
import { media, type MediaKey } from '../data/media';
import { useProgress } from '../store/progress';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon, type IconName } from './Icon';

export function Screen({
  children,
  scroll = true,
  dark = false,
  edges = ['top'],
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  dark?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const bg = dark ? colors.night : colors.paper;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false}>
          <View style={styles.maxWidth}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Header({ title, subtitle, dark, right, onBack }: { title: string; subtitle?: string; dark?: boolean; right?: ReactNode; onBack?: () => void }) {
  const fg = dark ? colors.paper : colors.ink;
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="back"
        hitSlop={12}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/map')))}
        style={styles.headerBtn}
      >
        <Icon name="back" color={fg} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[styles.h2, { color: fg }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? <Text style={[styles.muted, dark && { color: colors.line }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'light';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, v.box, disabled && { opacity: 0.45 }, pressed && { opacity: 0.8 }, style]}
    >
      <Text style={[styles.btnText, v.text]}>{label}</Text>
      {icon ? <Icon name={icon} size={18} color={v.text.color as string} /> : null}
    </Pressable>
  );
}

const buttonVariants = {
  primary: { box: { backgroundColor: colors.olive }, text: { color: colors.paper } },
  ghost: { box: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.olive }, text: { color: colors.olive } },
  light: { box: { backgroundColor: colors.paper }, text: { color: colors.oliveDark } },
} satisfies Record<string, { box: ViewStyle; text: TextStyle }>;

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }, style]}>
        {children}
      </Pressable>
    );
  return <View style={[styles.card, style]}>{children}</View>;
}

/** An image that always carries its authenticity label (concept §20). */
export function Photo({
  k,
  style,
  badge = true,
  badgePosition = 'bottom',
  resizeMode = 'cover',
}: {
  k: MediaKey;
  style?: StyleProp<ImageStyle>;
  badge?: boolean;
  badgePosition?: 'top' | 'bottom';
  resizeMode?: 'cover' | 'contain';
}) {
  const m = media[k];
  return (
    <View style={[{ overflow: 'hidden' }, style as StyleProp<ViewStyle>]}>
      <Image source={m.source} style={StyleSheet.absoluteFill} resizeMode={resizeMode} />
      {badge ? <MediaBadge k={k} style={badgePosition === 'top' ? { top: 6 } : { bottom: 6 }} /> : null}
    </View>
  );
}

export function MediaBadge({ k, style }: { k: MediaKey; style?: StyleProp<ViewStyle> }) {
  const { lang } = useT();
  const kind = media[k].kind;
  const label = {
    real: { vi: 'Ảnh thật', en: 'Real site' },
    archival: { vi: 'Tư liệu', en: 'Archival' },
    reconstruction: { vi: 'Minh hoạ / tái hiện', en: 'Illustration / reconstruction' },
  }[kind][lang];
  const bg = kind === 'real' ? colors.olive : kind === 'archival' ? colors.earth : 'rgba(28,26,20,0.72)';
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]} accessibilityLabel={media[k].credit[lang]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = colors.ember, track = colors.line }: { value: number; color?: string; track?: string }) {
  return (
    <View style={[styles.track, { backgroundColor: track }]}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Chip({ label, active, onPress, dark }: { label: string; active?: boolean; onPress?: () => void; dark?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        dark && { borderColor: colors.oliveLight },
        active && { backgroundColor: dark ? colors.paper : colors.olive, borderColor: dark ? colors.paper : colors.olive },
      ]}
    >
      <Text style={[styles.chipText, dark && { color: colors.paper }, active && { color: dark ? colors.oliveDark : colors.paper }]}>{label}</Text>
    </Pressable>
  );
}

export function LangToggle({ dark }: { dark?: boolean }) {
  const lang = useProgress((s) => s.lang);
  const setLang = useProgress((s) => s.setLang);
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      <Chip dark={dark} label="VI" active={lang === 'vi'} onPress={() => setLang('vi')} />
      <Chip dark={dark} label="EN" active={lang === 'en'} onPress={() => setLang('en')} />
    </View>
  );
}

export function SectionTitle({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <Text style={[styles.section, dark && { color: colors.paper }]}>{children}</Text>;
}

export const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  maxWidth: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, fontWeight: '700' },
  h2: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, fontWeight: '700' },
  h3: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, color: colors.ink },
  muted: { fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  section: { fontFamily: fonts.display, fontSize: 18, fontWeight: '700', color: colors.oliveDark, marginTop: 6 },
  btn: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: { fontSize: 16, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line, ...shadow },
  badge: { position: 'absolute', left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
