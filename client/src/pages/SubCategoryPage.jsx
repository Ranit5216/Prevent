import React, { useEffect, useState } from "react"
import UploadSubCategoryModel from "../components/UploadSubCategoryModel"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import AxiosToastError from "../utils/AxiosToastError"
import DisplayTable from "../components/DisplayTable"
import { createColumnHelper } from "@tanstack/react-table"
import ViewImage from "../components/ViewImage"
import { MdDelete } from "react-icons/md"
import { HiPencil } from "react-icons/hi"
import EditSubCategory from "../components/EditSubCategory"
import CofirmBox from "../components/CofirmBox"
import toast from "react-hot-toast"
import { FaPlus } from "react-icons/fa"

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
            header : "Name"
        }),
        columnHelper.accessor('image',{
            header : "Image",
            cell : ({row})=>{
                console.log("row",)
                return <div className="flex justify-center items-center">
                    <img
                    src={row.original.image}
                    alt={row.original.name}
                    className='w-10 h-10 cursor-pointer'
                    onClick={()=>{
                        setImageURL(row.original.image)
                    }}
                />
                </div>
            }
        }),
        columnHelper.accessor("category",{
            header : "Category",
            cell : ({row})=>{
                return(
                    <>
                        {
                            row.original.category.map((c,index)=>{
                                return(
                                    <p key={c._id+"table"} className="shadow-md px-1 inline-block">{c.name}</p>
                                )
                            })
                        }
                    </>
                )
            }
        }),
        columnHelper.accessor("_id",{
            header : "Action",
            cell : ({row})=>{
                return(
                    <div className="flex items-center justify-center gap-3">
                        <button onClick={()=>{
                            setOpenEdit(true)
                            setEditData(row.original)
                        }} className="p-2 bg-green-200 rounded-full cursor-pointer hover:text-green-500">
                            < HiPencil size={20}/>
                        </button>
                        <button onClick={()=>{
                            setopenDeleteConfirmBox(true)
                            setDeleteSubCategory(row.original)
                        }} className="p-2 bg-red-200 text-red-400 rounded-full cursor-pointer hover:text-red-600">
                            <MdDelete size={20}/>
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
        <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Sub Categories</h2>
                            <p className="text-gray-600 mt-1">Manage your subcategories here</p>
                        </div>
                        <button 
                            onClick={() => setOpenAddSubCategory(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
                        >
                            <FaPlus />
                            Add Sub Category
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <DisplayTable
                        data={data}
                        column={column}
                    />
                </div>
            </div>

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