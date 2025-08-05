import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";
import logo from '../assets/until-logo-1.png';

const Footer = () => {
  return (
    <footer className="border-t bg-gray-50 mt-8">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row md:justify-between gap-8 md:gap-4">
        {/* Logo & Description */}
        <div className="flex flex-col items-center md:items-start gap-2 max-w-xs w-full text-center md:text-left">
          <img src={logo} alt="logo" className="w-24 md:w-32 mb-2 mx-auto md:mx-0" />
          <p className="text-gray-600 text-sm">
            Your one-stop shop for the best prices, wide assortment, and fast delivery. Experience convenience and quality with us!
          </p>
        </div>
        {/* Useful Links */}
        <div className="flex flex-col items-center md:items-start gap-2 w-full">
          <h3 className="font-semibold text-gray-800 mb-1">Useful Links</h3>
          <a href="#about" className="text-gray-600 hover:text-red-500 transition text-base">About</a>
          <a href="#contact" className="text-gray-600 hover:text-red-500 transition text-base">Contact</a>
          <a href="#privacy" className="text-gray-600 hover:text-red-500 transition text-base">Privacy Policy</a>
        </div>
        {/* Social & Contact */}
        <div className="flex flex-col items-center md:items-end gap-2 w-full">
          <h3 className="font-semibold text-gray-800 mb-1">Connect with us</h3>
          <div className="flex gap-4 text-2xl justify-center md:justify-end w-full">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition"><FaFacebook /></a>
            <a href="https://www.instagram.com/preevent_official.in/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition"><FaInstagram /></a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition"><FaLinkedin /></a>
            <a href="https://www.youtube.com/channel/UCL8i8hmeYjSS3ci-0WhaZkg" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition"><FaYoutube /></a>
          </div>
          <p className="text-gray-500 text-xs mt-2">Email: tradeoxford123@gmail.com</p>
          <p className="text-gray-500 text-xs">Contact: +91 7439001746</p>
        </div>
      </div>
      <div className="border-t text-center py-4 text-gray-500 text-xs md:text-sm bg-gray-100">
        © All Rights Reserved 2025. PreEvent
      </div>
    </footer>
  )
}

export default Footer