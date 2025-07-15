'use client'
// components/FormPaymentPlan.tsx
import { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { usePaymentPlanForm } from './usePaymentPlanForm';
import { useAlert } from '@/app/contexts/alertContext';

interface PaymentPlan {
  _id: string;
  planName: string;
  planDescription: string;
  planDetails: {
    pName: string;
    pValue: string;
  }[];
}

interface FormPaymentPlanProps {
  editData?: PaymentPlan | null; // Add prop for edit data
}

export default function FormPaymentPlan({ editData }: FormPaymentPlanProps) {
  const router = useRouter();
  const [isEditing] = useState(!!editData); // Determine if in edit mode
  const { alert } = useAlert();

  // Helper function to get plan detail value by name
  const getPlanDetailValue = (name: string) => {
    return editData?.planDetails?.find(detail => detail.pName === name)?.pValue || '';
  };

  const [formData, setFormData] = useState({
    planName: editData?.planName || '',
    planDescription: editData?.planDescription || '',
    useUpfront: true, // Default to true as per your mutation
    upFrontPrice: getPlanDetailValue('upFrontPrice'),
    uFrontDaysIncluded: getPlanDetailValue('uFrontDaysIncluded'),
    freecodePrice: getPlanDetailValue('freecodePrice'),
    hourPrice: getPlanDetailValue('hourPrice'),
    daysToCutOff: getPlanDetailValue('daysToCutOff'),
    expectedPaid: getPlanDetailValue('expectedPaid'),
    minimumPaymentAmount: getPlanDetailValue('minimumPaymentAmount'),
  });

  const { handleSubmit, isLoading, error } = usePaymentPlanForm({
    isEdit: isEditing,
    planId: editData?._id,
    onSuccess: () => {
      router.back();
      alert({ text: `Payment Plan ${isEditing ? 'Updated' : 'Created'} Successfully`, type: "success" });
    },
    onError: () => {
      alert({ text: `There was a problem ${isEditing ? 'Updating' : 'Creating'} the Payment Plan`, type: "error" });
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
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
          <span>Back</span>
        </button>
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          {isEditing ? 'Edit Payment Plan' : 'Create a Payment Plan'}
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
                <label className="block text-sm font-medium mb-1" htmlFor="planName">
                  Plan Name
                </label>
                <input
                  id="planName"
                  name="planName"
                  className="form-input w-full"
                  type="text"
                  value={formData.planName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="planDescription">
                  Plan Description
                </label>
                <input
                  id="planDescription"
                  name="planDescription"
                  className="form-input w-full"
                  type="text"
                  value={formData.planDescription}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="upFrontPrice">
                  Up Front Price
                </label>
                <input
                  id="upFrontPrice"
                  name="upFrontPrice"
                  className="form-input w-full"
                  type="number"
                  step="0.01"
                  value={formData.upFrontPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="uFrontDaysIncluded">
                  Up Front Days Included
                </label>
                <input
                  id="uFrontDaysIncluded"
                  name="uFrontDaysIncluded"
                  className="form-input w-full"
                  type="number"
                  value={formData.uFrontDaysIncluded}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="freecodePrice">
                  Freecode Price
                </label>
                <input
                  id="freecodePrice"
                  name="freecodePrice"
                  className="form-input w-full"
                  type="number"
                  step="0.01"
                  value={formData.freecodePrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="hourPrice">
                  Hour Price
                </label>
                <input
                  id="hourPrice"
                  name="hourPrice"
                  className="form-input w-full"
                  type="number"
                  step="0.01"
                  value={formData.hourPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="daysToCutOff">
                  Days to Cut Off
                </label>
                <input
                  id="daysToCutOff"
                  name="daysToCutOff"
                  className="form-input w-full"
                  type="number"
                  value={formData.daysToCutOff}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="expectedPaid">
                  Expected Paid
                </label>
                <input
                  id="expectedPaid"
                  name="expectedPaid"
                  className="form-input w-full"
                  type="number"
                  step="0.01"
                  value={formData.expectedPaid}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="minimumPaymentAmount">
                  Minimum Payment Amount
                </label>
                <input
                  id="minimumPaymentAmount"
                  name="minimumPaymentAmount"
                  className="form-input w-full"
                  type="number"
                  step="0.01"
                  value={formData.minimumPaymentAmount}
                  onChange={handleInputChange}
                  required
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
                    ? `${isEditing ? 'Updating...' : 'Creating...'}`
                    : `${isEditing ? 'Update' : 'Create'} Payment Plan`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}