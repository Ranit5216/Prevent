import React from 'react'
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";


const Footer = () => {
  return (
    <footer className='border-t'>
        <div className='container mx-auto p-4 text-center flex flex-col lg:flex-row lg:justify-between gap-2'>
            <p>© All Rights Reserved 2025.</p>

            <div className='flex items-center gap-4 justify-center text-2xl'>
                <a href='' className='hover:text-primary-100'>
                    <FaFacebook/>
                </a>
                <a href='https://www.instagram.com/preevent_official.in/' className='hover:text-primary-100'>
                    <FaInstagram/>
                </a>
                <a href='https://www.youtube.com/channel/UCL8i8hmeYjSS3ci-0WhaZkg' className='hover:text-primary-100'>
                    <FaYoutube/>
                </a>
            </div>
        </div>
    </footer>
  )
}

export default Footer