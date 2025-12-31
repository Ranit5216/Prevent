import React, { useEffect, useState, useCallback } from 'react'
import { IoSearch } from "react-icons/io5";
import { useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

const Search = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isSearchPage,setIsSearchPage] = useState(false)
    const searchText = location.search ? location.search.slice(3) : ""
    const [searchValue, setSearchValue] = useState(searchText)

    useEffect(()=>{
        const isSearch = location.pathname === "/search"
        setIsSearchPage(isSearch)
    },[location])

    useEffect(() => {
        setSearchValue(searchText)
    }, [searchText])

    const redirectToSearchPage = ()=>{
        navigate("/search")
    }

    // Debounced navigation function
    const debouncedNavigate = useCallback(
        (() => {
            let timeoutId
            return (value) => {
                clearTimeout(timeoutId)
                timeoutId = setTimeout(() => {
                    const url = `search?q=${value}`
                    navigate(url)
                }, 500) // 500ms debounce delay
            }
        })(),
        [navigate]
    )

    const handleOnChange = (e)=>{
        const value = e.target.value
        setSearchValue(value)
        // Debounce the navigation
        debouncedNavigate(value)
    }

   

  return (
    <div className='w-full h-10 md:h-11 rounded-lg overflow-hidden flex items-center text-gray-400 bg-gray-50 border-2 border-gray-200 group focus-within:border-[#DC2626] focus-within:ring-2 focus-within:ring-red-100 focus-within:bg-white transition-all duration-300 shadow-sm hover:shadow-md hover:border-gray-300'>
        <div className='flex-shrink-0 pl-3 md:pl-4'>
                <div className='flex justify-center items-center h-full text-gray-500'>
                    <IoSearch size={18} className='md:w-5 md:h-5 text-gray-400 group-focus-within:text-[#DC2626] transition-colors'/>
                </div>
        </div>

        <div className='w-full h-full flex items-center pr-3 md:pr-4'>
            {
                !isSearchPage ? (
                    //not is search page
                    <div onClick={redirectToSearchPage} className='w-full h-full flex items-center cursor-text px-2 md:px-3'>
                        <TypeAnimation
                            sequence={[
                                'Search for events, photographers, makeup artists...',
                                2500,
                                'Search for catering, event planners...',
                                2500,
                                'Search for models, decorators...',
                                2500
                            ]}
                            wrapper="span"
                            speed={50}
                            repeat={Infinity}
                            className='text-gray-500 text-xs md:text-sm'
                            />
                    </div>
                ) : (
                    //when i was searchpage
                    <div className='w-full h-full'>
                        <input
                            type='text'
                            placeholder='Search for events, photographers, makeup artists...'
                            autoFocus
                            value={searchValue}
                            className='bg-transparent w-full h-full outline-none text-gray-700 text-xs md:text-sm placeholder-gray-400 px-2 md:px-3'
                            onChange={handleOnChange}
                        />
                    </div>
                )
            }

        </div>

    </div>
  )
}

export default Search
