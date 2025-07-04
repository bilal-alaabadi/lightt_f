import React, { useState } from 'react';
import { useDeleteOrderMutation, useGetAllOrdersQuery } from '../../../../redux/features/orders/orderApi';
import { formatDate } from '../../../../utils/formateDate';
import UpdateOrderModal from './UpdateOrderModal';
import html2pdf from 'html2pdf.js';

const ManageOrders = () => {
    const { data: orders, error, isLoading, refetch } = useGetAllOrdersQuery();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewOrder, setViewOrder] = useState(null);
    const [deleteOrder] = useDeleteOrderMutation();

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleDeleteOder = async (orderId) => {
        try {
            await deleteOrder(orderId).unwrap();
            alert("تم حذف الطلب بنجاح");
            refetch();
        } catch (error) {
            console.error("فشل حذف الطلب:", error);
        }
    };

    const handleViewOrder = (order) => {
        setViewOrder(order);
    };

    const handleCloseViewModal = () => {
        setViewOrder(null);
    };

    const handlePrintOrder = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('order-details');
        const options = {
            margin: [10, 10],
            filename: `طلب_${viewOrder._id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        html2pdf().from(element).set(options).save();
    };

    const handleContactWhatsApp = (phone) => {
        if (!phone) {
            alert('رقم الهاتف غير متوفر');
            return;
        }
        
        const cleanedPhone = phone.replace(/\D/g, '');
        const message = `مرحباً ${viewOrder.customerName || 'عميلنا العزيز'}،
        
تفاصيل طلبك رقم: ${viewOrder.orderId}
تاريخ الطلب: ${formatDate(viewOrder.createdAt)}
المجموع النهائي: ${(viewOrder.amount || 0).toFixed(2)} ر.ع

المنتجات:
${viewOrder.products?.map(p => `- ${p.name} (${p.quantity}x ${(p.price || 0).toFixed(2)} ر.ع)`).join('\n')}

الرجاء تأكيد استلامك للطلب. شكراً لثقتكم بنا!`;
        
        window.open(`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const formatPrice = (price) => {
        return (parseFloat(price) || 0).toFixed(2);
    };

    if (isLoading) return <div className="p-4 text-center">جار التحميل...</div>;
    if (error) return <div className="p-4 text-center text-red-500">لا توجد طلبات</div>;

    return (
        <div className='section__container p-4 md:p-6' dir='rtl'>
            <h2 className='text-xl md:text-2xl font-semibold mb-4'>إدارة الطلبات</h2>
            
            <div className="overflow-x-auto">
                <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='py-3 px-2 md:px-4 border-b text-right'>رقم الطلب</th>
                            <th className='py-3 px-2 md:px-4 border-b text-right'>العميل</th>
                            <th className='py-3 px-2 md:px-4 border-b text-right'>التاريخ</th>
                            <th className='py-3 px-2 md:px-4 border-b text-right'>الإجراءات</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders?.length > 0 ? (
                            orders.map((order, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                    <td className='py-3 px-2 md:px-4 border-b'>{order?.orderId || '--'}</td>
                                    <td className='py-3 px-2 md:px-4 border-b'>{order?.customerName || order?.email || 'غير محدد'}</td>
                                    <td className='py-3 px-2 md:px-4 border-b'>{formatDate(order?.updatedAt)}</td>
                                    <td className='py-3 px-2 md:px-4 border-b'>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <button
                                                className="text-blue-500 hover:underline text-sm md:text-base"
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                عرض التفاصيل
                                            </button>
                                            <button
                                                className="text-red-500 hover:underline text-sm md:text-base"
                                                onClick={() => handleDeleteOder(order?._id)}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-4 text-center text-gray-500">
                                    لا توجد طلبات متاحة
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {viewOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
                    <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto print-modal" id="order-details" dir="rtl">
                        <style>
                            {`
                                @media print {
                                    body * {
                                        visibility: hidden;
                                    }
                                    .print-modal, .print-modal * {
                                        visibility: visible;
                                    }
                                    .print-modal {
                                        position: absolute;
                                        left: 0;
                                        top: 0;
                                        width: 100%;
                                        max-width: 100%;
                                        box-shadow: none;
                                        border: none;
                                        padding: 20px;
                                    }
                                    .print-modal button {
                                        display: none;
                                    }
                                    .print-header {
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        margin-bottom: 20px;
                                        border-bottom: 1px solid #eee;
                                        padding-bottom: 10px;
                                    }
                                    .invoice-title {
                                        font-size: 24px;
                                        font-weight: bold;
                                        color: #333;
                                    }
                                    .invoice-meta {
                                        text-align: left;
                                    }
                                }
                            `}
                        </style>
                        
                        <div className="print-header">
                            <div>
                                <h1 className="invoice-title">فاتورة الطلب</h1>
                                <p className="text-gray-600">شكراً لاختياركم متجرنا</p>
                            </div>
                            <div className="invoice-meta">
                                <p><strong>رقم الفاتورة:</strong> #{viewOrder.orderId}</p>
                                <p><strong>تاريخ الفاتورة:</strong> {formatDate(viewOrder.createdAt)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3 border-b pb-2">معلومات العميل</h3>
                                <div className="space-y-2">
                                    <p><strong>الاسم:</strong> {viewOrder.customerName || 'غير محدد'}</p>
                                    <p><strong>رقم الهاتف:</strong> {viewOrder.customerPhone || 'غير محدد'}</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3 border-b pb-2">معلومات التوصيل</h3>
                                <div className="space-y-2">
                                    <p><strong>الولاية:</strong> {viewOrder.wilayat || 'غير محدد'}</p>
                                    <p><strong>ملاحظات:</strong> {viewOrder.notes || 'لا توجد ملاحظات'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="font-bold text-lg mb-3 border-b pb-2">المنتجات المطلوبة</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 text-right w-16">#</th>
                                            <th className="py-3 px-4 text-right">الصورة</th>
                                            <th className="py-3 px-4 text-right">المنتج</th>
                                            <th className="py-3 px-4 text-right">الكمية</th>
                                            <th className="py-3 px-4 text-right">سعر الوحدة</th>
                                            <th className="py-3 px-4 text-right">المجموع</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewOrder.products?.map((product, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="py-3 px-4 text-center">{index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <img 
                                                        src={product.image || '/images/placeholder.jpg'} 
                                                        alt={product.name || 'منتج'} 
                                                        className="w-16 h-16 object-cover rounded mx-auto"
                                                        onError={(e) => {
                                                            e.target.src = '/images/placeholder.jpg';
                                                            e.target.alt = 'صورة غير متوفرة';
                                                        }}
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium">{product.name || 'منتج غير محدد'}</p>
                                                        {product.selectedSize && (
                                                            <p className="text-xs text-gray-500">الحجم: {product.selectedSize}</p>
                                                        )}
                                                        {product.selectedColor && (
                                                            <p className="text-xs text-gray-500">اللون: {product.selectedColor}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">{product.quantity || 0}</td>
                                                <td className="py-3 px-4 text-left">{formatPrice(product.price)} ر.ع</td>
                                                <td className="py-3 px-4 text-left font-medium">
                                                    {formatPrice((product.price || 0) * (product.quantity || 0))} ر.ع
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg mb-6">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">ملخص الفاتورة</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span>الإجمالي الجزئي:</span>
                                    <span>{formatPrice(viewOrder.amount - 2)} ر.ع</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>رسوم الشحن:</span>
                                    <span>2.00 ر.ع</span>
                                </div>
                                {viewOrder.discount > 0 && (
                                    <div className="flex justify-between items-center text-red-600">
                                        <span>خصم:</span>
                                        <span>-{formatPrice(viewOrder.discount)} ر.ع</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="font-bold text-lg">الإجمالي النهائي:</span>
                                    <span className="font-bold text-lg text-blue-600">{formatPrice(viewOrder.amount)} ر.ع</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3 justify-end">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm md:text-base flex items-center gap-2"
                                onClick={handleCloseViewModal}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/>
                                </svg>
                                إغلاق
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm md:text-base flex items-center gap-2"
                                onClick={handlePrintOrder}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 17v4h-12v-4h-4v-9c0-2.761 2.239-5 5-5h10c2.761 0 5 2.239 5 5v9h-4zm-10-1h8v1h-8v-1zm0-2h8v1h-8v-1zm-5-6v5h18v-5c0-1.656-1.344-3-3-3h-12c-1.656 0-3 1.344-3 3zm18 2h-2v-1h2v1z"/>
                                </svg>
                                طباعة الفاتورة
                            </button>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm md:text-base flex items-center gap-2"
                                onClick={handleDownloadPDF}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14 2v17h2v-7h3v7h2v-17h-7zm-9 0v17h2v-7h3v7h2v-17h-9z"/>
                                </svg>
                                تحميل PDF
                            </button>
                            {viewOrder.customerPhone && (
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm md:text-base flex items-center gap-2"
                                    onClick={() => handleContactWhatsApp(viewOrder.customerPhone)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335 .157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    التواصل عبر واتساب
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;