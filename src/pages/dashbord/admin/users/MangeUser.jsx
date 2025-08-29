import React, { useState } from 'react';
import { useDeleteUserMutation, useGetUserQuery } from '../../../../redux/features/auth/authApi';
import { Link } from 'react-router-dom';
import UpdateUserModal from './UpdateUserModal';

const ManageUser = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { data: users = [], error, isLoading, refetch } = useGetUserQuery();

    const [deleteUser] = useDeleteUserMutation();

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟");
        if (!confirmDelete) return;
        
        try {
            await deleteUser(id).unwrap();
            alert("تم حذف المستخدم بنجاح!");
            refetch();
        } catch (error) {
            console.error("فشل في حذف المستخدم", error);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <>
            {isLoading && <div>جاري التحميل...</div>}
            {error && <div>حدث خطأ أثناء تحميل بيانات المستخدمين.</div>}
            
            <section className="py-4 bg-gray-100 text-right w-full">
                <div className="container mx-auto px-2 sm:px-4">
                    <div className="bg-white shadow-lg rounded-lg ">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold mb-2 sm:mb-0">جميع المستخدمين</h3>
                            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">عرض الكل</button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse bg-white shadow-md rounded-lg text-xs sm:text-sm">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-2">رقم</th>
                                        <th className="p-2">البريد الإلكتروني</th>
                                        <th className="p-2">الدور</th>
                                        <th className="p-2">تعديل</th>
                                        <th className="p-2">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users && users.map((user, index) => (
                                        <tr key={index} className="border-b text-center">
                                            <td className="p-2">{index + 1}</td>
                                            <td className="p-2">{user?.email || 'غير متوفر'}</td>
                                            <td className="p-2">
                                                <span className={`rounded-full py-1 px-3 ${user?.role === "admin" ? "bg-indigo-500 text-white" : "bg-green-400"}`}>
                                                    {user?.role === "admin" ? "مسؤول" : "محل"}
                                                </span>
                                            </td>
                                            <td className="p-2 font-bold text-lg text-blue-500 cursor-pointer">
                                                <button onClick={() => handleEdit(user)} className='hover:text-red-500'>تعديل</button>
                                            </td>
                                            <td className="p-2">
                                                <button onClick={() => handleDelete(user?._id)} className='bg-red-500 text-white px-2 py-1 rounded text-xs sm:text-sm'>حذف</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {isModalOpen && <UpdateUserModal user={selectedUser} onClose={handleCloseModal} onRoleUpdate={refetch} />}
        </>
    );
};

export default ManageUser;