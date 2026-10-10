import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = process.env.MEDIA_DIR || '/srv/chromatik/media';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = (req as any).user?._id || 'anonymous';
        const year = new Date().getFullYear();
        
        let subfolder = 'misc';
        if (file.fieldname === 'art') subfolder = 'art';
        else if (file.fieldname === 'untaggedAudio') subfolder = 'untagged';
        else if (file.fieldname === 'taggedAudio') subfolder = 'tagged';
        else if (file.fieldname === 'stems') subfolder = 'stems';
        else if (file.fieldname === 'avatar') subfolder = 'avatar';

        const dir = path.join(uploadDir, String(userId), String(year), subfolder);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // allow audio, images, zip
    const allowedMimeTypes = [
        'audio/mpeg', 
        'audio/wav', 
        'audio/x-wav', 
        'application/zip',
        'application/x-zip-compressed',
        'image/jpeg',
        'image/png'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only audio, zip and images are allowed.`));
    }
};

export const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 2048 * 1024 * 1024 // 500 MB max file size
    }
});
