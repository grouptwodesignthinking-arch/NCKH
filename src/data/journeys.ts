import type { L } from '../i18n';
import type { CheckpointId } from './checkpoints';
import type { MediaKey } from './media';

export type JourneyId = 'basic' | 'deep' | 'family' | 'challenge';

export type Journey = { id: JourneyId; name: L; desc: L; duration: L; route: CheckpointId[]; image: MediaKey };

export const journeys: Journey[] = [
  {
    id: 'basic',
    name: { vi: 'Hành trình Cơ bản', en: 'Basic journey' },
    desc: { vi: 'Những điểm không thể bỏ lỡ', en: 'The must-see highlights' },
    duration: { vi: '1–2 giờ', en: '1–2 h' },
    route: ['nap-ham', 'bep-hoang-cam', 'ham-hoi-hop', 'gieng-nuoc'],
    image: 'siteKitchen',
  },
  {
    id: 'deep',
    name: { vi: 'Hành trình Chuyên sâu', en: 'Deep exploration' },
    desc: { vi: 'Toàn bộ tuyến, đầy đủ câu chuyện', en: 'The full route, every story' },
    duration: { vi: '3–4 giờ', en: '3–4 h' },
    route: ['nap-ham', 'bep-hoang-cam', 'ham-hoi-hop', 'lo-thong-hoi', 'gieng-nuoc', 'ham-quan-y', 'ho-bom'],
    image: 'siteMeeting',
  },
  {
    id: 'family',
    name: { vi: 'Hành trình Gia đình', en: 'Family journey' },
    desc: { vi: 'Lối đi dễ, phù hợp trẻ em', en: 'Easy paths, kid friendly' },
    duration: { vi: '1,5 giờ', en: '1.5 h' },
    route: ['nap-ham', 'bep-hoang-cam', 'lo-thong-hoi', 'gieng-nuoc'],
    image: 'siteWell',
  },
  {
    id: 'challenge',
    name: { vi: 'Hành trình Thử thách', en: 'Challenge journey' },
    desc: { vi: 'Thu thập huy hiệu, mở nội dung đặc biệt', en: 'Collect badges, unlock special content' },
    duration: { vi: '2–3 giờ', en: '2–3 h' },
    route: ['nap-ham', 'lo-thong-hoi', 'bep-hoang-cam', 'ham-hoi-hop', 'ham-quan-y', 'ho-bom'],
    image: 'siteTermite',
  },
];

export const journeyById = Object.fromEntries(journeys.map((j) => [j.id, j])) as Record<JourneyId, Journey>;
