import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const categories = [
  { name: 'Food', icon: '🍔', color: '#f43f5e' },
  { name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { name: 'Rent', icon: '🏠', color: '#8b5cf6' },
  { name: 'Shopping', icon: '🛍️', color: '#f59e0b' },
  { name: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { name: 'Bills', icon: '📄', color: '#06b6d4' },
  { name: 'Health', icon: '💊', color: '#10b981' },
  { name: 'Education', icon: '📚', color: '#6366f1' },
  { name: 'Other', icon: '📦', color: '#64748b' },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding categories...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { icon: category.icon, color: category.color },
      create: category,
    });
  }

  console.log('✅ Seeded 9 categories successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
