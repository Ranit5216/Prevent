import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink, HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineLogout, HiOutlineUser, HiOutlineTag, HiOutlineCollection, HiOutlineUpload, HiOutlineLocationMarker } from "react-icons/hi";
import { FaComments, FaChartLine } from 'react-icons/fa';
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
    {
      label: 'Profile',
      to: '/dashboard/profile',
      icon: <HiOutlineUser className="w-5 h-5" />,
    },
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
      label: 'My Booking',
      to: '/dashboard/myorders',
      icon: <HiOutlineClipboardList className="w-5 h-5" />,
    },
    ...(isAdmin(user.role)
      ? [
          {
            label: 'Chat Support',
            to: '/dashboard/admin-chat',
            icon: <FaComments className="w-5 h-5" />,
          },
          {
            label: 'Vendor Dashboard',
            to: '/dashboard/vendor-dashboard',
            icon: <FaChartLine className="w-5 h-5" />,
          },
        ]
      : []),
    ...(!isAdmin(user.role)
      ? [
          {
            label: 'Save Address',
            to: '/dashboard/address',
            icon: <HiOutlineLocationMarker className="w-5 h-5" />,
          },
        ]
      : []),
  ]

  return (
    <div className="w-full bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-[#E2E8F0] max-h-[calc(100vh-110px)] overflow-y-auto">
      {/* User Info */}
      <div className="text-center pb-3 sm:pb-4 border-b border-[#E2E8F0] mb-3 sm:mb-4">
        {/* Avatar */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-2 sm:mb-3 border-2 border-[#E2E8F0] overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-lg sm:text-xl font-semibold text-[#475569]">{getInitials(user.name || user.mobile)}</span>
          )}
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] mb-1.5 sm:mb-2">{user.name || user.mobile}</h3>
        {user.role === "ADMIN" && (
          <div className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#FEF2F2] text-[#DC2626] rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide mb-1.5 sm:mb-2">
            <span>Admin</span>
            <Link onClick={handleClose} to={"/dashboard/profile"} title="Profile">
              <HiOutlineExternalLink className="text-[9px] sm:text-[10px]" />
            </Link>
          </div>
        )}
        <p className="text-[10px] sm:text-[11px] text-[#94A3B8] font-normal">My Account</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            onClick={handleClose}
            className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-[13px] font-medium mb-0.5 ${
              location.pathname === item.to 
                ? 'bg-[#FEF2F2] text-[#DC2626] font-semibold' 
                : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#DC2626]'
            }`}
          >
            <span className="w-3.5 sm:w-4 text-center text-[#94A3B8]">
              {React.cloneElement(item.icon, { 
                className: `w-3.5 h-3.5 sm:w-4 sm:h-4 ${location.pathname === item.to ? 'text-[#DC2626]' : ''}` 
              })}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-[13px] text-[#DC2626] hover:bg-[#FEF2F2] font-medium mt-1 transition-all"
        >
          <HiOutlineLogout className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
          <span>Log Out</span>
        </button>
      </nav>
    </div>
  )
}

export default UserMenu

