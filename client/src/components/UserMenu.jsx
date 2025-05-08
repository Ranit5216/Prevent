import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink } from "react-icons/hi";
import isAdmin from '../utils/isAdmin'



const UserMenu = ({close}) => {
    const user = useSelector((state)=> state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleClose = ()=>{
        if(close){
            close()
        }
    }

    const handleLogout = async()=>{
        try {
            const response = await Axios({
                ...SummaryApi.logout
            })

            if(response.data.success){
                if(close){
                    close()
                }
                dispatch(logout())
                localStorage.clear()
                toast.success(response.data.message)
                navigate("/")
            }
        } catch (error) {
            AxiosToastError(error)
            
        }
    }

    return (
        <div>
            <div className='font-semibold flex items-center gap-2'>My Account</div>
            <div className='text-sm'>{user.name || user.mobile} <span className='font-medium text-red-500'>{user.role === "ADMIN" ? "(Admin)" : ""}</span> <Link onClick={handleClose} to={"/dashboard/profile"}>< HiOutlineExternalLink className=' hover:bg-amber-300' size={15}/></Link></div>

            <Divider/>
            <div className="text-sm grid gap-1">
                {
                    isAdmin(user.role) && (
                        <Link onClick={handleClose}  to={"/dashboard/category"} className="px-2 hover:bg-orange-200 py-1">Category</Link>
                    )
                }

                {
                    isAdmin(user.role) && (
                        <Link onClick={handleClose}  to={"/dashboard/subcategory"} className="px-2 hover:bg-orange-200 py-1">Sub Category</Link>

                    )
                }

                {
                    isAdmin(user.role) && (
                        <Link onClick={handleClose}  to={"/dashboard/upload-product"} className="px-2 hover:bg-orange-200 py-1">Upload Product</Link>

                    )
                }

                {
                    isAdmin(user.role) && (
                        <Link onClick={handleClose}  to={"/dashboard/product"} className="px-2 hover:bg-orange-200 py-1">Product</Link>

                    )
                }

                
                <Link onClick={handleClose}  to={"/dashboard/myorders"} className="px-2 hover:bg-orange-200 py-1">My Orders</Link>

                <Link onClick={handleClose}  to={"/dashboard/address"} className="px-2 hover:bg-orange-200 py-1">Save Address</Link>
                
                <button onClick={handleLogout} className="text-left hover:bg-orange-200 py-1 px-2">Log Out</button>

            </div>
        </div>
    )
}

export default UserMenu