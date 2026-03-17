'use client'
// components/FormCustomer.tsx
import { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCustomerForm } from './useCustomerForm';
import { useAlert } from '@/app/contexts/alertContext';
// import { PersonInterface } from '../../types';
import { Person } from '../types/Person';
import { useTranslations } from 'next-intl';

interface FormCustomerProps {
  editData?: Person | null; // Add prop for edit data
}

 export default function FormCustomer({ editData }: FormCustomerProps) {
  const router = useRouter();
  const [isEditing] = useState(!!editData);
  const { alert } = useAlert();
  const t = useTranslations('customers');
  const tc = useTranslations('common');

  const [formData, setFormData] = useState({
    name: editData?.name || '',
    email: editData?.contact?.email || '',
    phone: editData?.contact?.phone || '',
    social: editData?.contact?.social || '',
    city: editData?.address?.city || '',
    country: editData?.address?.country || '',
    postCode: editData?.address?.postcode || '',
    srpc: editData?.address?.srpc || '',
    street: editData?.address?.street || '',
    unit: editData?.address?.unit || '',
    longitude: editData?.address?.addressLocation?.addressLongitude?.toString() || '0',
    latitude: editData?.address?.addressLocation?.addressLongitude?.toString() || '0',
    description: editData?.description || '',
  });

  const { handleSubmit, isLoading, error } = useCustomerForm({
    isEdit: isEditing,
    personId: editData?._id,
    onSuccess: () => {
      router.back();
      alert({ text: isEditing ? t('updatedSuccess') : t('createdSuccess'), type: "success" });
    },
    onError: () => {
      alert({ text: isEditing ? t('updateError') : t('createError'), type: "error" });
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-3"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>{tc('back')}</span>
        </button>
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          {isEditing ? t('editCustomer') : t('createCustomer')}
        </h1>
      </div>

      <form onSubmit={onSubmit}>
        {error && (
          <div>Error!!</div>
        )}

        <div className="space-y-8 mt-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  {t('customerForm.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  className="form-input w-full"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  {t('customerForm.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  className="form-input w-full"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                  {t('customerForm.phone')}
                </label>
                <input
                  id="phone"
                  name="phone"
                  className="form-input w-full"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="social">
                  {t('customerForm.social')}
                </label>
                <input
                  id="social"
                  name="social"
                  className="form-input w-full"
                  type="text"
                  value={formData.social}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="city">
                  {t('customerForm.city')}
                </label>
                <input
                  id="city"
                  name="city"
                  className="form-input w-full"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="country">
                  {t('customerForm.country')}
                </label>
                <input
                  id="country"
                  name="country"
                  className="form-input w-full"
                  type="text"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="postCode">
                  {t('customerForm.postCode')}
                </label>
                <input
                  id="postCode"
                  name="postCode"
                  className="form-input w-full"
                  type="text"
                  value={formData.postCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="srpc">
                  {t('customerForm.srpc')}
                </label>
                <input
                  id="srpc"
                  name="srpc"
                  className="form-input w-full"
                  type="text"
                  value={formData.srpc}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="street">
                  {t('customerForm.street')}
                </label>
                <input
                  id="street"
                  name="street"
                  className="form-input w-full"
                  type="text"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="unit">
                  {t('customerForm.unit')}
                </label>
                <input
                  id="unit"
                  name="unit"
                  className="form-input w-full"
                  type="text"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="longitude">
                  {t('customerForm.longitude')}
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  className="form-input w-full"
                  type="text"
                  value={formData.longitude}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="latitude">
                  {t('customerForm.latitude')}
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  className="form-input w-full"
                  type="text"
                  value={formData.latitude}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="description">
                  {t('customerForm.description')}
                </label>
                {/* <textarea
                  id="description"
                  name="description"
                  className="form-input w-full"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                /> */}
                <input
                  id="description"
                  name="description"
                  className="form-input w-full"
                  type="text"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <div className="mt-[25px]">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`btn bg-green-500 hover:bg-green-600 text-white w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isLoading
                    ? (isEditing ? tc('updating') : tc('creating'))
                    : `${isEditing ? tc('update') : tc('create')} ${t('title')}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}