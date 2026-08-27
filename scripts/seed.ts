/**
 * Seed script — 15 fictional Austin creatives so the Home feed is never
 * empty on first run.
 *
 * Runs as a plain Node script outside the Expo bundler:
 *   npx tsx --env-file=.env --env-file=.env.seed scripts/seed.ts
 *
 * Uses the service-role key (EXPO_PRIVATE_SUPABASE_SECRET_KEY) to bypass RLS
 * and the auth admin API — profiles.id FKs to auth.users, so each seed
 * profile needs a real (pre-confirmed) auth user behind it. Never import
 * this key or this file from app code.
 *
 * Idempotent: re-running upserts profiles and replaces their roles/portfolio
 * rows instead of duplicating them.
 */
import { createClient } from '@supabase/supabase-js';

import type { Database, TablesInsert } from '../types/database';

type RateTier = Database['public']['Enums']['rate_tier'];
type UserMode = Database['public']['Enums']['user_mode'];

interface SeedRole {
  slug: string;
  experience: number; // 1–5 self-rated dots
}

interface SeedProfile {
  /** Non-deliverable seed address — doubles as the idempotency key. */
  email: string;
  displayName: string;
  bio: string;
  rateTier: RateTier;
  userMode: UserMode;
  roles: SeedRole[];
  /** Cloudinary publicId for the card background (all seed work assets are images). */
  workPublicId: string;
  /** Cloudinary publicId for the circular face overlay. */
  facePublicId: string;
}

const SEED_EMAIL_DOMAIN = 'seed.joinscene.com';

const SEED_PROFILES: SeedProfile[] = [
  {
    email: `felix@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Felix Marlowe',
    bio: "DP with a soft spot for natural light and hard schedules. Shot three narrative shorts and a hill country doc last year. If it can be done practical, let's do it practical.",
    rateTier: '$$$',
    userMode: 'pro',
    roles: [
      { slug: 'dp', experience: 4 },
      { slug: 'camera-operator', experience: 3 },
      { slug: 'gaffer', experience: 2 },
    ],
    workPublicId: 'work1_vbjwif',
    facePublicId: 'Fido_sas0lt',
  },
  {
    email: `denny@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Denny Kowalski',
    bio: 'Camera op / 1st AC. Steady hands, clean marks, zero drama. Comfortable on gimbal, dolly, and handheld — commercial and narrative both.',
    rateTier: '$$',
    userMode: 'pro',
    roles: [
      { slug: 'camera-operator', experience: 4 },
      { slug: 'first-ac', experience: 3 },
    ],
    workPublicId: 'work7_r7ow2f',
    facePublicId: 'fleegan_gkoqpw',
  },
  {
    email: `wade@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Wade Hollis',
    bio: 'Gaffer, 15 years in. I bring the truck, the crew, and the plan. Big fan of shaping with negative fill and going home on time.',
    rateTier: '$$$',
    userMode: 'pro',
    roles: [
      { slug: 'gaffer', experience: 5 },
      { slug: 'key-grip', experience: 3 },
    ],
    workPublicId: 'work12_u8mwts',
    facePublicId: 'GolDRoger_bltbzy',
  },
  {
    email: `marcus@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Marcus Trejo',
    bio: "Key grip out of East Austin. Rigging, dollies, condor days — whatever the shot needs. Safety first, speed second, but you'll get both.",
    rateTier: '$$',
    userMode: 'pro',
    roles: [
      { slug: 'key-grip', experience: 4 },
      { slug: 'swing', experience: 3 },
    ],
    workPublicId: 'work3_xonpwb',
    facePublicId: 'vanoss_pvzh8v',
  },
  {
    email: `rory@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Rory Callahan',
    bio: 'Editor finishing up at UT RTF. Cut two festival shorts and more spec ads than I can count. Fast turnarounds, obsessive about rhythm.',
    rateTier: '$',
    userMode: 'up_and_coming',
    roles: [
      { slug: 'editor', experience: 3 },
      { slug: 'motion-graphics', experience: 2 },
    ],
    workPublicId: 'work2_jchwqr',
    facePublicId: 'Tony_r8buqg',
  },
  {
    email: `gus@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Gus Brannigan',
    bio: 'Colorist. Resolve certified, calibrated suite off Burnet. I match skin tones before I touch a look — grade should serve the story, not the reel.',
    rateTier: '$$',
    userMode: 'pro',
    roles: [
      { slug: 'colorist', experience: 4 },
      { slug: 'editor', experience: 3 },
    ],
    workPublicId: 'work14_utqtrj',
    facePublicId: 'Euller_po5e24',
  },
  {
    email: `theo@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Theo Vance',
    bio: 'Production sound mixer with my own 8-channel rig. Clean dialogue is the whole job — everything else is a bonus. Also boom, also post cleanup.',
    rateTier: '$$',
    userMode: 'up_and_coming',
    roles: [
      { slug: 'production-sound-mixer', experience: 3 },
      { slug: 'boom-operator', experience: 3 },
      { slug: 'sound-editor', experience: 2 },
    ],
    workPublicId: 'work15_i86n2w',
    facePublicId: 'chad_pjhbbg',
  },
  {
    email: `kenji@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Kenji Sato',
    bio: 'Boom op and set utility. Quiet on set, early to call, arms of steel. Building toward mixing — happy to second on bigger jobs.',
    rateTier: '$',
    userMode: 'up_and_coming',
    roles: [
      { slug: 'boom-operator', experience: 2 },
      { slug: 'pa', experience: 3 },
    ],
    workPublicId: 'work5_hbo234',
    facePublicId: 'zerotwo_kscxtx',
  },
  {
    email: `sal@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Sal Moretti',
    bio: 'Producer. I take projects from pitch deck to picture lock — budgets, permits, crew, the unglamorous stuff that makes the glamorous stuff possible.',
    rateTier: '$$$',
    userMode: 'pro',
    roles: [
      { slug: 'producer', experience: 4 },
      { slug: 'line-producer', experience: 3 },
      { slug: 'production-manager', experience: 3 },
    ],
    workPublicId: 'work8_z1y8c2',
    facePublicId: 'novaOnline_ok8t9m',
  },
  {
    email: `diego@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Diego Fuentes',
    bio: 'Production coordinator who actually likes spreadsheets. Call sheets out by 8pm, every time. PA experience on two features and a docuseries.',
    rateTier: '$',
    userMode: 'up_and_coming',
    roles: [
      { slug: 'production-coordinator', experience: 3 },
      { slug: 'pa', experience: 4 },
    ],
    workPublicId: 'work11_y0wwtc',
    facePublicId: 'john_obiolx',
  },
  {
    email: `vinh@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Vinh Tran',
    bio: 'Production designer. Worlds on a budget — I scout, I build, I dress, and I return everything with the receipts. Strong prop shop network in town.',
    rateTier: '$$',
    userMode: 'pro',
    roles: [
      { slug: 'production-designer', experience: 4 },
      { slug: 'art-director', experience: 3 },
      { slug: 'set-decorator', experience: 3 },
    ],
    workPublicId: 'work6_t3q0np',
    facePublicId: 'huy_thmedg',
  },
  {
    email: `juno@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Juno Vasquez',
    bio: 'Costume designer and stylist. Period, streetwear, sci-fi — clothes tell the audience who someone is before they speak. Kit includes a full sewing setup.',
    rateTier: '$$',
    userMode: 'pro',
    roles: [
      { slug: 'costume-designer', experience: 4 },
      { slug: 'wardrobe-stylist', experience: 3 },
      { slug: 'key-makeup-artist', experience: 2 },
    ],
    workPublicId: 'work9_fbwchz',
    facePublicId: 'tasha_ypsigq',
  },
  {
    email: `cole@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Cole Whitaker',
    bio: 'Director. Two shorts on the festival circuit, a third in post. I storyboard everything and shoot the rehearsal — come ready to play.',
    rateTier: '$$',
    userMode: 'up_and_coming',
    roles: [
      { slug: 'director', experience: 3 },
      { slug: 'assistant-director', experience: 2 },
      { slug: 'editor', experience: 2 },
    ],
    workPublicId: 'work10_awf4kj',
    facePublicId: 'luc_iq1jmv',
  },
  {
    email: `oscar@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Oscar Winters',
    bio: 'VFX artist — comp, cleanup, screen replacements, and the occasional creature. Nuke and After Effects. Send me your impossible shot.',
    rateTier: '$$$',
    userMode: 'pro',
    roles: [
      { slug: 'vfx-artist', experience: 4 },
      { slug: 'motion-graphics', experience: 3 },
    ],
    workPublicId: 'work13_fhwuld',
    facePublicId: 'icewizard_qbwlke',
  },
  {
    email: `duncan@${SEED_EMAIL_DOMAIN}`,
    displayName: 'Duncan Sheehy',
    bio: "Location manager. I know every ranch, warehouse, and diner within an hour of Austin — and which owners pick up the phone. Permits handled before you ask.",
    rateTier: '$$',
    userMode: 'pro',
    roles: [
      { slug: 'location-manager', experience: 4 },
      { slug: 'location-scout', experience: 4 },
    ],
    workPublicId: 'work4_fsdacf',
    facePublicId: 'john_pork_shulza',
  },
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name} — run with: npx tsx --env-file=.env --env-file=.env.seed scripts/seed.ts`
    );
  }
  return value;
}

const supabaseUrl = requireEnv('EXPO_PUBLIC_SUPABASE_URL');
const serviceRoleKey = requireEnv('EXPO_PRIVATE_SUPABASE_SECRET_KEY');

const admin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Page through auth users to find an existing seed user by email. */
async function findUserIdByEmail(email: string): Promise<string | null> {
  const perPage = 200;
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match.id;
    if (data.users.length < perPage) return null;
  }
}

/** Create the auth user behind a seed profile, or reuse it on re-runs. */
async function ensureAuthUser(seed: SeedProfile): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email: seed.email,
    password: crypto.randomUUID(), // never logged in with; throwaway
    email_confirm: true,
    user_metadata: { display_name: seed.displayName, seed: true },
  });
  if (!error) return data.user.id;

  const alreadyExists =
    error.code === 'email_exists' || /already.*registered/i.test(error.message);
  if (alreadyExists) {
    const existingId = await findUserIdByEmail(seed.email);
    if (existingId) return existingId;
  }
  throw new Error(`createUser(${seed.email}) failed: ${error.message}`);
}

async function upsertProfile(seed: SeedProfile, userId: string, cityId: string) {
  const row: TablesInsert<'profiles'> = {
    id: userId,
    display_name: seed.displayName,
    bio: seed.bio,
    city_id: cityId,
    user_mode: seed.userMode,
    rate_tier: seed.rateTier,
    work_public_id: seed.workPublicId,
    work_media_type: 'image',
    face_public_id: seed.facePublicId,
  };
  const { error } = await admin.from('profiles').upsert(row);
  if (error) throw new Error(`profiles upsert (${seed.displayName}): ${error.message}`);
}

async function replaceRoles(seed: SeedProfile, userId: string) {
  const { error: deleteError } = await admin
    .from('profile_roles')
    .delete()
    .eq('profile_id', userId);
  if (deleteError) {
    throw new Error(`profile_roles delete (${seed.displayName}): ${deleteError.message}`);
  }

  const rows: TablesInsert<'profile_roles'>[] = seed.roles.map((role) => ({
    profile_id: userId,
    role_slug: role.slug,
    experience: role.experience,
  }));
  const { error: insertError } = await admin.from('profile_roles').insert(rows);
  if (insertError) {
    throw new Error(`profile_roles insert (${seed.displayName}): ${insertError.message}`);
  }
}

/** Seed profiles reuse the work asset as their single portfolio piece. */
async function replacePortfolio(seed: SeedProfile, userId: string) {
  const { error: deleteError } = await admin
    .from('portfolio_media')
    .delete()
    .eq('profile_id', userId);
  if (deleteError) {
    throw new Error(`portfolio delete (${seed.displayName}): ${deleteError.message}`);
  }

  const row: TablesInsert<'portfolio_media'> = {
    profile_id: userId,
    public_id: seed.workPublicId,
    media_type: 'image',
    caption: 'Selected work',
    sort_order: 0,
  };
  const { error: insertError } = await admin.from('portfolio_media').insert(row);
  if (insertError) {
    throw new Error(`portfolio insert (${seed.displayName}): ${insertError.message}`);
  }
}

async function main() {
  const { data: austin, error: cityError } = await admin
    .from('cities')
    .select('id, name, state')
    .eq('slug', 'austin')
    .single();
  if (cityError || !austin) {
    throw new Error(`Could not load Austin city row: ${cityError?.message}`);
  }

  console.log(`Seeding ${SEED_PROFILES.length} profiles into ${austin.name}, ${austin.state}…\n`);

  for (const seed of SEED_PROFILES) {
    const userId = await ensureAuthUser(seed);
    await upsertProfile(seed, userId, austin.id);
    await replaceRoles(seed, userId);
    await replacePortfolio(seed, userId);
    const roleSummary = seed.roles
      .map((r) => `${r.slug}:${r.experience}`)
      .join(', ');
    console.log(`✓ ${seed.displayName.padEnd(16)} ${seed.rateTier.padEnd(3)} ${roleSummary}`);
  }

  // Verify: every seed profile is present with media and at least one role.
  const { data: check, error: checkError } = await admin
    .from('profiles')
    .select('display_name, work_public_id, face_public_id, profile_roles(role_slug)')
    .eq('city_id', austin.id);
  if (checkError) throw new Error(`verification query failed: ${checkError.message}`);

  const seededNames = new Set(SEED_PROFILES.map((s) => s.displayName));
  const seeded = check.filter((p) => seededNames.has(p.display_name));
  const broken = seeded.filter(
    (p) => !p.work_public_id || !p.face_public_id || p.profile_roles.length === 0
  );

  console.log(`\nVerified: ${seeded.length}/${SEED_PROFILES.length} seed profiles live in Austin.`);
  if (seeded.length !== SEED_PROFILES.length || broken.length > 0) {
    if (broken.length > 0) {
      console.error(
        `Profiles missing media or roles: ${broken.map((p) => p.display_name).join(', ')}`
      );
    }
    throw new Error('Seed verification failed.');
  }
  console.log('Seed complete.');
}

main().catch((error) => {
  console.error(`\nSeed failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
