@echo off
npm uninstall prisma @prisma/client
npm install prisma@5.22.0 @prisma/client@5.22.0 -D
npx prisma generate
npx prisma db push
npm run seed
