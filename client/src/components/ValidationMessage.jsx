import React from 'react'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

const ValidationMessage = ({ isValid, message, show = true }) => {
  if (!show || !message) return null

  return (
    <div className={`flex items-center gap-1.5 mt-1.5 text-xs transition-all duration-300 ${
      isValid ? 'text-green-600' : 'text-red-600'
    }`}>
      {isValid ? (
        <FaCheckCircle className="text-xs" />
      ) : (
        <FaExclamationCircle className="text-xs" />
      )}
      <span>{message}</span>
    </div>
  )
}

export default ValidationMessage

