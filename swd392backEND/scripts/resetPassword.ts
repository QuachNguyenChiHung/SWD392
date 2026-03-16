// Run with: npx ts-node scripts/resetPassword.ts --email user1@example.com --password "NewPass123!"
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { User } from "../src/entities/User.ts";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

const argv = require("yargs")
  .option("email", { type: "string", demandOption: true })
  .option("password", { type: "string", demandOption: true }).argv;

async function run() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/swd392";
  await mongoose.connect(mongoUri);
  const email = (argv.email || "").trim().toLowerCase();
  const password = argv.password;
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const updated = await User.findOneAndUpdate(
    { email },
    { password: hash },
    { new: true },
  );
  if (updated) {
    console.log(`Password updated for ${email}`);
  } else {
    console.log(`User not found for ${email}`);
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
