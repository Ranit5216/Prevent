import React, { useEffect, useState } from 'react'
import logo from '../assets/until-logo-1.png'
import Search from './Search'
import { TypeAnimation } from 'react-type-animation';
import { Link, useLocation,useNavigate } from 'react-router-dom';
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from '../hooks/useMobile';
import { BsCart4 } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { GoTriangleDown,  GoTriangleUp } from "react-icons/go";
import UserMenu from './UserMenu';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { GlobalContext, useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';


const Header = () => {
  const [ isMobile ] = useMobile()
  const location = useLocation()
  const isSearchPage = location.pathname === '/search'
  const navigate = useNavigate()
  const user = useSelector((state)=> state?.user)
  const [openUserMenu,setOpenUserMenu] = useState(false)
  const cartItem = useSelector(state => state.cartItem.cart)
  //const [totelPrice,setTotalPrice] = useState(0)
  //const [totalQty,setTotalQty] = useState(0)
  const { totalPrice,totalQty} = useGlobalContext()
  const [openCartSection, setOpenCartSection ] = useState(false)


  const redirectToLoginPage = ()=>{
    navigate("/login")
  }

  const handleCloseMenu = ()=>{
    setOpenUserMenu(false)
  }

  const handleMobileUser = ()=>{
    if(!user._id){
      navigate("/login")
      return
    }

    navigate("/user")
  }

  //Total item and total price
  //useEffect(()=>{
    //const qty = cartItem.reduce((preve,curr)=>{
    //  return preve + curr.quantity
    //},0)
    //setTotalQty(qty)
    

    //const tPrice = cartItem.reduce((preve,curr)=>{
     // return preve + (curr.productId.price * curr.quantity)
    //},0)
    //setTotalPrice(tPrice)
  //},[cartItem])



  
  return (
    <header className='h-28 lg:h-20 lg:shadow-md sticky top-0 z-40 bg-red-500 flex items-center flex-col justify-center gap-1'>
      {
        !(isSearchPage && isMobile) && (
        <div className='container mx-auto flex items-center px-2 lg:pt-1 justify-between'>
          {/**logo */}
          <div className='h-full'>
            <Link to={"/"} className='h-full flex justify-center items-center'>
              <img
                  src={logo}
                  width={190}
                  height={190}
                  alt='logo'
                  className='hidden lg:block '
              />
              <img
                  src={logo}
                  width={130}
                  height={130}
                  alt='logo'
                  className='lg:hidden'
              />
            </Link>

          </div>
        

          {/**Search */}
          <div className='hidden lg:block'>
            <Search/>
          </div>




          {/**login and my cart */}
          <div className=''>
            {/** user icons display in only in mobile version **/}
            <button className='text-neutral-600 lg:hidden' onClick={handleMobileUser}>
                <FaRegCircleUser size={26}/>
            </button>

            {/** Dekstop */}
            <div className='hidden lg:flex items-center gap-10'>
              {

                user?._id ? (
                  <div className='relative'>
                    <div  onClick={()=>setOpenUserMenu(preve => !preve)} className='cursor-pointer flex select-none items-center gap-1'>
                      <p>Account</p>
                      {
                        openUserMenu ? (
                          <GoTriangleUp size={25}/> 
                        ) : (
                          <GoTriangleDown size={25}/>
                        )
                      } 
                    </div>
                    {
                      openUserMenu && (
                        <div className='absolute right-0 top-12'>
                          <div  className='bg-white rounded p-4 min-w-52 lg:shadow-lg'>
                            <UserMenu close={handleCloseMenu}/>
                          </div>
                        </div>
                      )
                    }
                    
                  </div>
                ) : (
                  <button onClick={redirectToLoginPage} className='cursor-pointer text-lg px-2'>Login</button>
                )
              }
            
                
                <button onClick={()=>setOpenCartSection(true)} className='flex items-center gap-2 cursor-pointer bg-green-600 px-4 py-3 hover:bg-green-800 rounded text-white'>
                  {/**add to cart icon */}
                  <div className='animate-bounce'>
                      <BsCart4 size={26}/>
                  </div>
                  <div className='font-semibold text-sm'>
                    {
                      cartItem[0] ? (
                        <div>
                            <p>{totalQty} Items</p>
                            <p>{DisplayPriceInRupees(totalPrice)}</p>
                        </div>
                      ) : (
                        <p>My Cart</p>
                      )
                    }
                    
                    
                  </div>
                </button>
            </div>
          </div>

        </div>
        )

      }
        
      <div className='container mx-auto px-2 lg:hidden'>
        <Search/>
      </div>

      {
        openCartSection && (
          <DisplayCartItem close={()=>setOpenCartSection(false)}/>
        )
      }

    </header>
        
  )
}

export default Header
