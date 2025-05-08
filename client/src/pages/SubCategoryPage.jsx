import React, { useEffect, useState } from "react"
import UploadSubCategoryModel from "../components/UploadSubCategoryModel"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import AxiosToastError from "../utils/AxiosToastError"
import DisplayTable from "../components/DisplayTable"
import { createColumnHelper } from "@tanstack/react-table"
import ViewImage from "../components/ViewImage"
import { MdDelete } from "react-icons/md";
import { HiPencil } from "react-icons/hi";
import EditSubCategory from "../components/EditSubCategory"
import CofirmBox from "../components/CofirmBox"
import toast from "react-hot-toast"

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
        <section className="">
            <div className="p-2 bg-white shadow-md flex items-center justify-between">
                <h2 className="font-semibold">Sub Category</h2>
                <button onClick={()=>setOpenAddSubCategory(true)} className="text-sm border border-amber-300 hover:bg-yellow-300 px-3 py-1 rounded cursor-pointer">Add Sub Category</button>
            </div>

            <div>
                <DisplayTable
                    data={data}
                    column={column}
                />
            </div>

            {
                openAddSubCategory && (
                    <UploadSubCategoryModel
                    close={()=>setOpenAddSubCategory(false)}
                    fetchData={fetchSubCategory}
                    />
                )
            }
            {
                ImageURL && 
                <ViewImage url={ImageURL} close={()=>setImageURL("")}/>
            }

            {
                OpenEdit &&
                <EditSubCategory
                data={editData} 
                close={()=>setOpenEdit(false)}
                fetchData={fetchSubCategory}
                />
            }

            {
                openDeleteConfirmBox && (
                    <CofirmBox
                    cancel={()=>setopenDeleteConfirmBox(false)}
                    close={()=>setopenDeleteConfirmBox(false)}
                    confirm={handleDeleteSubCategory}
                    />
                )
            }
        </section>
    )

 
         

 
}

export default SubCategoryPage