import React, { useState, useEffect } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaArrowRight } from "react-icons/fa";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import ValidationMessage from '../components/ValidationMessage';

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        role: "USER" // Default role
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isVendorMode, setIsVendorMode] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const [touchedFields, setTouchedFields] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 640)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const toggleVendorMode = (e) => {
        e.preventDefault()
        setIsVendorMode(!isVendorMode)
        setData(prev => ({
            ...prev,
            role: !isVendorMode ? "ADMIN" : "USER"
        }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })

        // Real-time validation
        validateField(name, value)
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        setTouchedFields(prev => ({ ...prev, [name]: true }))
        validateField(name, value)
        
        // Handle styling for regular input fields (name, email, etc.)
        if (['name', 'email', 'businessName'].includes(name)) {
            e.target.style.borderColor = '#E5E7EB'
            e.target.style.backgroundColor = '#F3F4F6'
            e.target.style.boxShadow = 'none'
            e.target.style.transform = 'translateY(0)'
        }
        
        // Handle styling for mobile field
        if (name === 'mobile') {
            const wrapper = e.target.closest('#mobile-wrapper')
            const countryCode = wrapper?.querySelector('div')
            e.target.style.borderColor = '#E5E7EB'
            e.target.style.background = '#F3F4F6'
            if (countryCode) {
                countryCode.style.borderColor = '#E5E7EB'
                countryCode.style.background = '#F3F4F6'
            }
            if (wrapper) {
                wrapper.style.boxShadow = 'none'
            }
            e.target.style.transform = 'translateY(0)'
        }
        
        // Handle styling for password fields
        if (name === 'password' || name === 'confirmPassword') {
            const wrapperId = name === 'password' ? '#password-wrapper' : '#confirm-password-wrapper'
            const wrapper = e.target.closest(wrapperId)
            if (wrapper) {
                wrapper.style.borderColor = '#E5E7EB'
                wrapper.style.background = '#F3F4F6'
                wrapper.style.boxShadow = 'none'
                wrapper.style.transform = 'translateY(0)'
            }
        }
    }

    const validateField = (name, value) => {
        let error = ''
        let isValid = true

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    error = 'Name is required'
                    isValid = false
                } else if (!isValidName(value)) {
                    error = 'Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes'
                    isValid = false
                } else {
                    error = 'Name looks good!'
                    isValid = true
                }
                break
            case 'email':
                if (!value.trim()) {
                    error = 'Email is required'
                    isValid = false
                } else if (!isValidEmail(value)) {
                    error = 'Please enter a valid email address'
                    isValid = false
                } else {
                    error = 'Email looks good!'
                    isValid = true
                }
                break
            case 'mobile':
                if (!value) {
                    error = 'Mobile number is required'
                    isValid = false
                } else if (!/^\d{10}$/.test(value)) {
                    error = 'Please enter a valid 10-digit mobile number'
                    isValid = false
                } else {
                    error = 'Mobile number looks good!'
                    isValid = true
                }
                break
            case 'password':
                if (!value) {
                    error = 'Password is required'
                    isValid = false
                } else if (!isValidPassword(value)) {
                    error = 'Password must be between 6 and 128 characters'
                    isValid = false
                } else {
                    error = 'Password looks good!'
                    isValid = true
                }
                break
            case 'confirmPassword':
                if (!value) {
                    error = 'Please confirm your password'
                    isValid = false
                } else if (value !== data.password) {
                    error = 'Passwords do not match'
                    isValid = false
                } else {
                    error = 'Passwords match!'
                    isValid = true
                }
                break
            default:
                break
        }

        setValidationErrors(prev => ({
            ...prev,
            [name]: { message: error, isValid }
        }))
    }

    // Email validation function
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    // Name validation function
    const isValidName = (name) => {
        const trimmedName = name.trim()
        return trimmedName.length >= 2 && trimmedName.length <= 50 && /^[a-zA-Z\s'-]+$/.test(trimmedName)
    }

    // Password validation function
    const isValidPassword = (password) => {
        return password.length >= 6 && password.length <= 128
    }

    const valideValue = isVendorMode 
        ? data.name && data.email && data.mobile && data.password && data.confirmPassword && data.businessName && data.businessType
        : data.name && data.email && data.mobile && data.password && data.confirmPassword

    const handleSubmit = async(e)=>{
        e.preventDefault()

        // Validate name
        if (!isValidName(data.name)) {
            toast.error("Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes")
            return
        }

        // Validate email format
        if (!isValidEmail(data.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        // Validate mobile number
        if (!/^\d{10}$/.test(data.mobile)) {
            toast.error("Please enter a valid 10-digit mobile number")
            return
        }

        // Validate password
        if (!isValidPassword(data.password)) {
            toast.error("Password must be between 6 and 128 characters long")
            return
        }

        if(data.password !== data.confirmPassword){
            toast.error("Password and confirm password must be same")
            return
        }

        // Admin-specific validations
        if(isVendorMode) {
            if(!data.businessName || !data.businessName.trim()) {
                toast.error("Business name is required for admin registration")
                return
            }
            if(!data.businessType) {
                toast.error("Please select a business type")
                return
            }
        }

        setIsLoading(true)

        try {
            const registrationData = {
                name: data.name.trim(),
                email: data.email.trim().toLowerCase(),
                mobile: data.mobile,
                password: data.password,
                role: data.role
            }

            // Add business details for admin registration
            if (isVendorMode) {
                if (data.businessName) {
                    registrationData.businessName = data.businessName.trim()
                }
                if (data.businessType) {
                    registrationData.businessType = data.businessType
                }
            }

            const response = await Axios({
                ...SummaryApi.register,
                data: registrationData
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                localStorage.setItem('otp_email', data.email); // Store email for OTP fallback
                navigate("/otp-verification", {
                    state: {
                        email: data.email.trim().toLowerCase()
                    }
                })
                setData({
                    name : "",
                    email : "",
                    mobile: "",
                    password : "",
                    confirmPassword : "",
                    role: "USER",
                    businessName: "",
                    businessType: ""
                })
                setIsVendorMode(false)
            }

        } catch (error) {
            // Registration error handled by AxiosToastError
            AxiosToastError(error)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div 
            className='min-h-screen flex flex-col'
            style={{
                background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 50%, #F9FAFB 100%)',
                backgroundAttachment: 'fixed',
                position: 'relative'
            }}
        >
            {/* Background Pattern */}
            <div 
                className='fixed inset-0 pointer-events-none z-0'
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255, 191, 0, 0.03) 0%, transparent 50%)
                    `
                }}
            />

            {/* Main Content */}
            <main className='flex-1 flex items-center justify-center px-4 py-6 relative z-10 flex-col sm:flex-row gap-6'>
                {/* Registration Form Container */}
                <div 
                    className={`w-full max-w-[540px] bg-white rounded-[20px] relative overflow-hidden ${
                        isVendorMode ? 'p-6 pt-4' : 'p-8'
                    }`}
                    style={{
                        boxShadow: `
                            0 20px 25px -5px rgba(0, 0, 0, 0.1),
                            0 10px 10px -5px rgba(0, 0, 0, 0.04),
                            0 0 0 1px rgba(220, 38, 38, 0.05),
                            inset 0 1px 0 rgba(255, 255, 255, 0.6)
                        `,
                        border: '1px solid rgba(220, 38, 38, 0.1)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {/* Top Accent Bar */}
                    <div 
                        className='absolute top-0 left-0 right-0 h-1'
                        style={{
                            background: isVendorMode
                                ? 'linear-gradient(90deg, #2563EB 0%, #60A5FA 50%, #2563EB 100%)'
                                : 'linear-gradient(90deg, #DC2626 0%, #ffbf00 50%, #DC2626 100%)',
                            boxShadow: isVendorMode
                                ? '0 2px 8px rgba(37, 99, 235, 0.2)'
                                : '0 2px 8px rgba(220, 38, 38, 0.2)'
                        }}
                    />

                    {/* Decorative Background */}
                    <div 
                        className='absolute pointer-events-none'
                        style={{
                            width: '200%',
                            height: '200%',
                            top: '-50%',
                            right: '-50%',
                            background: `
                                radial-gradient(circle at 30% 30%, rgba(220, 38, 38, 0.03) 0%, transparent 50%),
                                radial-gradient(circle at 70% 70%, rgba(255, 191, 0, 0.02) 0%, transparent 50%)
                            `
                        }}
                    />

                    {/* Form Content */}
                    <div className='relative z-10'>
                        {/* Header Section with Role Badge */}
                        <div className='relative mb-4'>
                            <div className='flex items-start justify-between gap-2'>
                                <div className='flex-1'>
                                    {!isVendorMode ? (
                                        <>
                                            <h1 
                                                className='text-[1.75rem] font-bold text-[#111827] mb-1 text-center sm:text-left'
                                                style={{
                                                    letterSpacing: '-0.5px',
                                                    lineHeight: '1.2',
                                                    fontFamily: "'DM Sans', 'Inter', sans-serif"
                                                }}
                                            >
                                                Welcome to PreEvent
                                            </h1>
                                            <p className='text-[0.875rem] text-[#6B7280] text-center sm:text-left mb-0' style={{ lineHeight: '1.3' }}>
                                                Create your account to get started
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className='text-center sm:text-left'>
                                                <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] mb-3 shadow-lg'>
                                                    <FaUser className='text-white text-2xl' />
                                                </div>
                                                <h1 
                                                    className='text-[1.75rem] font-bold text-[#111827] mb-1.5'
                                                    style={{
                                                        letterSpacing: '-0.5px',
                                                        lineHeight: '1.2',
                                                        fontFamily: "'DM Sans', 'Inter', sans-serif"
                                                    }}
                                                >
                                                    Admin Registration
                                                </h1>
                                                <p className='text-[0.875rem] text-[#6B7280] mb-0.5' style={{ lineHeight: '1.3' }}>
                                                    Join PreEvent as an Admin Partner
                                                </p>
                                                <p className='text-[0.75rem] text-[#9CA3AF]'>
                                                    Provide your business details to get started
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                {/* Role Selection Badge - Right Side Under Header */}
                                <div 
                                    className='flex-shrink-0 max-w-[220px] sm:max-w-[180px]'
                                    style={{
                                        animation: 'slideIn 0.3s ease',
                                        marginTop: '0'
                                    }}
                                >
                                    <div 
                                        className={`rounded-xl transition-all duration-300 ${
                                            isVendorMode ? 'vendor-mode' : ''
                                        }`}
                                        style={{
                                            background: isVendorMode 
                                                ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                                                : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                                            border: isVendorMode 
                                                ? '1.5px solid #BFDBFE'
                                                : '1.5px solid #FECACA',
                                            borderRadius: '12px',
                                            padding: isMobile ? '10px 12px' : '14px 16px',
                                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.3s ease',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        <div 
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginBottom: '8px'
                                            }}
                                        >
                                            <span 
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6B7280',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Registering as a
                                            </span>
                                            <span 
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: isVendorMode ? '#2563EB' : '#DC2626',
                                                    fontWeight: 700
                                                }}
                                            >
                                                {isVendorMode ? 'Admin' : 'Customer'}
                                            </span>
                                        </div>
                                        <a
                                            href='#'
                                            onClick={toggleVendorMode}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '0.7rem',
                                                color: isVendorMode ? '#2563EB' : '#DC2626',
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                transition: 'all 0.3s ease',
                                                background: isVendorMode 
                                                    ? 'rgba(37, 99, 235, 0.08)'
                                                    : 'rgba(220, 38, 38, 0.08)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = isVendorMode 
                                                    ? 'rgba(37, 99, 235, 0.15)'
                                                    : 'rgba(220, 38, 38, 0.15)'
                                                e.currentTarget.style.transform = 'translateX(2px)'
                                                const icon = e.currentTarget.querySelector('svg')
                                                if (icon) {
                                                    icon.style.transform = 'translateX(2px)'
                                                    icon.style.transition = 'transform 0.3s ease'
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = isVendorMode 
                                                    ? 'rgba(37, 99, 235, 0.08)'
                                                    : 'rgba(220, 38, 38, 0.08)'
                                                e.currentTarget.style.transform = 'translateX(0)'
                                                const icon = e.currentTarget.querySelector('svg')
                                                if (icon) {
                                                    icon.style.transform = 'translateX(0)'
                                                }
                                            }}
                                        >
                                            <FaArrowRight 
                                                style={{
                                                    fontSize: '0.65rem',
                                                    transition: 'transform 0.3s ease',
                                                    color: isVendorMode ? '#2563EB' : '#DC2626'
                                                }}
                                            />
                                            <span>{isVendorMode ? 'Register as Customer' : 'Join as Partner'}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form className='space-y-4' onSubmit={handleSubmit}>
                            {isVendorMode ? (
                                <>
                                    {/* Business Name Field - Admin Only */}
                                    <div className='relative z-10'>
                                        <label 
                                            htmlFor='businessName' 
                                            className='flex items-center gap-2 font-semibold text-[#111827] mb-1.5 text-[0.875rem]'
                                            style={{ letterSpacing: '0.1px' }}
                                        >
                                            <FaUser className='text-[#2563EB] text-[0.875rem] opacity-70' />
                                            Business Name <span className='text-[#EF4444]'>*</span>
                                        </label>
                                        <div className='relative'>
                                            <FaUser className='absolute left-3.5 top-1/2 text-[#6B7280] text-[0.875rem] pointer-events-none z-10' style={{ transform: 'translateY(-50%)' }} />
                                            <input
                                                type='text'
                                                id='businessName'
                                                autoFocus
                                                autoComplete='organization'
                                                className='w-full pl-11 pr-3.5 py-3.5 min-h-[44px] bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-lg text-base text-[#111827] font-medium outline-none transition-all duration-300'
                                                style={{
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: '16px' // Prevents zoom on iOS
                                                }}
                                                name='businessName'
                                                value={data.businessName || ''}
                                                onChange={handleChange}
                                                placeholder='Enter your business name'
                                                required
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#2563EB';
                                                    e.target.style.backgroundColor = '#FFFFFF';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)';
                                                    e.target.style.transform = 'translateY(-1px)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#E5E7EB';
                                                    e.target.style.backgroundColor = '#F3F4F6';
                                                    e.target.style.boxShadow = 'none';
                                                    e.target.style.transform = 'translateY(0)';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Business Type Field - Admin Only */}
                                    <div className='relative z-10'>
                                        <label 
                                            htmlFor='businessType' 
                                            className='flex items-center gap-2 font-semibold text-[#111827] mb-1.5 text-[0.875rem]'
                                            style={{ letterSpacing: '0.1px' }}
                                        >
                                            <FaUser className='text-[#2563EB] text-[0.875rem] opacity-70' />
                                            Business Type <span className='text-[#EF4444]'>*</span>
                                        </label>
                                        <div className='relative'>
                                            <select
                                                id='businessType'
                                                className='w-full pl-11 pr-10 py-3.5 min-h-[44px] bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-lg text-base text-[#111827] font-medium outline-none transition-all duration-300 appearance-none cursor-pointer'
                                                style={{
                                                    fontFamily: "'Inter', sans-serif",
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 0.875rem center',
                                                    backgroundSize: '12px 12px'
                                                }}
                                                name='businessType'
                                                value={data.businessType || ''}
                                                onChange={handleChange}
                                                required
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#2563EB';
                                                    e.target.style.backgroundColor = '#FFFFFF';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)';
                                                    e.target.style.transform = 'translateY(-1px)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#E5E7EB';
                                                    e.target.style.backgroundColor = '#F3F4F6';
                                                    e.target.style.boxShadow = 'none';
                                                    e.target.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <option value="">Select business type</option>
                                                <option value="Catering">Catering</option>
                                                <option value="Event Planning">Event Planning</option>
                                                <option value="Photography">Photography</option>
                                                <option value="Venue">Venue</option>
                                                <option value="Decoration">Decoration</option>
                                                <option value="Entertainment">Entertainment</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : null}

                            {/* Name Field */}
                            <div className='relative z-10'>
                                <label 
                                    htmlFor='name' 
                                    className='flex items-center gap-2 font-semibold text-[#111827] mb-1.5 text-[0.875rem]'
                                    style={{ letterSpacing: '0.1px' }}
                                >
                                    <FaUser className='text-[#DC2626] text-[0.875rem] opacity-70' />
                                    Name :
                                </label>
                                <div className='relative'>
                                    <FaUser className='absolute left-3.5 top-1/2 text-[#6B7280] text-[0.875rem] pointer-events-none z-10' style={{ transform: 'translateY(-50%)' }} />
                                    <input
                                        type='text'
                                        id='name'
                                        autoFocus
                                        autoComplete='name'
                                        inputMode='text'
                                        className={`w-full pl-11 pr-3.5 py-3.5 min-h-[44px] bg-[#F3F4F6] border-2 rounded-lg text-base text-[#111827] font-medium outline-none transition-all duration-300 ${
                                            touchedFields.name 
                                                ? validationErrors.name?.isValid 
                                                    ? 'border-green-500' 
                                                    : 'border-red-500'
                                                : 'border-[#E5E7EB]'
                                        }`}
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '16px' // Prevents zoom on iOS
                                        }}
                                        name='name'
                                        value={data.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder='Enter your name'
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#ffbf00';
                                            e.target.style.backgroundColor = '#FFFFFF';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 191, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)';
                                            e.target.style.transform = 'translateY(-1px)';
                                        }}
                                    />
                                    {touchedFields.name && (
                                        <ValidationMessage 
                                            isValid={validationErrors.name?.isValid} 
                                            message={validationErrors.name?.message}
                                    />
                                    )}
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className='relative z-10'>
                                <label 
                                    htmlFor='email' 
                                    className='flex items-center gap-2 font-semibold text-[#111827] mb-1.5 text-[0.875rem]'
                                    style={{ letterSpacing: '0.1px' }}
                                >
                                    <FaEnvelope className='text-[#DC2626] text-[0.875rem] opacity-70' />
                                    Email :
                                </label>
                                <div className='relative'>
                                    <FaEnvelope className='absolute left-3.5 top-1/2 text-[#6B7280] text-[0.875rem] pointer-events-none z-10' style={{ transform: 'translateY(-50%)' }} />
                                    <input
                                        type='email'
                                        id='email'
                                        inputMode='email'
                                        autoComplete='email'
                                        className={`w-full pl-11 pr-3.5 py-3.5 min-h-[44px] bg-[#F3F4F6] border-2 rounded-lg text-base text-[#111827] font-medium outline-none transition-all duration-300 ${
                                            touchedFields.email 
                                                ? validationErrors.email?.isValid 
                                                    ? 'border-green-500' 
                                                    : 'border-red-500'
                                                : 'border-[#E5E7EB]'
                                        }`}
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '16px' // Prevents zoom on iOS
                                        }}
                                        name='email'
                                        value={data.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder='Enter your email'
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#ffbf00';
                                            e.target.style.backgroundColor = '#FFFFFF';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 191, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)';
                                            e.target.style.transform = 'translateY(-1px)';
                                        }}
                                    />
                                    {touchedFields.email && (
                                        <ValidationMessage 
                                            isValid={validationErrors.email?.isValid} 
                                            message={validationErrors.email?.message}
                                    />
                                    )}
                                </div>
                            </div>

                            {/* Mobile Number Field */}
                            <div className='relative z-10'>
                                <label 
                                    htmlFor='mobile' 
                                    className='flex items-center gap-2 font-semibold text-[#111827] mb-1.5 text-[0.875rem]'
                                    style={{ letterSpacing: '0.1px' }}
                                >
                                    <FaPhone className='text-[#DC2626] text-[0.875rem] opacity-70' />
                                    Mobile Number :
                                </label>
                                <div className='flex relative' id='mobile-wrapper'>
                                    <div 
                                        className='px-3.5 py-3 bg-[#F3F4F6] border-2 border-[#E5E7EB] border-r-0 rounded-l-lg text-[0.9rem] text-[#111827] font-semibold flex items-center whitespace-nowrap select-none transition-all duration-300'
                                    >
                                        +91
                                    </div>
                                    <div className='flex-1 relative'>
                                        <FaPhone className='absolute left-3.5 top-1/2 text-[#6B7280] text-[0.875rem] pointer-events-none z-10' style={{ transform: 'translateY(-50%)' }} />
                                        <input
                                            type='tel'
                                            id='mobile'
                                            inputMode='numeric'
                                            autoComplete='tel'
                                            className='w-full pl-11 pr-3.5 py-3.5 min-h-[44px] bg-[#F3F4F6] border-2 border-[#E5E7EB] border-l border-r-0 rounded-r-lg text-base text-[#111827] font-medium outline-none transition-all duration-300'
                                            style={{
                                                fontFamily: "'Inter', sans-serif",
                                                fontSize: '16px' // Prevents zoom on iOS
                                            }}
                                            name='mobile'
                                            value={data.mobile}
                                            onChange={e => {
                                                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                setData(prev => ({ ...prev, mobile: value }));
                                                validateField('mobile', value);
                                            }}
                                            onBlur={handleBlur}
                                            placeholder='Enter your 10-digit mobile number'
                                            maxLength={10}
                                            onFocus={(e) => {
                                                const wrapper = e.target.closest('#mobile-wrapper');
                                                const countryCode = wrapper?.querySelector('div');
                                                e.target.style.borderColor = '#ffbf00';
                                                e.target.style.background = '#FFFFFF';
                                                if (countryCode) {
                                                    countryCode.style.borderColor = '#ffbf00';
                                                    countryCode.style.background = '#FFFFFF';
                                                }
                                                wrapper.style.boxShadow = '0 0 0 3px rgba(255, 191, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)';
                                                e.target.style.transform = 'translateY(-1px)';
                                            }}
                                        />
                                        {touchedFields.mobile && (
                                            <ValidationMessage 
                                                isValid={validationErrors.mobile?.isValid} 
                                                message={validationErrors.mobile?.message}
                                        />
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* Password Field */}
                            <div className='relative z-10'>
                                <label 
                                    htmlFor='password' 
                                    className='flex items-center gap-2 font-semibold text-[#111827] mb-1.5 text-[0.875rem]'
                                    style={{ letterSpacing: '0.1px' }}
                                >
                                    <FaLock className='text-[#DC2626] text-[0.875rem] opacity-70' />
                                    Password :
                                </label>
                                <div className='relative flex items-center bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-lg px-3.5 transition-all duration-300' id='password-wrapper'>
                                    <FaLock className='absolute left-3.5 text-[#6B7280] text-[0.875rem] pointer-events-none z-10' />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id='password'
                                        autoComplete='new-password'
                                        className='flex-1 pl-11 pr-2 py-3.5 min-h-[44px] bg-transparent border-none outline-none text-base text-[#111827] font-medium'
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '16px' // Prevents zoom on iOS
                                        }}
                                        name='password'
                                        value={data.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder='Enter your password'
                                        onFocus={(e) => {
                                            const wrapper = e.target.closest('#password-wrapper');
                                            wrapper.style.borderColor = '#ffbf00';
                                            wrapper.style.background = '#FFFFFF';
                                            wrapper.style.boxShadow = '0 0 0 3px rgba(255, 191, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)';
                                            wrapper.style.transform = 'translateY(-1px)';
                                        }}
                                    />
                                    <div 
                                        onClick={() => setShowPassword(preve => !preve)} 
                                        className='cursor-pointer p-2 rounded-lg transition-all duration-300 hover:bg-[#FEE2E2] hover:text-[#DC2626]'
                                    >
                                        {showPassword ? <FaRegEye className='text-[#6B7280]' /> : <FaRegEyeSlash className='text-[#6B7280]' />}
                                    </div>
                                </div>
                                {touchedFields.password && (
                                    <ValidationMessage 
                                        isValid={validationErrors.password?.isValid} 
                                        message={validationErrors.password?.message}
                                    />
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div className='relative z-10'>
                                <label 
                                    htmlFor='confirmPassword' 
                                    className='flex items-center gap-2 font-semibold text-[#111827] mb-1.5 text-[0.875rem]'
                                    style={{ letterSpacing: '0.1px' }}
                                >
                                    <FaLock className='text-[#DC2626] text-[0.875rem] opacity-70' />
                                    Confirm Password :
                                </label>
                                <div className='relative flex items-center bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-lg px-3.5 transition-all duration-300' id='confirm-password-wrapper'>
                                    <FaLock className='absolute left-3.5 text-[#6B7280] text-[0.875rem] pointer-events-none z-10' />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id='confirmPassword'
                                        autoComplete='new-password'
                                        className='flex-1 pl-11 pr-2 py-3.5 min-h-[44px] bg-transparent border-none outline-none text-base text-[#111827] font-medium'
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '16px' // Prevents zoom on iOS
                                        }}
                                        name='confirmPassword'
                                        value={data.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder='Enter your confirm password'
                                        onFocus={(e) => {
                                            const wrapper = e.target.closest('#confirm-password-wrapper');
                                            wrapper.style.borderColor = '#ffbf00';
                                            wrapper.style.background = '#FFFFFF';
                                            wrapper.style.boxShadow = '0 0 0 3px rgba(255, 191, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)';
                                            wrapper.style.transform = 'translateY(-1px)';
                                        }}
                                    />
                                    <div 
                                        onClick={() => setShowConfirmPassword(preve => !preve)} 
                                        className='cursor-pointer p-2 rounded-lg transition-all duration-300 hover:bg-[#FEE2E2] hover:text-[#DC2626]'
                                    >
                                        {showConfirmPassword ? <FaRegEye className='text-[#6B7280]' /> : <FaRegEyeSlash className='text-[#6B7280]' />}
                                    </div>
                                </div>
                                {touchedFields.confirmPassword && (
                                    <ValidationMessage 
                                        isValid={validationErrors.confirmPassword?.isValid} 
                                        message={validationErrors.confirmPassword?.message}
                                    />
                                )}
                            </div>

                            {/* Register Button */}
                            <button 
                                type='submit'
                                disabled={!valideValue || isLoading} 
                                className={`w-full min-h-[44px] py-3.5 px-6 rounded-[10px] font-bold text-base uppercase tracking-wider text-white transition-all duration-400 relative overflow-hidden mt-4 ${
                                    valideValue && !isLoading 
                                        ? 'bg-gradient-to-br from-[#DC2626] to-[#991B1B] hover:from-[#EF4444] hover:to-[#DC2626] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]' 
                                        : 'bg-[#9CA3AF] opacity-60 cursor-not-allowed'
                                }`}
                                style={{
                                    fontFamily: "'DM Sans', 'Inter', sans-serif",
                                    letterSpacing: '0.5px',
                                    boxShadow: valideValue && !isLoading 
                                        ? '0 4px 14px 0 rgba(220, 38, 38, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        : 'none'
                                }}
                            >
                                {isLoading ? "Registering..." : isVendorMode ? "Join as Partner" : "Register"}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className='text-center mt-4 pt-4 border-t border-[#E5E7EB] relative'>
                            <div 
                                className='absolute top-0 left-1/2 w-[60px] h-px'
                                style={{
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(90deg, transparent, #E5E7EB, transparent)'
                                }}
                            />
                            <p className='text-[0.875rem] text-[#6B7280]'>
                                Already have account ?{' '}
                                <Link 
                                    to={"/login"} 
                                    className='font-bold text-[#00b050] hover:text-[#008040] transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-[rgba(0,176,80,0.1)] inline-block relative'
                                >
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}

export default Register