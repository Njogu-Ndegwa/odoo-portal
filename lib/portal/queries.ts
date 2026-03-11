import { gql } from "@apollo/client";

export const CUSTOMERS_QUERY = gql`
  query Customers($filters: CustomersFilterInput) {
    customers(filters: $filters) {
      data {
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
        assignedEmployeeId
        assignedEmployeeName
        createdAt
        updatedAt
      }
      pagination {
        currentPage
        perPage
        totalRecords
        totalPages
        hasNextPage
        hasPreviousPage
        nextPage
        previousPage
      }
    }
  }
`;

export const CUSTOMER_QUERY = gql`
  query Customer($id: ID!) {
    customer(id: $id) {
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
      assignedEmployeeId
      assignedEmployeeName
      createdAt
      updatedAt
    }
  }
`;

export const PRODUCT_UNITS_QUERY = gql`
  query ProductUnits($filters: ProductUnitsFilterInput) {
    productUnits(filters: $filters) {
      data {
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
      pagination {
        currentPage
        perPage
        totalRecords
        totalPages
        hasNextPage
        hasPreviousPage
        nextPage
        previousPage
      }
    }
  }
`;

export const PRODUCT_UNIT_QUERY = gql`
  query ProductUnit($id: ID!) {
    productUnit(id: $id) {
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
`;

// ============================================================================
// Orders — Queries
// ============================================================================

export const ORDERS_QUERY = gql`
  query Orders($filters: OrdersFilterInput) {
    orders(filters: $filters) {
      data {
        id
        name
        state
        approvalStatus
        paymentStatus
        partnerId
        partnerName
        partnerEmail
        partnerPhone
        contactPerson
        clientOrderRef
        channelPartner
        salesRepName
        salesOutlet
        amountUntaxed
        amountTax
        amountTotal
        paidAmount
        remainingAmount
        invoiceCount
        createdAt
        updatedAt
      }
      pagination {
        currentPage
        perPage
        totalRecords
        totalPages
        hasNextPage
        hasPreviousPage
        nextPage
        previousPage
      }
    }
  }
`;

export const ORDER_QUERY = gql`
  query Order($id: Int!) {
    order(id: $id) {
      order {
        id
        name
        state
        approvalStatus
        paymentStatus
        partnerId
        partnerName
        partnerEmail
        partnerPhone
        contactPerson
        clientOrderRef
        channelPartner
        salesRepName
        salesOutlet
        amountUntaxed
        amountTax
        amountTotal
        paidAmount
        remainingAmount
        invoiceCount
        lines {
          id
          productId
          productName
          sku
          puCategory
          puMetric
          serviceType
          contractType
          description
          quantity
          priceUnit
          priceSubtotal
          durationMonths
        }
        invoices {
          id
          name
          state
          amountTotal
          amountResidual
          createdAt
        }
        payments {
          id
          amount
          paymentDate
          memo
          paymentMethod
          transactionRef
        }
        approval {
          submittedBy
          submittedAt
          approvedBy
          approvedAt
          notes
        }
        timeline {
          title
          meta
          description
          color
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_PROFORMA_PDF = gql`
  query ProformaPdf($orderId: Int!) {
    proformaPdf(orderId: $orderId) {
      filename
      contentType
      base64
    }
  }
`;

// ============================================================================
// Orders — Mutations
// ============================================================================

export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      success
      message
      order {
        id
        name
        state
      }
    }
  }
`;

export const ADD_LINES_MUTATION = gql`
  mutation AddLinesToOrder($orderId: Int!, $input: AddLinesInput!) {
    addLinesToOrder(orderId: $orderId, input: $input) {
      success
      message
    }
  }
`;

export const SEND_ORDER_MUTATION = gql`
  mutation SendOrder($orderId: Int!) {
    sendOrder(orderId: $orderId) {
      success
      message
    }
  }
`;

export const CONFIRM_ORDER_MUTATION = gql`
  mutation ConfirmOrder($orderId: Int!) {
    confirmOrder(orderId: $orderId) {
      success
      message
    }
  }
`;

export const REQUEST_APPROVAL_MUTATION = gql`
  mutation RequestApproval($orderId: Int!) {
    requestApproval(orderId: $orderId) {
      success
      message
    }
  }
`;

export const APPROVE_ORDER_MUTATION = gql`
  mutation ApproveOrder($orderId: Int!, $input: ApprovalNotesInput) {
    approveOrder(orderId: $orderId, input: $input) {
      success
      message
    }
  }
`;

export const REJECT_ORDER_MUTATION = gql`
  mutation RejectOrder($orderId: Int!, $input: ApprovalNotesInput) {
    rejectOrder(orderId: $orderId, input: $input) {
      success
      message
    }
  }
`;

export const CREATE_INVOICE_MUTATION = gql`
  mutation CreateInvoice($orderId: Int!) {
    createInvoice(orderId: $orderId) {
      success
      message
      invoiceId
    }
  }
`;

export const CONFIRM_INVOICE_MUTATION = gql`
  mutation ConfirmInvoice($orderId: Int!, $invoiceId: Int!) {
    confirmInvoice(orderId: $orderId, invoiceId: $invoiceId) {
      success
      message
    }
  }
`;

export const REGISTER_PAYMENT_MUTATION = gql`
  mutation RegisterPayment($orderId: Int!, $input: RegisterPaymentInput!) {
    registerPayment(orderId: $orderId, input: $input) {
      success
      message
    }
  }
`;
