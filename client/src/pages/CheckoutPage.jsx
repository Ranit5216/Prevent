import React, { useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaCalendarAlt, FaWallet, FaPhone } from 'react-icons/fa'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(0)
  const [deliveryDate, setDeliveryDate] = useState('')
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Get maximum date (30 days from now)
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const handleCashOnDelivery = async() => {
      if (!deliveryDate) {
          toast.error("Please select a delivery date")
          return
      }
      if (!addressList[selectAddress]?._id) {
          toast.error("Please select a booking address")
          return
      }
      try {
          const response = await Axios({
            ...SummaryApi.CashOnDeliveryOrder,
            data : {
              list_items : cartItemsList,
              addressId : addressList[selectAddress]?._id,
              subTotalAmt : totalPrice,
              totalAmt :  totalPrice,
              delivery_date: deliveryDate
            }
          })

          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              if(fetchCartItem){
                fetchCartItem()
              }
              if(fetchOrder){
                fetchOrder()
              }
              navigate('/success',{
                state : {
                  text : "Order"
                }
              })
          }

      } catch (error) {
        AxiosToastError(error)
      }
  }

  return (
    <section className='min-h-screen bg-[#E8F4F8] py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6'>
      <div className='max-w-[1200px] mx-auto'>
        <div className='grid lg:grid-cols-[1fr_400px] gap-4 sm:gap-6 md:gap-8'>
          {/* LEFT COLUMN - BOOKING DETAILS */}
          <div className='flex flex-col gap-4 sm:gap-6 md:gap-8'>
            {/* Booking Address Section */}
            <div className='bg-white rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-[#E5E7EB] p-4'>
              <h2 className='flex items-center gap-2 text-base sm:text-lg font-bold text-[#111827] mb-3' style={{ fontFamily: 'DM Sans, Inter, sans-serif' }}>
                <FaMapMarkerAlt className='text-[#DC2626] text-lg sm:text-xl' />
                Booking Address
              </h2>
              
              <div className='flex flex-col gap-2 sm:gap-3 mb-3'>
                {addressList.map((address, index) => (
                  address.status && (
                    <label 
                      key={index}
                      htmlFor={`address${index}`}
                      className={`flex items-start gap-3 p-2.5 sm:p-3 border-2 rounded-[10px] cursor-pointer transition-all duration-300 ${
                        Number(selectAddress) === index 
                          ? 'border-[#DC2626] bg-[#FEE2E2] shadow-[0_0_0_2px_rgba(220,38,38,0.1)]' 
                          : 'border-[#E5E7EB] bg-white hover:border-[#FEE2E2] hover:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:-translate-y-0.5'
                      }`}
                    >
                      <input 
                        id={`address${index}`}
                        type='radio'
                        value={index}
                        checked={Number(selectAddress) === index}
                        onChange={(e) => setSelectAddress(Number(e.target.value))}
                        name='address'
                        className='mt-0.5 w-4 h-4 flex-shrink-0 cursor-pointer accent-[#DC2626]'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='font-semibold text-sm sm:text-base text-[#111827] mb-1'>
                          {address.address_line}
                        </div>
                        <div className='text-xs sm:text-sm text-[#6B7280] leading-[1.3] mb-0'>
                          {address.city}, {address.state}
                        </div>
                        <div className='text-xs sm:text-sm text-[#6B7280] leading-[1.3] mb-0'>
                          {address.country} - {address.pincode}
                        </div>
                        <div className='flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-[#6B7280]'>
                          <FaPhone className='text-[#00b050] text-xs' />
                          <span>{address.mobile}</span>
                        </div>
                      </div>
                    </label>
                  )
                ))}
              </div>

              <button 
                onClick={() => setOpenAddress(true)}
                className='w-full py-2.5 sm:py-3 border-2 border-dashed border-[#DC2626] rounded-[10px] bg-transparent text-[#DC2626] font-semibold text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#FEE2E2] hover:border-[#991B1B] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]'
              >
                <FaMapMarkerAlt className='text-sm sm:text-base' />
                Add New Address
              </button>
            </div>

            {/* Select Booking Date Section */}
            <div className='bg-white rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-[#E5E7EB] p-4'>
              <h2 className='flex items-center gap-2 text-base sm:text-lg font-bold text-[#111827] mb-3' style={{ fontFamily: 'DM Sans, Inter, sans-serif' }}>
                <FaCalendarAlt className='text-[#DC2626] text-lg sm:text-xl' />
                Select Booking Date
              </h2>
              
              <div className='relative'>
                <FaCalendarAlt className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#DC2626] text-lg pointer-events-none' />
                <input
                  type="date"
                  min={minDate}
                  max={maxDateStr}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className='w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-[10px] text-sm sm:text-base text-[#111827] transition-all duration-300 outline-none font-medium cursor-pointer focus:border-[#ffbf00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,191,0,0.15),0_4px_12px_rgba(0,0,0,0.1)]'
                  placeholder="dd-mm-2025"
                />
              </div>
              
              <p className='mt-2 sm:mt-3 text-xs sm:text-sm text-[#6B7280] leading-normal'>
                Please select a Booking date between tomorrow and 30 days from now
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - ORDER SUMMARY */}
          <div className='lg:sticky lg:top-8 h-fit'>
            <div className='bg-white rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-4 sm:p-5 md:p-6'>
              <h2 className='text-xl sm:text-2xl font-bold text-[#111827] mb-4 sm:mb-6' style={{ fontFamily: 'DM Sans, Inter, sans-serif' }}>
                Order Summary
              </h2>
              
              <div className='space-y-3 sm:space-y-4'>
                {/* Items Total */}
                <div className='flex justify-between items-center pb-3 sm:pb-4 border-b border-[#E5E7EB]'>
                  <span className='text-sm sm:text-base text-[#6B7280] font-medium'>Items Total</span>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm sm:text-base text-[#6B7280] line-through'>
                      {DisplayPriceInRupees(notDiscountTotalPrice)}
                    </span>
                    <span className='text-sm sm:text-base text-[#DC2626] font-bold'>
                      {DisplayPriceInRupees(totalPrice)}
                    </span>
                  </div>
                </div>
                
                {/* Quantity Total */}
                <div className='flex justify-between items-center pb-3 sm:pb-4 border-b border-[#E5E7EB]'>
                  <span className='text-sm sm:text-base text-[#6B7280] font-medium'>Quantity Total</span>
                  <span className='text-sm sm:text-base text-[#111827] font-semibold'>{totalQty} Service</span>
                </div>
                
                {/* Travelling Charge */}
                <div className='flex justify-between items-center pb-3 sm:pb-4'>
                  <span className='text-sm sm:text-base text-[#6B7280] font-medium'>Travelling Charge</span>
                  <span className='text-sm sm:text-base text-[#00b050] font-semibold'>Free</span>
                </div>
              </div>
              
              {/* Divider */}
              <div className='h-px bg-[#E5E7EB] my-4 sm:my-6'></div>
              
              {/* Grand Total */}
              <div className='flex justify-between items-center pt-4 sm:pt-6 border-t-2 border-[#E5E7EB]'>
                <span className='text-lg sm:text-xl font-bold text-[#111827]' style={{ fontFamily: 'DM Sans, Inter, sans-serif' }}>
                  Grand Total
                </span>
                <span className='text-xl sm:text-2xl md:text-3xl font-bold text-[#DC2626]' style={{ fontFamily: 'DM Sans, Inter, sans-serif' }}>
                  {DisplayPriceInRupees(totalPrice)}
                </span>
              </div>
              
              {/* Cash on Booking Button */}
              <button 
                onClick={handleCashOnDelivery}
                className='w-full py-3 sm:py-4 mt-4 sm:mt-6 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white rounded-xl font-bold text-sm sm:text-base uppercase tracking-wide shadow-[0_4px_14px_0_rgba(220,38,38,0.3),0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer flex items-center justify-center gap-2 sm:gap-3 transition-all duration-400 hover:from-[#EF4444] hover:to-[#DC2626] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(220,38,38,0.4),0_4px_8px_rgba(0,0,0,0.15)] active:-translate-y-0.5 active:shadow-[0_4px_12px_rgba(220,38,38,0.3)] relative overflow-hidden group'
                style={{ fontFamily: 'DM Sans, Inter, sans-serif' }}
              >
                <span className='absolute top-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 checkout-shine'></span>
                <FaWallet className='text-base sm:text-lg relative z-10' />
                <span className='relative z-10'>Cash on Booking</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {openAddress && (
        <AddAddress close={() => setOpenAddress(false)} />
      )}
    </section>
  )
}

export default CheckoutPage
