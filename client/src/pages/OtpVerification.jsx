import React, { useEffect, useRef, useState } from 'react'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
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

    return (
        <section className='w-full container mx-auto px-2'>
            <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-7'>
                <p className='font-semibold text-lg'>Enter OTP</p>
                <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label htmlFor='otp'>Enter Your OTP :</label>
                        <div className='flex items-center gap-2 justify-between mt-3'>
                            {
                                data.map((element,index)=>{
                                    return(
                                        <input
                                            key={"otp"+index}
                                            type='text'
                                            id='otp'
                                            ref={(ref)=>{
                                                inputRef.current[index] = ref
                                                return ref 
                                            }}
                                            value={data[index]}
                                            onChange={(e)=>{
                                                const value =  e.target.value

                                                const newData = [...data]
                                                newData[index] = value
                                                setData(newData)

                                                if(value && index < 5){
                                                    inputRef.current[index+1].focus()
                                                }


                                            }}
                                            maxLength={1}
                                            className='bg-blue-50 w-full max-w-16 p-2 border rounded outline-none focus:border-primary-200 text-center font-semibold'
                                        />
                                    )
                                })
                            }
                        </div>
                        
                    </div>
             
                    <button disabled={!valideValue} className={` ${valideValue ? "bg-green-800 hover:bg-green-700" : "bg-gray-500" }    text-white py-2 rounded font-semibold my-3 tracking-wide`}>Verify OTP</button>
                    <button type="button" onClick={handleResendOtp} disabled={isResending} className="bg-blue-600 text-white py-2 rounded font-semibold tracking-wide mt-2">
                        {isResending ? "Resending..." : "Resend OTP"}
                    </button>

                </form>

                <p>
                    Already have account? <Link to={"/login"} className='font-semibold text-green-700 hover:text-green-800'>Login</Link>
                </p>
            </div>
        </section>
    )
}

export default OtpVerification


