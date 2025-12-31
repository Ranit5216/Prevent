import multer from 'multer'

const storage = multer.memoryStorage()

// Configure multer with file size limits
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10, // Maximum 10 files
        fieldSize: 2 * 1024 * 1024 // 2MB field size
    },
    fileFilter: (request, file, cb) => {
        // Allow images and documents
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf'
        ]
        
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false)
        }
    }
})

export default upload