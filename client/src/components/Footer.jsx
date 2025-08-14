import React from 'react'
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";
import logo from '../assets/until-logo-1.png';

const Footer = () => {
  return (
    <footer className="border-t bg-gray-50 mt-8">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* Logo & Brand */}
          <div className="text-center">
            <img src={logo} alt="PreEvent" className="w-14 mx-auto mb-2" />
            <h2 className="text-base font-bold text-gray-800 mb-1">PreEvent</h2>
            <p className="text-gray-600 text-xs leading-relaxed max-w-xs mx-auto">
              Professional event planning services for all occasions.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 text-xs mb-1">Services</h3>
              <div className="space-y-0.5">
                <a href="#wedding-planning" className="block text-gray-600 hover:text-red-500 transition text-xs">Wedding</a>
                <a href="#corporate-events" className="block text-gray-600 hover:text-red-500 transition text-xs">Corporate</a>
                <a href="#birthday-parties" className="block text-gray-600 hover:text-red-500 transition text-xs">Birthday</a>
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 text-xs mb-1">Links</h3>
              <div className="space-y-0.5">
                <a href="#about" className="block text-gray-600 hover:text-red-500 transition text-xs">About</a>
                <a href="#contact" className="block text-gray-600 hover:text-red-500 transition text-xs">Contact</a>
                <a href="#privacy" className="block text-gray-600 hover:text-red-500 transition text-xs">Privacy</a>
              </div>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 text-xs mb-2">Follow Us</h3>
            <div className="flex justify-center space-x-3">
              <a href="https://www.facebook.com/profile.php?id=61578853584613" target="_blank" rel="noopener noreferrer" 
                 className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition">
                <FaFacebook className="text-sm" />
              </a>
              <a href="https://www.instagram.com/preevent_official.in/" target="_blank" rel="noopener noreferrer" 
                 className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition">
                <FaInstagram className="text-sm" />
              </a>
              <a href="https://www.youtube.com/channel/UCL8i8hmeYjSS3ci-0WhaZkg" target="_blank" rel="noopener noreferrer" 
                 className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition">
                <FaYoutube className="text-sm" />
              </a>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="text-center bg-white rounded-lg p-3 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-xs mb-1">Contact</h3>
            <div className="space-y-0.5">
              <p className="text-gray-600 text-xs">📧 tradeoxford123@gmail.com</p>
              <p className="text-gray-600 text-xs">📞 +91 7439001746</p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-row md:justify-between gap-8">
          {/* Logo & Description */}
          <div className="flex flex-col items-start gap-2 max-w-xs text-left">
            <img src={logo} alt="PreEvent - Professional Event Planning Services" className="w-32 mb-2" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">PreEvent</h2>
            <p className="text-gray-600 text-sm">
              PreEvent is your premier event planning partner, offering comprehensive services for weddings, corporate events, birthday parties, and special occasions. Our expert team of event planners, photographers, makeup artists, and caterers ensure your Pre-Event coordination is flawless.
            </p>
          </div>
          
          {/* Services & Keywords */}
          <div className="flex flex-col items-start gap-2">
            <h3 className="font-semibold text-gray-800 mb-1">Our Services</h3>
            <a href="#wedding-planning" className="text-gray-600 hover:text-red-500 transition text-base">Wedding Planning</a>
            <a href="#corporate-events" className="text-gray-600 hover:text-red-500 transition text-base">Corporate Events</a>
            <a href="#birthday-parties" className="text-gray-600 hover:text-red-500 transition text-base">Birthday Parties</a>
            <a href="#event-coordination" className="text-gray-600 hover:text-red-500 transition text-base">Event Coordination</a>
            <a href="#pre-event-services" className="text-gray-600 hover:text-red-500 transition text-base">Pre-Event Services</a>
          </div>
          
          {/* Useful Links */}
          <div className="flex flex-col items-start gap-2">
            <h3 className="font-semibold text-gray-800 mb-1">Useful Links</h3>
            <a href="#about" className="text-gray-600 hover:text-red-500 transition text-base">About PreEvent</a>
            <a href="#contact" className="text-gray-600 hover:text-red-500 transition text-base">Contact Us</a>
            <a href="#privacy" className="text-gray-600 hover:text-red-500 transition text-base">Privacy Policy</a>
            <a href="#terms" className="text-gray-600 hover:text-red-500 transition text-base">Terms of Service</a>
          </div>
          
          {/* Social & Contact */}
          <div className="flex flex-col items-end gap-2">
            <h3 className="font-semibold text-gray-800 mb-1">Connect with PreEvent</h3>
            <div className="flex gap-4 text-2xl justify-end">
              <a href="https://www.facebook.com/preevent" target="_blank" rel="noopener noreferrer" aria-label="Follow PreEvent on Facebook" className="hover:text-blue-600 transition"><FaFacebook /></a>
              <a href="https://www.instagram.com/preevent_official.in/" target="_blank" rel="noopener noreferrer" aria-label="Follow PreEvent on Instagram" className="hover:text-pink-500 transition"><FaInstagram /></a>
              <a href="https://www.youtube.com/channel/UCL8i8hmeYjSS3ci-0WhaZkg" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to PreEvent on YouTube" className="hover:text-red-600 transition"><FaYoutube /></a>
            </div>
            <p className="text-gray-500 text-xs mt-2">Email: tradeoxford123@gmail.com</p>
            <p className="text-gray-500 text-xs">Contact: +91 7439001746</p>
            <p className="text-gray-500 text-xs">Professional Event Planning Services</p>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="border-t text-center py-3 md:py-4 text-gray-500 text-xs md:text-sm bg-gray-100">
        <p>© All Rights Reserved 2025. PreEvent - Your Trusted Event Planning Partner</p>
        <p className="mt-1">Preevent | Pre-Event | Prevent | Privent - Professional Event Planners</p>
      </div>
    </footer>
  )
}

export default Footer