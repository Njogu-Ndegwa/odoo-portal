// hooks/usePaymentPlanForm.ts
import { useState } from 'react';

interface PaymentPlanFormData {
  planName: string;
  planDescription: string;
  useUpfront: boolean;
  upFrontPrice: string;
  uFrontDaysIncluded: string;
  freecodePrice: string;
  hourPrice: string;
  daysToCutOff: string;
  expectedPaid: string;
  minimumPaymentAmount: string;
}

interface PaymentPlan {
  _id: string;
  planName: string;
  planDescription: string;
  planDetails: {
    pName: string;
    pValue: string;
  }[];
}

interface UsePaymentPlanFormProps {
  isEdit?: boolean;
  planId?: string | null;
  onSuccess?: (plan: PaymentPlan) => void;
  onError?: (error: string) => void;
}

export const usePaymentPlanForm = ({
  isEdit = false,
  planId = null,
  onSuccess,
  onError
}: UsePaymentPlanFormProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // You'll need to import these hooks based on your GraphQL setup
  // const { createPayPlan } = useCreatePayPlan((data) => {
  //   if (onSuccess) {
  //     onSuccess(data.createPayPlan);
  //   }
  // });

  // const { updatePayPlan } = useUpdatePayPlan((data) => {
  //   if (onSuccess) {
  //     onSuccess(data.updatePayPlan);
  //   }
  // });

  const handleSubmit = async (formData: PaymentPlanFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEdit && planId) {
        // Update existing payment plan
        // await updatePayPlan({
        //   variables: {
        //     updatePayPlanInput: {
        //       planId: planId,
        //       planName: formData.planName,
        //       planDescription: formData.planDescription,
        //       useUpfront: formData.useUpfront,
        //       planDetails: [
        //         {
        //           pName: "upFrontPrice",
        //           pValue: formData.upFrontPrice
        //         },
        //         {
        //           pName: "uFrontDaysIncluded",
        //           pValue: formData.uFrontDaysIncluded
        //         },
        //         {
        //           pName: "freecodePrice",
        //           pValue: formData.freecodePrice
        //         },
        //         {
        //           pName: "hourPrice",
        //           pValue: formData.hourPrice
        //         },
        //         {
        //           pName: "daysToCutOff",
        //           pValue: formData.daysToCutOff
        //         },
        //         {
        //           pName: "expectedPaid",
        //           pValue: formData.expectedPaid
        //         },
        //         {
        //           pName: "minimumPaymentAmount",
        //           pValue: formData.minimumPaymentAmount
        //         }
        //       ]
        //     }
        //   }
        // });
      } else {
        // Create new payment plan
        // await createPayPlan({
        //   variables: {
        //     createPayPlanTemplateInput: {
        //       planName: formData.planName,
        //       planDescription: formData.planDescription,
        //       useUpfront: formData.useUpfront,
        //       planDetails: [
        //         {
        //           pName: "upFrontPrice",
        //           pValue: formData.upFrontPrice
        //         },
        //         {
        //           pName: "uFrontDaysIncluded",
        //           pValue: formData.uFrontDaysIncluded
        //         },
        //         {
        //           pName: "freecodePrice",
        //           pValue: formData.freecodePrice
        //         },
        //         {
        //           pName: "hourPrice",
        //           pValue: formData.hourPrice
        //         },
        //         {
        //           pName: "daysToCutOff",
        //           pValue: formData.daysToCutOff
        //         },
        //         {
        //           pName: "expectedPaid",
        //           pValue: formData.expectedPaid
        //         },
        //         {
        //           pName: "minimumPaymentAmount",
        //           pValue: formData.minimumPaymentAmount
        //         }
        //       ]
        //     }
        //   }
        // });
      }

      // Temporary success simulation - remove this when implementing actual mutations
      if (onSuccess) {
        onSuccess({
          _id: planId || 'temp-id',
          planName: formData.planName,
          planDescription: formData.planDescription,
          planDetails: [
            { pName: "upFrontPrice", pValue: formData.upFrontPrice },
            { pName: "uFrontDaysIncluded", pValue: formData.uFrontDaysIncluded },
            { pName: "freecodePrice", pValue: formData.freecodePrice },
            { pName: "hourPrice", pValue: formData.hourPrice },
            { pName: "daysToCutOff", pValue: formData.daysToCutOff },
            { pName: "expectedPaid", pValue: formData.expectedPaid },
            { pName: "minimumPaymentAmount", pValue: formData.minimumPaymentAmount }
          ]
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      throw err; // Re-throw error for component-level handling
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    error,
  };
};