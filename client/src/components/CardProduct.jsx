import React from "react";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { Link } from "react-router-dom";
import { valideURLConvert } from "../utils/valideURLConvert";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { useState } from "react";
import Axios from "../utils/Axios";
import toast from "react-hot-toast";
import { useGlobalContext } from "../provider/GlobalProvider";
import AddToCartButton from "./AddToCartButton";

const CardProduct = ({data}) =>{
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`
  const [loading,setLoading] = useState(false)
 
    return(
    <Link to={url} className='border p-4 grid gap-3 max-w-52 rounded bg-white cursor-pointer '>
      <div className='h-35 bg-blue-50 rounded'>
        <img
            src={data.image[0]}
            className="w-45 rounded h-full "
        />
      </div>
        <div className=' flex rounded-fit text-sm w-fit  text-green-600 bg-green-100'>
          Booking now
          {
              Boolean(data.discount) && (
                <p className="text-green-500 pr-5
                ">{data.discount}% <span className="text-sm text-neutral-500">Discount</span></p>
              
              )
          }
        </div>
      <div className='font-medium text-ellipsis line-clamp-2'>
        {data.name}
      </div>
      <div className='w-fit'>
        {data.unit}
      </div>

      <div className='flex items-center  gap-7 '>
        <div className="flex items-center gap-1">
          <div className='font-semibold'>
              {DisplayPriceInRupees(pricewithDiscount(data.price,data.discount))}
          </div>
          
        </div>
        <div className=''>
          {
            data.stock == 0 ? (
              <p className='text-red-500 text-sm text-center'>Out of stock</p>
            ) : (
              <AddToCartButton data={data} />
            )
          }
            
        </div>

      </div>
      <div>
        
      </div>

    </Link>
    )
}

export default CardProduct