import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCards from './ProductCards';
import ShopFiltering from './ShopFiltering';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';

const categories = [
    { label: 'الكل', value: 'الكل' },
    { label: 'نظارات', value: 'نظارات' },
    { label: 'محافظ', value: 'محافظ' },
    { label: 'ساعات', value: 'ساعات' },
    { label: 'غتر', value: 'غتر' },
    { label: 'اقلام', value: 'اقلام' },
    { label: 'بوكسات الشهر', value: 'بوكسات الشهر' },
    { label: 'أقمشة', value: 'أقمشة'},
    { label: 'مسباح', value: 'مسباح'},
    { label: 'اكسسوارات', value: 'اكسسوارات'},
    { label: 'كابات', value: 'كابات'},
    { label: 'شنط رجالية', value: 'شنط رجالية'},
    { label: 'شنط نسائية', value: 'شنط نسائية'},
    { label: 'احذية', value: 'احذية'},
    { label: 'عطورات', value: 'عطورات'},
];

const genderTypes = [
    { label: 'الكل', value: 'الكل' },
    { label: 'رجالي', value: 'رجالي' },
    { label: 'نسائي', value: 'نسائي' },
];

// فئات تحتاج فلتر النوع
const needsGender = (cat) => cat === 'نظارات' || cat === 'ساعات' || cat === 'احذية';

const ShopPage = () => {
    const [searchParams] = useSearchParams();
    const urlCategory = searchParams.get('category');
    const urlGender = searchParams.get('gender');
    
    const [filtersState, setFiltersState] = useState({
        category: urlCategory || 'الكل',
        gender: urlGender || 'الكل'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [ProductsPerPage] = useState(8);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (urlCategory || urlGender) {
            setFiltersState({
                category: urlCategory || 'الكل',
                gender: urlGender || 'الكل'
            });
        }
    }, [urlCategory, urlGender]);

    const { data: { products = [], totalPages = 1, totalProducts = 0 } = {}, error, isLoading } =
      useFetchAllProductsQuery({
        category: filtersState.category === 'الكل' ? '' : filtersState.category,
        // تمرير الجندر عند نظارات/ساعات/احذية فقط
        gender: needsGender(filtersState.category)
          ? (filtersState.gender === 'الكل' ? '' : filtersState.gender)
          : '',
        page: currentPage,
        limit: ProductsPerPage,
    });

    const clearFilters = () => {
        setFiltersState({ category: 'الكل', gender: 'الكل' });
        setCurrentPage(1);
    }; 

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    if (isLoading) return <div className="text-center py-8">جاري التحميل...</div>;
    if (error) return <div className="text-center py-8 text-red-500">حدث خطأ أثناء تحميل المنتجات</div>;

    // const startProduct = (currentPage - 1) * ProductsPerPage + 1;
    // const endProduct = startProduct + products.length - 1;

    return (
        <>
            <section className='section__container bg-[#FAEBD7]'>
                <h2 className='section__header capitalize'>صفحة المتجر</h2>
                <p className='section__subheader'> .أنتقينا لك الأجود… لأنك تستحق الأفضل</p>
            </section>

            <section className='section__container'>
                <div className='flex flex-col md:flex-row md:gap-12 gap-8'>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className='md:hidden bg-[#CEAE7A] py-2 px-4 text-white rounded mb-4 w-fit'
                    >
                        {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
                    </button>

                    <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                        <ShopFiltering
                            categories={categories}
                            genderTypes={genderTypes}
                            filtersState={filtersState}
                            setFiltersState={setFiltersState}
                            clearFilters={clearFilters}
                            needsGender={needsGender}
                        />
                    </div>

                    <div className='flex-1'>
                        {products.length > 0 ? (
                            <>
                                <ProductCards products={products} />
                                
                                <div className='mt-6 flex justify-center'>
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2 disabled:opacity-50'
                                    >
                                        السابق
                                    </button>

                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(index + 1)}
                                            className={`px-4 py-2 mx-1 rounded-md ${currentPage === index + 1 ? 'bg-[#CEAE7A] text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md ml-2 disabled:opacity-50'
                                    >
                                        التالي
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-lg text-gray-500">لا توجد منتجات متاحة حسب الفلتر المحدد</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ShopPage;
