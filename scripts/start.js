// Production start script.
//
// Order of operations on every container start:
//   1. Apply any pending Prisma migrations (idempotent).
//   2. If the DB is empty, run the seed once. If it already has users, skip.
//   3. Boot the Next.js server.
//
// This is wired up as `npm run start:prod` in package.json and is what
// render.yaml's `startCommand` invokes.

/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync, spawn } = require('node:child_process');

function run(cmd, args, opts = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (r.status !== 0) {
    console.error(`Command failed (${r.status}): ${cmd} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
}

async function shouldSeed() {
  // Lazy-load Prisma — schema is generated at build, ready at runtime.
  const { PrismaClient } = require('@prisma/client');
  const db = new PrismaClient();
  try {
    const userCount = await db.user.count();
    return userCount === 0;
  } catch (err) {
    // If the table doesn't exist yet, the migrate step above will have failed
    // first — but be defensive.
    console.error('Could not check user count:', err);
    return false;
  } finally {
    await db.$disconnect();
  }
}

/**
 * If `RESET_STAFF_PASSWORD` is set, force-set all 4 staff accounts
 * (kaiser/asad/faisal/arman) to that password and clear forcePasswordChange.
 *
 * This is a recovery hook — once you've used it, REMOVE the env var so it
 * doesn't reset passwords on every boot. The script logs prominently when
 * this fires so you can't miss it in deploy logs.
 */
async function maybeResetStaffPassword() {
  const target = process.env.RESET_STAFF_PASSWORD;
  if (!target) return;

  if (target.length < 8) {
    console.error('RESET_STAFF_PASSWORD is set but too short (<8 chars). Refusing.');
    return;
  }

  const bcrypt = require('bcryptjs');
  const { PrismaClient } = require('@prisma/client');
  const db = new PrismaClient();
  const STAFF_EMAILS = [
    'igre.kaiser@gmail.com',
    'igre.asad@gmail.com',
    'faisalvpz2777@gmail.com',
    'ashikuzzamanarman@gmail.com',
  ];

  try {
    console.log('=== RESET_STAFF_PASSWORD set — resetting staff passwords ===');
    const hash = await bcrypt.hash(target, 12);
    let updated = 0;
    for (const email of STAFF_EMAILS) {
      try {
        await db.user.update({
          where: { email },
          data: { passwordHash: hash, forcePasswordChange: false },
        });
        console.log(`  reset: ${email}`);
        updated++;
      } catch (err) {
        console.warn(`  not found: ${email}`);
      }
    }
    console.log(`=== ${updated}/${STAFF_EMAILS.length} staff passwords reset; REMOVE the RESET_STAFF_PASSWORD env var now ===`);
  } catch (err) {
    console.error('Password reset failed:', err);
  } finally {
    await db.$disconnect();
  }
}

(async () => {
  console.log('IGRE — production bootstrap starting');

  // 1. Apply pending migrations
  run('npx', ['prisma', 'migrate', 'deploy']);

  // 2. Seed if the DB is empty
  if (await shouldSeed()) {
    console.log('DB empty — running seed (one-time)');
    run('npx', ['tsx', 'prisma/seed.ts']);
  } else {
    console.log('DB has data — skipping seed');
  }

  // 2b. Optional staff-password reset (set RESET_STAFF_PASSWORD env var)
  await maybeResetStaffPassword();

  // 3. Hand off to Next
  console.log('Starting Next.js server');
  const next = spawn('npx', ['next', 'start', '-p', process.env.PORT || '3000'], {
    stdio: 'inherit',
    shell: true,
  });
  next.on('exit', (code) => process.exit(code ?? 0));
})().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
