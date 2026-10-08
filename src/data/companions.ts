import type { L } from '../i18n';
import type { MediaKey } from './media';

export type CompanionId = 'cook' | 'liaison' | 'medic' | 'villager';

export type Companion = { id: CompanionId; name: L; line: L; intro: L; image: MediaKey };

export const companions: Companion[] = [
  {
    id: 'cook',
    name: { vi: 'Người nấu ăn', en: 'The cook' },
    line: { vi: 'Giữ lửa giữa lòng đất', en: 'Keeping the fire underground' },
    intro: {
      vi: 'Tôi lo cái ăn cho cả khu căn cứ. Mỗi bữa cơm là một bài toán: no bụng mà không để lộ khói.',
      en: 'I fed the whole base. Every meal was a puzzle: full stomachs, no smoke.',
    },
    image: 'companionCook',
  },
  {
    id: 'liaison',
    name: { vi: 'Chiến sĩ liên lạc', en: 'The liaison soldier' },
    line: { vi: 'Những bước chân thầm lặng', en: 'Silent footsteps' },
    intro: {
      vi: 'Tôi mang tin qua rừng và qua hầm. Tôi thuộc từng lối đi như thuộc lòng bàn tay.',
      en: 'I carried messages through forest and tunnel. I knew every passage by heart.',
    },
    image: 'companionLiaison',
  },
  {
    id: 'medic',
    name: { vi: 'Bác sĩ quân y', en: 'The army medic' },
    line: { vi: 'Sự sống trong bóng tối', en: 'Life in the darkness' },
    intro: {
      vi: 'Tôi chữa trị dưới ánh đèn dầu, với rất ít thuốc. Ở đây, mỗi người được cứu là một chiến thắng.',
      en: 'I treated people by oil lamp, with very little medicine. Every life saved was a victory.',
    },
    image: 'companionMedic',
  },
  {
    id: 'villager',
    name: { vi: 'Người dân địa phương', en: 'The local villager' },
    line: { vi: 'Cuộc sống thời chiến', en: 'Everyday life in wartime' },
    intro: {
      vi: 'Ban ngày tôi làm ruộng, ban đêm tôi đào hầm. Củ Chi là nhà, và chúng tôi giữ nhà bằng mọi cách.',
      en: 'By day I farmed, by night I dug. Củ Chi was home, and we kept it however we could.',
    },
    image: 'companionVillager',
  },
];

export const companionById = Object.fromEntries(companions.map((c) => [c.id, c])) as Record<CompanionId, Companion>;
