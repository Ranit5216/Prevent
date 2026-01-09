import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import PendingRegistrationModel from '../models/pendingRegistration.model.js'
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageClodinary from '../utils/uploadImageClodinary.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'


export async function registerUserController(request, response) {
    try {
        const { name, email, password, mobile, role } = request.body
        // Allow role selection from client, default to USER if not provided
        const selectedRole = role || "USER"

        // Trim and validate inputs
        const trimmedName = name?.trim()
        const trimmedEmail = email?.trim().toLowerCase()

        if (!trimmedName || !trimmedEmail || !password || !mobile) {
            return response.status(400).json({
                message: "Provide email, name, password, and mobile",
                error: true,
                success: false
            })
        }

        // Validate name (2-50 characters, letters, spaces, hyphens, apostrophes only)
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return response.status(400).json({
                message: "Name must be between 2 and 50 characters",
                error: true,
                success: false
            })
        }
        if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
            return response.status(400).json({
                message: "Name can only contain letters, spaces, hyphens, and apostrophes",
                error: true,
                success: false
            })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedEmail)) {
            return response.status(400).json({
                message: "Please provide a valid email address",
                error: true,
                success: false
            })
        }

        // Validate mobile number (must be exactly 10 digits)
        if (!/^\d{10}$/.test(mobile)) {
            return response.status(400).json({
                message: "Please provide a valid 10-digit mobile number",
                error: true,
                success: false
            })
        }

        // Validate password length
        if (password.length < 6 || password.length > 128) {
            return response.status(400).json({
                message: "Password must be between 6 and 128 characters long",
                error: true,
                success: false
            })
        }

        // Check if email already exists in UserModel (verified users)
        const existingUserByEmail = await UserModel.findOne({ email: trimmedEmail })
        if (existingUserByEmail) {
            if (existingUserByEmail.verify_email) {
                return response.status(400).json({
                    message: "This email is already registered and verified. Please login instead.",
                    error: true,
                    success: false
                })
            }
            // If user exists but not verified, allow re-registration (delete old unverified user)
            await UserModel.deleteOne({ _id: existingUserByEmail._id })
        }

        // Check if email exists in PendingRegistration (unverified registrations)
        // If user goes back from OTP page, allow them to register again (delete old pending registration)
        const existingPendingByEmail = await PendingRegistrationModel.findOne({ email: trimmedEmail })
        if (existingPendingByEmail) {
            // Delete old pending registration to allow fresh registration
            await PendingRegistrationModel.deleteOne({ email: trimmedEmail })
        }

        // Check if mobile already exists in UserModel (verified users only)
        const existingUserByMobile = await UserModel.findOne({ mobile: Number(mobile) })
        if (existingUserByMobile) {
            // Only block if user is verified, allow re-registration for unverified
            if (existingUserByMobile.verify_email) {
                return response.status(400).json({
                    message: "Mobile number already registered",
                    error: true,
                    success: false
                })
            }
            // If mobile exists but not verified, allow re-registration (delete old user)
            await UserModel.deleteOne({ _id: existingUserByMobile._id })
        }

        // Check if mobile exists in PendingRegistration
        // If user goes back from OTP page, allow them to register again (delete old pending registration)
        const existingPendingByMobile = await PendingRegistrationModel.findOne({ mobile: Number(mobile) })
        if (existingPendingByMobile) {
            // Delete old pending registration to allow fresh registration
            await PendingRegistrationModel.deleteOne({ mobile: Number(mobile) })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt)

        // Generate OTP and expiry (10 minutes)
        const otp = generatedOtp().toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

        // Get optional businessName and businessType from request body
        const { businessName, businessType } = request.body

        const payload = {
            name: trimmedName,
            email: trimmedEmail,
            password: hashPassword,
            role: selectedRole, // Use selected role from client
            mobile: Number(mobile), // Convert to number to match schema
            otp,
            otpExpiry,
            ...(businessName && { businessName: businessName.trim() }),
            ...(businessType && { businessType: businessType.trim() })
        }

        // Save to PendingRegistration instead of UserModel
        // User will only be created in UserModel after OTP verification
        const newPendingRegistration = new PendingRegistrationModel(payload)
        const savePending = await newPendingRegistration.save()

        try {
            await sendEmail({
                sendTo: trimmedEmail,
                subject: "Your Prevent OTP for Email Verification",
                html: verifyEmailTemplate({
                    name: trimmedName,
                    otp
                })
            })

            return response.json({
                message: "Registration initiated. Please check your email for OTP verification.",
                error: false,
                success: true,
                data: { email: savePending.email }
            })
        } catch (emailError) {
            logger.error("Email sending failed:", emailError)
            // If email fails, delete the pending registration
            await PendingRegistrationModel.deleteOne({ _id: savePending._id })
            return response.status(500).json({
                message: "Failed to send OTP email. Please try again later.",
                error: true,
                success: false
            })
        }
    } catch (error) {
        logger.error("Registration error:", error)
        return response.status(500).json({
            message: "Internal server error. Please try again later.",
            error: true,
            success: false
        })
    }
}

// OTP verification controller
export async function verifyOtpController(request, response) {
    try {
        const { email, otp } = request.body
        const trimmedEmail = email?.trim().toLowerCase()

        if (!trimmedEmail || !otp) {
            return response.status(400).json({
                message: "Email and OTP are required",
                error: true,
                success: false
            })
        }

        // Find pending registration
        const pendingRegistration = await PendingRegistrationModel.findOne({ email: trimmedEmail })
        if (!pendingRegistration) {
            return response.status(400).json({
                message: "Registration not found. Please register again.",
                error: true,
                success: false
            })
        }

        // Verify OTP
        if (String(pendingRegistration.otp) !== String(otp)) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            })
        }

        // Check OTP expiry
        if (pendingRegistration.otpExpiry < new Date()) {
            // Delete expired pending registration
            await PendingRegistrationModel.deleteOne({ _id: pendingRegistration._id })
            return response.status(400).json({
                message: "OTP expired. Please register again.",
                error: true,
                success: false
            })
        }

        // Check if user already exists in UserModel (shouldn't happen, but safety check)
        const existingUser = await UserModel.findOne({ email: trimmedEmail })
        if (existingUser) {
            // If user exists but not verified, delete and recreate
            if (!existingUser.verify_email) {
                await UserModel.deleteOne({ _id: existingUser._id })
            } else {
                // User is already verified
                await PendingRegistrationModel.deleteOne({ _id: pendingRegistration._id })
                return response.status(400).json({
                    message: "Email already verified. Please login instead.",
                    error: true,
                    success: false
                })
            }
        }

        // Create user in UserModel after OTP verification
        const userPayload = {
            name: pendingRegistration.name,
            email: pendingRegistration.email,
            password: pendingRegistration.password,
            role: pendingRegistration.role,
            mobile: pendingRegistration.mobile,
            verify_email: true, // Mark as verified
            otp: null,
            otpExpiry: null
        }

        const newUser = new UserModel(userPayload)
        const savedUser = await newUser.save()

        // Delete pending registration after successful user creation
        await PendingRegistrationModel.deleteOne({ _id: pendingRegistration._id })

        // Generate tokens as in loginController
        const accesstoken = await generatedAccessToken(savedUser._id)
        const refreshToken = await genertedRefreshToken(savedUser._id)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        response.cookie('accessToken',accesstoken,cookiesOption)
        response.cookie('refreshToken',refreshToken,cookiesOption)

        return response.json({
            message: "Email verified successfully! Your account has been created.",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        })
    } catch (error) {
        logger.error("OTP verification error:", error)
        return response.status(500).json({
            message: error.message || "Internal server error. Please try again later.",
            error: true,
            success: false
        })
    }
}

// Resend OTP controller
export async function resendOtpController(request, response) {
    try {
        const { email } = request.body
        const trimmedEmail = email?.trim().toLowerCase()

        if (!trimmedEmail) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            })
        }

        // Find pending registration
        const pendingRegistration = await PendingRegistrationModel.findOne({ email: trimmedEmail })
        if (!pendingRegistration) {
            return response.status(400).json({
                message: "Registration not found. Please register again.",
                error: true,
                success: false
            })
        }

        // Check if OTP is still valid (within last 9 minutes, allow resend)
        const timeRemaining = pendingRegistration.otpExpiry - new Date()
        if (timeRemaining < 60000) { // Less than 1 minute remaining
            // Generate new OTP and expiry
            const otp = generatedOtp().toString()
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
            pendingRegistration.otp = otp
            pendingRegistration.otpExpiry = otpExpiry
            await pendingRegistration.save()

            try {
                await sendEmail({
                    sendTo: trimmedEmail,
                    subject: "Your Prevent OTP for Email Verification (Resend)",
                    html: verifyEmailTemplate({
                        name: pendingRegistration.name,
                        otp
                    })
                })
                return response.json({
                    message: "New OTP sent successfully. Please check your email.",
                    error: false,
                    success: true
                })
            } catch (emailError) {
                logger.error("Email sending failed:", emailError)
                return response.status(500).json({
                    message: "Failed to send OTP email. Please try again later.",
                    error: true,
                    success: false
                })
            }
        } else {
            // Resend existing OTP
            try {
                await sendEmail({
                    sendTo: trimmedEmail,
                    subject: "Your Prevent OTP for Email Verification (Resend)",
                    html: verifyEmailTemplate({
                        name: pendingRegistration.name,
                        otp: pendingRegistration.otp
                    })
                })
                return response.json({
                    message: "OTP resent successfully. Please check your email.",
                    error: false,
                    success: true
                })
            } catch (emailError) {
                logger.error("Email sending failed:", emailError)
                return response.status(500).json({
                    message: "Failed to send OTP email. Please try again later.",
                    error: true,
                    success: false
                })
            }
        }
    } catch (error) {
        logger.error("Resend OTP error:", error)
        return response.status(500).json({
            message: error.message || "Internal server error. Please try again later.",
            error: true,
            success: false
        })
    }
}

//login controller
export async function loginController(request,response) {
    try {
        const { email , password } = request.body

        if(!email || !password){
            return response.status(400).json({
                message : "provide email, password",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "User not register",
                error : true,
                success : false
            })
        }

        // Prevent login if email is not verified
        // All users must verify their email before logging in
        if(!user.verify_email){
            return response.status(400).json({
                message: "Please verify your email with OTP before logging in.",
                error: true,
                success: false
            })
        }

        if(user.status !== "Active"){
            return response.status(400).json({
                message : "Contact to Admin",
                error : true,
                success : false
            })
        }

        const checkPassword = await bcryptjs.compare(password,user.password)

        if(!checkPassword){
            return response.status(400).json({
                message : "Check your password",
                error : true,
                success : false
            })
        }

        const accesstoken = await generatedAccessToken(user._id)
        const refreshToken = await genertedRefreshToken(user._id)

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date : new Date()
        })

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        response.cookie('accessToken',accesstoken,cookiesOption)
        response.cookie('refreshToken',refreshToken,cookiesOption)

        return response.json({
            message : "Login successfully",
            error : false,
            success : true,
            data : {
                accesstoken,
                refreshToken
            }
        })

        
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
        
    }
}

//logout controller
export async function logoutController(request,response){
    try {
        const userid = request.userId //middleware

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        return response.json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//upload user avatar
export async function uploadAvatar(request,response){
    try {
        const userId = request.userId  // auth middleware
        const image = request.file  // multer middleware

        const upload = await uploadImageClodinary(image)

        const updateUser = await UserModel.findByIdAndUpdate(userId,{
            avatar : upload.url
        })
        
        return response.json({
            message : "upload profile",
            success : true,
            error : false,
            data : {
                _id : userId,
                avatar : upload.url
            }
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
        
    }
    
}

//update user details
export async function updateUserDetails(request,response){
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password, facebookLink, youtubeLink, instagramLink, location } = request.body 

        // Check if user is admin and validate location is provided
        const user = await UserModel.findById(userId)
        if (user && user.role === 'ADMIN' && location !== undefined && (!location || location.trim() === '')) {
            return response.status(400).json({
                message: "City location is required for admin users",
                error: true,
                success: false
            })
        }

        let hashPassword = ""

        if(password){
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password,salt)
        }

        const updateData = {
            ...(name && { name : name }),
            ...(email && { email : email }),
            ...(mobile && { mobile : mobile }),
            ...(password && { password : hashPassword }),
            ...(facebookLink !== undefined && { facebookLink : facebookLink }),
            ...(youtubeLink !== undefined && { youtubeLink : youtubeLink }),
            ...(instagramLink !== undefined && { instagramLink : instagramLink }),
        }

        // Always update location if provided in request body (even if empty string)
        if (location !== undefined) {
            updateData.location = location ? location.trim() : ""
        }

        await UserModel.updateOne({ _id : userId}, updateData)

        // Fetch updated user data to return
        const updatedUser = await UserModel.findById(userId).select('-password -refresh_token')

        return response.json({
            message : "Updated successfully",
            error : false,
            success : true,
            data : updatedUser
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//forgot password not login
export async function forgotPasswordController(request,response) {
    try {
        const { email } = request.body 

        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message: "Email not found",
                error: true,
                success: false
            })
        }

        const otp = generatedOtp()
        const expireTime = new Date(Date.now() + 60 * 60 * 1000) // 1hr from now

        try {
            await sendEmail({
                sendTo: email,
                subject: "Forgot password from PreEvent",
                html: forgotPasswordTemplate({
                    name: user.name,
                    otp: otp
                })
            })

            // Only update the OTP if email was sent successfully
            const update = await UserModel.findByIdAndUpdate(user._id, {
                forgot_password_otp: otp,
                forgot_password_expiry: expireTime.toISOString()
            })

            return response.json({
                message: "OTP has been sent to your email",
                error: false,
                success: true
            })
        } catch (emailError) {
            logger.error("Failed to send OTP email:", emailError)
            return response.status(500).json({
                message: "Failed to send OTP. Please try again later.",
                error: true,
                success: false
            })
        }

    } catch (error) {
        logger.error("Forgot password error:", error)
        return response.status(500).json({
            message: error.message || "Something went wrong",
            error: true,
            success: false
        })
    }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(request,response){
    try {
        const { email , otp }  = request.body

        if(!email || !otp){
            return response.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const currentTime = new Date();
        if(new Date(user.forgot_password_expiry) < currentTime){
            return response.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }

        if(String(otp) !== String(user.forgot_password_otp)){
            return response.status(400).json({
                message : "Invalid otp",
                error : true,
                success : false
            })
        }

        //if otp is not expired
        //otp === user.forgot_password_otp

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
             forgot_password_otp : "",
             forgot_password_expiry : ""
        })
        
        return response.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//reset the password
export async function resetpassword(request,response){
    try {
        const { email , newPassword, confirmPassword } = request.body 

        if(!email || !newPassword || !confirmPassword){
            return response.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }

        if(newPassword !== confirmPassword){
            return response.status(400).json({
                message : "newPassword and confirmPassword must be same.",
                error : true,
                success : false,
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword,salt)

        const update = await UserModel.findOneAndUpdate(user._id,{
            password : hashPassword
        })

        return response.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//refresh token controler
export async function refreshToken(request,response){
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if(!refreshToken){
            return response.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

        const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken){
            return response.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.cookie('accessToken',newAccessToken,cookiesOption)

        return response.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//get login user details
export async function userDetails(request,response){
    try {
        const userId  = request.userId

        const user = await UserModel.findById(userId).select('-password -refresh_token')

        return response.json({
            message : 'user details',
            data : user,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : "Something is wrong",
            error : true,
            success : false
        })
    }
}

