import React, { useEffect, useRef, useState } from 'react'
import { FaKey } from "react-icons/fa";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import fetchUserDetails from '../utils/fetchUserDetails';
import { setUserDetails } from '../store/userSlice';

const OtpVerification = () => {
    const [data, setData] = useState(["","","","","",""])
    const navigate = useNavigate()
    const inputRef = useRef([])
    const location = useLocation()
    const [isResending, setIsResending] = useState(false)
    // Support both registration and forgot password flows
    const [email, setEmail] = useState(
        location?.state?.email ||
        localStorage.getItem('otp_email') ||
        localStorage.getItem('forgot_email') ||
        ""
    );

    // Track which flow we're in
    const [flow, setFlow] = useState(location?.state?.fromForgot ? 'forgot' : 'register');

    useEffect(() => {
        if (location?.state?.fromForgot) {
            setFlow('forgot');
        } else {
            setFlow('register');
        }
    }, [location]);

    useEffect(() => {
        if (location?.state?.email) {
            // If coming from registration, store in otp_email
            if (location.pathname.includes('otp-verification')) {
                localStorage.setItem('otp_email', location.state.email);
                setFlow('register');
            }
            // If coming from forgot password, store in forgot_email
            if (location.pathname.includes('otp-verification') && location.state.fromForgot) {
                localStorage.setItem('forgot_email', location.state.email);
                setFlow('forgot');
            }
            setEmail(location.state.email);
        } else if (localStorage.getItem('forgot_email')) {
            setEmail(localStorage.getItem('forgot_email'));
            setFlow('forgot');
        } else if (localStorage.getItem('otp_email')) {
            setEmail(localStorage.getItem('otp_email'));
            setFlow('register');
        } else if (!email) {
            navigate("/register");
        }
    }, [location, email, navigate]);

    const valideValue = data.every(el => el)

    const dispatch = useDispatch();

    const handleSubmit = async(e)=>{
        e.preventDefault();

        try {
            const apiConfig = flow === 'forgot'
                ? SummaryApi.forgot_password_otp_verification
                : SummaryApi.verify_otp;

            const response = await Axios({
                ...apiConfig,
                data : {
                    otp : data.join(""),
                    email : email
                }
            });

            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                setData(["","","","","",""])
                if(flow === 'forgot'){
                    localStorage.removeItem('forgot_email');
                    navigate("/reset-password", { state: { email: email, data: response.data } });
                } else {
                    localStorage.removeItem('otp_email');
                    // Store tokens and set user state, then redirect to home
                    localStorage.setItem('accesstoken',response.data.data.accesstoken)
                    localStorage.setItem('refreshToken',response.data.data.refreshToken)
                    const userDetails = await fetchUserDetails();
                    dispatch(setUserDetails(userDetails.data));
                    navigate("/");
                }
            }

        } catch (error) {
            AxiosToastError(error)
        }
    }

    const handleResendOtp = async () => {
        setIsResending(true)
        try {
            const response = await Axios({
                ...SummaryApi.resend_otp,
                data: {
                    email: email
                }
            })
            if(response.data.error){
                toast.error(response.data.message)
            }
            if(response.data.success){
                toast.success(response.data.message)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setIsResending(false)
        }
    }

    // Handle paste functionality
    const handlePaste = (e, index) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
        const newData = [...data]
        
        pastedData.split('').forEach((char, i) => {
            if (newData[index + i] !== undefined) {
                newData[index + i] = char
            }
        })
        
        setData(newData)
        
        // Focus on the next empty input or the last input
        const nextIndex = Math.min(index + pastedData.length, 5)
        if (inputRef.current[nextIndex]) {
            inputRef.current[nextIndex].focus()
        }
    }

    // Handle backspace navigation
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !data[index] && index > 0) {
            inputRef.current[index - 1].focus()
        }
    }

    // Auto-focus first input on mount
    useEffect(() => {
        if (inputRef.current[0]) {
            inputRef.current[0].focus()
        }
    }, [])

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
                            Enter OTP
                        </h1>
                        <p className='text-[0.875rem] text-[#6B7280] text-center mb-6' style={{ lineHeight: '1.3' }}>
                            We've sent a verification code to your email
                        </p>

                        <form className='space-y-4' onSubmit={handleSubmit}>
                            <label 
                                htmlFor='otp-input-0' 
                                className='flex items-center justify-center gap-2 font-semibold text-[#111827] mb-5 text-[0.9rem]'
                                style={{ letterSpacing: '0.2px' }}
                            >
                                <FaKey className='text-[#DC2626] text-[0.875rem] opacity-70' />
                                Enter Your OTP :
                            </label>

                            <div className='flex justify-center gap-3 mb-6'>
                                {data.map((element, index) => (
                                    <input
                                        key={`otp-${index}`}
                                        type='text'
                                        id={`otp-input-${index}`}
                                        ref={(ref) => {
                                            inputRef.current[index] = ref
                                            return ref
                                        }}
                                        value={data[index]}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1)
                                            const newData = [...data]
                                            newData[index] = value
                                            setData(newData)

                                            if (value && index < 5) {
                                                inputRef.current[index + 1].focus()
                                            }
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={(e) => handlePaste(e, index)}
                                        maxLength={1}
                                        pattern="[0-9]"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="0"
                                        className='w-14 h-14 bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-xl text-2xl font-bold text-[#111827] text-center outline-none transition-all duration-300'
                                        style={{
                                            fontFamily: "'DM Sans', 'Inter', sans-serif"
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#ffbf00'
                                            e.target.style.backgroundColor = '#FFFFFF'
                                            e.target.style.boxShadow = '0 0 0 4px rgba(255, 191, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)'
                                            e.target.style.transform = 'translateY(-2px) scale(1.05)'
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value) {
                                                e.target.style.borderColor = '#00b050'
                                                e.target.style.backgroundColor = '#FFFFFF'
                                            } else {
                                                e.target.style.borderColor = '#E5E7EB'
                                                e.target.style.backgroundColor = '#F3F4F6'
                                            }
                                            e.target.style.boxShadow = 'none'
                                            e.target.style.transform = 'translateY(0) scale(1)'
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Verify OTP Button */}
                            <button 
                                type='submit'
                                disabled={!valideValue} 
                                className={`w-full py-3 px-6 rounded-[10px] font-bold text-[0.95rem] uppercase tracking-wider text-white transition-all duration-400 relative overflow-hidden mb-3 ${
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
                                Verify OTP
                            </button>

                            {/* Resend OTP Button */}
                            <button 
                                type="button" 
                                onClick={handleResendOtp} 
                                disabled={isResending}
                                className={`w-full py-3 px-6 rounded-[10px] font-bold text-[0.95rem] uppercase tracking-wider text-white transition-all duration-400 relative overflow-hidden ${
                                    isResending 
                                        ? 'bg-[#9CA3AF] opacity-60 cursor-not-allowed' 
                                        : 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB] hover:from-[#60A5FA] hover:to-[#3B82F6] hover:scale-[1.02] hover:-translate-y-0.5'
                                }`}
                                style={{
                                    fontFamily: "'DM Sans', 'Inter', sans-serif",
                                    letterSpacing: '0.5px',
                                    boxShadow: !isResending 
                                        ? '0 4px 14px 0 rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        : 'none'
                                }}
                            >
                                {isResending ? "Resending..." : "Resend OTP"}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className='text-center mt-4 pt-4 border-t border-[#E5E7EB] relative'>
                            <div 
                                className='absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-px'
                                style={{
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

export default OtpVerification


