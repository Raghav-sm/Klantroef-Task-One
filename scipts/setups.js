import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminUser from '../src/models/AdminUser.model';

dotenv.config();

const setupAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await AdminUser.findOne({ email: 'admin@medacess.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const adminUser = new AdminUser({
      email: 'admin@medacess.com',
      hashed_password: hashedPassword
    });

    await adminUser.save();
    console.log('Default admin user created:');
    console.log('Email: admin@medacess.com');
    console.log('Password: adminmedacess123');
    console.log('Please change this password after first login!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
};

setupAdminUser();