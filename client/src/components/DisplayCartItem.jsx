import React from 'react'
import { IoClose } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import imageEmpty from '../assets/empty cart item.jpg'
import toast from 'react-hot-toast'
import { FaTrash } from 'react-icons/fa'

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
  return (
    <section className='bg-black/50 backdrop-blur-sm fixed top-0 bottom-0 right-0 left-0 z-50 transition-all duration-300'>
        <div className='bg-white w-full max-w-sm h-screen ml-auto shadow-2xl transform transition-transform duration-300 flex flex-col'>
            {/* Header */}
            <div className='flex items-center p-6 shadow-md gap-3 justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0'>
                <h2 className='font-bold text-xl'>Your Shopping Cart</h2>
                <Link to={"/"} className='lg:hidden hover:scale-110 transition-transform'>
                    <IoClose size={25}/>
                </Link>
                <button onClick={close} className='cursor-pointer hidden lg:block hover:scale-110 transition-transform'>
                    <IoClose size={25}/>
                </button>
            </div>

            {/* Main Content */}
            <div className='flex-1 overflow-y-auto min-h-0 p-4 flex flex-col gap-6'>
                {/***display items */}
                {
                    cartItem[0] ? (
                        <>
                            <div className='flex items-center justify-between px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md'>
                                <p className='font-medium'>Your total savings</p>
                                <p className='font-bold'>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice )}</p>
                            </div>
                            <div className='bg-white rounded-xl p-6 grid gap-6 overflow-auto shadow-md'>
                                    {
                                        cartItem[0] && (
                                            cartItem.map((item,index)=>{
                                                return(
                                                    <div key={item?._id+"cartItemDisplay"} className='flex w-full gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors'>
                                                        <div className='w-20 h-20 min-h-20 min-w-20 border rounded-lg overflow-hidden shadow-sm'>
                                                            <img
                                                                src={item?.productId?.image[0]}
                                                                className='h-full w-full object-cover hover:scale-110 transition-transform duration-300'
                                                            />
                                                        </div>
                                                        <div className='w-full max-w-sm'>
                                                            <p className='text-sm font-medium text-gray-800 line-clamp-2'>{item?.productId?.name}</p>
                                                            <p className='font-bold text-blue-600 mt-2'>{DisplayPriceInRupees(pricewithDiscount(item?.productId?.price,item?.productId?.discount))}</p>
                                                        </div>
                                                        <div className='flex flex-col gap-3'>
                                                            <AddToCartButton data={item?.productId}/>
                                                            <button 
                                                                onClick={() => handleRemoveItem(item._id)}
                                                                className='bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg flex items-center justify-center transition-colors'
                                                            >
                                                                <FaTrash size={14}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )
                                    }
                            </div>
                            <div className='bg-white p-6 rounded-xl shadow-md'>
                                <h3 className='font-bold text-lg mb-4 text-gray-800'>Bill Details</h3>
                                <div className='space-y-3'>
                                    <div className='flex justify-between items-center'>
                                        <p className='text-gray-600'>Items total</p>
                                        <p className='flex items-center gap-2'>
                                            <span className='line-through text-gray-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                                            <span className='font-medium'>{DisplayPriceInRupees(totalPrice)}</span>
                                        </p>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <p className='text-gray-600'>Quantity total</p>
                                        <p className='font-medium'>{totalQty} items</p>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <p className='text-gray-600'>Delivery Charge</p>
                                        <p className='text-green-600 font-medium'>Free</p>
                                    </div>
                                    <div className='border-t pt-3 mt-3 flex justify-between items-center'>
                                        <p className='font-bold text-lg text-gray-800'>Grand total</p>
                                        <p className='font-bold text-xl text-blue-600'>{DisplayPriceInRupees(totalPrice)}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='bg-white rounded-xl p-8 flex flex-col justify-center items-center shadow-md'>
                            <img
                                src={imageEmpty}
                                className='w-64 h-64 object-contain mb-6' 
                            />
                            <p className='text-gray-600 mb-6 text-center'>Your cart is empty. Start shopping to add items!</p>
                            <Link 
                                onClick={close} 
                                to={"/"} 
                                className='bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105'
                            >
                                Start Shopping
                            </Link>
                        </div>
                    )
                }
            </div>

            {/* Footer/Checkout */}
            {
                cartItem[0] && (
                    <div className='p-4 bg-white border-t flex-shrink-0'>
                        <div className='bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between hover:shadow-xl transition-all'>
                            <div className='font-bold text-xl'>
                                {DisplayPriceInRupees(totalPrice)}
                            </div>
                            <button 
                                onClick={redirectToCheckoutPage} 
                                className='cursor-pointer flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors'
                            >
                                Proceed to Checkout
                                <FaCaretRight/>
                            </button>
                        </div>
                    </div>
                )
            }
        </div>
    </section>
  )
}

export default DisplayCartItem