import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaRegUserCircle, FaUser, FaEnvelope, FaPhone, FaFacebook, FaYoutube, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";
import UserProfileAvatarEdit from '../components/UserProfileAvatarEdit';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { setUserDetails } from '../store/userSlice';
import fetchUserDetails from '../utils/fetchUserDetails';

const Profile = () => {
    const user = useSelector(state => state.user)
    const [openProfileAvatarEdit,setProfileAvatarEdit] = useState(false)
    const [userData,setUserData] = useState({
        name : user.name,
        email : user.email,
        mobile : user.mobile,
        location: user.location || '',
        facebookLink: user.facebookLink || '',
        youtubeLink: user.youtubeLink || '',
        instagramLink: user.instagramLink || '',
    })
    const [loading,setLoading] = useState(false)
    const dispatch = useDispatch()

    useEffect(()=>{
        setUserData({
            name : user.name,
            email : user.email,
            mobile : user.mobile,
            location: user.location || '',
            facebookLink: user.facebookLink || '',
            youtubeLink: user.youtubeLink || '',
            instagramLink: user.instagramLink || '',
        })
    },[user])

    const handleOnChange  = (e)=>{
        const { name, value} = e.target 

        setUserData((preve)=>{
            return{
                ...preve,
                [name] : value
            }
        })
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.updateUserDetails,
                data : userData
            })

            const { data : responseData } = response

            if(responseData.success){
                toast.success(responseData.message)
                // Use the updated user data from response if available, otherwise fetch
                if(responseData.data){
                    const previousLocation = user.location || ''
                    const newLocation = responseData.data.location || ''
                    dispatch(setUserDetails(responseData.data))
                    // If location was updated for admin, inform user about product cards
                    if(user.role === "ADMIN" && newLocation && newLocation !== previousLocation){
                        setTimeout(() => {
                            toast("Location updated! Product cards will show the new location after refreshing the page.", {
                                icon: "ℹ️",
                                duration: 4000
                            })
                        }, 500)
                    }
                } else {
                    const userData = await fetchUserDetails()
                    dispatch(setUserDetails(userData.data))
                }
            }

        } catch (error) {
            AxiosToastError(error)
        } finally{
            setLoading(false)
        }
    }
  
    return (
        <div className="p-3 sm:p-4 md:p-6">
            <div className="max-w-[600px] mx-auto">
                {/* Profile Header */}
                <div className="text-center mb-4 sm:mb-6 pb-4 sm:pb-5 border-b border-[#E2E8F0]">
                    <div className="relative inline-block">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-2 sm:mb-3 border-2 border-[#E2E8F0] overflow-hidden">
                            {user.avatar ? (
                                <img 
                                    alt={user.name}
                                    src={user.avatar}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaRegUserCircle size={32} className="sm:w-10 sm:h-10 text-[#94A3B8]"/>
                            )}
                        </div>
                        <button 
                            onClick={()=>setProfileAvatarEdit(true)} 
                            className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 bg-[#10B981] text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-white hover:bg-[#059669] transition-colors"
                        >
                            <FaUser size={10} className="sm:w-3 sm:h-3"/>
                        </button>
                    </div>
                    <h1 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-1">{user.name}</h1>
                    <p className="text-xs sm:text-[13px] text-[#94A3B8] font-normal">{user.role === "ADMIN" ? "Administrator" : "User"}</p>
                </div>

                {/* Profile Form */}
                <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div>
                        <label className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-semibold text-[#0F172A] mb-1 sm:mb-1.5">
                            <FaUser className="text-[#94A3B8] text-xs sm:text-sm w-3.5 sm:w-4 text-center" />
                            <span>Name</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your name" 
                            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] transition-all bg-white"
                            value={userData.name}
                            name="name"
                            onChange={handleOnChange}
                            required
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-semibold text-[#0F172A] mb-1 sm:mb-1.5">
                            <FaEnvelope className="text-[#94A3B8] text-xs sm:text-sm w-3.5 sm:w-4 text-center" />
                            <span>Email</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email" 
                            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] transition-all bg-white"
                            value={userData.email}
                            name="email"
                            onChange={handleOnChange}
                            required
                        />
                    </div>

                    {/* Mobile Field */}
                    <div>
                        <label className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-semibold text-[#0F172A] mb-1 sm:mb-1.5">
                            <FaPhone className="text-[#94A3B8] text-xs sm:text-sm w-3.5 sm:w-4 text-center" />
                            <span>Phone Number</span>
                            <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your phone number" 
                            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] transition-all bg-white"
                            value={userData.mobile}
                            name="mobile"
                            onChange={handleOnChange}
                            required
                        />
                    </div>

                    {/* City Location Field - Only for Admin (Mandatory) */}
                    {user.role === "ADMIN" && (
                        <div>
                            <label className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-semibold text-[#0F172A] mb-1 sm:mb-1.5">
                                <FaMapMarkerAlt className="text-[#94A3B8] text-xs sm:text-sm w-3.5 sm:w-4 text-center" />
                                <span>City</span>
                                <span className="text-[#DC2626]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your city (e.g., Mumbai)" 
                                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] transition-all bg-white"
                                value={userData.location}
                                name="location"
                                onChange={handleOnChange}
                                required
                            />
                        </div>
                    )}

                    {/* Social Media Links - Only for Admin */}
                    {user.role === "ADMIN" && (
                        <>
                            {/* Facebook Link */}
                            <div>
                                <label className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-semibold text-[#0F172A] mb-1 sm:mb-1.5">
                                    <FaFacebook className="text-[#94A3B8] text-xs sm:text-sm w-3.5 sm:w-4 text-center" />
                                    <span>Facebook Link</span>
                                </label>
                                <input
                                    type="url"
                                    placeholder="Enter Facebook link" 
                                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] transition-all bg-white"
                                    value={userData.facebookLink}
                                    name="facebookLink"
                                    onChange={handleOnChange}
                                />
                            </div>

                            {/* YouTube Link */}
                            <div>
                                <label className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-semibold text-[#0F172A] mb-1 sm:mb-1.5">
                                    <FaYoutube className="text-[#94A3B8] text-xs sm:text-sm w-3.5 sm:w-4 text-center" />
                                    <span>YouTube Link</span>
                                </label>
                                <input
                                    type="url"
                                    placeholder="Enter YouTube link" 
                                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] transition-all bg-white"
                                    value={userData.youtubeLink}
                                    name="youtubeLink"
                                    onChange={handleOnChange}
                                />
                            </div>

                            {/* Instagram Link */}
                            <div>
                                <label className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-semibold text-[#0F172A] mb-1 sm:mb-1.5">
                                    <FaInstagram className="text-[#94A3B8] text-xs sm:text-sm w-3.5 sm:w-4 text-center" />
                                    <span>Instagram Link</span>
                                </label>
                                <input
                                    type="url"
                                    placeholder="Enter Instagram link" 
                                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] transition-all bg-white"
                                    value={userData.instagramLink}
                                    name="instagramLink"
                                    onChange={handleOnChange}
                                />
                            </div>
                        </>
                    )}

                    <button 
                        className={`w-full py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg text-xs sm:text-[13px] font-semibold text-white transition-all mt-0.5 sm:mt-1 ${
                            loading 
                                ? "bg-gray-400 cursor-not-allowed" 
                                : "bg-[#10B981] hover:bg-[#059669] cursor-pointer"
                        }`}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 sm:mr-2"></div>
                                <span className="text-xs sm:text-[13px]">Updating...</span>
                            </div>
                        ) : (
                            "Update Profile"
                        )}
                    </button>
                </form>
            </div>

            {openProfileAvatarEdit && (
                <UserProfileAvatarEdit close={()=>setProfileAvatarEdit(false)}/>
            )}
        </div>
    )
}

export default Profile