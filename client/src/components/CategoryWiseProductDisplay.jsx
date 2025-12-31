import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import CardLoading from './CardLoading'
import CardProduct from './CardProduct'
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'

const CategoryWiseProductDisplay = ({ id, name }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const containerRef = useRef()
    const subCategoryData = useSelector(state => state.product.allSubCategory)
    const loadingCardNumber = new Array(6).fill(null)

    const fetchCategoryWiseProduct = async () => {
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getProductByCategory,
                data: {
                    id: id
                }
            })

            const { data: responseData } = response

            if (responseData.success) {
                setData(responseData.data)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategoryWiseProduct()
    }, [])

    const handleScrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollLeft += 200
        }
    }

    const handleScrollLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollLeft -= 200
        }
    }

    const handleRedirectProductListpage = () => {
        const subcategory = subCategoryData?.find(sub => {
            const filterData = sub?.category?.some(c => {
                return c._id == id
            })
            return filterData ? true : null
        })
        const url = `/${valideURLConvert(name)}-${id}/${valideURLConvert(subcategory?.name)}-${subcategory?._id}`
        return url
    }

    const redirectURL = handleRedirectProductListpage()

    if (data.length === 0 && !loading) {
        return null
    }

    return (
        <div className='mb-10 md:mb-12'>
            {/* Products Header */}
            <div className='container mx-auto max-w-7xl px-4 md:px-6 mb-4 md:mb-6 flex items-center justify-between'>
                <h3 className='text-2xl md:text-3xl font-bold text-[#111827]' style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>{name}</h3>
                <Link 
                    to={redirectURL} 
                    className='text-[#DC2626] hover:text-[#991B1B] transition-colors text-sm md:text-base font-semibold flex items-center gap-1 group'
                >
                    View All 
                    <span className='group-hover:translate-x-1 transition-transform text-lg'>→</span>
                </Link>
            </div>

            {/* Products Grid - Desktop, Horizontal Scroll - Mobile */}
            <div className='container mx-auto max-w-7xl px-2 sm:px-4 md:px-6'>
                {/* Desktop Grid Layout - Ensure all cards in one row with equal height */}
                <div className='hidden lg:grid grid-cols-4 gap-4 items-stretch'>
                    {loading ? (
                        loadingCardNumber.slice(0, 4).map((_, index) => (
                            <div key={"CategorywiseProductDisplay123" + index} className="min-w-0 flex">
                                <CardLoading />
                            </div>
                        ))
                    ) : (
                        data.slice(0, 4).map((p, index) => (
                            <div key={p._id + "CategorywiseProductDisplay" + index} className="min-w-0 flex">
                                <CardProduct
                                    data={p}
                                    variant="default"
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Mobile/Tablet Horizontal Scroll */}
                <div className='lg:hidden relative'>
                    <div 
                        className='flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4' 
                        ref={containerRef}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {loading ? (
                            loadingCardNumber.map((_, index) => (
                                <div key={"CategorywiseProductDisplay123" + index} className='flex-shrink-0 w-[220px] sm:w-[240px] md:w-[280px]'>
                                    <CardLoading />
                                </div>
                            ))
                        ) : (
                            data.map((p, index) => (
                                <div key={p._id + "CategorywiseProductDisplay" + index} className='flex-shrink-0 w-[220px] sm:w-[240px] md:w-[280px]'>
                                    <CardProduct
                                        data={p}
                                        variant="default"
                                    />
                                </div>
                            ))
                        )}
                    </div>
                    {/* Scroll Buttons for Mobile/Tablet */}
                    <div className='absolute left-0 right-0 top-1/2 -translate-y-1/2 hidden md:flex lg:hidden justify-between pointer-events-none px-2'>
                        <button 
                            onClick={handleScrollLeft} 
                            className='z-10 relative bg-white hover:bg-gray-100 shadow-lg text-lg p-3 rounded-full pointer-events-auto transition-all duration-300 hover:scale-110'
                            aria-label='Scroll left'
                        >
                            <FaAngleLeft />
                        </button>
                        <button 
                            onClick={handleScrollRight} 
                            className='z-10 relative bg-white hover:bg-gray-100 shadow-lg p-3 text-lg rounded-full pointer-events-auto transition-all duration-300 hover:scale-110'
                            aria-label='Scroll right'
                        >
                            <FaAngleRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryWiseProductDisplay
