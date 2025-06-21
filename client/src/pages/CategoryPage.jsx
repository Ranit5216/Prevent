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
        <section>
            <div className="p-2 bg-white shadow-md flex items-center justify-between">
                <h2 className="font-semibold">Category</h2>
                <button onClick={()=>setOpenUploadCategory(true)}
                 className="text-sm border border-amber-300 hover:bg-yellow-300 px-3 py-1 rounded">Add Category</button>
            </div>
            {
                !categoryData[0] && !loading && (
                    <NoData/>
                )
            }

            <div className="p-2 grid grid-cols-2 lg:grid-cols-4 gap-2">
            {
                categoryData.map((category,index)=>{
                    return(
                        <div>
                            <div className=" pb-8 m-10 w-30 h-36 rounded shadow-md" key={category._id}>
                                <img
                                    src={category.image}
                                    className="w-full h-full"

                                />
                                <div className=" mt-1.5 rounded shadow-md bg-blue-30">
                                    {category.name}
                                    
                                </div>
                                <div className="mt-2 rounded shadow-md bg-blue-50">
                                    <button onClick={()=>{
                                        setOpenEdit(true)
                                        setEditData(category)
                                    }} className="flex-1 bg-blue-300 hover:bg-blue-500 rounded cursor-pointer font-medium">
                                        Edit
                                    </button>
                                    <button onClick={()=>{
                                        setOpenConfirmBoxDelete(true)
                                        setdeleteCategory(category)
                                    }} className="flex-1 ml-9 bg-red-300 hover:bg-red-500 rounded cursor-pointer font-medium">
                                        Delete
                                    </button>
                                </div>   
                            </div>
                        </div>
                    )
                })
            }
            </div>

            {
                loading && (
                    <Loading/>
                )
            }

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