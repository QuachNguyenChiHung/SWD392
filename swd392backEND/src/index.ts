import dotenv from 'dotenv';
dotenv.config();

import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import CloudinaryUploadDemoRoute from './route/CloudinaryUploadDemoRoute.ts';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import UserRoute from './route/UserRoute.ts';
import CourseRoute from './route/CourseRoute.ts';
import EnrollRoute from './route/EnrollRoute.ts';
import TopicRoute from './route/TopicRoute.ts';
import ClassRoute from './route/ClassRoute.ts';
import ClassMaterialRoute from './route/ClassMaterialRoute.ts';
import DashboardRoute from './route/DashboardRoute.ts';
import QuizRoute from './route/QuizRoute.ts';
import QuestionRoute from './route/QuestionRoute.ts';
import SlideRoute from './route/SlideRoute.ts';
import FileRoute from './route/FileRoute.ts';
import ProgressClassMaterialRoute from './route/ProgressClassMaterialRoute.ts';
import QuizAttemptRoute from './route/QuizAttemptRoute.ts';
import ClaudeMemeRoute from './route/ClaudeMemeRoute.ts';
import TeacherRequestRoute from './route/TeacherRequestRoute.ts';
import TeacherRoute from './route/TeacherRoute.ts';


const spec = swaggerJSDoc({
    definition: { openapi: '3.0.0', info: { title: 'API', version: '1.0.0' } },
    apis: ['./src/swagger/*.ts'],
});
//
const app = express();
app.use(cookieParser(process.env.COOKIE_KEY || 'default_cookie_key'));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [
        process.env.FE || 'http://localhost:5173',
        `http://localhost:${process.env.PORT || 3000}`,
    ],
    credentials: true
}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));


//start the server and connect to MongoDB(Hung)
console.log(process.env.MONGO_URI);
(
    async () => {
        const localUri = 'mongodb://localhost:27017/swd392';
        const primaryUri = process.env.MONGO_URI;

        async function tryConnect(uri: string, label: string) {
            try {
                console.log(`Attempting MongoDB connection (${label}): ${uri}`);
                // short server selection timeout to fail fast on unreachable hosts
                await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 } as any);
                console.log(`Connected to MongoDB (${label})`);
                return true;
            } catch (err) {
                console.error(`Failed to connect to MongoDB (${label}):`, err);
                return false;
            }
        }

        try {
            let connected = false;
            if (primaryUri) {
                connected = await tryConnect(primaryUri, 'MONGO_URI');
            } else {
                console.log('MONGO_URI not set — skipping primary attempt.');
            }

            if (!connected) {
                connected = await tryConnect(localUri, 'localhost');
                if (!connected) {
                    console.error('Could not connect to MongoDB (primary and localhost). Exiting.');
                    // kill the process as requested
                    process.exit(1);
                }
            }
app.get('/',(_req,res)=>{
    res.send("Hello");
});
            app.use('/cloudinary-demo', CloudinaryUploadDemoRoute);
            app.use('/api', UserRoute);
            app.use('/api', CourseRoute);
            app.use('/api', EnrollRoute);
            app.use('/api', TopicRoute);
            app.use('/api', ClassRoute);
            app.use('/api', ClassMaterialRoute);
            app.use('/api', DashboardRoute);
            app.use('/api', QuizRoute);
            app.use('/api', QuestionRoute);
            app.use('/api', SlideRoute);
            app.use('/api', FileRoute);
            app.use('/api', ProgressClassMaterialRoute);
            app.use('/api', QuizAttemptRoute);
            app.use('/api', ClaudeMemeRoute);
            app.use('/api', TeacherRequestRoute);
            app.use('/api', TeacherRoute);
            // Error handler must be after routes
            app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
                console.error(err);
                try {
                    res.status(500).json({ message: JSON.parse(err.message.message || err.message || { "message": 'Something broke!' }) });
                } catch (error) {
                    res.status(500).json({ "message": 'Something broke!' });
                }

            });

            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        } catch (error) {
            console.error('Unexpected error during startup:', error);
            process.exit(1);
        }
    }
)();
// if failed to connect to MongoDB, exit the server(Hung)

export default app;