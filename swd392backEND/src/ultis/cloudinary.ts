import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();
import crypto from 'crypto';
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME || '',
    api_key: CLOUDINARY_API_KEY || '',
    api_secret: CLOUDINARY_API_SECRET || '',
});
const Cloudinary = cloudinary.v2;
const imageMulterUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
            new Error('Only image files are allowed');
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
const filesMulterUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
function getCloudinaryPublicId(url: string): string {
    const filename = url.split('/').pop();
    if (!filename) throw new Error('Invalid Cloudinary URL');
    return filename.split('.')[0] || '';
}



//upload by buffer(req.file.buffer)
async function uploadImage(buffer: Buffer | undefined): Promise<string> {
    if (!buffer) throw new Error('No file buffer provided');
    return new Promise((resolve, reject) => {
        Cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) {
                return reject(error);
            }
            if (!result?.secure_url) {
                return reject(new Error('Cloudinary returned no URL'));
            }
            return resolve(result.secure_url);
        }).end(buffer);
    });
}

//delete image by url(must be cloudinary url)
async function deleteImage(url: string) {
    const publicId = getCloudinaryPublicId(url);
    if (!publicId) throw new Error('Invalid public ID');
    try {
        await Cloudinary.uploader.destroy(publicId, { invalidate: true });
        return true;
    } catch (error) {
        return false;
    }
}

//update image by delete old one and upload new one
async function updateImage(oldUrl: string, newBuffer: Buffer | undefined) {
    const deleteResult = await deleteImage(oldUrl);
    if (!deleteResult) {
        throw new Error('Failed to delete old image');
    }
    return await uploadImage(newBuffer);
}

//upload by buffer(req.file.buffer)
async function uploadFile(buffer: Buffer | undefined, originalname: string): Promise<string> {
    if (!buffer) throw new Error('No file buffer provided');
    console.log('Uploading file to Cloudinary...');
    const uniqueID = crypto.randomUUID();
    const extension = originalname.split('.').pop();
    return new Promise((resolve, reject) => {
        Cloudinary.uploader.upload_stream({ resource_type: 'raw', folder: 'files', public_id: `${uniqueID}.${extension}` }, (error, result) => {
            if (error) {
                return reject(error);
            }
            if (!result?.secure_url) {
                return reject(new Error('Cloudinary returned no URL'));
            }
            return resolve(result.secure_url);
        }).end(buffer);
    });
}

//delete image by url(must be cloudinary url)
async function deleteFile(url: string) {
    const publicId = getCloudinaryPublicId(url);
    if (!publicId) throw new Error('Invalid public ID');
    try {
        await Cloudinary.uploader.destroy(publicId, { invalidate: true });
        return true;
    } catch (error) {
        return false;
    }
}

//update image by delete old one and upload new one
async function updateFile(oldUrl: string, newBuffer: Buffer | undefined, originalname: string) {
    const deleteResult = await deleteFile(oldUrl);
    if (!deleteResult) {
        throw new Error('Failed to delete old file');
    }
    return await uploadFile(newBuffer, originalname);
}

export { uploadImage, deleteImage, updateImage, uploadFile, deleteFile, updateFile, imageMulterUpload, filesMulterUpload };