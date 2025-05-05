import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('Starting user and role seed...');

    // Check if roles already exist
    const adminRoleExists = await prisma.role.findUnique({
      where: { name: 'ADMIN' }
    });

    const operatorRoleExists = await prisma.role.findUnique({
      where: { name: 'OPERATOR' }
    });

    // Create roles if they don't exist
    let adminRole = adminRoleExists;
    let operatorRole = operatorRoleExists;

    if (!adminRoleExists) {
      console.log('Creating ADMIN role...');
      adminRole = await prisma.role.create({
        data: {
          name: 'ADMIN',
          description: 'Administrator with full access'
        }
      });
    }

    if (!operatorRoleExists) {
      console.log('Creating OPERATOR role...');
      operatorRole = await prisma.role.create({
        data: {
          name: 'OPERATOR',
          description: 'Parking operator with limited access'
        }
      });
    }

    // Check if admin user exists
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@parking.com' }
    });

    // Create admin user if it doesn't exist
    if (!adminExists && adminRole) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@parking.com',
          password: hashedPassword,
          pin: '1234', // Default PIN for admin
          roles: {
            create: {
              roleId: adminRole.id
            }
          }
        }
      });
      
      console.log(`Created admin user with ID: ${adminUser.id}`);
    }

    // Create a test operator user
    const operatorExists = await prisma.user.findUnique({
      where: { email: 'operator@parking.com' }
    });

    if (!operatorExists && operatorRole) {
      console.log('Creating operator user...');
      const hashedPassword = await bcrypt.hash('operator123', 10);
      
      const operatorUser = await prisma.user.create({
        data: {
          name: 'Operator User',
          email: 'operator@parking.com',
          password: hashedPassword,
          pin: '5678', // Default PIN for operator
          roles: {
            create: {
              roleId: operatorRole.id
            }
          }
        }
      });
      
      console.log(`Created operator user with ID: ${operatorUser.id}`);
    }

    console.log('User and role seed completed successfully!');
  } catch (error) {
    console.error('Error seeding users and roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedUsers(); 