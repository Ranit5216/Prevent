import React from 'react'
import banner from '../assets/Event Banner.png'
import bannerMobile from '../assets/Mobile Event Banner.png'
import { useSelector } from 'react-redux'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)

  const handleRedirectProductListpage = (id,cat)=>{
    console.log(id, cat)
    
    
  }
  return (
      <section className='bg-green-50 '  >
        <div className=' container mx-auto my-3 px-6'>
          <div className={`w-full h-full min-h-45 bg-blue-100 rounded-3xl ${!banner && "animate-pulse"}`}>
              <img
              src={banner}
              className='w-full h-45 rounded hidden lg:block'
              alt='banner'
              />
              <img
              src={bannerMobile}
              className='w-full h-45 rounded lg:hidden '
              alt='banner'
              />

          </div>
        </div>

        <div className='container mx-auto px-4 my-2 grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4'>
          {
           loadingCategory ? (
            new Array(12).fill(null).map((c,index)=>{
              return(
                <div key={index} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
                   <div className='bg-blue-100 min-h-24 rounded'></div>
                   <div className='bg-blue-100 h-8 rounded'></div>
                </div>
                                              
              )
            })
           ) : (
            categoryData.map((cat,index)=>{
              return(
              <div key={index}>
                <div className='w-full h-35 bg-blue-100' onClick={()=>handleRedirectProductListpage(cat._id,cat.name)}>
                  <img
                    src={cat.image}
                    className='w-full h-35 '
                  
                  />
                </div>
                <div className='w-full h-12 mt-1 bg-blue-100'>
                  {cat.name}
                </div>
              </div>
              )
            })
            
           )
          }
        </div>
      </section>
  )
}

export default Home
