// Run with: npx ts-node scripts/lowercaseEmails.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { User } from "../src/entities/User.ts";

async function run() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/swd392";
  await mongoose.connect(mongoUri);
  const users = await User.find();
  let updated = 0;
  for (const u of users) {
    const email = (u.email || "").trim();
    const lower = email.toLowerCase();
    if (email !== lower) {
      await User.updateOne({ _id: u._id }, { email: lower });
      updated++;
    }
  }
  console.log(`Normalized ${updated} emails`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
