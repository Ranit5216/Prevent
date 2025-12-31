import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import { useNavigate } from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import { FaArrowRight } from 'react-icons/fa'
import OptimizedImage from '../components/OptimizedImage'

const Home = () => {
  const loadingCategory = useSelector(state => state?.product?.loadingCategory) || false
  const categoryData = useSelector(state => state?.product?.allCategory) || []
  const subCategoryData = useSelector(state => state?.product?.allSubCategory) || []
  const navigate = useNavigate()
  const [showScrollTop, setShowScrollTop] = useState(false)

  const handleRedirectProductListpage = (id, cat) => {
    if (!subCategoryData || subCategoryData.length === 0) return
    
    const subcategory = subCategoryData.find(sub => {
      if (!sub?.category) return false
      return sub.category.some(c => c?._id == id)
    })

    if (subcategory?.name && subcategory?._id) {
      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`
      navigate(url)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className='min-h-screen bg-[#F5F5F5]'>
      {/* Hero Section */}
      <section className='bg-gradient-to-br from-[#DC2626] via-[#B91C1C] to-[#991B1B] text-white py-8 md:py-20 lg:py-24 px-4 md:px-6 relative overflow-hidden' id='home'>
        <div className='absolute inset-0 opacity-30' style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
        }}></div>
        <div className='container mx-auto max-w-7xl relative z-10 text-center'>
          <h1 className='text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 md:mb-6 leading-tight' style={{ fontFamily: 'Playfair Display, serif' }}>
            Your Dream Event, Perfectly Planned
          </h1>
          <p className='text-sm sm:text-lg md:text-2xl mb-6 md:mb-10 max-w-2xl mx-auto opacity-95'>
            Discover trusted vendors, compare prices, and book instantly. Make your special moments unforgettable with PreEvent.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center'>
            <button 
              onClick={() => {
                const el = document.getElementById('categories')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className='bg-white text-[#DC2626] px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-sm md:text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2'
            >
              Explore Services <FaArrowRight />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('services')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className='bg-white/20 text-white border-2 border-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-sm md:text-lg hover:bg-white hover:text-[#DC2626] transition-all'
            >
              View Packages
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='bg-white py-12 md:py-16 -mt-8 md:-mt-12 relative z-20'>
        <div className='container mx-auto max-w-7xl px-4 md:px-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8'>
            <div className='text-center p-6 md:p-8 bg-[#F5F5F5] rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
              <div className='text-3xl md:text-5xl font-extrabold text-[#DC2626] mb-2'>1K+</div>
              <div className='text-sm md:text-base font-medium text-[#6B7280]'>Happy Customers</div>
            </div>
            <div className='text-center p-6 md:p-8 bg-[#F5F5F5] rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
              <div className='text-3xl md:text-5xl font-extrabold text-[#DC2626] mb-2'>500+</div>
              <div className='text-sm md:text-base font-medium text-[#6B7280]'>Trusted Vendors</div>
            </div>
            <div className='text-center p-6 md:p-8 bg-[#F5F5F5] rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
              <div className='text-3xl md:text-5xl font-extrabold text-[#DC2626] mb-2'>50+</div>
              <div className='text-sm md:text-base font-medium text-[#6B7280]'>Service Categories</div>
            </div>
            <div className='text-center p-6 md:p-8 bg-[#F5F5F5] rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
              <div className='text-3xl md:text-5xl font-extrabold text-[#DC2626] mb-2'>4.8★</div>
              <div className='text-sm md:text-base font-medium text-[#6B7280]'>Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id='categories' className='py-12 md:py-16 lg:py-20 px-4 md:px-6 bg-[#F5F5F5]'>
        <div className='container mx-auto max-w-7xl'>
          <div className='text-center mb-10 md:mb-12'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#111827] mb-2' style={{ fontFamily: 'Playfair Display, serif' }}>
              Explore <span className='text-[#DC2626]'>Categories</span>
            </h2>
            <p className='text-base md:text-lg lg:text-xl text-[#6B7280]'>Find the perfect service for your event</p>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6'>
            {loadingCategory ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={`loading-${index}`} className='bg-white rounded-2xl p-4 shadow-md animate-pulse'>
                  <div className='bg-[#FEE2E2] min-h-[180px] rounded-xl mb-4'></div>
                  <div className='bg-[#FEE2E2] h-5 rounded-lg'></div>
                </div>
              ))
            ) : (
              categoryData.map((cat, index) => {
                if (!cat) return null
                return (
                  <div 
                    key={cat._id || `cat-${index}`}
                    onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
                    className='group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-[#DC2626]'
                  >
                    <div className='relative overflow-hidden h-[180px]'>
                      {cat.image ? (
                        <OptimizedImage
                          src={cat.image}
                          alt={cat.name || 'Category'}
                          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                          loading="lazy"
                          fetchPriority="auto"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        />
                      ) : null}
                      <div className='absolute inset-0 bg-gradient-to-br from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                    </div>
                    <div className='p-5 text-center'>
                      <h3 className='font-semibold text-sm md:text-base text-[#111827] group-hover:text-[#DC2626] transition-colors'>
                        {cat.name || 'Category'}
                      </h3>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Category-wise Products Section */}
      <section id='services' className='pt-8 md:pt-10 pb-12 md:pb-16 lg:pb-20 px-4 md:px-6 bg-white'>
        <div className='container mx-auto max-w-7xl'>
          {categoryData && categoryData.length > 0 && categoryData.map((c, index) => {
            if (!c || !c._id) return null
            return (
              <CategoryWiseProductDisplay
                key={c._id || `product-${index}`}
                id={c._id}
                name={c.name || 'Category'}
              />
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-6 md:py-16 lg:py-20 px-4 md:px-6 bg-[#F5F5F5]' id='about'>
        <div className='container mx-auto max-w-7xl'>
          <div className='text-center mb-6 md:mb-12'>
            <h2 className='text-2xl sm:text-4xl md:text-5xl font-bold text-[#111827] mb-1 md:mb-2' style={{ fontFamily: 'Playfair Display, serif' }}>
              Why Choose <span className='text-[#DC2626]'>PreEvent</span>
            </h2>
            <p className='text-sm md:text-lg lg:text-xl text-[#6B7280]'>Experience the difference with our premium services</p>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8'>
            {[
              { icon: '💰', title: 'Best Prices Guaranteed', desc: 'We offer competitive rates tailored to your budget without compromising on quality. Compare prices from multiple vendors and choose the best deal.' },
              { icon: '📦', title: 'Wide Assortment', desc: 'Access an extensive collection of services across 50+ categories. From photography to catering, find everything you need in one place.' },
              { icon: '⚡', title: 'Fast & Reliable Service', desc: 'Quick booking process with instant confirmations. Our verified vendors ensure timely delivery and seamless event planning experience.' },
              { icon: '✅', title: 'Verified Vendors', desc: 'All our vendors are thoroughly verified and rated by customers. Book with confidence knowing you are working with trusted professionals.' },
              { icon: '🎯', title: 'Custom Packages', desc: 'Create personalized event packages that suit your specific needs. Mix and match services to create the perfect event solution.' },
              { icon: '💬', title: '24/7 Support', desc: 'Our dedicated support team is available round the clock to assist you with any queries or concerns. We are here to help you every step of the way.' }
            ].map((benefit, index) => (
              <div key={index} className='bg-white p-3 md:p-10 rounded-xl md:rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row gap-2 md:gap-6 items-center md:items-start text-center md:text-left'>
                <div className='w-10 h-10 md:w-16 md:h-16 bg-[#FEE2E2] rounded-lg md:rounded-2xl flex items-center justify-center text-xl md:text-3xl flex-shrink-0'>
                  {benefit.icon}
                </div>
                <div className='flex-1'>
                  <h3 className='text-xs md:text-xl font-bold text-[#111827] mb-1 md:mb-2'>{benefit.title}</h3>
                  <p className='text-[10px] md:text-base text-[#6B7280] leading-tight md:leading-relaxed'>{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-gradient-to-br from-[#DC2626] via-[#B91C1C] to-[#991B1B] text-white py-8 md:py-20 lg:py-24 px-4 md:px-6 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-30' style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
        }}></div>
        <div className='container mx-auto max-w-4xl relative z-10 text-center'>
          <h2 className='text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-6' style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Plan Your Perfect Event?
          </h2>
          <p className='text-sm sm:text-lg md:text-2xl mb-6 md:mb-10 opacity-95'>
            Join thousands of satisfied customers who trust PreEvent for their special occasions
          </p>
          <button 
            onClick={() => {
              const el = document.getElementById('categories')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className='bg-white text-[#DC2626] px-8 py-3 md:px-12 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
          >
            Start Planning Now
          </button>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className='fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-50 flex items-center justify-center text-xl'
          aria-label='Scroll to top'
        >
          ↑
        </button>
      )}
    </div>
  )
}

export default Home
