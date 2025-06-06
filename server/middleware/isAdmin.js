import UserModel from '../models/user.model.js'

export const isAdmin = async (request, response, next) => {
    try {
        const userId = request.userId

        const user = await UserModel.findById(userId)
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        if (user.role !== "ADMIN") {
            return response.status(403).json({
                message: "Access denied. Admin privileges required",
                error: true,
                success: false
            })
        }

        next()
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
} 