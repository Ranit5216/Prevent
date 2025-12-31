import React from 'react'
import UserMenu from '../components/UserMenu'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Dashboard = () => {
  const user = useSelector(state => state.user)

  return (
    <section className='bg-[#F8FAFC] min-h-screen'>
        <div className='max-w-[1600px] mx-auto px-3 py-3 sm:px-5 sm:py-5 flex flex-col lg:flex-row gap-3 sm:gap-5'>
            {/**left for menu */}
            <aside className='w-full lg:w-[260px] flex-shrink-0'>
                <div className='hidden lg:block sticky top-[90px]'>
                    <UserMenu/>
                </div>
            </aside>

            {/**right for content */}
            <main className='flex-1 min-w-0'>
                <div className='bg-white rounded-lg sm:rounded-xl shadow-sm border border-[#E2E8F0] min-h-[75vh]'>
                    <Outlet/>
                </div>
            </main>
        </div>
    </section>
  )
}

export default Dashboard