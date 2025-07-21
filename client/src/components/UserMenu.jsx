import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink, HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineLogout, HiOutlineUser, HiOutlineTag, HiOutlineCollection, HiOutlineUpload } from "react-icons/hi";
import { FaCalendarAlt } from 'react-icons/fa';
import isAdmin from '../utils/isAdmin'

// Helper to get initials from name
const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  return names.map(n => n[0]).join('').toUpperCase();
};

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleClose = () => {
    if (close) {
      close()
    }
  }

  const handleLogout = async () => {
    try {
      const response = await Axios({ ...SummaryApi.logout })
      if (response.data.success) {
        if (close) close()
        dispatch(logout())
        localStorage.clear()
        toast.success(response.data.message)
        navigate("/")
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  // Navigation items
  const navItems = [
    ...(isAdmin(user.role)
      ? [
          {
            label: 'Category',
            to: '/dashboard/category',
            icon: <HiOutlineTag className="w-5 h-5" />,
          },
          {
            label: 'Sub Category',
            to: '/dashboard/subcategory',
            icon: <HiOutlineCollection className="w-5 h-5" />,
          },
          {
            label: 'Upload Service',
            to: '/dashboard/upload-product',
            icon: <HiOutlineUpload className="w-5 h-5" />,
          },
          {
            label: 'My Services',
            to: '/dashboard/product',
            icon: <HiOutlineViewGrid className="w-5 h-5" />,
          },
        ]
      : []),
    {
      label: 'My Orders',
      to: '/dashboard/myorders',
      icon: <HiOutlineClipboardList className="w-5 h-5" />,
    },
    ...(isAdmin(user.role)
      ? [
          {
            label: 'Booking Orders',
            to: '/dashboard/bookingorders',
            icon: <FaCalendarAlt className="w-5 h-5" />,
          },
        ]
      : []),
    {
      label: 'Save Address',
      to: '/dashboard/address',
      icon: <HiOutlineUser className="w-5 h-5" />,
    },
  ]

  return (
    <div className="max-w-xs w-full bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6 border border-gray-100 overflow-auto scrollbar-none">
      {/* User Info */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user.name || user.mobile)
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            {user.name || user.mobile}
            {user.role === "ADMIN" && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full font-medium">Admin</span>
            )}
            <Link onClick={handleClose} to={"/dashboard/profile"} title="Profile">
              <HiOutlineExternalLink className="ml-1 text-slate-400 hover:text-indigo-500" size={18} />
            </Link>
          </div>
          <span className="text-xs text-slate-500">My Account</span>
        </div>
      </div>
      <Divider />
      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            onClick={handleClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium ${location.pathname === item.to ? 'bg-indigo-100 text-indigo-700' : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium mt-2 transition-colors"
        >
          <HiOutlineLogout className="w-5 h-5" /> Log Out
        </button>
      </nav>
    </div>
  )
}

export default UserMenu

