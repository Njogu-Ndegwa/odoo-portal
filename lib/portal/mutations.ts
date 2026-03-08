import { gql } from "@apollo/client";

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      success
      message
      customer {
        id
        name
        email
        phone
        mobile
        street
        city
        zip
        isCompany
        companyId
        companyName
        countryName
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $input: UpdateCustomerInput!) {
    updateCustomer(id: $id, input: $input) {
      success
      message
      customer {
        id
        name
        email
        phone
        mobile
        street
        city
        zip
        isCompany
        companyId
        companyName
        countryName
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      success
      message
    }
  }
`;

export const ASSIGN_CUSTOMER_TO_EMPLOYEE = gql`
  mutation AssignCustomerToEmployee($input: AssignCustomerInput!) {
    assignCustomerToEmployee(input: $input) {
      success
      message
    }
  }
`;

export const CREATE_PRODUCT_UNIT = gql`
  mutation CreateProductUnit($input: CreateProductUnitInput!) {
    createProductUnit(input: $input) {
      success
      message
      productUnit {
        id
        name
        sku
        listPrice
        type
        puCategory
        puMetric
        serviceType
        contractType
        categoryName
        companyId
        companyName
        currencyName
        recurringInvoice
        saleOk
        active
        imageUrl
        description
        descriptionSale
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_PRODUCT_UNIT = gql`
  mutation UpdateProductUnit($id: ID!, $input: UpdateProductUnitInput!) {
    updateProductUnit(id: $id, input: $input) {
      success
      message
      productUnit {
        id
        name
        sku
        listPrice
        type
        puCategory
        puMetric
        serviceType
        contractType
        categoryName
        companyId
        companyName
        currencyName
        recurringInvoice
        saleOk
        active
        imageUrl
        description
        descriptionSale
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_PRODUCT_UNIT = gql`
  mutation DeleteProductUnit($id: ID!) {
    deleteProductUnit(id: $id) {
      success
      message
    }
  }
`;

// ============================================================================
// Orders — GraphQL stubs (uncomment when BFF is ready)
// ============================================================================

// export const CREATE_ORDER = gql`
//   mutation CreateOrder($input: CreateOrderInput!) {
//     createOrder(input: $input) {
//       success
//       message
//       order { id name state }
//     }
//   }
// `;

// export const UPDATE_ORDER_LINES = gql`
//   mutation UpdateOrderLines($id: ID!, $input: UpdateOrderLinesInput!) {
//     updateOrderLines(id: $id, input: $input) {
//       success
//       message
//       order { id name }
//     }
//   }
// `;

// export const DELETE_ORDER = gql`
//   mutation DeleteOrder($id: ID!) {
//     deleteOrder(id: $id) { success message }
//   }
// `;

// export const SEND_ORDER = gql`
//   mutation SendOrder($id: ID!) {
//     sendOrder(id: $id) { success message }
//   }
// `;

// export const CONFIRM_ORDER = gql`
//   mutation ConfirmOrder($id: ID!) {
//     confirmOrder(id: $id) { success message }
//   }
// `;

// export const REQUEST_APPROVAL = gql`
//   mutation RequestApproval($id: ID!) {
//     requestApproval(id: $id) { success message }
//   }
// `;

// export const APPROVE_ORDER = gql`
//   mutation ApproveOrder($id: ID!, $notes: String) {
//     approveOrder(id: $id, notes: $notes) { success message }
//   }
// `;

// export const REJECT_ORDER = gql`
//   mutation RejectOrder($id: ID!, $notes: String) {
//     rejectOrder(id: $id, notes: $notes) { success message }
//   }
// `;

// export const CREATE_INVOICE = gql`
//   mutation CreateInvoice($orderId: ID!) {
//     createInvoice(orderId: $orderId) {
//       success
//       message
//       invoiceId
//     }
//   }
// `;

// export const CONFIRM_INVOICE = gql`
//   mutation ConfirmInvoice($orderId: ID!, $invoiceId: ID!) {
//     confirmInvoice(orderId: $orderId, invoiceId: $invoiceId) {
//       success
//       message
//     }
//   }
// `;

// export const REGISTER_PAYMENT = gql`
//   mutation RegisterPayment($orderId: ID!, $input: RegisterPaymentInput!) {
//     registerPayment(orderId: $orderId, input: $input) { success message }
//   }
// `;
