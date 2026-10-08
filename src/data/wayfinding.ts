import type { L } from '../i18n';
import { checkpointById, type Checkpoint, type CheckpointId } from './checkpoints';

/**
 * Offline walking directions between checkpoints (concept §18–19).
 * Landmarks are sample data for the prototype — replace them with the
 * site's real signage once the route is surveyed.
 */
const landmarks: Record<CheckpointId, L> = {
  'nap-ham': { vi: 'khu rừng ngay sau cổng vào', en: 'the forest just past the entrance gate' },
  'bep-hoang-cam': { vi: 'mái che có biển “Bếp Hoàng Cầm”', en: 'the shelter signed “Hoàng Cầm kitchen”' },
  'ham-hoi-hop': { vi: 'lối xuống hầm có tay vịn', en: 'the tunnel entrance with a handrail' },
  'lo-thong-hoi': { vi: 'cụm ụ mối cạnh lối mòn', en: 'the cluster of termite mounds by the trail' },
  'gieng-nuoc': { vi: 'khoảng sân có rào chắn gỗ', en: 'the clearing with a wooden railing' },
  'ham-quan-y': { vi: 'biển chỉ dẫn khu quân y', en: 'the field clinic sign' },
  'ho-bom': { vi: 'hàng cao su dẫn ra bãi trống', en: 'the rubber trees leading to an open area' },
};

export type Step = { text: L; meters?: number };

export function directionsTo(route: CheckpointId[], id: CheckpointId): { from?: Checkpoint; steps: Step[] } {
  const c = checkpointById[id];
  const i = route.indexOf(id);
  const from = i > 0 ? checkpointById[route[i - 1]] : undefined;
  const d = c.distanceM;
  const lm = landmarks[id];
  if (!from || d === 0) {
    return {
      from,
      steps: [
        { text: { vi: 'Qua cổng soát vé, đi theo lối mòn chính', en: 'Pass the ticket gate and follow the main trail' } },
        { text: { vi: `Dừng ở ${lm.vi}`, en: `Stop at ${lm.en}` } },
      ],
    };
  }
  const half = Math.round(d / 2 / 10) * 10;
  return {
    from,
    steps: [
      { text: { vi: `Từ ${from.name.vi}, đi theo lối mòn chính`, en: `From ${from.name.en}, follow the main trail` }, meters: half },
      { text: { vi: 'Đi theo biển chỉ dẫn màu nâu của khu di tích', en: 'Follow the site’s brown direction signs' }, meters: d - half },
      { text: { vi: `Bạn sẽ thấy ${lm.vi}`, en: `You will see ${lm.en}` } },
    ],
  };
}

export type MapFilter = 'all' | 'underground' | 'surface' | 'pastPresent';

export function matchesFilter(c: Checkpoint, f: MapFilter) {
  if (f === 'underground') return c.underground;
  if (f === 'surface') return !c.underground;
  if (f === 'pastPresent') return !!c.pastPresent;
  return true;
}
