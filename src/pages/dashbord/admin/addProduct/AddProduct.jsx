// ========================= AddProduct.jsx =========================
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import UploadImage from './UploadImage';
import { useAddProductMutation } from '../../../../redux/features/products/productsApi';
import { useNavigate } from 'react-router-dom';

const categories = [
  { label: 'الكل', value: 'الكل' },
  { label: 'نظارات', value: 'نظارات' },
  { label: 'محافظ', value: 'محافظ' },
  { label: 'ساعات', value: 'ساعات' },
  { label: 'غتر', value: 'غتر' },
  { label: 'اقلام', value: 'اقلام' },
  { label: 'بوكسات الشهر', value: 'بوكسات الشهر' },
  { label: 'أقمشة', value: 'أقمشة' },
  { label: 'مسباح', value: 'مسباح' },
  { label: 'اكسسوارات', value: 'اكسسوارات' },
  { label: 'كابات', value: 'كابات' },
  { label: 'شنط رجالية', value: 'شنط رجالية' },
  { label: 'شنط نسائية', value: 'شنط نسائية' },
  { label: 'احذية', value: 'احذية' },
  { label: 'عطورات', value: 'عطورات' },
];

const genderTypes = [
  { label: 'اختر النوع', value: '', disabled: true },
  { label: 'رجالي', value: 'رجالي' },
  { label: 'نسائي', value: 'نسائي' },
];

// ✅ أضفنا "محافظ"
const GENDER_REQUIRED_CATEGORIES = new Set(['نظارات', 'ساعات', 'احذية', 'محافظ']);

const AddProduct = () => {
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    oldPrice: '',
    originalPrice: '',
    description: '',
    gender: '',
    quantity: 0,
  });

  const [image, setImage] = useState([]);
  const [showGenderField, setShowGenderField] = useState(false);

  const [AddProduct, { isLoading }] = useAddProductMutation();
  const navigate = useNavigate();

  useEffect(() => {
    const needGender = GENDER_REQUIRED_CATEGORIES.has(product.category);
    setShowGenderField(needGender);
    if (!needGender) {
      setProduct((prev) => ({ ...prev, gender: '' }));
    }
  }, [product.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = {
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: image.length > 0,
      quantity: product.quantity !== '',
    };

    if (GENDER_REQUIRED_CATEGORIES.has(product.category)) {
      if (!product.gender) {
        alert('الرجاء اختيار نوع المنتج (رجالي/نسائي)');
        return;
      }
    }

    if (Object.values(requiredFields).some((field) => !field)) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await AddProduct({
        ...product,
        price: Number(product.price),
        oldPrice: product.oldPrice !== '' ? Number(product.oldPrice) : undefined,
        originalPrice: product.originalPrice !== '' ? Number(product.originalPrice) : undefined,
        quantity: Number(product.quantity),
        image,
        author: user?._id,
      }).unwrap();

      alert('تمت إضافة المنتج بنجاح');
      setProduct({
        name: '',
        category: '',
        price: '',
        oldPrice: '',
        originalPrice: '',
        description: '',
        gender: '',
        quantity: 0,
      });
      setImage([]);
      navigate('/shop');
    } catch (error) {
      console.error('فشل في إضافة المنتج:', error);
      alert(`فشل في إضافة المنتج: ${error.data?.message || error.message}`);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">إضافة منتج جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="اسم المنتج"
          name="name"
          placeholder="أكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
          required
        />

        <SelectInput
          label="صنف المنتج"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={categories}
          required
        />

        {showGenderField && (
          <SelectInput
            label="نوع المنتج"
            name="gender"
            value={product.gender}
            onChange={handleChange}
            options={genderTypes}
            required
          />
        )}

        <TextInput
          label="السعر الحالي"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
        />

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          placeholder="100"
          value={product.oldPrice}
          onChange={handleChange}
          min="0"
          step="0.01"
        />

        <TextInput
          label="السعر الأصلي (اختياري)"
          name="originalPrice"
          type="number"
          placeholder="120"
          value={product.originalPrice}
          onChange={handleChange}
          min="0"
          step="0.01"
        />

        <TextInput
          label="الكمية المتاحة"
          name="quantity"
          type="number"
          placeholder="10"
          value={product.quantity}
          onChange={handleChange}
          required
          min="0"
        />

        <UploadImage name="image" id="image" setImage={setImage} required />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={4}
            value={product.description}
            placeholder="أكتب وصف المنتج"
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'جاري الإضافة...' : 'إضافة المنتج'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
