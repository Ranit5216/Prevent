import React, { useEffect, useState } from 'react'
import CardLoading from '../components/CardLoading'
import SkeletonCard from '../components/SkeletonCard'
import ErrorWithRetry from '../components/ErrorWithRetry'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import CardProduct from '../components/CardProduct'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useLocation } from 'react-router-dom'
import noDataImage from '../assets/NoDataImage.png'
import AdvancedSearchFilters from '../components/AdvancedSearchFilters'

const SearchPage = () => {
  const [data,setData] = useState([])
  const [loading,setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const loadingArrayCard = new Array(10).fill(null)
  const [page,setPage] = useState(1)
  const [totalPage,setTotalPage] = useState(1)
  const params = useLocation()
  const searchText = params?.search?.slice(3) || ""
  
  // Advanced filters state
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    categoryId: null,
    subCategoryId: null,
    minRating: null,
    hasDiscount: false,
    sortBy: 'newest'
  })

  // Reset page when search text or filters change
  useEffect(() => {
    setPage(1)
    setData([])
  }, [searchText, filters])

  const fetchData = async() => {
    try {
      setLoading(true)
      setError(null)
        const response = await Axios({
            ...SummaryApi.searchProduct,
            data : {
              search : searchText,
              page : page,
              limit: 20,
              ...filters
            }
        })

        const { data : responseData } = response

        if(responseData.success){
            if(responseData.page == 1){
              setData(responseData.data)
            }else{
              setData((preve)=>{
                return[
                  ...preve,
                  ...responseData.data
                ]
              })
            }
            setTotalPage(responseData.totalPage)
            setRetryCount(0) // Reset retry count on success
        }
    } catch (error) {
        setError(error)
        AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchData()
  }

  useEffect(()=>{
    // Fetch data if there's search text OR any active filters
    const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.categoryId || 
                            filters.subCategoryId || filters.minRating || filters.hasDiscount || 
                            (filters.sortBy && filters.sortBy !== 'newest')
    
    if (searchText || hasActiveFilters) {
      fetchData()
    } else {
      // No search text and no filters - clear data
      setData([])
      setLoading(false)
    }
  },[page, searchText, filters])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({
      minPrice: null,
      maxPrice: null,
      categoryId: null,
      subCategoryId: null,
      minRating: null,
      hasDiscount: false,
      sortBy: 'newest'
    })
  }

  const handleFetchMore = ()=>{
    if(totalPage > page){
      setPage(preve => preve + 1)
    }
  }

  return (
    <section className='bg-[#F5F5F5] min-h-screen'>
      <div className='container mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6'>
        <div className='flex flex-col lg:flex-row gap-4 sm:gap-6'>
          {/* Advanced Filters Sidebar */}
          <div className='lg:w-64 flex-shrink-0'>
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Main Content */}
          <div className='flex-1 min-w-0'>
            <div className='mb-4 sm:mb-6'>
              <p className='text-base sm:text-lg md:text-xl font-semibold text-[#111827]'>
                Search Results: <span className='text-[#DC2626]'>{data.length}</span>
              </p>
            </div>

        {error && !loading ? (
          <ErrorWithRetry 
            message="Failed to load search results. Please try again."
            onRetry={handleRetry}
            retryCount={retryCount}
          />
        ) : (
        <InfiniteScroll
              dataLength={data.length}
              hasMore={totalPage > page}
              next={handleFetchMore}
              loader={<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 py-4 gap-3 sm:gap-4'>
                {loadingArrayCard.map((_,index)=>(
                  <SkeletonCard key={"loadingsearchpage"+index} variant="compact"/>
                ))}
              </div>}
        >
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 py-4 gap-3 sm:gap-4'>
          <style>{`
            @media (max-width: 640px) {
              .grid.grid-cols-1 {
                gap: 1rem !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
              }
              .grid.grid-cols-1 > * {
                max-width: 100% !important;
                width: 100% !important;
              }
            }
          `}</style>
              {
                data.map((p,index)=>{
                  return(
                    <CardProduct data={p} key={p?._id+"searchProduct"+index} variant="compact"/>
                  )
                })
              }
        </div>
        </InfiniteScroll>
        )}

              {
                //no data 
                !data[0] && !loading && (
                  <div className='flex flex-col justify-center items-center w-full mx-auto py-8 sm:py-12 md:py-16'>
                    <img
                      src={noDataImage} 
                      className='w-full h-full max-w-[200px] sm:max-w-xs md:max-w-sm max-h-[200px] sm:max-h-xs md:max-h-sm block'
                      alt="No data found"
                    />
                    <p className='font-semibold my-2 sm:my-3 text-base sm:text-lg text-[#6B7280]'>No Data found</p>
                  </div>
                )
              }
          </div>
        </div>
      </div>
    </section>
  )
}

export default SearchPage