import dotenv from 'dotenv';
dotenv.config();

import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import multer from 'multer';//cannot use req.file without this import(Hung),dont know why
import CloudinaryUploadDemoRoute from './route/CloudinaryUploadDemoRoute.ts';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import UserRoute from './route/UserRoute.ts';

const spec = swaggerJSDoc({
    definition: { openapi: '3.0.0', info: { title: 'API', version: '1.0.0' } },
    apis: ['./src/swagger/*.ts'],
});
//
const app = express();
app.use(cookieParser(process.env.COOKIE_KEY));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FE || 'http://localhost:5173',
    credentials: true
}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));


//start the server and connect to MongoDB(Hung)
console.log(process.env.MONGO_URI);
(
    async () => {
        try {
            const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/'
            await mongoose.connect(mongoUri);
            console.log('Connected to MongoDB');
            app.use('/cloudinary-demo', CloudinaryUploadDemoRoute);
            app.use('/api', UserRoute);

            // Error handler must be after routes
            app.use((err: any, req: Request, res: Response, next: NextFunction) => {
                console.error(err.stack);
                res.status(500).json({ message: err.message || 'Something broke!' });
            });

            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            process.exit(1);
        }
    }
)();
// if failed to connect to MongoDB, exit the server(Hung)

export default app;