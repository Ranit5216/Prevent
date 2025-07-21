import React, { useState } from 'react'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        mobile: "", // Add mobile field
        password: "",
        confirmPassword: "",
        role: "USER" // Default role
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    // Email validation function
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    // Password validation function
    const isValidPassword = (password) => {
        return password.length >= 6
    }

    const valideValue = Object.values(data).every(el => el)

    const handleSubmit = async(e)=>{
        e.preventDefault()

        // Validate email format
        if (!isValidEmail(data.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        // Validate mobile number (basic check)
        if (!/^\d{10}$/.test(data.mobile)) {
            toast.error("Please enter a valid 10-digit mobile number")
            return
        }

        // Validate password length
        if (!isValidPassword(data.password)) {
            toast.error("Password must be at least 6 characters long")
            return
        }

        if(data.password !== data.confirmPassword){
            toast.error(
                "Password and confirm password must be same"
            )
            return
        }

        setIsLoading(true)

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data : {
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile, // Send mobile to backend
                    password: data.password,
                    role: data.role
                }
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                localStorage.setItem('otp_email', data.email); // Store email for OTP fallback
                navigate("/otp-verification", {
                    state: {
                        email: data.email,
                        role: data.role
                    }
                })
                setData({
                    name : "",
                    email : "",
                    mobile: "", // Reset mobile
                    password : "",
                    confirmPassword : "",
                    role: "USER"
                })
            }

        } catch (error) {
            console.error("Registration error:", error)
            AxiosToastError(error)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <section className='w-full container mx-auto px-2'>
            <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-7'>
                <p>Welcome to Prevent</p>

                <form className='grid gap-4 mt-6' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label htmlFor='name'>Name :</label>
                        <input
                            type='text'
                            id='name'
                            autoFocus
                            className='bg-blue-50 p-2 border rounded outline-none focus:border-primary-200'
                            name='name'
                            value={data.name}
                            onChange={handleChange}
                            placeholder='Enter your name'
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='email'>Email :</label>
                        <input
                            type='email'
                            id='email'
                            className='bg-blue-50 p-2 border rounded outline-none focus:border-primary-200'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='Enter your email'
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='mobile'>Mobile Number :</label>
                        <div className='flex items-center'>
                            <span className='bg-blue-50 p-2 border border-r-0 rounded-l outline-none select-none'>+91</span>
                            <input
                                type='text'
                                id='mobile'
                                className='bg-blue-50 p-2 border rounded-r outline-none focus:border-primary-200 w-full'
                                name='mobile'
                                value={data.mobile}
                                onChange={e => {
                                    // Only allow numbers, max 10 digits
                                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                    setData(prev => ({ ...prev, mobile: value }));
                                }}
                                placeholder='Enter your 10-digit mobile number'
                                maxLength={10}
                            />
                        </div>
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='role'>Role :</label>
                        <select
                            id='role'
                            className='bg-blue-50 p-2 border rounded outline-none focus:border-primary-200'
                            name='role'
                            value={data.role}
                            onChange={handleChange}
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='password'>Password :</label>
                        <div className='bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='password'
                                className='w-full outline-none'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='Enter your password'
                            />
                            <div onClick={() => setShowPassword(preve => !preve)} className='cursor-pointer'>
                                {
                                    showPassword ? (
                                        <FaRegEye />
                                    ) : (
                                        <FaRegEyeSlash />
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='confirmPassword'>Confirm Password :</label>
                        <div className='bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id='confirmPassword'
                                className='w-full outline-none'
                                name='confirmPassword'
                                value={data.confirmPassword}
                                onChange={handleChange}
                                placeholder='Enter your confirm password'
                            />
                            <div onClick={() => setShowConfirmPassword(preve => !preve)} className='cursor-pointer'>
                                {
                                    showConfirmPassword ? (
                                        <FaRegEye />
                                    ) : (
                                        <FaRegEyeSlash />
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    <button 
                        disabled={!valideValue || isLoading} 
                        className={` ${valideValue && !isLoading ? "bg-green-800 hover:bg-green-700" : "bg-gray-500" } text-white py-2 rounded font-semibold my-3 tracking-wide`}
                    >
                        {isLoading ? "Registering..." : "Register"}
                    </button>

                </form>

                <p>
                    Already have account ? <Link to={"/login"} className='font-semibold text-green-700 hover:text-green-800'>Login</Link>
                </p>
            </div>
        </section>
    )
}

export default Register