import type { ImageSourcePropType } from 'react-native';
import type { L } from '../i18n';

/**
 * Content authenticity (concept §20). Every image shown in the app is
 * registered here with what kind of visual it is:
 *  - real:           verified photo/video taken at Củ Chi
 *  - archival:       historical material, with source and date when known
 *  - reconstruction: AR / 3D / AI reconstruction or concept illustration
 *
 * All images currently bundled are crops of the team's concept mockups
 * (AI-generated), so they are all `reconstruction`. When real photos are
 * added, replace `source` and set `kind` + `credit` accordingly.
 */
export type MediaKind = 'real' | 'archival' | 'reconstruction';

export type Media = {
  source: ImageSourcePropType;
  kind: MediaKind;
  credit: L;
};

const concept: L = {
  vi: 'Ảnh minh hoạ concept (AI) — sẽ thay bằng ảnh thật',
  en: 'Concept illustration (AI) — to be replaced with real photos',
};

const m = (source: ImageSourcePropType): Media => ({ source, kind: 'reconstruction', credit: concept });

export const media = {
  heroTunnel: m(require('../../assets/images/hero-tunnel.jpg')),

  siteHatch: m(require('../../assets/images/site-hatch.jpg')),
  siteKitchen: m(require('../../assets/images/site-kitchen.jpg')),
  siteTermite: m(require('../../assets/images/site-termite.jpg')),
  siteWell: m(require('../../assets/images/site-well.jpg')),
  siteMeeting: m(require('../../assets/images/site-meeting.jpg')),
  siteMedical: m(require('../../assets/images/site-medical.jpg')),
  siteBomb: m(require('../../assets/images/site-bomb.jpg')),

  companionCook: m(require('../../assets/images/companion-cook.jpg')),
  companionLiaison: m(require('../../assets/images/companion-liaison.jpg')),
  companionMedic: m(require('../../assets/images/companion-medic.jpg')),
  companionVillager: m(require('../../assets/images/companion-villager.jpg')),

  archiveKitchen: m(require('../../assets/images/archive-kitchen.jpg')),
  storyWitness: m(require('../../assets/images/story-witness.jpg')),

  arLeaves: m(require('../../assets/images/ar-leaves.jpg')),
  arHatchOpen: m(require('../../assets/images/ar-hatch-real.jpg')),
  arKitchenStove: m(require('../../assets/images/ar-kitchen-real.jpg')),
  arKitchenGhost: m(require('../../assets/images/ar-kitchen-ghost.jpg')),
  arMeetingGhost: m(require('../../assets/images/ar-meeting-ghost.jpg')),

  vrInterior: m(require('../../assets/images/vr-interior.jpg')),
  vrPano: m(require('../../assets/images/vr-pano.jpg')),
} satisfies Record<string, Media>;

export type MediaKey = keyof typeof media;
