import bcrypt from 'bcrypt';

const hash = '$2a$12$cAs/1b1rLMGGZwWqM8jZ3OH1fUSpPjkPBJ8IpFUUWA6nnHIGGnYk.';
const passwords = ['password', '12345678', '1234567890', 'admin123', 'Password123!', 'user123', 'Abc1234567*'];

async function test() {
    for (const pw of passwords) {
        const match = await bcrypt.compare(pw, hash);
        console.log(`Password: ${pw}, Match: ${match}`);
    }
}

test();
