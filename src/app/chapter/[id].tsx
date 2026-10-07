import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { Stamp } from '../../components/Stamp';
import { Stepper } from '../../components/Stepper';
import { useNarration } from '../../components/useNarration';
import { Button, Card, Chip, Header, Photo, Screen, styles as ui } from '../../components/ui';
import { achievements, specialStories } from '../../data/achievements';
import { checkpointById, type Checkpoint, type CheckpointId } from '../../data/checkpoints';
import { companionById } from '../../data/companions';
import { useT } from '../../i18n';
import { routeOf, useProgress } from '../../store/progress';
import { colors, radius } from '../../theme';

const STEP_KEYS = ['stepHook', 'stepDiscover', 'stepUnderstand', 'stepStory', 'stepInteract', 'stepReflect', 'stepUnlock'] as const;

/** Micro-story structure: Hook → Discover → Understand → Human Story → Interact → Reflect → Unlock. */
export default function ChapterScreen() {
  const { id } = useLocalSearchParams<{ id: CheckpointId }>();
  // Keyed so that moving to the next chapter starts a fresh story.
  return checkpointById[id] ? <Chapter key={id} c={checkpointById[id]} /> : null;
}

function Chapter({ c }: { c: Checkpoint }) {
  const id = c.id;
  const { t, tr } = useT();
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<string>();
  const [reflection, setReflection] = useState('');
  const progress = useProgress();
  const route = routeOf(progress.journeyId);
  const chapterNo = Math.max(0, route.indexOf(id)) + 1;

  // Snapshot of what was earned before this chapter, to announce new unlocks.
  const before = useRef({
    ach: achievements.filter((a) => a.earned(progress)).map((a) => a.id),
    stories: specialStories.filter((s) => s.unlocked(progress)).map((s) => s.id),
  });

  const next = () => setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));

  const finish = () => {
    progress.completeChapter(c.id, { choice, reflection: reflection.trim() || undefined });
    next();
  };

  return (
    <Screen>
      <Header title={tr(c.name)} subtitle={t('chapterN', { n: chapterNo })} />
      <Stepper steps={STEP_KEYS.map((k) => t(k))} index={step} />
      {step === 0 && <Hook c={c} onNext={next} />}
      {step === 1 && <Discover c={c} onNext={next} />}
      {step === 2 && <Understand c={c} onNext={next} />}
      {step === 3 && (
        <Story
          c={c}
          onNext={() => {
            progress.markStory(c.id);
            next();
          }}
        />
      )}
      {step === 4 && <Interact c={c} choice={choice} setChoice={setChoice} onNext={next} />}
      {step === 5 && <Reflect c={c} value={reflection} setValue={setReflection} onNext={finish} skipLabel={t('skip')} />}
      {step === 6 && <Unlock c={c} chapterNo={chapterNo} before={before.current} />}
    </Screen>
  );
}

function Hook({ c, onNext }: { c: Checkpoint; onNext: () => void }) {
  const { t, tr } = useT();
  const companionId = useProgress((s) => s.companionId);
  const companion = companionId ? companionById[companionId] : undefined;
  const note = companionId ? c.companionNotes?.[companionId] : undefined;
  return (
    <>
      <Photo k={c.image} style={{ height: 230, borderRadius: radius.md }} />
      <Text style={[ui.h2, { fontStyle: 'italic' }]}>“{tr(c.hook)}”</Text>
      {companion ? (
        <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Photo k={companion.image} badge={false} style={{ width: 48, height: 48, borderRadius: 24 }} />
          <View style={{ flex: 1 }}>
            <Text style={[ui.muted, { fontWeight: '700' }]}>{t('companionSays', { name: tr(companion.name) })}</Text>
            <Text style={ui.body}>{tr(note ?? companion.intro)}</Text>
          </View>
        </Card>
      ) : null}
      <Button label={t('arrived')} icon="pin" onPress={onNext} />
      <Text style={[ui.muted, { textAlign: 'center' }]}>{t('arrivedHint')}</Text>
    </>
  );
}

function Discover({ c, onNext }: { c: Checkpoint; onNext: () => void }) {
  const { t, tr } = useT();
  const done = useProgress((s) => s.arDone.includes(c.id));
  return (
    <>
      <View style={{ backgroundColor: colors.night, borderRadius: radius.md, padding: 20, gap: 12, alignItems: 'center' }}>
        <Icon name="scan" size={44} color={colors.ember} />
        <Text style={[ui.h2, { color: colors.paper, textAlign: 'center' }]}>{t('somethingHidden')}</Text>
        <Text style={[ui.muted, { color: colors.line, textAlign: 'center' }]}>{t('scanHint')}</Text>
        <View style={{ gap: 4, alignSelf: 'stretch' }}>
          {c.arLayers.map((l, i) => (
            <Text key={i} style={{ color: done ? colors.paper : colors.locked, fontSize: 13 }}>
              {done ? '✓' : '○'} {tr(l.label)}
            </Text>
          ))}
        </View>
      </View>
      {done ? (
        <>
          <Text style={[ui.muted, { color: colors.olive, fontWeight: '700', textAlign: 'center' }]}>✓ {t('arDoneLabel')}</Text>
          <Button label={t('next')} icon="arrow" onPress={onNext} />
          <Button variant="ghost" label={t('openAr')} icon="scan" onPress={() => router.push(`/ar/${c.id}`)} />
        </>
      ) : (
        <>
          <Button label={t('openAr')} icon="scan" onPress={() => router.push(`/ar/${c.id}`)} />
          <Button variant="ghost" label={t('skip')} onPress={onNext} />
        </>
      )}
    </>
  );
}

function Understand({ c, onNext }: { c: Checkpoint; onNext: () => void }) {
  const { t, tr } = useT();
  return (
    <>
      <Photo k={c.arGhost ?? c.image} style={{ height: 220, borderRadius: radius.md }} />
      <Text style={ui.body}>{tr(c.understand)}</Text>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {c.pastPresent ? (
          <Button variant="ghost" icon="layers" label={t('openPastPresent')} onPress={() => router.push(`/past-present/${c.id}`)} style={{ flexGrow: 1 }} />
        ) : null}
        <Button
          variant="ghost"
          icon="cube"
          label={t('open3d')}
          onPress={() => router.push({ pathname: '/explorer', params: { zone: c.zone } })}
          style={{ flexGrow: 1 }}
        />
      </View>
      <Button label={t('next')} icon="arrow" onPress={onNext} />
    </>
  );
}

function Story({ c, onNext }: { c: Checkpoint; onNext: () => void }) {
  const { t, tr } = useT();
  const { speaking, play, stop } = useNarration();
  const markStory = useProgress((s) => s.markStory);
  return (
    <>
      <View style={{ backgroundColor: colors.night, borderRadius: radius.md, overflow: 'hidden' }}>
        <Photo k={c.image} style={{ height: 180 }} badgePosition="top" />
        <View style={{ padding: 16, gap: 10 }}>
          <Text style={[ui.h2, { color: colors.paper }]}>{tr(c.story.title)}</Text>
          <Text style={{ color: colors.ember, fontSize: 13, fontWeight: '600' }}>
            {t('narrator')}: {tr(c.story.narrator)}
          </Text>
          <Text style={{ color: colors.paper, fontSize: 16, lineHeight: 25, fontStyle: 'italic' }}>“{tr(c.story.text)}”</Text>
          <Button
            variant="light"
            icon={speaking ? 'stop' : 'sound'}
            label={speaking ? t('stop') : t('listen')}
            onPress={() => (speaking ? stop() : play(tr(c.story.text), () => markStory(c.id)))}
          />
        </View>
      </View>
      <Button
        label={t('next')}
        icon="arrow"
        onPress={() => {
          stop();
          onNext();
        }}
      />
    </>
  );
}

function Interact({ c, choice, setChoice, onNext }: { c: Checkpoint; choice?: string; setChoice: (v: string) => void; onNext: () => void }) {
  const { t, tr } = useT();
  const chosen = c.interact.options.find((o) => o.id === choice);
  const best = c.interact.options.find((o) => o.best);
  return (
    <>
      <Card>
        <Text style={ui.h3}>{tr(c.interact.prompt)}</Text>
      </Card>
      <Text style={[ui.muted, { fontWeight: '700' }]}>{t('chooseOne')}</Text>
      {c.interact.options.map((o, i) => {
        const isChosen = o.id === choice;
        return (
          <Pressable
            key={o.id}
            disabled={!!choice}
            onPress={() => setChoice(o.id)}
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              padding: 14,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: choice && o.best ? colors.olive : isChosen ? colors.ember : colors.line,
              backgroundColor: isChosen ? colors.paperDeep : colors.card,
            }}
          >
            <Text style={{ fontWeight: '700', color: colors.olive }}>{String.fromCharCode(65 + i)}.</Text>
            <Text style={[ui.body, { flex: 1 }]}>{tr(o.text)}</Text>
          </Pressable>
        );
      })}
      {chosen ? (
        <Card style={{ gap: 8, backgroundColor: colors.paperDeep }}>
          <Text style={ui.body}>{tr(chosen.explain)}</Text>
          {best && best.id !== chosen.id ? (
            <>
              <Text style={[ui.muted, { fontWeight: '700', color: colors.olive }]}>{t('whatHappened')}</Text>
              <Text style={ui.body}>{tr(best.explain)}</Text>
            </>
          ) : null}
        </Card>
      ) : null}
      <Button label={t('next')} icon="arrow" disabled={!choice} onPress={onNext} />
    </>
  );
}

function Reflect({
  c,
  value,
  setValue,
  onNext,
  skipLabel,
}: {
  c: Checkpoint;
  value: string;
  setValue: (v: string) => void;
  onNext: () => void;
  skipLabel: string;
}) {
  const { t, tr } = useT();
  return (
    <>
      <Text style={[ui.h2, { fontStyle: 'italic' }]}>{tr(c.reflect.question)}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={t('reflectionPlaceholder')}
        placeholderTextColor={colors.locked}
        multiline
        maxLength={200}
        style={{
          minHeight: 90,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: radius.md,
          padding: 12,
          backgroundColor: colors.card,
          fontSize: 15,
          color: colors.ink,
          textAlignVertical: 'top',
        }}
      />
      <Text style={ui.muted}>{t('orPickOne')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {c.reflect.quick.map((q, i) => (
          <Chip key={i} label={tr(q)} active={value === tr(q)} onPress={() => setValue(tr(q))} />
        ))}
      </View>
      <Button label={t('next')} icon="arrow" onPress={onNext} />
      <Button
        variant="ghost"
        label={skipLabel}
        onPress={() => {
          setValue('');
          onNext();
        }}
      />
    </>
  );
}

function Unlock({ c, chapterNo, before }: { c: Checkpoint; chapterNo: number; before: { ach: string[]; stories: string[] } }) {
  const { t, tr } = useT();
  const progress = useProgress();
  const route = routeOf(progress.journeyId);
  const newAch = achievements.filter((a) => a.earned(progress) && !before.ach.includes(a.id));
  const newStories = specialStories.filter((s) => s.unlocked(progress) && !before.stories.includes(s.id));
  const nextId = route.find((id) => !progress.chapters[id]);
  return (
    <>
      <Text style={[ui.muted, { textAlign: 'center', fontWeight: '700', color: colors.ember }]}>{t('unlocked')}</Text>
      <Card style={{ alignItems: 'center', gap: 10 }}>
        <Text style={[ui.muted, { fontWeight: '700' }]}>{t('memoryFragment')}</Text>
        <Photo k={c.fragment.media} style={{ width: '100%', height: 200, borderRadius: radius.sm }} />
        <Text style={ui.h2}>{tr(c.fragment.title)}</Text>
        <Text style={ui.muted}>{tr(c.fragment.caption)}</Text>
      </Card>
      <View style={{ alignItems: 'center', gap: 8, paddingVertical: 6 }}>
        <Stamp name={tr(c.name)} at={progress.chapters[c.id]?.completedAt} chapterLabel={t('chapterCompleted', { n: chapterNo })} />
        <Text style={ui.muted}>{t('stampAdded')}</Text>
      </View>
      {newAch.map((a) => (
        <Card key={a.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', borderColor: colors.ember }}>
          <Text style={{ fontSize: 28, color: colors.ember }}>{a.symbol}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[ui.muted, { fontWeight: '700', color: colors.ember }]}>{t('newAchievement')}</Text>
            <Text style={ui.h3}>{tr(a.name)}</Text>
            <Text style={ui.muted}>{tr(a.desc)}</Text>
          </View>
        </Card>
      ))}
      {newStories.map((s) => (
        <Card
          key={s.id}
          onPress={() => router.push(`/story/${s.id}`)}
          style={{ flexDirection: 'row', gap: 12, alignItems: 'center', borderColor: colors.olive }}
        >
          <Photo k={s.image} badge={false} style={{ width: 56, height: 56, borderRadius: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={[ui.muted, { fontWeight: '700', color: colors.olive }]}>{t('newStory')}</Text>
            <Text style={ui.h3}>{tr(s.title)}</Text>
          </View>
          <Icon name="arrow" color={colors.olive} />
        </Card>
      ))}
      {nextId ? (
        <Button label={`${t('nextChapter')}: ${tr(checkpointById[nextId].name)}`} icon="arrow" onPress={() => router.replace(`/directions/${nextId}`)} />
      ) : (
        <Button label={t('finishJourney')} icon="star" onPress={() => router.replace('/souvenir')} />
      )}
      <Button variant="ghost" label={t('backToMap')} onPress={() => router.navigate('/map')} />
    </>
  );
}
