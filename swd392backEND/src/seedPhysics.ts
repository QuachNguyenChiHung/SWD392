// @ts-nocheck
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Course } from './entities/Course.ts';
import { Topic } from './entities/Topic.ts';

const courseData = {
    course_name: 'Vật lí 7',
    grade_level: 7,
    change_log: null,
    status: 'active',
};

const topicData = [
    {
        title: 'Nhận biết ánh sáng - nguồn sáng và vật sáng',
        description: 'Bài 1 trong chương Quang học.',
        content_json: {},
    },
    {
        title: 'Sự truyền ánh sáng',
        description: 'Bài 2 trong chương Quang học.',
        content_json: {},
    },
    {
        title: 'Ứng dụng định luật truyền thẳng của ánh sáng',
        description: 'Bài 3 trong chương Quang học.',
        content_json: {},
    },
    {
        title: 'Định luật phản xạ ánh sáng',
        description: 'Bài 4 trong chương Quang học.',
        content_json: {},
    },
    {
        title: 'Ảnh của một vật tạo bởi gương phẳng',
        description: 'Bài 5 trong chương Quang học.',
        content_json: {},
    },
    {
        title: 'Thực hành: Quan sát và vẽ ảnh của một vật tạo bởi gương phẳng',
        description: 'Bài 6 trong chương Quang học.',
        content_json: {},
    },
    {
        title: 'Gương cầu lồi',
        description: 'Bài 7 trong chương Quang học.',
        content_json: {},
    },
    {
        title: 'Gương cầu lõm',
        description: 'Bài 8 trong chương Quang học.',
        content_json: {},
    },
    {
        title: 'Nguồn âm',
        description: 'Bài 10 trong chương Âm học.',
        content_json: {},
    },
    {
        title: 'Độ cao của âm',
        description: 'Bài 11 trong chương Âm học.',
        content_json: {},
    },
    {
        title: 'Độ to của âm',
        description: 'Bài 12 trong chương Âm học.',
        content_json: {},
    },
    {
        title: 'Môi trường truyền âm',
        description: 'Bài 13 trong chương Âm học.',
        content_json: {},
    },
    {
        title: 'Phản xạ âm - tiếng vang',
        description: 'Bài 14 trong chương Âm học.',
        content_json: {},
    },
    {
        title: 'Chống ô nhiễm tiếng ồn',
        description: 'Bài 15 trong chương Âm học.',
        content_json: {},
    },
    {
        title: 'Sự nhiễm điện do cọ xát',
        description: 'Bài 17 trong chương Điện học.',
        content_json: {},
    },
    {
        title: 'Hai loại điện tích',
        description: 'Bài 18 trong chương Điện học.',
        content_json: {},
    },
    {
        title: 'Dòng điện - nguồn điện',
        description: 'Bài 19 trong chương Điện học.',
        content_json: {},
    },
    {
        title: 'Chất dẫn điện và chất cách điện - Dòng điện trong kim loại',
        description: 'Bài 20 trong chương Điện học.',
        content_json: {},
    },
    {
        title: 'Sơ đồ mạch điện - Chiều dòng điện',
        description: 'Bài 21 trong chương Điện học.',
        content_json: {},
    },
    {
        title: 'Tác dụng nhiệt và tác dụng phát sáng của dòng điện',
        description: 'Bài 22 trong chương Điện học.',
        content_json: {},
    },
];

async function seed() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/swd392';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for physics seeding...');

    try {
        const existingCourse = await Course.findOne({ course_name: courseData.course_name });
        if (existingCourse) {
            await Topic.deleteMany({ course_id: existingCourse._id });
            await Course.deleteOne({ _id: existingCourse._id });
        }

        await Topic.deleteMany({ title: { $in: topicData.map((topic) => topic.title) } });

        const createdCourse = await Course.create(courseData);
        const topicsToInsert = topicData.map((topic) => ({
            course_id: createdCourse._id,
            title: topic.title,
            description: topic.description,
            content_json: topic.content_json,
        }));

        const createdTopics = await Topic.insertMany(topicsToInsert);

        console.log(`Seeded course: ${createdCourse.course_name}`);
        console.log(`Seeded ${createdTopics.length} topics`);
        console.log('\n✅ Physics seed complete.');
    } catch (error) {
        console.error('\n❌ Physics seeding failed.');
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
