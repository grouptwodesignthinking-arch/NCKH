import type { L } from '../i18n';
import { checkpointById, type CheckpointId } from './checkpoints';
import { routeOf } from '../store/progress';
import type { JourneyId } from './journeys';
import type { MediaKey } from './media';

export type ProgressView = {
  chapters: Partial<Record<CheckpointId, unknown>>;
  arDone: CheckpointId[];
  storiesHeard: string[];
  journeyId?: JourneyId;
};

const doneIds = (p: ProgressView) => Object.keys(p.chapters) as CheckpointId[];
const undergroundDone = (p: ProgressView) => doneIds(p).filter((id) => checkpointById[id]?.underground).length;
const journeyComplete = (p: ProgressView) => routeOf(p.journeyId).every((id) => p.chapters[id]);

export type Achievement = { id: string; name: L; desc: L; symbol: string; earned: (p: ProgressView) => boolean };

/** Achievements are tied to exploring behaviour, not points (concept §12). */
export const achievements: Achievement[] = [
  {
    id: 'smoke-finder',
    name: { vi: 'Người tìm dấu khói', en: 'Smoke finder' },
    desc: { vi: 'Hoàn thành thử thách AR tại Bếp Hoàng Cầm', en: 'Finish the AR challenge at the Hoàng Cầm kitchen' },
    symbol: '♨',
    earned: (p) => p.arDone.includes('bep-hoang-cam'),
  },
  {
    id: 'tunnel-explorer',
    name: { vi: 'Nhà khám phá địa đạo', en: 'Tunnel explorer' },
    desc: { vi: 'Khám phá 3 khu vực dưới lòng đất', en: 'Explore 3 underground areas' },
    symbol: '⛏',
    earned: (p) => undergroundDone(p) >= 3,
  },
  {
    id: 'decoder',
    name: { vi: 'Người giải mã', en: 'The decoder' },
    desc: { vi: 'Hoàn thành 3 thử thách lịch sử', en: 'Complete 3 historical challenges' },
    symbol: '✦',
    earned: (p) => doneIds(p).length >= 3,
  },
  {
    id: 'listener',
    name: { vi: 'Người lắng nghe', en: 'The listener' },
    desc: { vi: 'Nghe đầy đủ 3 câu chuyện nhân chứng', en: 'Listen to 3 witness stories' },
    symbol: '♪',
    earned: (p) => p.storiesHeard.length >= 3,
  },
  {
    id: 'explorer',
    name: { vi: 'Củ Chi Explorer', en: 'Củ Chi Explorer' },
    desc: { vi: 'Hoàn thành toàn bộ tuyến', en: 'Complete the whole route' },
    symbol: '★',
    earned: journeyComplete,
  },
];

export type SpecialStory = {
  id: string;
  title: L;
  desc: L;
  rule: L;
  image: MediaKey;
  text: L;
  unlocked: (p: ProgressView) => boolean;
};

/** Deeper cultural content as the final reward (concept §13). */
export const specialStories: SpecialStory[] = [
  {
    id: 'one-day-underground',
    title: { vi: 'Một ngày dưới lòng đất', en: 'A day underground' },
    desc: { vi: 'Từ bình minh đến đêm khuya trong địa đạo', en: 'From dawn to midnight in the tunnels' },
    rule: { vi: 'khám phá 3 khu vực dưới lòng đất', en: 'explore 3 underground areas' },
    image: 'vrInterior',
    text: {
      vi: 'Trời chưa sáng, bếp đã đỏ lửa để khói kịp lẫn vào sương. Buổi sáng, người lớn lên ruộng, trẻ con học chữ dưới hầm. Trưa nắng, cả hầm chờ từng làn gió qua lỗ thông hơi. Chiều, tin tức theo bước chân người liên lạc trở về. Đêm xuống, ngọn đèn dầu trong hầm quân y vẫn sáng. Một ngày dưới lòng đất là một ngày của những điều rất bình thường — được giữ gìn bằng sự can đảm phi thường.',
      en: 'Before dawn the stove is lit so smoke can hide in the mist. In the morning adults go to the fields and children learn to read underground. At noon the whole tunnel waits for a breeze through the vents. In the afternoon news returns with the liaison’s footsteps. At night the lamp in the field clinic still burns. A day underground was a day of ordinary things — kept alive by extraordinary courage.',
    },
    unlocked: (p) => undergroundDone(p) >= 3,
  },
  {
    id: 'voices',
    title: { vi: 'Tiếng nói Củ Chi', en: 'Voices of Củ Chi' },
    desc: { vi: 'Bộ sưu tập lời kể nhân chứng', en: 'A collection of witness voices' },
    rule: { vi: 'hoàn thành toàn bộ tuyến', en: 'complete the whole route' },
    image: 'storyWitness',
    text: {
      vi: 'Bộ sưu tập này dành cho phỏng vấn nhân chứng do ban quản lý di tích cung cấp. Trong prototype, đây là nơi giữ chỗ cho các đoạn ghi âm và ảnh tư liệu đã được xác minh nguồn.',
      en: 'This collection is reserved for witness interviews provided by the site management. In the prototype it is a placeholder for recordings and archival photos with verified sources.',
    },
    unlocked: journeyComplete,
  },
];
