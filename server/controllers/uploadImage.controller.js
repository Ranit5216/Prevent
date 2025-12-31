import uploadImageClodinary from "../utils/uploadImageClodinary.js"
import logger from "../utils/logger.js"

const uploadImageController = async(request, response, next) => {
    try {
        const file = request.file

        if (!file) {
            return response.status(400).json({
                message: "No file provided",
                error: true,
                success: false
            })
        }

        const uploadFile = await uploadImageClodinary(file)

        return response.json({
            message: "Upload done",
            data: uploadFile,
            success: true,
            error: false
        })
    } catch (error) {
        logger.error("Image upload error:", error)
        return next(error) // Pass to error handler middleware
    }
}

export default uploadImageController
