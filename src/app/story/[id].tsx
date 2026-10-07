import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useNarration } from '../../components/useNarration';
import { Button, Header, Photo, Screen, styles as ui } from '../../components/ui';
import { specialStories } from '../../data/achievements';
import { checkpointById, type CheckpointId } from '../../data/checkpoints';
import type { MediaKey } from '../../data/media';
import { useT, type L } from '../../i18n';
import { useProgress } from '../../store/progress';
import { radius } from '../../theme';

/** Reader/player for a chapter story or an unlocked special story. */
export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr } = useT();
  const s = useProgress();
  const { speaking, play, stop } = useNarration();

  const special = specialStories.find((x) => x.id === id);
  const chapter = checkpointById[id as CheckpointId];
  let data: { title: L; sub: L; text: L; image: MediaKey } | undefined;
  if (special && special.unlocked(s)) data = { title: special.title, sub: special.desc, text: special.text, image: special.image };
  else if (chapter && s.chapters[chapter.id])
    data = { title: chapter.story.title, sub: chapter.story.narrator, text: chapter.story.text, image: chapter.image };

  if (!data) {
    return (
      <Screen>
        <Header title={t('storiesTitle')} />
        <Text style={ui.muted}>{t('lockedStory')}</Text>
      </Screen>
    );
  }
  const d = data;

  return (
    <Screen>
      <Header title={tr(d.title)} subtitle={tr(d.sub)} />
      <Photo k={d.image} style={{ height: 240, borderRadius: radius.md }} />
      <Text style={[ui.body, { fontSize: 17, lineHeight: 27 }]}>{tr(d.text)}</Text>
      <Button
        icon={speaking ? 'stop' : 'sound'}
        label={speaking ? t('stop') : t('listen')}
        onPress={() => (speaking ? stop() : play(tr(d.text), () => s.markStory(String(id))))}
      />
    </Screen>
  );
}
