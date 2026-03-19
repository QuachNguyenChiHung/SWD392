// @ts-nocheck
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from './entities/User.ts';
import { Admin } from './entities/Admin.ts';
import { Teacher } from './entities/Teacher.ts';

async function seed() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/swd392';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    try {
        // ─── Clear existing data ───
        await Promise.all([
            User.deleteMany({}),
            Admin.deleteMany({}),
            Teacher.deleteMany({}),
        ]);
        console.log('Cleared user-related collections.');

        // ─── 1. Users (10) ───
        //password : 67Hashed_password
        const users = await User.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                role: i < 2 ? 'admin' : i < 4 ? 'moderator' : i < 7 ? 'teacher' : 'student',
                username: `user_${i + 1}`,
                email: `user${i + 1}@example.com`,
                password: '$2a$12$cAs/1b1rLMGGZwWqM8jZ3OH1fUSpPjkPBJ8IpFUUWA6nnHIGGnYk.',
                date_create: new Date(),
                status: 'active',
            }))
        );
        console.log('Seeded 10 Users');

        // ─── 2. Admins (admins and moderators) ───
        const adminUsers = users.filter(user => user.role === 'admin' || user.role === 'moderator');
        const admins = await Admin.insertMany(
            adminUsers.map(user => ({
                user_id: user._id,
                authorization_lvl: user.role === 'admin' ? 2 : 1, // admin = level 2, moderator = level 1
                date_create: new Date(),
            }))
        );
        console.log(`Seeded ${admins.length} Admins`);

        // ─── 3. Teachers (teacher users only) ───
        const teacherUsers = users.filter(user => user.role === 'teacher');
        const teachers = await Teacher.insertMany(
            teacherUsers.map(user => ({
                user_id: user._id,
                credential: null, // null certificate as requested
                date_create: new Date(),
            }))
        );
        console.log(`Seeded ${teachers.length} Teachers`);
        console.log('\n✅ Seeding complete! Users, admins, moderators, and teachers were seeded successfully.');

    } catch (error) {
        console.error('\n❌ Seeding failed.');
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

seed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Seeding error:', err);
        process.exit(1);
    });
