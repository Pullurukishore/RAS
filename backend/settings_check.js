const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const settings = await prisma.setting.findMany();
        console.log('--- SETTINGS ---');
        console.log(JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error('Error fetching settings:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
