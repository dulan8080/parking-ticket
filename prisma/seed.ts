import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, create vehicle types
  const car = await prisma.vehicleType.create({
    data: {
      name: 'Car',
    },
  });

  const bike = await prisma.vehicleType.create({
    data: {
      name: 'Bike',
    },
  });

  // Add rates for car
  await prisma.hourlyRate.createMany({
    data: [
      { hour: 1, price: 200, vehicleTypeId: car.id },
      { hour: 2, price: 150, vehicleTypeId: car.id },
      { hour: 3, price: 100, vehicleTypeId: car.id },
      { hour: 4, price: 50, vehicleTypeId: car.id },
    ],
  });

  // Add rates for bike
  await prisma.hourlyRate.createMany({
    data: [
      { hour: 1, price: 100, vehicleTypeId: bike.id },
      { hour: 2, price: 75, vehicleTypeId: bike.id },
      { hour: 3, price: 50, vehicleTypeId: bike.id },
      { hour: 4, price: 25, vehicleTypeId: bike.id },
    ],
  });

  console.log('Database has been seeded! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 