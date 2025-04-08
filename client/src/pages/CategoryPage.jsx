import React, {useEffect, useState} from "react";
import UploadCategoryModel from "../components/UploadCategoryModel";
import Loading from "../components/Loading";
import NoData from "../components/NoData";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

const CategoryPage = () => {
    const [openUploadCategory,setOpenUploadCategory] = useState(false)
    const [loading,setLoading] = useState(false)
    const [categoryData,setCategoryData] = useState([])

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
                        <div className=" p-1 m-4 w-30 h-46 rounded shadow-md bg-blue-100">
                            <img
                                alt={category.name}
                                src={category.image}
                                className="w-full object-scale-down"

                            />
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
                    <UploadCategoryModel fetchCategory={fetchCategory} close={()=>setOpenUploadCategory(false)}/>
                )
            }
            
        </section>
    )
}
export default CategoryPage