import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GLBoundary, TunnelModel, type LayerKey } from '../components/TunnelModel';
import { XRaySchematic } from '../components/XRaySchematic';
import { Button, Chip, Header, Photo, styles as ui } from '../components/ui';
import { checkpoints } from '../data/checkpoints';
import { useT } from '../i18n';
import { colors, radius } from '../theme';

/** 3D Tunnel Explorer — the iPad / visitor-centre "exploration station". */
export default function Explorer() {
  const { zone } = useLocalSearchParams<{ zone?: string }>();
  const { t, tr } = useT();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ ground: true, l1: true, l2: true, l3: true });
  const [selected, setSelected] = useState(zone ?? 'kitchen');
  const c = checkpoints.find((x) => x.zone === selected) ?? checkpoints[0];

  const layerChips = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {(['ground', 'l1', 'l2', 'l3'] as const).map((k, i) => (
        <Chip
          key={k}
          dark
          label={k === 'ground' ? t('ground') : t('levelN', { n: i })}
          active={layers[k]}
          onPress={() => setLayers((l) => ({ ...l, [k]: !l[k] }))}
        />
      ))}
    </View>
  );

  const zoneList = (
    <View style={{ gap: 6 }}>
      {checkpoints.map((x) => (
        <Pressable
          key={x.id}
          onPress={() => setSelected(x.zone)}
          style={{ padding: 10, borderRadius: radius.sm, backgroundColor: x.zone === selected ? colors.paper : 'rgba(255,255,255,0.06)' }}
        >
          <Text style={{ color: x.zone === selected ? colors.oliveDark : colors.paper, fontWeight: '600' }}>{tr(x.name)}</Text>
        </Pressable>
      ))}
    </View>
  );

  const info = (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: 14, gap: 8 }}>
      <Text style={ui.h3}>{tr(c.name)}</Text>
      <Photo k={c.image} style={{ height: 130, borderRadius: radius.sm }} />
      <Text style={ui.muted}>{tr(c.understand)}</Text>
      <Button label={t('begin')} icon="arrow" onPress={() => router.push(`/chapter/${c.id}`)} />
    </View>
  );

  const model = (
    <View style={{ flex: 1, minHeight: 320, borderRadius: radius.md, overflow: 'hidden', backgroundColor: '#15130E' }}>
      <GLBoundary fallback={<XRaySchematic highlight={selected} />}>
        <TunnelModel layers={layers} highlight={selected} />
      </GLBoundary>
      <Text style={{ position: 'absolute', bottom: 8, left: 10, color: colors.line, fontSize: 11 }}>
        {t('dragToRotate')} · {t('schematicNote')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.night }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Header dark title={t('explorerTitle')} subtitle={t('explorerSub')} />
      </View>
      {wide ? (
        <View style={{ flex: 1, flexDirection: 'row', gap: 14, padding: 16 }}>
          <ScrollView style={{ width: 220, flexGrow: 0 }} contentContainerStyle={{ gap: 12 }}>
            <Text style={[ui.section, { color: colors.paper }]}>{t('layers')}</Text>
            {layerChips}
            {zoneList}
          </ScrollView>
          {model}
          <ScrollView style={{ width: 300, flexGrow: 0 }}>{info}</ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <View style={{ height: 360 }}>{model}</View>
          {layerChips}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {checkpoints.map((x) => (
              <Chip key={x.id} dark label={tr(x.name)} active={x.zone === selected} onPress={() => setSelected(x.zone)} />
            ))}
          </ScrollView>
          {info}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
