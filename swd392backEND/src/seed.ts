// @ts-nocheck
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from './entities/User.ts';
import { Admin } from './entities/Admin.ts';
import { Teacher } from './entities/Teacher.ts';
import { Course } from './entities/Course.ts';
import { Class } from './entities/Class.ts';
import { Topic } from './entities/Topic.ts';
import { ClassMaterial } from './entities/ClassMaterial.ts';
import { Slide } from './entities/Slide.ts';
import { Quiz } from './entities/Quiz.ts';
import { Question } from './entities/Question.ts';
import { QuizAttempt } from './entities/QuizAttempt.ts';
import { Result } from './entities/Result.ts';
import { Render2D } from './entities/Render2D.ts';
import { File } from './entities/File.ts';
import { Feedback } from './entities/Feedback.ts';
import { Enroll } from './entities/Enroll.ts';
import { AiRequest } from './entities/AiRequest.ts';
import { AiContent } from './entities/AiContent.ts';
import { Log } from './entities/Log.ts';
import { ProgressClassMaterial } from './entities/ProgressClassMaterial.ts';

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
            Course.deleteMany({}),
            Class.deleteMany({}),
            Topic.deleteMany({}),
            ClassMaterial.deleteMany({}),
            Slide.deleteMany({}),
            Quiz.deleteMany({}),
            Question.deleteMany({}),
            QuizAttempt.deleteMany({}),
            Result.deleteMany({}),
            Render2D.deleteMany({}),
            File.deleteMany({}),
            Feedback.deleteMany({}),
            Enroll.deleteMany({}),
            AiRequest.deleteMany({}),
            AiContent.deleteMany({}),
            Log.deleteMany({}),
            ProgressClassMaterial.deleteMany({}),
        ]);
        console.log('Cleared all collections.');

        // ─── 1. Users (10) ───
        //password : 67Hashed_password
        const users = await User.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                role: i < 2 ? 'admin' : i < 5 ? 'teacher' : 'student',
                username: `user_${i + 1}`,
                email: `user${i + 1}@example.com`,
                password: '$2a$12$cAs/1b1rLMGGZwWqM8jZ3OH1fUSpPjkPBJ8IpFUUWA6nnHIGGnYk.',
                date_create: new Date(),
                status: 'active',
            }))
        );
        console.log('Seeded 10 Users');

        // ─── 2. Admins (10) — first 10 users mapped ───
        const admins = await Admin.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                user_id: users[i]._id,
                authorization_lvl: (i % 3) + 1,
                date_create: new Date(),
            }))
        );
        console.log('Seeded 10 Admins');

        // ─── 3. Teachers (10) ───
        const teachers = await Teacher.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                user_id: users[i]._id,
                credential: `Teaching Certificate #${1000 + i}`,
                date_create: new Date(),
            }))
        );
        console.log('Seeded 10 Teachers');

        // ─── 4. Courses (10) ───
        const courseNames = [
            'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
            'Geography', 'English', 'Computer Science', 'Art', 'Music',
        ];
        const courses = await Course.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                course_name: courseNames[i],
                grade_level: (i % 12) + 1, // Numbers 1-12 instead of strings
                change_log: null,
                date_create: new Date(),
                status: 'active',
            }))
        );
        console.log('Seeded 10 Courses');

        // ─── 5. Classes (10) ───
        const classes = await Class.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                keypass: `CLASSKEY_${i + 1}_${Date.now()}`,
                course_id: courses[i % courses.length]._id,
                teacher_id: teachers[i % teachers.length]._id,
                class_name: `${courseNames[i]} - Section ${String.fromCharCode(65 + i)}`,
                img_cover_link: 'https://c.tenor.com/MaXmanjOI6sAAAAd/tenor.gif',
                keywords: `${courseNames[i].toLowerCase()}, education, learning`,
                date_create: new Date(),
                status: 'active',
            }))
        );
        console.log('Seeded 10 Classes');

        // ─── 6. Topics (10) ───
        const topicTitles = [
            'Introduction', 'Fundamentals', 'Core Concepts', 'Advanced Theory',
            'Practical Applications', 'Case Studies', 'Lab Work', 'Review',
            'Project Work', 'Final Assessment',
        ];
        const topics = await Topic.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                course_id: courses[i % courses.length]._id,
                title: topicTitles[i],
                description: `Detailed study of ${topicTitles[i].toLowerCase()} for ${courseNames[i % courseNames.length]}`,
            }))
        );
        console.log('Seeded 10 Topics');

        // ─── 7. ClassMaterials (10) ───
        const materialTypes = ['file', 'slide', '2d_render', 'quiz'];
        const classMaterials = await ClassMaterial.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                topic_id: topics[i % topics.length]._id,
                type: materialTypes[i % materialTypes.length],
                order_num: i + 1,
                class_assign_id: classes[i % classes.length]._id,
                title: `Material ${i + 1} - ${materialTypes[i % materialTypes.length]}`,
                dateUpdate: null,
                dateCreate: new Date(),
                content_id: null,
                is_ai_material: i % 3 === 0,
                ai_content_id: null,
            }))
        );
        console.log('Seeded 10 ClassMaterials');

        // ─── 8. Slides (10) ───
        const slides = await Slide.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                material_id: classMaterials[i]._id,
                slide_name: `Slide Deck ${i + 1}`,
                file_path: `/uploads/slides/slide_${i + 1}.pdf`,
            }))
        );
        console.log('Seeded 10 Slides');

        // ─── 9. Quizzes (10) ───
        const quizzes = await Quiz.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                material_id: classMaterials[i]._id,
                title: `Quiz ${i + 1}: ${topicTitles[i % topicTitles.length]}`,
                type: i % 2 === 0 ? 'multiple_choice' : 'true_false',
                available_date: new Date(),
                max_attempt_number: 3,
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                status: true,
            }))
        );
        console.log('Seeded 10 Quizzes');

        // ─── 10. Questions (10) ───
        const questions = await Question.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                quiz_id: quizzes[i % quizzes.length]._id,
                options: [
                    { text: `Option A for Q${i + 1}`, index: 0 },
                    { text: `Option B for Q${i + 1}`, index: 1 },
                    { text: `Option C for Q${i + 1}`, index: 2 },
                    { text: `Option D for Q${i + 1}`, index: 3 },
                ],
                correct_index: i % 4,
            }))
        );
        console.log('Seeded 10 Questions');

        // ─── 11. QuizAttempts (10) ───
        const studentUsers = users.filter((_, i) => i >= 5); // users 5-9 are students
        const quizAttempts = await QuizAttempt.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                quiz_id: quizzes[i % quizzes.length]._id,
                user_id: studentUsers[i % studentUsers.length]._id,
                attempt_number: Math.floor(i / 5) + 1,
                date: new Date(),
                record_json: {
                    answers: [0, 1, 2, 3],
                    score: Math.floor(Math.random() * 100),
                    time_taken: Math.floor(Math.random() * 3600),
                },
            }))
        );
        console.log('Seeded 10 QuizAttempts');

        // ─── 12. Results (10) ───
        await Result.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                quiz_attempt_id: quizAttempts[i % quizAttempts.length]._id,
                text: `Question ${i + 1}: What is the answer?`,
                options: [
                    { text: 'Option A', index: 0 },
                    { text: 'Option B', index: 1 },
                    { text: 'Option C', index: 2 },
                    { text: 'Option D', index: 3 },
                ],
                options_picked_index: i % 4,
                isCorrect: i % 2 === 0,
            }))
        );
        console.log('Seeded 10 Results');

        // ─── 13. Render2D (10) ───
        await Render2D.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                material_id: classMaterials[i]._id,
                render_data: {
                    canvas_width: 800,
                    canvas_height: 600,
                    objects: [
                        { type: 'circle', x: 100 + i * 10, y: 100, radius: 30, color: '#ff0000' },
                        { type: 'rect', x: 200 + i * 10, y: 200, width: 60, height: 40, color: '#00ff00' },
                        { type: 'text', x: 300, y: 300, value: `Scene ${i + 1}`, fontSize: 18 },
                    ],
                },
            }))
        );
        console.log('Seeded 10 Render2D');

        // ─── 14. Files (10) ───
        const fileExtensions = ['pdf', 'docx', 'pptx', 'xlsx', 'png', 'jpg', 'mp4', 'zip', 'txt', 'csv'];
        await File.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                material_id: classMaterials[i]._id,
                file_name: `document_${i + 1}.${fileExtensions[i]}`,
                file_path: `/uploads/files/document_${i + 1}.${fileExtensions[i]}`,
            }))
        );
        console.log('Seeded 10 Files');

        // ─── 15. Feedbacks (10) ───
        await Feedback.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                material_id: classMaterials[i % classMaterials.length]._id,
                user_id: users[i % users.length]._id,
                rating: (i % 5) + 1,
                comment: [
                    'Great material, very helpful!',
                    'Could use more examples.',
                    'Excellent presentation and content.',
                    'A bit too advanced for beginners.',
                    'Well structured and easy to follow.',
                    'Needs updated references.',
                    'Perfect for exam preparation.',
                    'Interactive elements would be nice.',
                    'Very detailed and thorough.',
                    'Good overview of the topic.',
                ][i],
                date: new Date(),
            }))
        );
        console.log('Seeded 10 Feedbacks');

        // ─── 16. Enrolls (10) ───
        const enrolls = await Enroll.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                class_id: classes[i % classes.length]._id,
                student_id: studentUsers[i % studentUsers.length]._id,
                date_join: new Date(),
                status: 'in_progress',
                date_end: null,
            }))
        );
        console.log('Seeded 10 Enrolls');

        // ─── 17. AiRequests (10) ───
        const aiPrompts = [
            'Generate a quiz about photosynthesis',
            'Create a summary of World War II',
            'Explain Newton\'s laws of motion',
            'Generate flashcards for chemistry elements',
            'Create a practice test for algebra',
            'Summarize the water cycle',
            'Generate questions about cell biology',
            'Create a study guide for geography',
            'Explain Shakespeare\'s themes',
            'Generate music theory exercises',
        ];
        const aiRequests = await AiRequest.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                user_id: users[i % users.length]._id,
                prompt: aiPrompts[i],
                type: i % 2 === 0 ? 'quiz_generation' : 'content_summary',
                date: new Date(),
            }))
        );
        console.log('Seeded 10 AiRequests');

        // ─── 18. AiContents (10) ───
        await AiContent.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                ai_request_id: aiRequests[i]._id,
                review_status: ['pending', 'approved', 'rejected'][i % 3],
                content_type: i % 2 === 0 ? 'quiz' : 'summary',
                record_json: {
                    generated_text: `AI-generated content for: ${aiPrompts[i]}`,
                    model: 'gpt-4',
                    tokens_used: 150 + i * 20,
                    confidence: 0.85 + (i % 5) * 0.03,
                },
            }))
        );
        console.log('Seeded 10 AiContents');

        // ─── 19. Logs (10) ───
        const logActions = [
            'Created user', 'Updated course', 'Deleted class', 'Approved content',
            'Banned user', 'Restored backup', 'Modified settings', 'Reviewed feedback',
            'Generated report', 'Cleared cache',
        ];
        await Log.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                admin_id: admins[i % admins.length]._id,
                action: logActions[i],
                action_type: ['create', 'update', 'delete', 'review'][i % 4],
                status: i % 5 === 0 ? 'failed' : 'success',
            }))
        );
        console.log('Seeded 10 Logs');

        // ─── 20. ProgressClassMaterials (10) ───
        await ProgressClassMaterial.insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                enroll_id: enrolls[i % enrolls.length]._id,
                classmaterial_id: classMaterials[i % classMaterials.length]._id,
                completion_status: ['in_progress', 'completed'][i % 2],
                date_completed: i % 2 === 1 ? new Date() : null,
            }))
        );
        console.log('Seeded 10 ProgressClassMaterials');

        console.log('\n✅ Seeding complete! 10 documents inserted per entity (20 entities, 200 documents total).');

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
