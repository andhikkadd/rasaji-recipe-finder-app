import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    take: 1
  });

  if (users.length === 0) {
    console.log("Tidak ada user di database. Silakan register akun terlebih dahulu di web app.");
  } else {
    const user = users[0];
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' }
    });
    console.log(`Berhasil! Akun ${user.email} telah diubah menjadi admin.`);
    console.log('Sekarang kamu bisa login dengan akun tersebut dan mengakses http://localhost:5173/admin');
  }
}

makeAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
