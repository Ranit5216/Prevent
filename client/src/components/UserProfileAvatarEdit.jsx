import React, { useState } from 'react'
import { FaRegUserCircle, FaUpload } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { updatedAvatar } from '../store/userSlice'
import { IoClose } from "react-icons/io5";

const UserProfileAvatarEdit = ({close}) => {
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [loading,setLoading] = useState(false)

    const handleSubmit = (e)=>{
        e.preventDefault()
    }

    const handleUploadAvatarImage = async(e)=>{
        const file = e.target.files[0]

        if(!file){
            return
        }

        const formData = new FormData()
        formData.append('avatar',file)

        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.uploadAvatar,
                data : formData
            })
            const { data : responseData}  = response

            dispatch(updatedAvatar(responseData.data.avatar))
            close()

        } catch (error) {
            AxiosToastError(error)
        } finally{
            setLoading(false)
        }
    }
  
    return (
        <section className='fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm p-4 flex items-center justify-center z-50'>
            <div className='bg-white max-w-md w-full rounded-xl shadow-2xl p-6'>
                <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-xl font-bold text-gray-800'>Update Profile Picture</h2>
                    <button onClick={close} className='text-gray-500 hover:text-gray-700 transition-colors'>
                        <IoClose size={24}/>
                    </button>
                </div>

                <div className='flex flex-col items-center'>
                    <div className='w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full overflow-hidden shadow-lg mb-6'>
                        {user.avatar ? (
                            <img 
                                alt={user.name}
                                src={user.avatar}
                                className='w-full h-full object-cover'
                            />
                        ) : (
                            <div className='w-full h-full flex items-center justify-center bg-gray-100'>
                                <FaRegUserCircle size={100} className="text-gray-400"/>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className='w-full'>
                        <label htmlFor='uploadProfile' className='w-full'>
                            <div className={`
                                w-full py-3 px-4 rounded-lg font-semibold text-white text-center cursor-pointer transition-all
                                ${loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                }
                            `}>
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Uploading...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <FaUpload />
                                        Upload New Picture
                                    </div>
                                )}
                            </div>
                            <input 
                                onChange={handleUploadAvatarImage} 
                                type='file' 
                                id='uploadProfile' 
                                className='hidden'
                                accept="image/*"
                            />
                        </label>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default UserProfileAvatarEdit