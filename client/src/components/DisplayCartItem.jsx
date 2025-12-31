import React from 'react'
import { IoClose } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { FaArrowUp } from "react-icons/fa";
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import imageEmpty from '../assets/empty cart item.jpg'
import toast from 'react-hot-toast'
import { FaTrash, FaShoppingCart } from 'react-icons/fa'

const DisplayCartItem = ({close}) => {
    const { notDiscountTotalPrice, totalPrice, totalQty, deleteCartItem } = useGlobalContext()
    const cartItem  = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    const navigate = useNavigate()

    const handleRemoveItem = (cartId) => {
        deleteCartItem(cartId)
    }

    const redirectToCheckoutPage = ()=>{
        if(user?._id){
            navigate("/checkout")
            if(close){
                close()
            }
            return
        }
        toast("Please Login")
    }

    // Close cart on Escape key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && close) {
                close()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [close])

  return (
    <>
        {/* Backdrop */}
        <div 
            className='fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[999] transition-opacity duration-300'
            onClick={close}
        />

        {/* Cart Overlay */}
        <div className='fixed top-0 right-0 w-full max-w-[420px] h-screen bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.15)] z-[1000] flex flex-col transition-transform duration-300'>
            {/* Cart Header */}
            <div className='bg-[#DC2626] text-white px-5 py-4 flex items-center justify-between flex-shrink-0'>
                <h2 className='text-lg font-bold'>Your Booking Cart</h2>
                <button 
                    onClick={close}
                    className='w-8 h-8 flex items-center justify-center rounded hover:bg-white/20 transition-colors'
                    aria-label="Close cart"
                >
                    <IoClose size={20} className="text-white" />
                </button>
            </div>

            {/* Savings Bar */}
            {cartItem[0] && (
                <div className='bg-[#10B981] text-white px-5 py-3 text-sm font-semibold text-center flex-shrink-0'>
                    Your total savings {DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}
                </div>
            )}

            {/* Cart Content */}
            <div className='flex-1 overflow-y-auto p-5 flex flex-col gap-5'>
                {cartItem[0] ? (
                    <>
                        {/* Cart Items */}
                        <div className='flex flex-col gap-4'>
                            {cartItem.map((item) => (
                                <div 
                                    key={item?._id+"cartItemDisplay"} 
                                    className='flex gap-3 p-3 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]'
                                >
                                    <img
                                        src={item?.productId?.image[0]}
                                        alt={item?.productId?.name}
                                        className='w-20 h-20 min-w-20 min-h-20 rounded-lg object-cover bg-white'
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <h3 className='text-sm font-semibold text-[#0F172A] mb-1.5 line-clamp-2'>
                                            {item?.productId?.name}
                                        </h3>
                                        <p className='text-base font-bold text-[#0F172A] mb-2'>
                                            {DisplayPriceInRupees(pricewithDiscount(item?.productId?.price, item?.productId?.discount))}
                                        </p>
                                        <div className='flex gap-2 items-center'>
                                            <AddToCartButton data={item?.productId} />
                                            <button 
                                                onClick={() => handleRemoveItem(item._id)}
                                                className='p-1.5 bg-[#DC2626] hover:bg-[#991B1B] text-white rounded-md transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center'
                                                aria-label="Remove item"
                                            >
                                                <FaTrash size={12}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bill Details */}
                        <div className='bg-white border border-[#E2E8F0] rounded-lg p-4 mt-auto'>
                            <h3 className='text-base font-bold text-[#0F172A] mb-4 pb-3 border-b border-[#E2E8F0]'>
                                Bill Details
                            </h3>
                            
                            <div className='space-y-3'>
                                <div className='flex justify-between items-center text-sm'>
                                    <span className='text-[#475569] font-medium'>Items total</span>
                                    <div className='flex items-center gap-2'>
                                        <span className='line-through text-[#94A3B8]'>
                                            {DisplayPriceInRupees(notDiscountTotalPrice)}
                                        </span>
                                        <span className='font-semibold text-[#0F172A]'>
                                            {DisplayPriceInRupees(totalPrice)}
                                        </span>
                                    </div>
                                </div>

                                <div className='flex justify-between items-center text-sm'>
                                    <span className='text-[#475569] font-medium'>Quantity total</span>
                                    <span className='font-semibold text-[#0F172A]'>{totalQty} items</span>
                                </div>

                                <div className='flex justify-between items-center text-sm'>
                                    <span className='text-[#475569] font-medium'>Travelling Charge</span>
                                    <span className='text-[#10B981] font-semibold'>Free</span>
                                </div>

                                <div className='flex justify-between items-center pt-4 mt-4 border-t-2 border-[#E2E8F0]'>
                                    <span className='text-base font-bold text-[#0F172A]'>Grand total</span>
                                    <span className='text-[#DC2626] text-lg font-bold'>
                                        {DisplayPriceInRupees(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button 
                                onClick={redirectToCheckoutPage}
                                className='w-full mt-4 px-5 py-3.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-bold text-base transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md flex items-center justify-center gap-2'
                            >
                                <span>{DisplayPriceInRupees(totalPrice)} Proceed to Checkout</span>
                                <FaArrowUp size={14} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className='bg-white rounded-xl p-8 flex flex-col justify-center items-center shadow-md'>
                        <img
                            src={imageEmpty}
                            className='w-64 h-64 object-contain mb-6' 
                            alt="Empty cart"
                        />
                        <p className='text-[#475569] mb-6 text-center'>Your cart is empty. Start booking to add items!</p>
                        <Link 
                            onClick={close} 
                            to={"/"} 
                            className='bg-[#DC2626] hover:bg-[#991B1B] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0'
                        >
                            Start Booking
                        </Link>
                    </div>
                )}
            </div>
        </div>
    </>
  )
}

export default DisplayCartItem
