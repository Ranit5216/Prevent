import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { Link, useParams } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import CardProduct from '../components/CardProduct'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'


const ProductListPage = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPage, setTotalPage] = useState(1)
  const params = useParams()
  const AllSubCategory = useSelector(state => state.product.allSubCategory)
  const [DisplaySubCatory, setDisplaySubCategory] = useState([])


  const subCategory = params?.subCategory?.split("-")
  const subCategoryName = subCategory?.slice(0, subCategory?.length - 1)?.join(" ")

  const categoryId = params.category.split("-").slice(-1)[0]
  const subCategoryId = params.subCategory.split("-").slice(-1)[0]


  const fetchProductdata = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId: categoryId,
          subCategoryId: subCategoryId,
          page: page,
          limit: 10,
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        if (responseData.page == 1) {
          setData(responseData.data)
        } else {
          setData([...data, ...responseData.data])
        }
        setTotalPage(responseData.totalCount)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductdata()
  }, [params])


  useEffect(() => {
    const sub = AllSubCategory.filter(s => {
      const filterData = s.category.some(el => {
        return el._id == categoryId
      })

      return filterData ? filterData : null
    })
    setDisplaySubCategory(sub)
  }, [params, AllSubCategory])

  // Color mapping for category buttons
  const getCategoryButtonColor = (index, isActive) => {
    if (isActive) {
      return 'bg-[#00b050] text-white'; // Green for active
    }
    const colors = [
      'bg-[#ffbf00] text-[#111827]', // Yellow
      'bg-[#ffc929] text-[#111827]', // Light yellow
      'bg-[#ffd700] text-[#111827]', // Gold
      'bg-[#ffa500] text-white', // Orange
    ];
    return colors[index % colors.length];
  };

  return (
    <section className="min-h-screen bg-[#F5F5F5] py-4 md:py-6">
      <div className='container mx-auto max-w-7xl px-1.5 sm:px-2 md:px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-3 md:gap-4 lg:gap-5'>
          {/* Sidebar - Categories */}
          <aside className='hidden lg:block'>
            <div className='sticky top-24 h-[calc(100vh-120px)] overflow-y-auto bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-3 md:p-4 flex flex-col gap-3 md:gap-4 border-l-4 border-l-[#DC2626]'>
              {/* Custom scrollbar */}
              <style>{`
                .category-sidebar::-webkit-scrollbar {
                  width: 6px;
                }
                .category-sidebar::-webkit-scrollbar-track {
                  background: #F3F4F6;
                  border-radius: 10px;
                }
                .category-sidebar::-webkit-scrollbar-thumb {
                  background: #DC2626;
                  border-radius: 10px;
                }
                .category-sidebar::-webkit-scrollbar-thumb:hover {
                  background: #991B1B;
                }
              `}</style>
              <div className='category-sidebar flex flex-col gap-3 md:gap-4'>
                {DisplaySubCatory.map((s, index) => {
                  const url = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`;
                  const isActive = subCategoryId === s._id;
                  const buttonColor = getCategoryButtonColor(index, isActive);
                  
                  return (
                    <Link
                      key={index}
                      to={url}
                      className={`flex flex-col items-center p-2 md:p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-[rgba(0,176,80,0.15)] border-2 border-[#00b050] shadow-[0_0_0_3px_rgba(0,176,80,0.1)]'
                          : 'border-2 border-transparent hover:bg-[#FEE2E2] hover:border-[#DC2626] hover:-translate-y-0.5 hover:shadow-md'
                      }`}
                    >
                      <div className='w-full max-w-[180px] h-[110px] rounded-lg overflow-hidden mb-2 shadow-sm bg-[#F3F4F6] flex items-center justify-center'>
                        {s.image ? (
                          <img
                            src={s.image}
                            alt={s.name}
                            className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
                          />
                        ) : (
                          <div className='w-full h-full bg-gradient-to-br from-[#DC2626] to-[#991B1B] flex items-center justify-center text-white text-2xl'>
                            📷
                          </div>
                        )}
                      </div>
                      <div className={`w-full ${buttonColor} px-3 py-2 rounded-md font-semibold text-xs md:text-sm text-center shadow-sm transition-all duration-300`}>
                        {s.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar - Horizontal Scroll */}
          <div className='lg:hidden overflow-x-auto pb-2 mb-4 scrollbar-none'>
            <div className='flex gap-3 min-w-max'>
              {DisplaySubCatory.map((s, index) => {
                const url = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`;
                const isActive = subCategoryId === s._id;
                const buttonColor = getCategoryButtonColor(index, isActive);
                
                return (
                  <Link
                    key={index}
                    to={url}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 min-w-[120px] ${
                      isActive
                        ? 'bg-[rgba(0,176,80,0.15)] border-2 border-[#00b050]'
                        : 'border-2 border-transparent bg-white hover:bg-[#FEE2E2] hover:border-[#DC2626]'
                    }`}
                  >
                    <div className='w-full h-[80px] rounded-lg overflow-hidden mb-2 shadow-sm bg-[#F3F4F6] flex items-center justify-center'>
                      {s.image ? (
                        <img
                          src={s.image}
                          alt={s.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full bg-gradient-to-br from-[#DC2626] to-[#991B1B] flex items-center justify-center text-white text-xl'>
                          📷
                        </div>
                      )}
                    </div>
                    <div className={`w-full ${buttonColor} px-2 py-1.5 rounded-md font-semibold text-xs text-center shadow-sm`}>
                      {s.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main Product Section */}
          <div className='flex flex-col gap-3 md:gap-4'>
            {/* Section Header */}
            <div className='bg-white rounded-xl shadow-md border border-[#E5E7EB] p-3 md:p-4 lg:p-5 sticky top-20 lg:top-24 z-10'>
              <h2 className='text-xl md:text-2xl font-bold text-[#111827] flex items-center gap-2 md:gap-3' style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
                <span className='w-[3px] h-6 md:h-8 bg-[#DC2626] rounded-full'></span>
                {subCategoryName}
              </h2>
            </div>

            {/* Products Container */}
            <div className='bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-2 sm:p-3 md:p-4 min-h-[60vh] max-h-[calc(100vh-200px)] overflow-y-auto'>
              {/* Custom scrollbar */}
              <style>{`
                .products-scroll::-webkit-scrollbar {
                  width: 8px;
                }
                .products-scroll::-webkit-scrollbar-track {
                  background: #F3F4F6;
                  border-radius: 10px;
                }
                .products-scroll::-webkit-scrollbar-thumb {
                  background: #DC2626;
                  border-radius: 10px;
                }
                .products-scroll::-webkit-scrollbar-thumb:hover {
                  background: #991B1B;
                }
              `}</style>
              <div className='products-scroll'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'>
                  <style>{`
                    @media (max-width: 640px) {
                      .products-scroll {
                        padding: 0 !important;
                      }
                      .products-scroll .grid {
                        grid-template-columns: 1fr !important;
                        gap: 0.875rem !important;
                        padding: 0 !important;
                      }
                      .products-scroll .grid > * {
                        max-width: 100% !important;
                        width: 100% !important;
                      }
                    }
                  `}</style>
                  {data.map((p, index) => (
                    <CardProduct
                      data={p}
                      key={p._id + "productSubCategory" + index}
                      variant="compact"
                    />
                  ))}
                </div>
                {loading && <Loading />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductListPage