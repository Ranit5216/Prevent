import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide name"]
    },
    email: {
        type: String,
        required: [true, "Provide email"],
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Provide password"]
    },
    mobile: {
        type: Number,
        required: [true, "Provide mobile number"]
    },
    role: {
        type: String,
        enum: ['ADMIN', "USER"],
        default: "USER"
    },
    businessName: {
        type: String,
        default: ""
    },
    businessType: {
        type: String,
        default: ""
    },
    otp: {
        type: String,
        required: true
    },
    otpExpiry: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

// TTL index for auto-cleanup of expired registrations (MongoDB will automatically delete documents after otpExpiry date)
pendingRegistrationSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 })

const PendingRegistrationModel = mongoose.model("PendingRegistration", pendingRegistrationSchema)

export default PendingRegistrationModel

