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
          <img src={logo} alt="PreEvent - Professional Event Planning Services" className="w-24 md:w-32 mb-2 mx-auto md:mx-0" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">PreEvent</h2>
          <p className="text-gray-600 text-sm">
            PreEvent is your premier event planning partner, offering comprehensive services for weddings, corporate events, birthday parties, and special occasions. Our expert team of event planners, photographers, makeup artists, and caterers ensure your Pre-Event coordination is flawless.
          </p>
        </div>
        
        {/* Services & Keywords */}
        <div className="flex flex-col items-center md:items-start gap-2 w-full">
          <h3 className="font-semibold text-gray-800 mb-1">Our Services</h3>
          <a href="#wedding-planning" className="text-gray-600 hover:text-red-500 transition text-base">Wedding Planning</a>
          <a href="#corporate-events" className="text-gray-600 hover:text-red-500 transition text-base">Corporate Events</a>
          <a href="#birthday-parties" className="text-gray-600 hover:text-red-500 transition text-base">Birthday Parties</a>
          <a href="#event-coordination" className="text-gray-600 hover:text-red-500 transition text-base">Event Coordination</a>
          <a href="#pre-event-services" className="text-gray-600 hover:text-red-500 transition text-base">Pre-Event Services</a>
        </div>
        
        {/* Useful Links */}
        <div className="flex flex-col items-center md:items-start gap-2 w-full">
          <h3 className="font-semibold text-gray-800 mb-1">Useful Links</h3>
          <a href="#about" className="text-gray-600 hover:text-red-500 transition text-base">About PreEvent</a>
          <a href="#contact" className="text-gray-600 hover:text-red-500 transition text-base">Contact Us</a>
          <a href="#privacy" className="text-gray-600 hover:text-red-500 transition text-base">Privacy Policy</a>
          <a href="#terms" className="text-gray-600 hover:text-red-500 transition text-base">Terms of Service</a>
        </div>
        
        {/* Social & Contact */}
        <div className="flex flex-col items-center md:items-end gap-2 w-full">
          <h3 className="font-semibold text-gray-800 mb-1">Connect with PreEvent</h3>
          <div className="flex gap-4 text-2xl justify-center md:justify-end w-full">
            <a href="https://www.facebook.com/preevent" target="_blank" rel="noopener noreferrer" aria-label="Follow PreEvent on Facebook" className="hover:text-blue-600 transition"><FaFacebook /></a>
            <a href="https://www.instagram.com/preevent_official.in/" target="_blank" rel="noopener noreferrer" aria-label="Follow PreEvent on Instagram" className="hover:text-pink-500 transition"><FaInstagram /></a>
            <a href="https://www.linkedin.com/company/preevent" target="_blank" rel="noopener noreferrer" aria-label="Follow PreEvent on LinkedIn" className="hover:text-blue-700 transition"><FaLinkedin /></a>
            <a href="https://www.youtube.com/channel/UCL8i8hmeYjSS3ci-0WhaZkg" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to PreEvent on YouTube" className="hover:text-red-600 transition"><FaYoutube /></a>
          </div>
          <p className="text-gray-500 text-xs mt-2">Email: tradeoxford123@gmail.com</p>
          <p className="text-gray-500 text-xs">Contact: +91 7439001746</p>
          <p className="text-gray-500 text-xs">Professional Event Planning Services</p>
        </div>
      </div>
      
      {/* Footer Bottom with Keywords */}
      <div className="border-t text-center py-4 text-gray-500 text-xs md:text-sm bg-gray-100">
        <p>© All Rights Reserved 2025. PreEvent - Your Trusted Event Planning Partner</p>
        <p className="mt-1">Preevent | Pre-Event | Prevent | Privent - Professional Event Planners</p>
      </div>
    </footer>
  )
}

export default Footer