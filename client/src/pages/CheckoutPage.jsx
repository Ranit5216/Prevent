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
import { FaMapMarkerAlt, FaCalendarAlt, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa'

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
    <section className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='text-3xl font-bold text-center mb-8 text-gray-800'>Checkout</h1>
        
        <div className='grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto'>
          {/* Left Column - Address and Delivery Date */}
          <div className='space-y-6'>
            {/* Address Section */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <FaMapMarkerAlt className='text-blue-600 text-xl' />
                <h3 className='text-xl font-semibold text-gray-800'>Booking Address</h3>
              </div>
              
              <div className='space-y-4'>
                {addressList.map((address, index) => (
                  <label 
                    key={index}
                    htmlFor={`address${index}`} 
                    className={`block ${!address.status && "hidden"}`}
                  >
                    <div className={`border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer hover:border-blue-500 ${
                      selectAddress == index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <div className='flex gap-4'>
                        <input 
                          id={`address${index}`} 
                          type='radio' 
                          value={index} 
                          onChange={(e) => setSelectAddress(e.target.value)} 
                          name='address'
                          className='mt-1'
                        />
                        <div className='text-gray-700'>
                          <p className='font-medium'>{address.address_line}</p>
                          <p>{address.city}, {address.state}</p>
                          <p>{address.country} - {address.pincode}</p>
                          <p className='text-blue-600'>{address.mobile}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
                
                <button 
                  onClick={() => setOpenAddress(true)}
                  className='w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2'
                >
                  <FaMapMarkerAlt />
                  Add New Address
                </button>
              </div>
            </div>

            {/* Delivery Date Section */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <FaCalendarAlt className='text-blue-600 text-xl' />
                <h3 className='text-xl font-semibold text-gray-800'>Select Booking Date</h3>
              </div>
              
              <div className='space-y-4'>
                <input
                  type="date"
                  min={minDate}
                  max={maxDateStr}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <p className='text-sm text-gray-500'>
                  Please select a Booking date between tomorrow and 30 days from now
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className='bg-white rounded-xl shadow-lg p-6 h-fit'>
            <h3 className='text-xl font-semibold text-gray-800 mb-6'>Order Summary</h3>
            
            <div className='space-y-4'>
              <div className='flex justify-between items-center text-gray-600'>
                <span>Items Total</span>
                <div className='flex items-center gap-2'>
                  <span className='line-through text-gray-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                  <span className='font-medium text-gray-800'>{DisplayPriceInRupees(totalPrice)}</span>
                </div>
              </div>
              
              <div className='flex justify-between items-center text-gray-600'>
                <span>Quantity Total</span>
                <span className='font-medium text-gray-800'>{totalQty} Service</span>
              </div>
              
              <div className='flex justify-between items-center text-gray-600'>
                <span>Travelling Charge</span>
                <span className='text-green-600 font-medium'>Free</span>
              </div>
              
              <div className='border-t pt-4 mt-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-lg font-semibold text-gray-800'>Grand Total</span>
                  <span className='text-2xl font-bold text-blue-600'>{DisplayPriceInRupees(totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className='mt-8 space-y-4'>
              <button 
                onClick={handleCashOnDelivery}
                className='w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2'
              >
                <FaMoneyBillWave />
                Cash on Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {openAddress && (
        <AddAddress close={() => setOpenAddress(false)} />
      )}
    </section>
  )
}

export default CheckoutPage