import jwt from 'jsonwebtoken'

const generatedAccessToken = async(userId) => {
    const token = await jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: '30m' } // Reduced from 5h to 30 minutes for better security
    )

    return token
}

export default generatedAccessToken