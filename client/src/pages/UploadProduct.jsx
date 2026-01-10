import React, { useState } from 'react'
import { FaCloudUploadAlt, FaPlus } from "react-icons/fa";
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from "react-icons/md";
import { useSelector } from 'react-redux'
import { IoClose } from "react-icons/io5";
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';
import uploadFile from '../utils/UploadImage';

const UploadProduct = () => {
  const [data,setData] = useState({
      name : "",
      image : [],
      video : [],
      category : [],
      subCategory : [],
      stock : "",
      price : "",
      discount : "",
      description : "",
      more_details : {},
  })
  const [imageLoading,setImageLoading] = useState(false)
  const [ViewImageURL,setViewImageURL] = useState("")
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory,setSelectCategory] = useState("")
  const [selectSubCategory,setSelectSubCategory] = useState("")
  const allSubCategory = useSelector(state => state.product.allSubCategory)

  const [openAddField,setOpenAddField] = useState(false)
  const [fieldName,setFieldName] = useState("")
  const [videoLoading,setVideoLoading] = useState(false)
  const [dragoverImage, setDragoverImage] = useState(false)
  const [dragoverVideo, setDragoverVideo] = useState(false)

  const handleChange = (e)=>{
    const { name, value} = e.target 

    setData((preve)=>{
      return{
          ...preve,
          [name]  : value
      }
    })
  }

  const handleUploadImage = async(e)=>{
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]

    if(!file){
      return 
    }
    setImageLoading(true)
    const response = await uploadImage(file)
    const { data : ImageResponse } = response
    const imageUrl = ImageResponse.data.url 

    setData((preve)=>{
      return{
        ...preve,
        image : [...preve.image,imageUrl]
      }
    })
    setImageLoading(false)
    setDragoverImage(false)
  }

  const handleDeleteImage = async(index)=>{
      data.image.splice(index,1)
      setData((preve)=>{
        return{
            ...preve
        }
      })
  }

  const handleUploadVideo = async(e)=>{
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]
    if(!file){
      return 
    }
    setVideoLoading(true)
    const response = await uploadFile(file)
    const { data : VideoResponse } = response
    const videoUrl = VideoResponse.data.url 
    setData((preve)=>{
      return{
        ...preve,
        video : [...preve.video,videoUrl]
      }
    })
    setVideoLoading(false)
    setDragoverVideo(false)
  }

  const handleRemoveCategory = async(index)=>{
    data.category.splice(index,1)
    setData((preve)=>{
      return{
        ...preve
      }
    })
  }
  
  const handleRemoveSubCategory = async(index)=>{
      data.subCategory.splice(index,1)
      setData((preve)=>{
        return{
          ...preve
        }
      })
  }

  const handleAddField = ()=>{
    setData((preve)=>{
      return{
          ...preve,
          more_details : {
            ...preve.more_details,
            [fieldName] : ""
          }
      }
    })
    setFieldName("")
    setOpenAddField(false)
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()

    try {
      const response = await Axios({
          ...SummaryApi.createProduct,
          data : data
      })
      const { data : responseData} = response

      if(responseData.success){
          successAlert(responseData.message)
          setData({
            name : "",
            image : [],
            video : [],
            category : [],
            subCategory : [],
            stock : "",
            price : "",
            discount : "",
            description : "",
            more_details : {},
          })
      }
    } catch (error) {
        AxiosToastError(error)
    }
  }

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-5 sm:mb-6">Upload Product</h1>

      <form className="max-w-4xl" onSubmit={handleSubmit}>
        {/* Name Field */}
        <div className="mb-4 sm:mb-5">
          <label htmlFor='name' className="block text-sm font-semibold text-[#0F172A] mb-2">Name</label>
          <input 
            id='name'
            type='text'
            placeholder='Enter product name'
            name='name'
            value={data.name}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] bg-white transition-all duration-150 hover:border-[#94A3B8] focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2]"
          />
        </div>

        {/* Description Field */}
        <div className="mb-4 sm:mb-5">
          <label htmlFor='description' className="block text-sm font-semibold text-[#0F172A] mb-2">Description</label>
          <textarea 
            id='description'
            placeholder='Enter product description'
            name='description'
            value={data.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] bg-white transition-all duration-150 hover:border-[#94A3B8] focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] resize-y min-h-[100px]"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4 sm:mb-5">
          <label className="block text-sm font-semibold text-[#0F172A] mb-2">Image</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 sm:p-5 text-center bg-[#F1F5F9] transition-all duration-150 cursor-pointer ${
              dragoverImage ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E2E8F0] hover:border-[#DC2626] hover:bg-[#FEF2F2]'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragoverImage(true)
            }}
            onDragLeave={() => setDragoverImage(false)}
            onDrop={(e) => {
              e.preventDefault()
              handleUploadImage(e)
            }}
            onClick={() => document.getElementById('productImage').click()}
          >
            {imageLoading ? (
              <Loading/>
            ) : (
              <>
                <FaCloudUploadAlt className="mx-auto text-2xl sm:text-3xl text-[#94A3B8] mb-2" />
                <div className="text-sm font-semibold text-[#0F172A] mb-1">Upload Image</div>
                <div className="text-xs text-[#94A3B8]">Image size will be 2600*1900</div>
              </>
            )}
            <input 
              type='file'
              id='productImage'
              className='hidden'
              accept='image/*'
              onChange={handleUploadImage}
            />
          </div>
          
          {/* Display uploaded images */}
          {data.image.length > 0 && (
            <div className='flex flex-wrap gap-3 mt-3'>
              {data.image.map((img,index) => (
                <div key={img+index} className='h-20 w-20 min-w-20 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg relative group'>
                  <img
                    src={img}
                    alt={img}
                    className='w-full h-full object-cover rounded-lg cursor-pointer' 
                    onClick={()=>setViewImageURL(img)}
                  />
                  <div 
                    onClick={()=>handleDeleteImage(index)} 
                    className='absolute -top-2 -right-2 p-1.5 bg-[#DC2626] hover:bg-[#991B1B] rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md'
                  >
                    <MdDelete size={14}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div className="mb-4 sm:mb-5">
          <label className="block text-sm font-semibold text-[#0F172A] mb-2">Video</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 sm:p-5 text-center bg-[#F1F5F9] transition-all duration-150 cursor-pointer ${
              dragoverVideo ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E2E8F0] hover:border-[#DC2626] hover:bg-[#FEF2F2]'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragoverVideo(true)
            }}
            onDragLeave={() => setDragoverVideo(false)}
            onDrop={(e) => {
              e.preventDefault()
              handleUploadVideo(e)
            }}
            onClick={() => document.getElementById('productVideo').click()}
          >
            {videoLoading ? (
              <Loading/>
            ) : (
              <>
                <FaCloudUploadAlt className="mx-auto text-2xl sm:text-3xl text-[#94A3B8] mb-2" />
                <div className="text-sm font-semibold text-[#0F172A] mb-1">Upload Video</div>
                <div className="text-xs text-[#94A3B8]">Video size up to 50MB</div>
              </>
            )}
            <input 
              type='file'
              id='productVideo'
              className='hidden'
              accept='video/*'
              onChange={handleUploadVideo}
            />
          </div>
          
          {/* Display uploaded videos */}
          {data.video && data.video.length > 0 && (
            <div className='flex flex-wrap gap-3 mt-3'>
              {data.video.map((vid,index) => (
                <div key={vid+index} className='h-20 w-32 min-w-32 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg relative group'>
                  <video
                    src={vid}
                    controls
                    className='w-full h-full object-cover rounded-lg'
                    style={{maxHeight:'80px'}}
                  />
                  <div 
                    onClick={()=>{
                      data.video.splice(index,1)
                      setData((preve)=>({ ...preve, video: [...preve.video] }))
                    }} 
                    className='absolute -top-2 -right-2 p-1.5 bg-[#DC2626] hover:bg-[#991B1B] rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md'
                  >
                    <MdDelete size={14}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category and Sub Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">Category</label>
            <select
              className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] bg-white transition-all duration-150 hover:border-[#94A3B8] focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] cursor-pointer appearance-none bg-no-repeat pr-10"
              style={{ 
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E")`,
                backgroundPosition: 'right 14px center'
              }}
              value={selectCategory}
              onChange={(e)=>{
                const value = e.target.value 
                const category = allCategory.find(el => el._id === value )
                
                setData((preve)=>{
                  return{
                    ...preve,
                    category : [...preve.category,category],
                  }
                })
                setSelectCategory("")
              }}
            >
              <option value={""}>Select Category</option>
              {allCategory.map((c,index)=>{
                return(
                  <option key={index} value={c?._id}>{c.name}</option>
                )
              })}
            </select>
            
            {/* Display selected categories */}
            {data.category.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {data.category.map((c,index)=>{
                  return(
                    <div key={c._id+index+"productsection"} className='text-xs sm:text-sm flex items-center gap-1.5 bg-[#FEF2F2] text-[#DC2626] px-2.5 py-1.5 rounded-md border border-[#DC2626]/20'>
                      <span className="font-medium">{c.name}</span>
                      <button 
                        type="button"
                        className='hover:text-[#991B1B] cursor-pointer transition-colors' 
                        onClick={()=>handleRemoveCategory(index)}
                      >
                        <IoClose size={16}/>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sub Category */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">Sub Category</label>
            <select
              className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] bg-white transition-all duration-150 hover:border-[#94A3B8] focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2] cursor-pointer appearance-none bg-no-repeat pr-10"
              style={{ 
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E")`,
                backgroundPosition: 'right 14px center'
              }}
              value={selectSubCategory}
              onChange={(e)=>{
                const value = e.target.value 
                const subCategory = allSubCategory.find(el => el._id === value )

                setData((preve)=>{
                  return{
                    ...preve,
                    subCategory : [...preve.subCategory,subCategory]
                  }
                })
                setSelectSubCategory("")
              }}
            >
              <option value={""}>Select Sub Category</option>
              {allSubCategory.map((c,index)=>{
                return(
                  <option key={index} value={c?._id}>{c.name}</option>
                )
              })}
            </select>
            
            {/* Display selected sub categories */}
            {data.subCategory.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {data.subCategory.map((c,index)=>{
                  return(
                    <div key={c._id+index+"productsection"} className='text-xs sm:text-sm flex items-center gap-1.5 bg-[#FEF2F2] text-[#DC2626] px-2.5 py-1.5 rounded-md border border-[#DC2626]/20'>
                      <span className="font-medium">{c.name}</span>
                      <button 
                        type="button"
                        className='hover:text-[#991B1B] cursor-pointer transition-colors' 
                        onClick={()=>handleRemoveSubCategory(index)}
                      >
                        <IoClose size={16}/>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stock, Price, Discount Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-5">
          <div>
            <label htmlFor='stock' className="block text-sm font-semibold text-[#0F172A] mb-2">Number of Stock</label>
            <input 
              id='stock'
              type='number'
              placeholder='Enter product stock'
              name='stock'
              value={data.stock}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] bg-white transition-all duration-150 hover:border-[#94A3B8] focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2]"
            />
          </div>

          <div>
            <label htmlFor='price' className="block text-sm font-semibold text-[#0F172A] mb-2">Price</label>
            <input 
              id='price'
              type='number'
              placeholder='Enter product price'
              name='price'
              value={data.price}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] bg-white transition-all duration-150 hover:border-[#94A3B8] focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2]"
            />
          </div>

          <div>
            <label htmlFor='discount' className="block text-sm font-semibold text-[#0F172A] mb-2">Discount</label>
            <input 
              id='discount'
              type='number'
              placeholder='Enter product discount'
              name='discount'
              value={data.discount}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] bg-white transition-all duration-150 hover:border-[#94A3B8] focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2]"
            />
          </div>
        </div>

        {/* Additional Fields */}
        {Object?.keys(data?.more_details)?.map((k,index)=>{
          return(
            <div key={index} className="mb-4 sm:mb-5">
              <label htmlFor={k} className="block text-sm font-semibold text-[#0F172A] mb-2">{k}</label>
              <input 
                id={k}
                type='text'
                value={data?.more_details[k]}
                onChange={(e)=>{
                  const value = e.target.value 
                  setData((preve)=>{
                    return{
                      ...preve,
                      more_details : {
                        ...preve.more_details,
                        [k] : value
                      }
                    }
                  })
                }}
                required
                className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] bg-white transition-all duration-150 hover:border-[#94A3B8] focus:outline-none focus:border-[#DC2626] focus:ring-3 focus:ring-[#FEF2F2]"
              />
            </div>
          )
        })}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
          <button
            type="button"
            onClick={()=>setOpenAddField(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#DC2626] hover:bg-[#991B1B] text-white font-semibold rounded-lg transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            <FaPlus size={14}/>
            <span>Add Fields</span>
          </button>
          
          <button
            type="submit"
            className="flex-1 sm:flex-initial sm:min-w-[120px] inline-flex items-center justify-center px-5 py-2.5 bg-[#DC2626] hover:bg-[#991B1B] text-white font-semibold rounded-lg transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            Submit
          </button>
        </div>
      </form>

      {/* View Image Modal */}
      {ViewImageURL && (
        <ViewImage url={ViewImageURL} close={()=>setViewImageURL("")}/>
      )}

      {/* Add Field Modal */}
      {openAddField && (
        <AddFieldComponent 
          value={fieldName}
          onChange={(e)=>setFieldName(e.target.value)}
          submit={handleAddField}
          close={()=>setOpenAddField(false)} 
        />
      )}
    </div>
  )
}

export default UploadProduct
