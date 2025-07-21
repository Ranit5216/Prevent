import React from "react";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { Link } from "react-router-dom";
import { valideURLConvert } from "../utils/valideURLConvert";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import AddToCartButton from "./AddToCartButton";
import { FaShoppingCart } from "react-icons/fa";

const CARD_WIDTH = "w-72"; // fixed width (18rem)
const CARD_HEIGHT = "h-96"; // fixed height (24rem)

const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;

  return (
    <Link
      to={url}
      className={`bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3 ${CARD_WIDTH} ${CARD_HEIGHT} cursor-pointer border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200`}
      aria-label={data.name}
      style={{ minWidth: '18rem', minHeight: '24rem', maxWidth: '18rem', maxHeight: '24rem' }}
    >
      {/* Image Section */}
      <div className="aspect-[4/3] w-full bg-blue-50 rounded-xl overflow-hidden flex items-center justify-center mb-2">
        <img
          src={data.image[0]}
          alt={data.name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Badge Section */}
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
          Booking now
        </span>
        {Boolean(data.discount) && (
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-600">
            {data.discount}% <span className="text-gray-500">Off</span>
          </span>
        )}
      </div>
      {/* Title & Unit */}
      <div className="font-semibold text-gray-900 text-base line-clamp-2 mb-1">{data.name}</div>
      {/* Price & Add to Cart */}
      <div className="flex items-end justify-between mt-auto gap-2">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-green-700">
            {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
          </span>
          {Boolean(data.discount) && (
            <span className="text-xs text-gray-400 line-through">
              {DisplayPriceInRupees(data.price)}
            </span>
          )}
        </div>
        <div>
          {data.stock === 0 ? (
            <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-1 rounded">Out of stock</span>
          ) : (
            <AddToCartButton data={data} customButtonClass="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold shadow" icon={<FaShoppingCart />} />
          )}
        </div>
      </div>
    </Link>
  );
};

export default CardProduct;