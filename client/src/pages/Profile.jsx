import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaRegUserCircle, FaUser, FaEnvelope, FaPhone, FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
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
                const userData = await fetchUserDetails()
                dispatch(setUserDetails(userData.data))
            }

        } catch (error) {
            AxiosToastError(error)
        } finally{
            setLoading(false)
        }
    }
  
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-purple-600 rounded-full overflow-hidden shadow-lg">
                                {user.avatar ? (
                                    <img 
                                        alt={user.name}
                                        src={user.avatar}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <FaRegUserCircle size={80} className="text-gray-400"/>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={()=>setProfileAvatarEdit(true)} 
                                className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition-colors"
                            >
                                <FaUser size={20}/>
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mt-4">{user.name}</h2>
                        <p className="text-gray-600">{user.role === "ADMIN" ? "Administrator" : "User"}</p>
                    </div>

                    {/* Profile Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            {/* Name Field */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-gray-400"/>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your name" 
                                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={userData.name}
                                    name="name"
                                    onChange={handleOnChange}
                                    required
                                />
                            </div>

                            {/* Email Field */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400"/>
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your email" 
                                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={userData.email}
                                    name="email"
                                    onChange={handleOnChange}
                                    required
                                />
                            </div>

                            {/* Mobile Field */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhone className="text-gray-400"/>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your mobile" 
                                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={userData.mobile}
                                    name="mobile"
                                    onChange={handleOnChange}
                                    required
                                />
                            </div>

                            {/* Social Media Links - Only for Admin */}
                            {user.role === "ADMIN" && (
                                <>
                                    {/* Facebook Link */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaFacebook className="text-gray-400"/>
                                        </div>
                                        <input
                                            type="url"
                                            placeholder="Enter your Facebook page link" 
                                            className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={userData.facebookLink}
                                            name="facebookLink"
                                            onChange={handleOnChange}
                                        />
                                    </div>

                                    {/* YouTube Link */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaYoutube className="text-gray-400"/>
                                        </div>
                                        <input
                                            type="url"
                                            placeholder="Enter your YouTube channel link" 
                                            className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={userData.youtubeLink}
                                            name="youtubeLink"
                                            onChange={handleOnChange}
                                        />
                                    </div>

                                    {/* Instagram Link */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaInstagram className="text-gray-400"/>
                                        </div>
                                        <input
                                            type="url"
                                            placeholder="Enter your Instagram profile link" 
                                            className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={userData.instagramLink}
                                            name="instagramLink"
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <button 
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                                loading 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "bg-green-600 hover:bg-green-700 cursor-pointer shadow-lg hover:shadow-xl"
                            }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Updating...
                                </div>
                            ) : (
                                "Update Profile"
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {openProfileAvatarEdit && (
                <UserProfileAvatarEdit close={()=>setProfileAvatarEdit(false)}/>
            )}
        </div>
    )
}

export default Profile