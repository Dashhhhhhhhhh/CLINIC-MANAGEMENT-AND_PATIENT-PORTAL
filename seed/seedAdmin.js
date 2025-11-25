const { User } = require('../models/userModel');
const { Role } = require('../models/roleModel');
const { hashPassword } = require('../utils/security');

async function seedAdmin() {
  try {
    const adminRole = await Role.findOne({ where: { role_name: 'admin' } });
    if (!adminRole) throw new Error('Admin role not found');

    const existingAdmin = await User.findOne({
      where: { role_id: adminRole.role_id },
    });

    if (existingAdmin) {
      console.log(' Admin user already exists, skipping seeding.');
      return;
    }

    const password_hash = await hashPassword('Admin123!');

    await User.create({
      email: 'admin@clinic.com',
      username: 'admin',
      password_hash,
      role_id: adminRole.role_id,
      active: true,
    });

    console.log('✅ Admin user seeded successfully.');
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err.message);
  }
}

seedAdmin();
