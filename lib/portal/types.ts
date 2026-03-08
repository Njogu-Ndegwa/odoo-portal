// ============================================================================
// Entity types (matching GraphQL schema)
// ============================================================================

export interface CustomerEntity {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  street: string | null;
  city: string | null;
  zip: string | null;
  isCompany: boolean;
  companyId: number | null;
  companyName: string | null;
  countryName: string | null;
  assignedEmployeeId: number | null;
  assignedEmployeeName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProductUnitEntity {
  id: string;
  name: string;
  sku: string | null;
  listPrice: number | null;
  type: string | null;
  puCategory: string | null;
  puMetric: string | null;
  serviceType: string | null;
  contractType: string | null;
  categoryName: string | null;
  companyId: number | null;
  companyName: string | null;
  currencyName: string | null;
  recurringInvoice: boolean | null;
  saleOk: boolean | null;
  active: boolean;
  imageUrl: string | null;
  description: string | null;
  descriptionSale: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

// ============================================================================
// Query response types
// ============================================================================

export interface CustomersListResponse {
  customers: {
    data: CustomerEntity[];
    pagination: PaginationMeta;
  };
}

export interface CustomerDetailResponse {
  customer: CustomerEntity;
}

export interface ProductUnitsListResponse {
  productUnits: {
    data: ProductUnitEntity[];
    pagination: PaginationMeta;
  };
}

export interface ProductUnitDetailResponse {
  productUnit: ProductUnitEntity;
}

// ============================================================================
// Filter input types
// ============================================================================

export type ContactType = 'ALL' | 'COMPANY' | 'INDIVIDUAL';

export interface CustomersFilterInput {
  search?: string | null;
  type?: ContactType | null;
  companyId?: number | null;
  strict?: boolean | null;
  allCompany?: boolean | null;
  createdAfter?: string | null;
  createdBefore?: string | null;
  updatedAfter?: string | null;
  updatedBefore?: string | null;
  page?: number | null;
  limit?: number | null;
}

export interface ProductUnitsFilterInput {
  search?: string | null;
  companyId?: number | null;
  puCategory?: string | null;
  puMetric?: string | null;
  serviceType?: string | null;
  contractType?: string | null;
  type?: string | null;
  categoryId?: number | null;
  active?: boolean | null;
  createdAfter?: string | null;
  createdBefore?: string | null;
  page?: number | null;
  limit?: number | null;
}

// ============================================================================
// Mutation input types
// ============================================================================

export interface CreateCustomerInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  isCompany?: boolean | null;
  companyId?: number | null;
  countryId?: number | null;
}

export interface UpdateCustomerInput {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  isCompany?: boolean | null;
  companyId?: number | null;
  countryId?: number | null;
}

export interface AssignCustomerInput {
  customerId: number;
  employeeId: number;
}

export interface CreateProductUnitInput {
  name: string;
  listPrice?: number | null;
  type?: string | null;
  puCategory?: string | null;
  puMetric?: string | null;
  serviceType?: string | null;
  contractType?: string | null;
  sku?: string | null;
  description?: string | null;
  descriptionSale?: string | null;
  companyId?: number | null;
  recurringInvoice?: boolean | null;
  saleOk?: boolean | null;
  category?: string | null;
  externalImageUrl?: string | null;
}

export interface UpdateProductUnitInput {
  name?: string | null;
  listPrice?: number | null;
  type?: string | null;
  puCategory?: string | null;
  puMetric?: string | null;
  serviceType?: string | null;
  contractType?: string | null;
  sku?: string | null;
  description?: string | null;
  descriptionSale?: string | null;
  companyId?: number | null;
  recurringInvoice?: boolean | null;
  saleOk?: boolean | null;
  category?: string | null;
  externalImageUrl?: string | null;
}

// ============================================================================
// Mutation response types
// ============================================================================

export interface CustomerMutationResponse {
  success: boolean;
  message: string | null;
  customer: CustomerEntity | null;
}

export interface ProductUnitMutationResponse {
  success: boolean;
  message: string | null;
  productUnit: ProductUnitEntity | null;
}

export interface MutationResponse {
  success: boolean;
  message: string | null;
}

// Typed mutation wrappers for Apollo
export interface CreateCustomerData { createCustomer: CustomerMutationResponse; }
export interface UpdateCustomerData { updateCustomer: CustomerMutationResponse; }
export interface DeleteCustomerData { deleteCustomer: MutationResponse; }
export interface AssignCustomerData { assignCustomerToEmployee: MutationResponse; }
export interface CreateProductUnitData { createProductUnit: ProductUnitMutationResponse; }
export interface UpdateProductUnitData { updateProductUnit: ProductUnitMutationResponse; }
export interface DeleteProductUnitData { deleteProductUnit: MutationResponse; }

// ============================================================================
// Order types
// ============================================================================

export type OrderState = 'draft' | 'sent' | 'sale' | 'done' | 'cancel';
export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'not_paid' | 'partial' | 'paid';

export interface OrderLineEntity {
  id: string;
  productId: number;
  productName: string;
  sku: string | null;
  puCategory: string | null;
  puMetric: string | null;
  serviceType: string | null;
  contractType: string | null;
  description: string | null;
  quantity: number;
  priceUnit: number;
  priceSubtotal: number;
  durationMonths: number | null;
}

export interface OrderInvoiceEntity {
  id: string;
  name: string;
  state: 'draft' | 'posted' | 'cancel';
  amountTotal: number;
  amountResidual: number;
  createdAt: string | null;
}

export interface OrderPaymentEntity {
  id: string;
  amount: number;
  paymentDate: string;
  memo: string | null;
  paymentMethod: string | null;
  transactionRef: string | null;
}

export interface OrderTimelineEvent {
  title: string;
  meta: string;
  description?: string;
  color: 'green' | 'blue' | 'orange' | 'purple' | 'gray';
}

export interface OrderApproval {
  submittedBy: string;
  submittedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  notes: string | null;
}

export interface OrderEntity {
  id: string;
  name: string;
  state: OrderState;
  approvalStatus: ApprovalStatus;
  paymentStatus: PaymentStatus;
  partnerId: number;
  partnerName: string;
  partnerEmail: string | null;
  partnerPhone: string | null;
  contactPerson: string | null;
  clientOrderRef: string | null;
  channelPartner: string | null;
  salesRepName: string | null;
  salesOutlet: string | null;
  amountUntaxed: number;
  amountTax: number;
  amountTotal: number;
  paidAmount: number;
  remainingAmount: number;
  invoiceCount: number;
  lines: OrderLineEntity[];
  invoices: OrderInvoiceEntity[];
  payments: OrderPaymentEntity[];
  approval: OrderApproval | null;
  timeline: OrderTimelineEvent[];
  createdAt: string | null;
  updatedAt: string | null;
}

// Order query responses
export interface OrdersListResponse {
  orders: {
    data: OrderEntity[];
    pagination: PaginationMeta;
  };
}

export interface OrderDetailResponse {
  order: OrderEntity;
}

// Order filter inputs
export interface OrdersFilterInput {
  search?: string | null;
  state?: OrderState | null;
  approvalStatus?: ApprovalStatus | null;
  paymentStatus?: PaymentStatus | null;
  partnerId?: number | null;
  createdAfter?: string | null;
  createdBefore?: string | null;
  page?: number | null;
  limit?: number | null;
}

// Order mutation inputs
export interface CreateOrderInput {
  partnerId: number;
  clientOrderRef?: string | null;
  channelPartner?: string | null;
  salesRepName?: string | null;
  salesOutlet?: string | null;
  lines: CreateOrderLineInput[];
}

export interface CreateOrderLineInput {
  productId: number;
  quantity: number;
  priceUnit: number;
}

export interface UpdateOrderLinesInput {
  lines: { id?: string; productId: number; quantity: number; priceUnit: number }[];
}

export interface RegisterPaymentInput {
  amount: number;
  paymentDate: string;
  memo?: string | null;
  paymentMethod?: string | null;
  transactionRef?: string | null;
}

// Order mutation responses
export interface OrderMutationResponse {
  success: boolean;
  message: string | null;
  order: OrderEntity | null;
}

export interface CreateOrderData { createOrder: OrderMutationResponse; }
export interface UpdateOrderData { updateOrder: OrderMutationResponse; }
export interface DeleteOrderData { deleteOrder: MutationResponse; }
export interface SendOrderData { sendOrder: MutationResponse; }
export interface ConfirmOrderData { confirmOrder: MutationResponse; }
export interface RequestApprovalData { requestApproval: MutationResponse; }
export interface ApproveOrderData { approveOrder: MutationResponse; }
export interface RejectOrderData { rejectOrder: MutationResponse; }
export interface CreateInvoiceResponse {
  success: boolean;
  message: string | null;
  invoiceId: string | null;
}
export interface CreateInvoiceData { createInvoice: CreateInvoiceResponse; }
export interface ConfirmInvoiceData { confirmInvoice: MutationResponse; }
export interface RegisterPaymentData { registerPayment: MutationResponse; }

export interface ProformaPdfResponse {
  filename: string;
  contentType: string;
  base64: string;
}
