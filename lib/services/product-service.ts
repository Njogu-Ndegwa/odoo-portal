import {
  getProducts as apiGetProducts,
  getProductById as apiGetProductById,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  type OdooProduct,
  type ProductWritePayload,
} from '@/lib/odoo-api';

// ============================================================================
// Types
// ============================================================================

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  descriptionSale: string;
  listPrice: number;
  type: string;
  currencyName: string;
  categoryName: string;
  companyId: number | null;
  companyName: string;
  recurringInvoice: boolean;
  saleOk: boolean;
  active: boolean;
  imageUrl: string | null;
  puCategory: string;
  puMetric: string;
  serviceType: string;
  contractType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  success: boolean;
  products: Product[];
  total: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductDetailResponse {
  success: boolean;
  product: Product;
}

export interface ProductFilters {
  company_id?: number;
  pu_category?: string;
  pu_metric?: string;
  service_type?: string;
  contract_type?: string;
  type?: string;
  search?: string;
  created_after?: string;
  created_before?: string;
}

// ============================================================================
// Mapping
// ============================================================================

function mapProduct(p: OdooProduct): Product {
  return {
    id: p.product_id ?? p.id ?? 0,
    name: p.name || '',
    sku: p.default_code || '',
    description: p.description || '',
    descriptionSale: p.description_sale || '',
    listPrice: p.list_price ?? 0,
    type: p.type || '',
    currencyName: p.currency || '',
    categoryName: p.category_name || '',
    companyId: Array.isArray(p.company_id) ? p.company_id[0] : null,
    companyName: Array.isArray(p.company_id) ? p.company_id[1] : '',
    recurringInvoice: p.recurring_invoice ?? false,
    saleOk: p.sale_ok ?? true,
    active: p.active ?? true,
    imageUrl: p.image_url || null,
    puCategory: p.pu_category || '',
    puMetric: p.pu_metric || '',
    serviceType: p.service_type || '',
    contractType: p.contract_type || '',
    createdAt: p.create_date || '',
    updatedAt: p.write_date || '',
  };
}

// ============================================================================
// API Functions
// ============================================================================

export async function getAllProducts(
  page: number = 1,
  limit: number = 20,
  authToken?: string,
  filters: ProductFilters = {}
): Promise<ProductListResponse> {
  const result = await apiGetProducts(
    { page, limit, ...filters },
    authToken
  );

  return {
    success: true,
    products: result.products.map(mapProduct),
    total: result.pagination.total_records,
    limit: result.pagination.per_page,
    offset: 0,
    hasNextPage: result.pagination.has_next_page,
    hasPreviousPage: result.pagination.has_previous_page,
  };
}

export async function getProductById(
  id: number,
  authToken?: string
): Promise<ProductDetailResponse> {
  const result = await apiGetProductById(id, authToken);
  return {
    success: true,
    product: mapProduct(result.product),
  };
}

export async function createProductItem(
  data: ProductWritePayload,
  authToken?: string
): Promise<{ success: boolean; message: string }> {
  const result = await apiCreateProduct(data, authToken);
  return {
    success: true,
    message: result.message || 'Product created successfully',
  };
}

export async function updateProductItem(
  id: number,
  data: ProductWritePayload,
  authToken?: string
): Promise<{ success: boolean; message: string }> {
  const result = await apiUpdateProduct(id, data, authToken);
  return {
    success: true,
    message: result.message || 'Product updated successfully',
  };
}

export async function deleteProductItem(
  id: number,
  authToken?: string
): Promise<{ success: boolean; message: string }> {
  const result = await apiDeleteProduct(id, authToken);
  return {
    success: true,
    message: result.message || 'Product deleted successfully',
  };
}
