import React from 'react'
import banner from '../assets/Event Banner.png'
import bannerMobile from '../assets/Mobile Event Banner.png'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import { useNavigate } from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import { FaArrowRight } from 'react-icons/fa'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()

  const handleRedirectProductListpage = (id, cat) => {
    const subcategory = subCategoryData.find(sub => {
      const filterData = sub.category.some(c => {
        return c._id == id
      })
      return filterData ? true : null
    })

    const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`
    navigate(url)
  }

  return (
    <section className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'>
      {/* Hero Banner Section */}
      <div className='container mx-auto px-4 py-8'>
        <div className='relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300'>
          <img
            src={banner}
            className='w-full h-[400px] object-cover hidden lg:block'
            alt='PreEvent - Professional Event Planning Services Banner'
          />
          <img
            src={bannerMobile}
            className='w-full h-[300px] object-cover lg:hidden'
            alt='PreEvent - Professional Event Planning Services Mobile Banner'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center'>
            <div className='text-white p-8 lg:p-12'>
              <h1 className='text-3xl lg:text-5xl font-bold mb-4'>PreEvent - Professional Event Planning Services</h1>
              <p className='text-lg lg:text-xl mb-6 max-w-xl'></p>
              <button className='bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2'>
                Explore PreEvent Services <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className='container mx-auto px-4 py-12'>
        <h2 className='text-2xl lg:text-3xl font-bold text-gray-800 mb-8 text-center'>PreEvent Event Planning Categories</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6'>
          {loadingCategory ? (
            new Array(12).fill(null).map((_, index) => (
              <div key={index + "loading"} className='bg-white rounded-xl p-4 shadow-lg animate-pulse'>
                <div className='bg-blue-100 min-h-32 rounded-lg mb-3'></div>
                <div className='bg-blue-100 h-6 rounded-lg'></div>
              </div>
            ))
          ) : (
            categoryData.map((cat, index) => (
              <div 
                key={index}
                onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
                className='group cursor-pointer transform hover:scale-105 transition-all duration-300'
              >
                <div className='bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow'>
                  <div className='relative overflow-hidden rounded-lg aspect-square mb-3'>
                    <img
                      src={cat.image}
                      className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300'
                      alt={cat.name}
                    />
                  </div>
                  <h3 className='text-center font-semibold text-gray-800 group-hover:text-blue-600 transition-colors'>
                    {cat.name}
                  </h3>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category-wise Products Section */}
      <div className='container mx-auto px-4 py-12'>
        {categoryData?.map((c, index) => (
          <CategoryWiseProductDisplay
            key={c?._id + "CategorywiseProduct"}
            id={c?._id}
            name={c?.name}
          />
        ))}
      </div>
    </section>
  )
}

export default Home
