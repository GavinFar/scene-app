import type { Enums } from '@/types/database';

export type UserMode = Enums<'user_mode'>;

export interface UserModeOption {
  value: UserMode;
  label: string;
  /** One-liner shown under the label on the signup mode card. */
  description: string;
}

/**
 * The three user modes chosen at signup (locked product decision).
 * The app translates between modes — Clients get guided language,
 * Pros get full film terminology, Up & Coming gets a hybrid.
 */
export const USER_MODES: readonly UserModeOption[] = [
  {
    value: 'client',
    label: 'Client',
    description: "I'm hiring — help me find the right creative.",
  },
  {
    value: 'pro',
    label: 'Industry Pro',
    description: 'I work in film — show me full crew terminology.',
  },
  {
    value: 'up_and_coming',
    label: 'Up & Coming',
    description: "I'm early-career — building my reel and my network.",
  },
] as const;
