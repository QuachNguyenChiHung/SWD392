import { Router } from "express";
import { deleteImage, multerUpload, updateImage, uploadImage } from "../ultis/cloudinary.ts";

const route = Router();

//test upload image route
route.post('/', multerUpload.single('image'), async (req, res, next) => {
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

route.put('/:url', multerUpload.single('image'), async (req, res, next) => {
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

route.delete('/:url', async (req, res, next) => {
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

export default route;