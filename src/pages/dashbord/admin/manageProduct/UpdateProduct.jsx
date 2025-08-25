import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchProductByIdQuery, useUpdateProductMutation, useUpdateProductQuantityMutation } from '../../../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
import UploadImage from '../addProduct/UploadImage';

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
  { label: 'رجالي', value: 'رجالي' },
  { label: 'نسائي', value: 'نسائي' },
];

// الفئات التي تتطلب حقل النوع
const GENDER_REQUIRED_CATEGORIES = new Set(['نظارات', 'ساعات', 'احذية']);

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    oldPrice: '',
    originalPrice: '',
    description: '',
    image: '',
    gender: '',
    quantity: 0,
  });

  const [showGenderField, setShowGenderField] = useState(false);
  const { data: productData, isLoading: isProductLoading, error: fetchError, refetch } = useFetchProductByIdQuery(id);
  const [updateProduct] = useUpdateProductMutation();
  const [updateProductQuantity] = useUpdateProductQuantityMutation();
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    if (productData?.product) {
      setProduct({
        name: productData.product.name || '',
        category: productData.product.category || '',
        price: productData.product.price ?? '',
        oldPrice: productData.product.oldPrice ?? '',
        originalPrice: productData.product.originalPrice ?? '',
        description: productData.product.description || '',
        image: productData.product.image || '',
        gender: productData.product.gender || '',
        quantity: productData.product.quantity ?? 0,
      });
      setShowGenderField(GENDER_REQUIRED_CATEGORIES.has(productData.product.category));
    }
  }, [productData]);

  useEffect(() => {
    const needGender = GENDER_REQUIRED_CATEGORIES.has(product.category);
    setShowGenderField(needGender);
    if (!needGender) {
      setProduct((prev) => ({ ...prev, gender: '' }));
    }
  }, [product.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));

    if (name === 'quantity') {
      handleQuantityUpdate(value);
    }
  };

  const handleImageChange = (image) => {
    setNewImage(image);
  };

  const handleQuantityUpdate = async (newQuantity) => {
    try {
      await updateProductQuantity({
        id,
        quantity: Number(newQuantity),
      }).unwrap();
      await refetch();
    } catch (error) {
      console.error('فشل تحديث الكمية:', error);
      alert('فشل تحديث الكمية: ' + (error.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = {
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
    };
    if (GENDER_REQUIRED_CATEGORIES.has(product.category)) {
      requiredFields.gender = product.gender;
    }
    if (Object.values(requiredFields).some((f) => !f)) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('price', product.price);
    formData.append('oldPrice', product.oldPrice || '');
    formData.append('originalPrice', product.originalPrice || '');
    formData.append('description', product.description);
    formData.append('quantity', product.quantity);
    if (product.gender) formData.append('gender', product.gender);
    if (newImage) formData.append('image', newImage);
    formData.append('author', user._id);

    try {
      await updateProduct({ id, body: formData }).unwrap();
      alert('تم تحديث المنتج بنجاح');
      await refetch();
      navigate('/dashboard/manage-products');
    } catch (error) {
      console.error('فشل تحديث المنتج:', error);
      if (error.status === 401) {
        alert('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        navigate('/login');
      } else {
        alert('فشل تحديث المنتج: ' + (error.data?.message || error.message));
      }
    }
  };

  if (isProductLoading) return <div className="text-center py-8">جاري التحميل...</div>;
  if (fetchError) return <div className="text-center py-8 text-red-500">خطأ في تحميل بيانات المنتج</div>;

  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-right">تحديث المنتج</h2>
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
          min="0"
        />

        <UploadImage
          name="image"
          id="image"
          value={newImage || product.image}
          placeholder="صورة المنتج"
          setImage={handleImageChange}
        />

        <div className="text-right">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={product.description}
            placeholder="أكتب وصف المنتج"
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isProductLoading}
          >
            {isProductLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
