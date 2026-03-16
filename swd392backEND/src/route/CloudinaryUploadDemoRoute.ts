import { Router } from "express";
import {
    deleteImage,
    imageMulterUpload,
    updateImage,
    uploadImage,
    uploadFile,
    updateFile,
    deleteFile,
    filesMulterUpload
} from "../ultis/cloudinary.ts";

const route = Router();

// File upload routes
route.post('/file', filesMulterUpload.single('file'), async (req, res, next) => {
    try {
        console.log('File upload started...');
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log('File received:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const url = await uploadFile(req.file.buffer, req.file.originalname);
        console.log('File uploaded successfully:', url);
        return res.json({ url, filename: req.file.originalname });
    } catch (error) {
        console.error('File upload error:', error);
        next(error);
    }
});

route.put('/file/:url', filesMulterUpload.single('file'), async (req, res, next) => {
    const { url } = req.params;
    try {
        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const newUrl = await updateFile(decodeURIComponent(url as string), req.file.buffer, req.file.originalname);
        return res.json({ url: newUrl, filename: req.file.originalname });
    } catch (error) {
        next(error);
    }
});

route.delete('/file/:url', async (req, res, next) => {
    const { url } = req.params;
    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }
    try {
        const result = await deleteFile(decodeURIComponent(url));
        if (result) {
            return res.json({ message: 'File deleted successfully' });
        } else {
            return res.status(404).json({ error: 'File not found or already deleted' });
        }
    } catch (error) {
        next(error);
    }
});
//test upload image route
route.post('/image', imageMulterUpload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const url = await uploadImage(req.file.buffer);
        return res.json({ url });
    } catch (error) {
        next(error);
    }

});

route.put('/image/:url', imageMulterUpload.single('image'), async (req, res, next) => {
    const { url } = req.params;
    try {
        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const newUrl = await updateImage(url as string, req.file.buffer);
        return res.json({ url: newUrl });
    } catch (error) {
        next(error);
    }
});

route.delete('/image/:url', async (req, res, next) => {
    const { url } = req.params;
    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }
    try {
        await deleteImage(url);
        return res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        next(error);
    }
});

//skibidi dom dom
export default route;