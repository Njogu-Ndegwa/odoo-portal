// constants/PaymentPlanConstants.ts
export interface PaymentPlanFormData {
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

export interface PaymentPlanDetail {
  pName: string;
  pValue: string;
}

export interface PaymentPlan {
  _id: string;
  deleteStatus?: boolean;
  deleteAt?: string;
  createdAt: string;
  updatedAt: string;
  planName: string;
  planDescription: string;
  planDetails: PaymentPlanDetail[];
}