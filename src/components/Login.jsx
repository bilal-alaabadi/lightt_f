import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'
import { useLoginUserMutation } from '../redux/features/auth/authApi';
import { setUser } from '../redux/features/auth/authSlice';

const Login = () => {
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const disptach = useDispatch();
    const [loginUser, {isLoading: loginLoading}] = useLoginUserMutation()
    const navigate = useNavigate()
    
    // handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        const data = {
            email,
            password
        }

       try {
        
        const response = await loginUser(data).unwrap();
        // console.log(response)
        const {token, user} = response;
        disptach(setUser({user}))
        alert("نجح تسجيل الدخول");
        navigate("/")
       } catch (error) {
        setMessage("Please provide a valid email and password")
       }

    }
    return (
<section className='h-screen flex items-center justify-center'>
    <div className='max-w-sm border shadow bg-white mx-auto p-8'>
        <h2 className='text-2xl font-semibold pt-5'>يرجى تسجيل الدخول</h2>
        <form onSubmit={handleLogin} className='space-y-5 max-w-sm mx-auto pt-8'>
            <input
                type="email" 
                name="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder='البريد الإلكتروني'
                required
                className='w-full bg-gray-100 focus:outline-none px-5 py-3'
            />
            <input
                type="password"
                name="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder='كلمة المرور'
                required
                className='w-full bg-gray-100 focus:outline-none px-5 py-3'
            />
            {message && <p className='text-red-500'>{message}</p>}

            <button
                type='submit'
                className='w-full mt-5 bg-[#CEAE7A] text-white hover:bg-indigo-500 font-medium py-3 rounded-md'
            >
                تسجيل الدخول
            </button>
        </form>
{/* 
        <p className='my-5 italic text-sm text-center'>
            ليس لديك حساب؟ 
            <Link to="/register" className='text-red-700 px-1 underline'>سجل هنا</Link>.
        </p> */}
    </div>
</section>
    )
}

export default Login