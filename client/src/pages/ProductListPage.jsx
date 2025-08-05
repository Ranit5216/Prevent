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

  return (
     <section className="sticky top-24 lg:top-20">
        <div className='container sticky top-24  mx-auto grid  grid-cols-[100px_minmax(260px,_1fr)_100px]  md:grid-cols-[220px_minmax(900px,1fr)_300px] lg:grid-cols-[280px_minmax(1000px,1fr)_280px]'> 
          {/**sub category */}
          <div className=' min-h-[89vh] max-h-[1000vh] overflow-y-scroll  grid grid-rows-4 lg:grid-rows-3  gap-9  shadow-md scrollbarCustom py-2'>
              
            {
              DisplaySubCatory.map((s,index)=>{
               
                const url = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`
                return(
                  <Link key={index} to={url} className={`ml-1.5 rounded-2xl h-40 hover:bg-green-500 cursor-pointer ${subCategoryId === s._id ? "bg-green-300" : ""}`}>
                    <div className=' w-40 max-w-20 lg:max-w-44 lg:h-35 mx-auto rounded box-border ' >
                      <img
                        src={s.image}
                        alt="subCategory"
                        className='mt-5 w-25 h-25 lg:w-40 lg:h-35 rounded  '
                      />
                    </div>
                      <p className=' rounded-md bg-amber-200 font-medium lg:mt-0 text-sm text-center lg:text-auto lg:text-2xl'>{s.name}</p>
                  </Link>
                )
                })
                }
                </div>
            
                {/**Product */}
                <div className='sticky top-20'>
                  <div className='bg-white shadow-md p-4 z-10'>
                    <h3 className="font-semibold">{subCategoryName}</h3>
                  </div>
                  <div>

                    <div className='min-h-[80vh] max-h-[80vh] overflow-y-auto relative'>
                      <div  className=' grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 p-4 gap-4 '>
                        {
                            data.map((p,index)=>{
                                return(
                                    <CardProduct
                                    data={p}
                                    key={p._id+"productSubCategory"+index}
                                    />
                                )
                            })
                        }
                      </div>
                    </div>


                    {
                        loading && (
                            <Loading/>
                        )
                    }
              </div>
          </div>
        </div>
          
      </section>
    )
}

export default ProductListPage