import React, {useEffect, useState} from "react";
import UploadCategoryModel from "../components/UploadCategoryModel";
import Loading from "../components/Loading";
import NoData from "../components/NoData";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import EditCategory from "../components/EditCategory";
import CofirmBox from "../components/CofirmBox";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { useSelector } from "react-redux";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const CategoryPage = () => {
    const [openUploadCategory,setOpenUploadCategory] = useState(false)
    const [loading,setLoading] = useState(false)
    const [categoryData,setCategoryData] = useState([])
    const [openEdit,setOpenEdit] = useState(false)
    const [editData,setEditData] = useState({
        name : "",
        image : "",
    }) 
    const [openConfimBoxDelete,setOpenConfirmBoxDelete] = useState(false)
    const [deleteCategory,setdeleteCategory]= useState({
        _id : ""
    })
    //const allCategory = useSelector(state => state.product.allCategory)
    

    //useEffect(()=>{
    //    setCategoryData(allCategory)
    //},[allCategory])

    const fetchCategory = async()=>{
       try {
          setLoading(true)
        const response = await Axios({
                ...SummaryApi.getCategory
            })
            const { data : responseData } = response
    
            if(responseData.success){
              setCategoryData(responseData.data)
            }

        } catch (error) {
            
        }finally{
            setLoading(false)
        }
    }

     useEffect(()=>{
       fetchCategory()
    },[])

    const handleDeleteCategory = async()=>{
        try {
            const response = await Axios({
                ...SummaryApi.deleteCategory,
                data : deleteCategory
            })

            const { data : responseData } = response

            if(responseData.success){
                toast.success(responseData.message)
                fetchCategory()
                setOpenConfirmBoxDelete(false)
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

    return(
        <section className="p-3 sm:p-4 md:p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">Category</h1>
                <button 
                    onClick={()=>setOpenUploadCategory(true)}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                    <FaPlus className="text-sm sm:text-base" />
                    <span>Add Category</span>
                </button>
            </div>

            {/* Loading State */}
            {
                loading && (
                    <Loading/>
                )
            }

            {/* Empty State */}
            {
                !categoryData[0] && !loading && (
                    <NoData/>
                )
            }

            {/* Category Grid */}
            {
                categoryData[0] && !loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                        {
                            categoryData.map((category,index)=>{
                                return(
                                    <div 
                                        key={category._id || index}
                                        className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        {/* Category Image */}
                                        <div className="w-full h-48 sm:h-52 overflow-hidden bg-[#F1F5F9]">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Category Content */}
                                        <div className="p-4">
                                            {/* Category Name */}
                                            <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-3 text-center">
                                                {category.name}
                                            </h3>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={()=>{
                                                        setOpenEdit(true)
                                                        setEditData(category)
                                                    }} 
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0"
                                                >
                                                    <FaEdit className="text-xs" />
                                                    <span>Edit</span>
                                                </button>
                                                <button 
                                                    onClick={()=>{
                                                        setOpenConfirmBoxDelete(true)
                                                        setdeleteCategory(category)
                                                    }} 
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0"
                                                >
                                                    <FaTrash className="text-xs" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }

            {/* Modals */}
            {
                openUploadCategory && (
                    <UploadCategoryModel fetchData={fetchCategory} close={()=>setOpenUploadCategory(false)}/>
                )
            }

            {
                openEdit && (
                    <EditCategory data={editData} close={()=>setOpenEdit(false)} fetchData={fetchCategory}/>
                )
            }
            
            {
                openConfimBoxDelete && (
                    <CofirmBox close={()=>setOpenConfirmBoxDelete(false)} cancel={()=>setOpenConfirmBoxDelete(false)} confirm={handleDeleteCategory}/>
                )
            }
        </section>
    )
}
export default CategoryPage