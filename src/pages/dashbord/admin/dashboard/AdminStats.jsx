import React from 'react'

const AdminStats = ({stats}) => {
  return (
    <div className='my-5 space-y-4'>
        <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1'>
            {/* <div className='bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:scale-105 transition-all duration-200 cursor-pointer'>
                <h2 className='text-xl font-semibold mb-2'>إجمالي الأرباح (بدون شحن)</h2>
                <p className='text-2xl font-bold'>{stats?.totalEarnings?.toFixed(2)} ر.ع</p>
            </div> */}
            <div className='bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:scale-105 transition-all duration-200 cursor-pointer'>
                <h2 className='text-xl font-semibold mb-2'>جميع الطلبات</h2>
                <p className='text-2xl font-bold'>{stats?.totalOrders}</p>
            </div>
            <div className='bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:scale-105 transition-all duration-200 cursor-pointer'>
                <h2 className='text-xl font-semibold mb-2'>جميع المستخدمين</h2>
                <p className='text-2xl font-bold'>{stats?.totalUsers}</p>
            </div>
            <div className='bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:scale-105 transition-all duration-200 cursor-pointer'>
                <h2 className='text-xl font-semibold mb-2'>إجمالي المنتجات</h2>
                <p className='text-2xl font-bold'>{stats?.totalProducts}</p>
            </div>
        </div>
    </div>
  )
}

export default AdminStats