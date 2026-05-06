/**
 * One-shot user reset.
 *
 * Wipes ALL existing user accounts (the old kaiser/asad/faisal/arman/demo
 * 5-account set or whatever's there now) and creates exactly three:
 *
 *   admin@igre.ae    (ADMIN)    Admin@2026
 *   manager@igre.ae  (MANAGER)  Manager@2026
 *   user@igre.ae     (USER)     User@2026
 *
 * All three have forcePasswordChange = false, so first login lands them
 * straight on their dashboard.
 *
 * Safe for an existing prod DB:
 *   - Listings keep their data — agentId is reassigned to the new manager
 *   - Leads same — agentId reassigned
 *   - Anything cascade-linked to a deleted user (favourites, notifications)
 *     gets cleaned up by the FK cascade
 *
 * Run locally:    npx tsx scripts/reset-users.ts
 * Run on Railway: set env var RESET_USERS=1, redeploy, REMOVE the var.
 *
 * Override the default passwords by setting:
 *   SEED_ADMIN_PASSWORD, SEED_MANAGER_PASSWORD, SEED_USER_PASSWORD
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL   = 'admin@igre.ae';
const MANAGER_EMAIL = 'manager@igre.ae';
const USER_EMAIL    = 'user@igre.ae';

const ADMIN_PASSWORD   = process.env.SEED_ADMIN_PASSWORD   || 'Admin@2026';
const MANAGER_PASSWORD = process.env.SEED_MANAGER_PASSWORD || 'Manager@2026';
const USER_PASSWORD    = process.env.SEED_USER_PASSWORD    || 'User@2026';

async function main() {
  console.log('=== Resetting user accounts ===');

  // 1. Upsert the three new users FIRST so we have valid IDs to reassign to.
  const adminHash   = await bcrypt.hash(ADMIN_PASSWORD,   12);
  const managerHash = await bcrypt.hash(MANAGER_PASSWORD, 12);
  const userHash    = await bcrypt.hash(USER_PASSWORD,    12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: adminHash, role: 'ADMIN', forcePasswordChange: false, name: 'IGRE Admin' },
    create: {
      email: ADMIN_EMAIL,
      name: 'IGRE Admin',
      phone: '+971581005220',
      passwordHash: adminHash,
      role: 'ADMIN',
      bio: 'Founder & Managing Director. Property in Abu Dhabi since day one.',
      forcePasswordChange: false,
      avatarUrl: '/team/Kaiser.png',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: MANAGER_EMAIL },
    update: { passwordHash: managerHash, role: 'MANAGER', forcePasswordChange: false, name: 'IGRE Agent' },
    create: {
      email: MANAGER_EMAIL,
      name: 'IGRE Agent',
      phone: '+971502416589',
      passwordHash: managerHash,
      role: 'MANAGER',
      bio: 'Senior Property Consultant. Sales, leasing, and broker collaborations.',
      forcePasswordChange: false,
      avatarUrl: '/team/Asaduzzaman.png',
    },
  });

  await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: { passwordHash: userHash, role: 'USER', forcePasswordChange: false, name: 'IGRE Client' },
    create: {
      email: USER_EMAIL,
      name: 'IGRE Client',
      phone: '+971500000000',
      passwordHash: userHash,
      role: 'USER',
      forcePasswordChange: false,
    },
  });

  console.log(`  upserted: ${ADMIN_EMAIL} (ADMIN)`);
  console.log(`  upserted: ${MANAGER_EMAIL} (MANAGER)`);
  console.log(`  upserted: ${USER_EMAIL} (USER)`);

  // 2. Reassign listings and leads owned by anyone OTHER than the three new
  //    users to the new manager. Then orphan-cleanup the old users.
  const keepIds = [admin.id, manager.id];
  // (USER role accounts shouldn't own listings/leads, but include just in case.)

  const reassignedListings = await prisma.listing.updateMany({
    where: { agentId: { notIn: keepIds } },
    data: { agentId: manager.id },
  });
  console.log(`  ${reassignedListings.count} listings reassigned to ${MANAGER_EMAIL}`);

  const reassignedLeads = await prisma.lead.updateMany({
    where: { agentId: { notIn: keepIds } },
    data: { agentId: manager.id },
  });
  console.log(`  ${reassignedLeads.count} leads reassigned to ${MANAGER_EMAIL}`);

  // Detach AuditLog and Enquiry's optional userId (they don't cascade)
  await prisma.auditLog.updateMany({
    where: { userId: { notIn: [admin.id, manager.id] } },
    data: { userId: null },
  });
  await prisma.enquiry.updateMany({
    where: { userId: { notIn: [admin.id, manager.id] } },
    data: { userId: null },
  });

  // 3. Delete every user that isn't one of the three new ones.
  // Cascade FKs will clean up favourites, notifications, and viewing requests.
  const keptEmails = [ADMIN_EMAIL, MANAGER_EMAIL, USER_EMAIL];
  const removed = await prisma.user.deleteMany({
    where: { email: { notIn: keptEmails } },
  });
  console.log(`  ${removed.count} stale user accounts deleted`);

  console.log('=== User reset complete ===');
  console.log('');
  console.log('  CREDENTIALS:');
  console.log(`    ADMIN    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}`);
  console.log(`    MANAGER  ${MANAGER_EMAIL}  ${MANAGER_PASSWORD}`);
  console.log(`    USER     ${USER_EMAIL}     ${USER_PASSWORD}`);
}

main()
  .catch((err) => { console.error('Reset failed:', err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
