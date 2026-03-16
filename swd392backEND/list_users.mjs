import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema({
    email: String,
    username: String,
    role: String
});
const User = mongoose.model('User', UserSchema);

async function listUsers() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/swd392';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const users = await User.find({}, 'email username role');
    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));
    
    await mongoose.disconnect();
}

listUsers();
