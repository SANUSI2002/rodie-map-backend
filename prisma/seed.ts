import { PrismaClient, Role, Visibility, FeatureStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ---- Users ----
  const passwordHash = await bcrypt.hash('password123', 10);

  const userSeeds = [
    { name: 'Dami Adisa', email: 'dami@wragby.com', role: Role.SUPER_ADMIN, active: true },
    { name: 'Chidi Obi', email: 'chidi@wragby.com', role: Role.DEVELOPER, active: true },
    { name: 'Femi Kuti', email: 'femi@wragby.com', role: Role.DEVELOPER, active: true },
    { name: 'Bisi Tade', email: 'bisi@wragby.com', role: Role.PRODUCT_MANAGER, active: true },
    { name: 'Sales Team', email: 'sales@wragby.com', role: Role.SALES, active: false },
  ];
  for (const u of userSeeds) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: passwordHash },
    });
  }

  // ---- Products ----
  const productSeeds = [
    { id: 'alat', name: 'ALAT Mobile Banking', color: '#22C55E', icon: 'landmark', visibility: Visibility.PUBLIC, description: 'iOS features for FX sales, service requests and international transfers.' },
    { id: 'scopeflow', name: 'ScopeFlow', color: '#2E63F6', icon: 'file-check', visibility: Visibility.PRIVATE, description: 'Quotation management platform for sales reps and admins.' },
    { id: 'sabihealth', name: 'Sabi Health', color: '#EF4444', icon: 'heart-pulse', visibility: Visibility.PUBLIC, description: 'Healthcare PWA for the Nigerian market, expanding pan-African.' },
    { id: 'transportiq', name: 'TransportIQ', color: '#F59E0B', icon: 'zap', visibility: Visibility.PRIVATE, description: 'Gas transport monitoring platform for regulatory compliance.' },
  ];
  for (const p of productSeeds) {
    await prisma.product.upsert({ where: { id: p.id }, update: {}, create: p });
  }

  // ---- Modules ----
  const moduleSeeds = [
    { id: 'm1', productId: 'alat', name: 'FX Sales' },
    { id: 'm2', productId: 'alat', name: 'Service Requests' },
    { id: 'm3', productId: 'alat', name: 'Notifications' },
    { id: 'm4', productId: 'scopeflow', name: 'Admin Dashboard' },
    { id: 'm5', productId: 'scopeflow', name: 'Proposals' },
    { id: 'm6', productId: 'scopeflow', name: 'Auth' },
    { id: 'm7', productId: 'sabihealth', name: 'Patient Portal' },
    { id: 'm8', productId: 'sabihealth', name: 'Infrastructure' },
    { id: 'm9', productId: 'sabihealth', name: 'Design System' },
    { id: 'm10', productId: 'transportiq', name: 'Compliance' },
    { id: 'm11', productId: 'transportiq', name: 'Nominations' },
    { id: 'm12', productId: 'transportiq', name: 'Reporting' },
  ];
  for (const m of moduleSeeds) {
    await prisma.module.upsert({ where: { id: m.id }, update: {}, create: m });
  }

  // ---- Features (parents first, then children referencing parentId) ----
  const featureSeeds = [
    { id: 'f1', productId: 'alat', moduleId: 'm1', parentId: null, title: 'To Naira conversion flow', description: 'FX conversion flow that lets users convert foreign currency balances to Naira at live triangulated rates, built on UIKit + Moya + RxSwift with coordinator-based navigation.', status: FeatureStatus.RELEASED, progress: 100, priority: 2, startDate: '2026-01-05', endDate: '2026-02-18', owner: 'Dami A.', visibility: Visibility.PUBLIC },
    { id: 'f2', productId: 'alat', moduleId: 'm1', parentId: null, title: 'To Other(s) conversion flow', status: FeatureStatus.IN_PROGRESS, progress: 65, priority: 2, startDate: '2026-02-02', endDate: '2026-03-20', owner: 'Dami A.', visibility: Visibility.PUBLIC },
    { id: 'f3', productId: 'alat', moduleId: 'm2', parentId: null, title: 'Letter of Non-Indebtedness', status: FeatureStatus.BETA, progress: 80, priority: 3, startDate: '2026-03-01', endDate: '2026-04-15', owner: 'Chidi O.', visibility: Visibility.PUBLIC },
    { id: 'f4', productId: 'alat', moduleId: 'm3', parentId: null, title: 'Authenticator push routing', status: FeatureStatus.DELAYED, progress: 40, priority: 1, startDate: '2026-04-10', endDate: '2026-05-22', owner: 'Femi K.', visibility: Visibility.PRIVATE },
    { id: 'f5', productId: 'scopeflow', moduleId: 'm4', parentId: null, title: 'Pricing manager sync', status: FeatureStatus.IN_PROGRESS, progress: 55, priority: 2, startDate: '2026-01-08', endDate: '2026-03-25', owner: 'Dami A.', visibility: Visibility.PRIVATE },
    { id: 'f6', productId: 'scopeflow', moduleId: 'm5', parentId: null, title: 'Gemini AI proposal generation', status: FeatureStatus.BETA, progress: 70, priority: 1, startDate: '2026-03-05', endDate: '2026-04-18', owner: 'Bisi T.', visibility: Visibility.PRIVATE },
    { id: 'f7', productId: 'scopeflow', moduleId: 'm6', parentId: null, title: 'Role-based routing (3 roles)', status: FeatureStatus.RELEASED, progress: 100, priority: 3, startDate: '2026-01-02', endDate: '2026-01-28', owner: 'Dami A.', visibility: Visibility.PRIVATE },
    { id: 'f8', productId: 'sabihealth', moduleId: 'm7', parentId: null, title: 'AI Health Assistant scoping', status: FeatureStatus.PLANNED, progress: 10, priority: 2, startDate: '2026-05-04', endDate: '2026-06-20', owner: 'Team', visibility: Visibility.PUBLIC },
    { id: 'f9', productId: 'sabihealth', moduleId: 'm8', parentId: null, title: 'Render staging environments', status: FeatureStatus.RELEASED, progress: 100, priority: 1, startDate: '2026-01-03', endDate: '2026-01-30', owner: 'Dami A.', visibility: Visibility.PRIVATE },
    { id: 'f10', productId: 'sabihealth', moduleId: 'm9', parentId: null, title: 'Cross-platform component kit', status: FeatureStatus.IN_PROGRESS, progress: 35, priority: 2, startDate: '2026-02-06', endDate: '2026-04-28', owner: 'Design', visibility: Visibility.PUBLIC },
    { id: 'f11', productId: 'transportiq', moduleId: 'm10', parentId: null, title: 'Escalation letter export (Word/PDF)', status: FeatureStatus.RELEASED, progress: 100, priority: 1, startDate: '2026-01-06', endDate: '2026-02-14', owner: 'Dami A.', visibility: Visibility.PRIVATE },
    { id: 'f12', productId: 'transportiq', moduleId: 'm11', parentId: null, title: 'GASCO nomination workflow', status: FeatureStatus.IN_PROGRESS, progress: 60, priority: 2, startDate: '2026-03-02', endDate: '2026-04-16', owner: 'Dami A.', visibility: Visibility.PRIVATE },
    { id: 'f13', productId: 'transportiq', moduleId: 'm12', parentId: null, title: 'Supplier delivery performance', status: FeatureStatus.DELAYED, progress: 20, priority: 3, startDate: '2026-04-02', endDate: '2026-05-19', owner: 'Ops', visibility: Visibility.PRIVATE },
    // children (must be created after their parents)
    { id: 'f1a', productId: 'alat', moduleId: 'm1', parentId: 'f1', title: 'Rate triangulation edge cases', status: FeatureStatus.RELEASED, progress: 100, priority: 3, startDate: '2026-01-10', endDate: '2026-02-05', owner: 'Dami A.', visibility: Visibility.PUBLIC },
    { id: 'f10a', productId: 'sabihealth', moduleId: 'm9', parentId: 'f10', title: 'Typography scale', status: FeatureStatus.RELEASED, progress: 100, priority: 4, startDate: '2026-02-06', endDate: '2026-02-20', owner: 'Design', visibility: Visibility.PUBLIC },
  ];

  for (const f of featureSeeds) {
    const { startDate, endDate, ...rest } = f;
    await prisma.feature.upsert({
      where: { id: f.id },
      update: {},
      create: {
        ...rest,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
  }

  console.log('Seed complete. Default login: dami@wragby.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
