import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding salon menu...');

  // 1. Add 5 Services
  const services = [
    { code: 'SVC-0001', description: 'Haircut (Men)', price: 300, gender: 'Male', category: 'Hair' },
    { code: 'SVC-0002', description: 'Haircut (Women)', price: 800, gender: 'Female', category: 'Hair' },
    { code: 'SVC-0003', description: 'Global Hair Coloring', price: 2500, gender: 'Female', category: 'Hair' },
    { code: 'SVC-0004', description: 'Anti-Tan Facial', price: 1200, gender: 'Male', category: 'Skin' },
    { code: 'SVC-0005', description: 'Bridal Makeup', price: 8000, gender: 'Female', category: 'Makeup' },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { code: service.code },
      update: service,
      create: service,
    });
  }
  console.log('Added 5 services.');

  // 2. Add 5 Products
  const products = [
    { code: 'PRD-0001', description: 'Loreal Professionnel Shampoo', price: 650, category: 'Hair Care' },
    { code: 'PRD-0002', description: 'Loreal Professionnel Conditioner', price: 700, category: 'Hair Care' },
    { code: 'PRD-0003', description: 'O3+ Brightening Face Wash', price: 450, category: 'Skin Care' },
    { code: 'PRD-0004', description: 'Schwarzkopf Hair Serum', price: 550, category: 'Hair Care' },
    { code: 'PRD-0005', description: 'Beardo Beard Oil', price: 350, category: 'Grooming' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: product,
      create: product,
    });
  }
  console.log('Added 5 products.');

  // 3. Add 5 Packages
  const packages = [
    { code: 'PKG-0001', description: 'Ultimate Bridal Package', price: 15000 },
    { code: 'PKG-0002', description: 'Groom Essentials', price: 4500 },
    { code: 'PKG-0003', description: 'Hair Transformation Bundle', price: 5000 },
    { code: 'PKG-0004', description: 'Skin Revitalization Combo', price: 3500 },
    { code: 'PKG-0005', description: 'Classic Mani-Pedi Duo', price: 1200 },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { code: pkg.code },
      update: pkg,
      create: pkg,
    });
  }
  console.log('Added 5 packages.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
