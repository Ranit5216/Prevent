import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const BackButton = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <button
      onClick={handleBack}
      className="lg:hidden flex items-center gap-2 px-4 py-2.5 mb-4 sm:mb-5 text-[#475569] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all duration-150 font-semibold text-sm rounded-lg border border-[#E2E8F0] hover:border-[#DC2626] bg-white shadow-sm hover:shadow-md"
      aria-label="Go back"
    >
      <FaArrowLeft className="text-sm" />
      <span>Back</span>
    </button>
  )
}

export default BackButton

