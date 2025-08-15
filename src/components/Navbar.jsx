import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import CartModal from '../pages/shop/CartModal';
import avatarImg from "../assets/avatar.png";
import { useLogoutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import logo from "../assets/Asset_8__1_-removebg-preview.png"

const Navbar = () => {
    const products = useSelector((state) => state.cart.products);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const handleCartToggle = () => setIsCartOpen(!isCartOpen); 

    // User authentication
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [logoutUser] = useLogoutUserMutation();
    const navigate = useNavigate();

    // Dropdown menus
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const handleDropDownToggle = () => setIsDropDownOpen(!isDropDownOpen);

    // Mobile menu toggle
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // إغلاق القائمة المتنقلة عند النقر على رابط
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Admin dropdown menus
    const adminDropDownMenus = [
        { label: "لوحة التحكم", path: "/dashboard/admin" },
        { label: "تعديل المنتجات ", path: "/dashboard/manage-products" },
        { label: "إضافة منتج", path: "/dashboard/add-product" },
    ];

    // User dropdown menus
    const userDropDownMenus = [
        { label: "لوحة التحكم", path: "/dashboard" },
    ];

    const dropdownMenus = user?.role === 'admin' ? [...adminDropDownMenus] : [...userDropDownMenus];

    const handleLogout = async () => {
        try {
            await logoutUser().unwrap();
            dispatch(logout());
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
<header className='fixed-nav-bar w-full bg-white pt-10 pb-8'>
    <nav className='max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative'>
        {/* Mobile Menu Button (Hamburger Icon) */}
        <button
            onClick={handleMobileMenuToggle}
            className='sm:hidden text-gray-700 hover:text-[#d3ae27] focus:outline-none text-2xl'
        >
            <i className="ri-menu-line text-3xl"></i>
        </button>

        {/* Nav Links (Desktop) */}
        <ul className='hidden sm:flex gap-6 md:gap-8 text-lg' dir='rtl'>
            <li>
                <Link to="" className='text-lg hover:text-[#d3ae27] transition-colors duration-300'>
                    الرئيسية
                </Link>
            </li>
            <li>
                <Link to="/Shop" className='text-lg hover:text-[#d3ae27] transition-colors duration-300'>
                    المنتجات
                </Link>
            </li>
        </ul>

        {/* Logo (Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <Link to="/" className="inline-block">
                <img 
                    src={logo} 
                    alt="شعار رؤية" 
                    className="w-72 h-56 sm:w-60 sm:h-60 lg:w-72 lg:h-72 pt-5 pb-2"
                    loading="lazy" 
                />
            </Link>
        </div>

        {/* Nav Icons */}
        <div className='flex items-center gap-4 sm:gap-8 text-2xl'>
            {/* Search Button */}
{/* Search Button - Hidden on Mobile */}
<Link 
    to="/search" 
    className='hidden sm:inline-flex hover:text-[#d3ae27] transition-colors duration-300'
>
    <i className="ri-search-line text-2xl"></i>
</Link>


            <button onClick={handleCartToggle} className='relative hover:text-[#d3ae27] transition-colors duration-300'>
                <i className="ri-shopping-bag-line text-2xl"></i>
                {products.length > 0 && (
                    <sup className='absolute -top-2 -right-2 text-sm bg-primary text-white rounded-full px-1.5'>
                        {products.length}
                    </sup>
                )}
            </button>
            {user ? (
                <div className='relative'>
                    <img
                        onClick={handleDropDownToggle}
                        src={user?.profileImage || avatarImg}
                        alt="User Avatar"
                        className='size-10 rounded-full cursor-pointer'
                    />
                    {isDropDownOpen && (
                        <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50' >
                            <ul className='space-y-2 p-2 text-lg'>
                                {dropdownMenus.map((menu, index) => (
                                    <li key={index}>
                                        <Link
                                            to={menu.path}
                                            onClick={() => setIsDropDownOpen(false)}
                                            className='block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 rounded-lg'
                                        >
                                            {menu.label}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className='block w-full text-left px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 rounded-lg'
                                    >
                                        تسجيل الخروج
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <Link to="/login" className='hover:text-primary'>
                    <i className="ri-user-line text-2xl"></i>
                </Link>
            )}
        </div>

        {/* Mobile Menu (Links for Small Screens) */}
        {isMobileMenuOpen && (
            <div className='sm:hidden absolute top-16 left-0 w-full bg-white shadow-md z-40'>
                <ul className='flex flex-col gap-4 p-4 text-lg'>
                    <li>
                        <Link 
                            to="/" 
                            className='block hover:text-[#d3ae27] transition-colors duration-300'
                            onClick={closeMobileMenu}
                        >
                            الرئيسية
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/shop" 
                            className='block hover:text-[#d3ae27] transition-colors duration-300'
                            onClick={closeMobileMenu}
                        >
                            المتجر
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/search" 
                            className='block hover:text-[#d3ae27] transition-colors duration-300'
                            onClick={closeMobileMenu}
                        >
                            <i className="ri-search-line mr-1 text-xl"></i> بحث
                        </Link>
                    </li>
                </ul>
            </div>
        )}
    </nav>

    {/* Cart Modal */}
    {isCartOpen && <CartModal products={products} isOpen={isCartOpen} onClose={handleCartToggle} />}
</header>

    );
};

export default Navbar;