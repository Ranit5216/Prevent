import React, { useEffect, useState } from "react"
import UploadSubCategoryModel from "../components/UploadSubCategoryModel"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import AxiosToastError from "../utils/AxiosToastError"
import DisplayTable from "../components/DisplayTable"
import { createColumnHelper } from "@tanstack/react-table"
import ViewImage from "../components/ViewImage"
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa"
import EditSubCategory from "../components/EditSubCategory"
import CofirmBox from "../components/CofirmBox"
import toast from "react-hot-toast"
import Loading from "../components/Loading"

const SubCategoryPage = () => {
    const [openAddSubCategory,setOpenAddSubCategory] = useState(false)
    const [data,setdata] = useState([])
    const [loading,setLoading] = useState()
    const columnHelper = createColumnHelper()
    const [ImageURL,setImageURL] =useState("")
    const [OpenEdit,setOpenEdit] = useState(false)
    const [editData,setEditData] = useState({
        _id : ""
    })
    const [deleteSubCategory,setDeleteSubCategory] = useState({
        _id : ""
    })
    const [openDeleteConfirmBox,setopenDeleteConfirmBox] = useState(false)


    const fetchSubCategory = async()=>{
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getSubCategory
            })
            const { data : responseData } = response

            if(responseData.success){
                setdata(responseData.data)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchSubCategory()
    },[])

    const column = [
        columnHelper.accessor('name',{
            header : "NAME",
            cell : ({row})=>{
                return <span className="font-semibold text-[#0F172A]">{row.original.name}</span>
            }
        }),
        columnHelper.accessor('image',{
            header : "IMAGE",
            cell : ({row})=>{
                return (
                    <div className="flex justify-center items-center">
                        <img
                            src={row.original.image}
                            alt={row.original.name}
                            className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg cursor-pointer bg-[#F1F5F9]'
                            onClick={()=>{
                                setImageURL(row.original.image)
                            }}
                        />
                    </div>
                )
            }
        }),
        columnHelper.accessor("category",{
            header : "CATEGORY",
            cell : ({row})=>{
                return(
                    <div className="flex flex-wrap gap-1">
                        {
                            row.original.category?.map((c,index)=>{
                                return(
                                    <span 
                                        key={c._id+"table"} 
                                        className="text-[#DC2626] font-medium text-sm hover:underline cursor-pointer"
                                    >
                                        {c.name}
                                    </span>
                                )
                            })
                        }
                    </div>
                )
            }
        }),
        columnHelper.accessor("_id",{
            header : "ACTION",
            cell : ({row})=>{
                return(
                    <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={()=>{
                                setOpenEdit(true)
                                setEditData(row.original)
                            }} 
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            title="Edit"
                        >
                            <FaEdit className="text-xs sm:text-sm" />
                        </button>
                        <button 
                            onClick={()=>{
                                setopenDeleteConfirmBox(true)
                                setDeleteSubCategory(row.original)
                            }} 
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            title="Delete"
                        >
                            <FaTrash className="text-xs sm:text-sm" />
                        </button>
                    </div>
                )
            }
        })
    ]

    const handleDeleteSubCategory = async()=>{
        try {
            const response = await Axios({
                ...SummaryApi.deleteSubCategory,
                data : deleteSubCategory

            })

            const { data : responseData } = response

            if(responseData.success){
                toast.success(responseData.messsage)
                fetchSubCategory()
                setopenDeleteConfirmBox()
                setDeleteSubCategory({_id : ""})
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }
 
    return (
        <section className="p-3 sm:p-4 md:p-5">
            {/* Page Header */}
            <div className="mb-3 sm:mb-4">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight mb-1 sm:mb-2">
                    Sub Categories
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                    Manage your subcategories here.
                </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center justify-end mb-3 sm:mb-4">
                <button 
                    onClick={() => setOpenAddSubCategory(true)}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                    <FaPlus className="text-xs sm:text-sm" />
                    <span>Add Sub Category</span>
                </button>
            </div>

            {/* Loading State */}
            {loading && <Loading />}

            {/* Table Section */}
            {!loading && (
                <div className="bg-white rounded-lg sm:rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <DisplayTable
                            data={data}
                            column={column}
                        />
                    </div>
                </div>
            )}

            {/* Modals */}
            {openAddSubCategory && (
                <UploadSubCategoryModel
                    close={() => setOpenAddSubCategory(false)}
                    fetchData={fetchSubCategory}
                />
            )}
            {ImageURL && 
                <ViewImage url={ImageURL} close={() => setImageURL("")}/>
            }
            {OpenEdit &&
                <EditSubCategory
                    data={editData} 
                    close={() => setOpenEdit(false)}
                    fetchData={fetchSubCategory}
                />
            }
            {openDeleteConfirmBox && (
                <CofirmBox
                    cancel={() => setopenDeleteConfirmBox(false)}
                    close={() => setopenDeleteConfirmBox(false)}
                    confirm={handleDeleteSubCategory}
                />
            )}
        </section>
    )
}

export default SubCategoryPage