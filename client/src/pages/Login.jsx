import React, { useState } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const valideValue = Object.values(data).every(el => el)


    const handleSubmit = async(e)=>{
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                localStorage.setItem('accesstoken',response.data.data.accesstoken)
                localStorage.setItem('refreshToken',response.data.data.refreshToken)

                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails.data))

                setData({
                    email : "",
                    password : "",
                })
                navigate("/")
            }

        } catch (error) {
            AxiosToastError(error)
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
            <main className='flex-1 flex items-center justify-center px-4 py-6 relative z-10'>
                <div 
                    className='w-full max-w-[520px] bg-white rounded-[20px] p-8 relative overflow-hidden'
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
                            background: 'linear-gradient(90deg, #DC2626 0%, #ffbf00 50%, #DC2626 100%)',
                            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)'
                        }}
                    />

                    {/* Decorative Background */}
                    <div 
                        className='absolute -top-1/2 -right-1/2 w-[200%] h-[200%] pointer-events-none'
                        style={{
                            background: `
                                radial-gradient(circle at 30% 30%, rgba(220, 38, 38, 0.03) 0%, transparent 50%),
                                radial-gradient(circle at 70% 70%, rgba(255, 191, 0, 0.02) 0%, transparent 50%)
                            `
                        }}
                    />

                    {/* Form Content */}
                    <div className='relative z-10'>
                        <h1 
                            className='text-[1.75rem] font-bold text-[#111827] mb-1 text-center'
                            style={{
                                letterSpacing: '-0.5px',
                                lineHeight: '1.2',
                                fontFamily: "'DM Sans', 'Inter', sans-serif"
                            }}
                        >
                            Welcome Back
                        </h1>
                        <p className='text-[0.875rem] text-[#6B7280] text-center mb-6' style={{ lineHeight: '1.3' }}>
                            Sign in to your PreEvent account
                        </p>

                        <form className='space-y-4' onSubmit={handleSubmit}>
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
                                    <FaEnvelope className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] text-[0.875rem] pointer-events-none z-10' />
                                    <input
                                        type='email'
                                        id='email'
                                        inputMode='email'
                                        autoComplete='email'
                                        className='w-full pl-11 pr-3.5 py-3.5 min-h-[44px] bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-lg text-base text-[#111827] font-medium outline-none transition-all duration-300'
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '16px' // Prevents zoom on iOS
                                        }}
                                        name='email'
                                        value={data.email}
                                        onChange={handleChange}
                                        placeholder='Enter your email'
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#ffbf00';
                                            e.target.style.backgroundColor = '#FFFFFF';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 191, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)';
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
                                        autoComplete='current-password'
                                        className='flex-1 pl-11 pr-2 py-3.5 min-h-[44px] bg-transparent border-none outline-none text-base text-[#111827] font-medium'
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '16px' // Prevents zoom on iOS
                                        }}
                                        name='password'
                                        value={data.password}
                                        onChange={handleChange}
                                        placeholder='Enter your password'
                                        onFocus={(e) => {
                                            const wrapper = e.target.closest('#password-wrapper');
                                            wrapper.style.borderColor = '#ffbf00';
                                            wrapper.style.backgroundColor = '#FFFFFF';
                                            wrapper.style.boxShadow = '0 0 0 3px rgba(255, 191, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)';
                                            wrapper.style.transform = 'translateY(-1px)';
                                        }}
                                        onBlur={(e) => {
                                            const wrapper = e.target.closest('#password-wrapper');
                                            wrapper.style.borderColor = '#E5E7EB';
                                            wrapper.style.backgroundColor = '#F3F4F6';
                                            wrapper.style.boxShadow = 'none';
                                            wrapper.style.transform = 'translateY(0)';
                                        }}
                                    />
                                    <div 
                                        onClick={() => setShowPassword(preve => !preve)} 
                                        className='cursor-pointer p-2 rounded-lg transition-all duration-300 hover:bg-[#FEE2E2] hover:text-[#DC2626]'
                                    >
                                        {showPassword ? <FaRegEye className='text-[#6B7280]' /> : <FaRegEyeSlash className='text-[#6B7280]' />}
                                    </div>
                                </div>
                                <Link 
                                    to={"/forgot-password"} 
                                    className='flex items-center justify-end gap-1.5 text-[0.875rem] text-[#6B7280] mt-1.5 font-medium transition-all duration-300 hover:text-[#DC2626] group'
                                >
                                    Forgot password
                                    <FaArrowRight className='text-[0.75rem] transition-transform duration-300 group-hover:translate-x-0.5' />
                                </Link>
                            </div>

                            {/* Login Button */}
                            <button 
                                type='submit'
                                disabled={!valideValue} 
                                className={`w-full min-h-[44px] py-3.5 px-6 rounded-[10px] font-bold text-base uppercase tracking-wider text-white transition-all duration-400 relative overflow-hidden mt-4 ${
                                    valideValue 
                                        ? 'bg-gradient-to-br from-[#DC2626] to-[#991B1B] hover:from-[#EF4444] hover:to-[#DC2626] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]' 
                                        : 'bg-[#9CA3AF] opacity-60 cursor-not-allowed'
                                }`}
                                style={{
                                    fontFamily: "'DM Sans', 'Inter', sans-serif",
                                    letterSpacing: '0.5px',
                                    boxShadow: valideValue 
                                        ? '0 4px 14px 0 rgba(220, 38, 38, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        : 'none'
                                }}
                            >
                                Login
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className='text-center mt-4 pt-4 border-t border-[#E5E7EB] relative'>
                            <div 
                                className='absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-px'
                                style={{
                                    background: 'linear-gradient(90deg, transparent, #E5E7EB, transparent)'
                                }}
                            />
                            <p className='text-[0.875rem] text-[#6B7280]'>
                                Don't have account ?{' '}
                                <Link 
                                    to={"/register"} 
                                    className='font-bold text-[#00b050] hover:text-[#008040] transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-[rgba(0,176,80,0.1)] inline-block relative'
                                >
                                    Register
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Login