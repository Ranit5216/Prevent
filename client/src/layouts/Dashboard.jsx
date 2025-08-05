import React from 'react'
import UserMenu from '../components/UserMenu'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Dashboard = () => {
  const user = useSelector(state => state.user)

  return (
    <section className='bg-white'>
        <div className= 'container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 '>
                {/**left for menu */}
                <div className='py-4 sticky top-24 max-h-120 overflow-y-auto hidden lg:block border-r'>
                    <UserMenu/>
                </div>


                {/**right for content */}
                <div className='bg-white min-h-[75vh]'>
                    <Outlet/>
                </div>
        </div>
    </section>
  )
}

export default Dashboard