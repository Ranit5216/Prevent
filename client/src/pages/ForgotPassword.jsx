import React, { useState } from 'react'
import { FaEnvelope } from "react-icons/fa";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [data, setData] = useState({
        email: "",
    })
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

    const valideValue = Object.values(data).every(el => el)


    const handleSubmit = async(e)=>{
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.forgot_password,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                localStorage.setItem('forgot_email', data.email); // Store for OTP fallback
                navigate("/otp-verification",{
                  state : { email: data.email, fromForgot: true }
                })
                setData({
                    email : "",
                })
                
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
                    className='w-full max-w-[480px] bg-white rounded-[20px] p-8 relative overflow-hidden'
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
                        className='absolute w-[200%] h-[200%] pointer-events-none'
                        style={{
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
                        <h1 
                            className='text-[1.75rem] font-bold text-[#111827] mb-1 text-center'
                            style={{
                                letterSpacing: '-0.5px',
                                lineHeight: '1.2',
                                fontFamily: "'DM Sans', 'Inter', sans-serif"
                            }}
                        >
                            Forgot Password
                        </h1>
                        <p className='text-[0.875rem] text-[#6B7280] text-center mb-6' style={{ lineHeight: '1.3' }}>
                            Enter your email address and we'll send you an OTP to reset your password
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
                                    <FaEnvelope className='absolute left-3.5 top-1/2 text-[#6B7280] text-[0.875rem] pointer-events-none z-10' style={{ transform: 'translateY(-50%)' }} />
                                    <input
                                        type='email'
                                        id='email'
                                        className='w-full pl-11 pr-3.5 py-3 bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-lg text-[0.9rem] text-[#111827] font-medium outline-none transition-all duration-300'
                                        style={{
                                            fontFamily: "'Inter', sans-serif"
                                        }}
                                        name='email'
                                        value={data.email}
                                        onChange={handleChange}
                                        placeholder='Enter your email'
                                        autoFocus
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

                            {/* Send OTP Button */}
                            <button 
                                type='submit'
                                disabled={!valideValue} 
                                className={`w-full py-3 px-6 rounded-[10px] font-bold text-[0.95rem] uppercase tracking-wider text-white transition-all duration-400 relative overflow-hidden mt-4 ${
                                    valideValue 
                                        ? 'bg-gradient-to-br from-[#DC2626] to-[#991B1B] hover:from-[#EF4444] hover:to-[#DC2626] hover:scale-[1.02] hover:-translate-y-0.5' 
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
                                Send OTP
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
                                Already have account?{' '}
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

export default ForgotPassword

