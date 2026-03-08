import type {
  OrderEntity,
  OrderLineEntity,
  OrdersFilterInput,
  PaginationMeta,
} from './types';

// ============================================================================
// Sample order lines (reusable across orders)
// ============================================================================

const physicalLines: OrderLineEntity[] = [
  {
    id: 'line-1',
    productId: 101,
    productName: 'LEV E3-Pro Electric Motorbike',
    sku: 'PU-PHY-E3PRO',
    puCategory: 'physical',
    puMetric: 'Piece',
    serviceType: null,
    contractType: null,
    description: 'Stockable · VIN + serial tracked',
    quantity: 4,
    priceUnit: 2800,
    priceSubtotal: 11200,
    durationMonths: null,
  },
  {
    id: 'line-2',
    productId: 102,
    productName: 'MotBat 45Ah Battery Pack',
    sku: 'PU-PHY-MB45',
    puCategory: 'physical',
    puMetric: 'Piece',
    serviceType: null,
    contractType: null,
    description: 'Stockable · SoH tracked',
    quantity: 8,
    priceUnit: 450,
    priceSubtotal: 3600,
    durationMonths: null,
  },
  {
    id: 'line-3',
    productId: 103,
    productName: 'Home Charger (Standard)',
    sku: 'PU-PHY-CHG-STD',
    puCategory: 'physical',
    puMetric: 'Piece',
    serviceType: null,
    contractType: null,
    description: 'Stockable',
    quantity: 1,
    priceUnit: 320,
    priceSubtotal: 320,
    durationMonths: null,
  },
  {
    id: 'line-4',
    productId: 104,
    productName: 'Safety Equipment (Helmet + Vest)',
    sku: 'PU-PHY-SAFETY',
    puCategory: 'physical',
    puMetric: 'Piece',
    serviceType: null,
    contractType: null,
    description: 'Stockable',
    quantity: 4,
    priceUnit: 85,
    priceSubtotal: 340,
    durationMonths: null,
  },
];

const contractLines: OrderLineEntity[] = [
  {
    id: 'line-5',
    productId: 201,
    productName: 'Swap Privilege — MotBat 45Ah',
    sku: 'PU-CTR-SWPRIV-45',
    puCategory: 'contract',
    puMetric: 'Duration',
    serviceType: 'deposit',
    contractType: 'entitlement',
    description: 'Deposit / entitlement · 12-month term',
    quantity: 4,
    priceUnit: 200,
    priceSubtotal: 800,
    durationMonths: 12,
  },
  {
    id: 'line-6',
    productId: 202,
    productName: 'Replacement Warranty — MotBat 45Ah — 24 Mo',
    sku: 'PU-CTR-WARR-MB45-24',
    puCategory: 'contract',
    puMetric: 'Duration',
    serviceType: 'warranty',
    contractType: 'warranty',
    description: 'Warranty contract',
    quantity: 8,
    priceUnit: 45,
    priceSubtotal: 360,
    durationMonths: 24,
  },
  {
    id: 'line-7',
    productId: 203,
    productName: 'Limited Warranty — E3-Pro — 36 Months',
    sku: 'PU-CTR-WARR-E3P-36',
    puCategory: 'contract',
    puMetric: 'Duration',
    serviceType: 'warranty',
    contractType: 'warranty',
    description: 'Warranty contract',
    quantity: 4,
    priceUnit: 160,
    priceSubtotal: 640,
    durationMonths: 36,
  },
];

// ============================================================================
// Sample orders in various lifecycle stages
// ============================================================================

const MOCK_ORDERS: OrderEntity[] = [
  {
    id: '108',
    name: 'SO-2026-0108',
    state: 'sale',
    approvalStatus: 'approved',
    paymentStatus: 'paid',
    partnerId: 10,
    partnerName: 'Boda Fleet Solutions Ltd',
    partnerEmail: 'amos@bodafleet.co.ke',
    partnerPhone: '+254 722 890 456',
    contactPerson: 'Amos Ochieng',
    clientOrderRef: 'PO-2026-001',
    channelPartner: 'GreenRide Dealers Nairobi',
    salesRepName: 'Faith Wanjiku',
    salesOutlet: 'GreenRide Westlands Hub',
    amountUntaxed: 17260,
    amountTax: 2761.6,
    amountTotal: 20021.6,
    paidAmount: 20021.6,
    remainingAmount: 0,
    invoiceCount: 1,
    lines: [...physicalLines, ...contractLines],
    invoices: [
      {
        id: 'inv-1',
        name: 'INV-2026-0108',
        state: 'posted',
        amountTotal: 20021.6,
        amountResidual: 0,
        createdAt: '2026-03-05T11:45:00Z',
      },
    ],
    payments: [
      {
        id: 'pay-1',
        amount: 20021.6,
        paymentDate: '2026-03-05',
        memo: 'Full payment',
        paymentMethod: 'M-Pesa (Paybill)',
        transactionRef: 'MPESA-SG4K72HN9',
      },
    ],
    approval: {
      submittedBy: 'Faith Wanjiku',
      submittedAt: '2026-03-03T10:15:00Z',
      approvedBy: 'David Kamau',
      approvedAt: '2026-03-04T09:30:00Z',
      notes: 'Fleet deal looks good. Pricing within margin guidelines. Deposit terms are standard. Proceed to send PI to client.',
    },
    timeline: [
      { title: 'Quotation SO-2026-0108 Created (7 PU lines, Physical + Contract)', meta: 'Mar 1, 10:00 AM · Faith Wanjiku · GreenRide Westlands', color: 'green' },
      { title: 'Quotation Sent via Email', meta: 'Mar 1, 10:12 AM · sale.order state: draft → sent', color: 'blue' },
      { title: 'Quotation Revised (Rev. 2) — +1 bike, warranty extended to 36mo', meta: 'Mar 2, 03:30 PM · Physical & Contract qty updated', color: 'orange' },
      { title: 'Order Confirmed — Sales Order locked', meta: 'Mar 2, 04:45 PM · sale.order state: sent → sale', color: 'green' },
      { title: 'Proforma PI-2026-0108 submitted for approval', meta: 'Mar 3, 10:15 AM · Routed to Regional Manager (value > $5,000)', color: 'blue' },
      { title: 'Approved by David Kamau (Regional Manager)', meta: 'Mar 4, 09:30 AM · "Pricing within margin guidelines. Proceed."', color: 'green' },
      { title: 'Proforma PI-2026-0108 sent to customer', meta: 'Mar 4, 10:00 AM · PDF to amos@bodafleet.co.ke', color: 'orange' },
      { title: 'Payment Received — $20,021.60 via M-Pesa', meta: 'Mar 5, 11:30 AM · MPESA-SG4K72HN9', color: 'green' },
      { title: 'Invoice INV-2026-0108 Issued', meta: 'Mar 5, 11:45 AM · account.move posted · $800 deposit to liability', color: 'purple' },
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-05T11:45:00Z',
  },
  {
    id: '109',
    name: 'SO-2026-0109',
    state: 'draft',
    approvalStatus: 'none',
    paymentStatus: 'not_paid',
    partnerId: 11,
    partnerName: 'Kilimani Solar Hub',
    partnerEmail: 'orders@kilimani-solar.co.ke',
    partnerPhone: '+254 733 100 200',
    contactPerson: 'Grace Mwende',
    clientOrderRef: null,
    channelPartner: 'Nairobi Energy Partners',
    salesRepName: 'James Otieno',
    salesOutlet: 'NEP Karen Branch',
    amountUntaxed: 5600,
    amountTax: 896,
    amountTotal: 6496,
    paidAmount: 0,
    remainingAmount: 6496,
    invoiceCount: 0,
    lines: [
      {
        id: 'line-8',
        productId: 101,
        productName: 'LEV E3-Pro Electric Motorbike',
        sku: 'PU-PHY-E3PRO',
        puCategory: 'physical',
        puMetric: 'Piece',
        serviceType: null,
        contractType: null,
        description: 'Stockable · VIN + serial tracked',
        quantity: 2,
        priceUnit: 2800,
        priceSubtotal: 5600,
        durationMonths: null,
      },
    ],
    invoices: [],
    payments: [],
    approval: null,
    timeline: [
      { title: 'Quotation SO-2026-0109 Created (1 PU line)', meta: 'Mar 4, 02:00 PM · James Otieno · NEP Karen', color: 'green' },
    ],
    createdAt: '2026-03-04T14:00:00Z',
    updatedAt: '2026-03-04T14:00:00Z',
  },
  {
    id: '110',
    name: 'SO-2026-0110',
    state: 'sent',
    approvalStatus: 'none',
    paymentStatus: 'not_paid',
    partnerId: 12,
    partnerName: 'Safari Riders Co-op',
    partnerEmail: 'procurement@safaririders.co.ke',
    partnerPhone: '+254 711 555 333',
    contactPerson: 'Peter Nyongesa',
    clientOrderRef: 'SR-PO-003',
    channelPartner: 'GreenRide Dealers Nairobi',
    salesRepName: 'Faith Wanjiku',
    salesOutlet: 'GreenRide Westlands Hub',
    amountUntaxed: 9350,
    amountTax: 1496,
    amountTotal: 10846,
    paidAmount: 0,
    remainingAmount: 10846,
    invoiceCount: 0,
    lines: [
      {
        id: 'line-9',
        productId: 101,
        productName: 'LEV E3-Pro Electric Motorbike',
        sku: 'PU-PHY-E3PRO',
        puCategory: 'physical',
        puMetric: 'Piece',
        serviceType: null,
        contractType: null,
        description: 'Stockable · VIN + serial tracked',
        quantity: 3,
        priceUnit: 2800,
        priceSubtotal: 8400,
        durationMonths: null,
      },
      {
        id: 'line-10',
        productId: 102,
        productName: 'MotBat 45Ah Battery Pack',
        sku: 'PU-PHY-MB45',
        puCategory: 'physical',
        puMetric: 'Piece',
        serviceType: null,
        contractType: null,
        description: 'Stockable · SoH tracked',
        quantity: 6,
        priceUnit: 450,
        priceSubtotal: 2700,
        durationMonths: null,
      },
      {
        id: 'line-11',
        productId: 103,
        productName: 'Home Charger (Standard)',
        sku: 'PU-PHY-CHG-STD',
        puCategory: 'physical',
        puMetric: 'Piece',
        serviceType: null,
        contractType: null,
        description: 'Stockable',
        quantity: 1,
        priceUnit: 320,
        priceSubtotal: 320,
        durationMonths: null,
      },
    ],
    invoices: [],
    payments: [],
    approval: null,
    timeline: [
      { title: 'Quotation SO-2026-0110 Created (3 PU lines)', meta: 'Mar 3, 09:00 AM · Faith Wanjiku · GreenRide Westlands', color: 'green' },
      { title: 'Quotation Sent via Email', meta: 'Mar 3, 09:20 AM · System', color: 'blue' },
      { title: 'Awaiting Customer Response', meta: 'Current step', color: 'purple' },
    ],
    createdAt: '2026-03-03T09:00:00Z',
    updatedAt: '2026-03-03T09:20:00Z',
  },
  {
    id: '111',
    name: 'SO-2026-0111',
    state: 'sale',
    approvalStatus: 'pending',
    paymentStatus: 'not_paid',
    partnerId: 13,
    partnerName: 'EcoRide Transport Ltd',
    partnerEmail: 'finance@ecoride.co.ke',
    partnerPhone: '+254 720 800 900',
    contactPerson: 'Diana Achieng',
    clientOrderRef: 'ERT-2026-Q1',
    channelPartner: 'Mombasa Electric Dealers',
    salesRepName: 'Ahmed Hassan',
    salesOutlet: 'MED Nyali Showroom',
    amountUntaxed: 28400,
    amountTax: 4544,
    amountTotal: 32944,
    paidAmount: 0,
    remainingAmount: 32944,
    invoiceCount: 0,
    lines: [
      {
        id: 'line-12',
        productId: 101,
        productName: 'LEV E3-Pro Electric Motorbike',
        sku: 'PU-PHY-E3PRO',
        puCategory: 'physical',
        puMetric: 'Piece',
        serviceType: null,
        contractType: null,
        description: 'Stockable · VIN + serial tracked',
        quantity: 10,
        priceUnit: 2800,
        priceSubtotal: 28000,
        durationMonths: null,
      },
      {
        id: 'line-13',
        productId: 201,
        productName: 'Swap Privilege — MotBat 45Ah',
        sku: 'PU-CTR-SWPRIV-45',
        puCategory: 'contract',
        puMetric: 'Duration',
        serviceType: 'deposit',
        contractType: 'entitlement',
        description: 'Deposit / entitlement · 12-month term',
        quantity: 10,
        priceUnit: 200,
        priceSubtotal: 2000,
        durationMonths: 12,
      },
    ],
    invoices: [],
    payments: [],
    approval: {
      submittedBy: 'Ahmed Hassan',
      submittedAt: '2026-03-05T08:00:00Z',
      approvedBy: null,
      approvedAt: null,
      notes: null,
    },
    timeline: [
      { title: 'Quotation SO-2026-0111 Created', meta: 'Mar 4, 11:00 AM · Ahmed Hassan · MED Nyali', color: 'green' },
      { title: 'Quotation Sent via Email', meta: 'Mar 4, 11:15 AM · System', color: 'blue' },
      { title: 'Order Confirmed', meta: 'Mar 5, 07:45 AM · Ahmed Hassan', color: 'green' },
      { title: 'Proforma submitted for approval', meta: 'Mar 5, 08:00 AM · Routed to Head of Sales (value > $25,000)', color: 'blue' },
      { title: 'Pending approval', meta: 'Current step', color: 'orange' },
    ],
    createdAt: '2026-03-04T11:00:00Z',
    updatedAt: '2026-03-05T08:00:00Z',
  },
  {
    id: '112',
    name: 'SO-2026-0112',
    state: 'sale',
    approvalStatus: 'approved',
    paymentStatus: 'partial',
    partnerId: 14,
    partnerName: 'Nairobi Quick Deliveries',
    partnerEmail: 'ops@nqd.co.ke',
    partnerPhone: '+254 700 222 444',
    contactPerson: 'Samuel Kiprop',
    clientOrderRef: 'NQD-PO-055',
    channelPartner: 'GreenRide Dealers Nairobi',
    salesRepName: 'Faith Wanjiku',
    salesOutlet: 'GreenRide Westlands Hub',
    amountUntaxed: 6200,
    amountTax: 992,
    amountTotal: 7192,
    paidAmount: 4000,
    remainingAmount: 3192,
    invoiceCount: 1,
    lines: [
      {
        id: 'line-14',
        productId: 101,
        productName: 'LEV E3-Pro Electric Motorbike',
        sku: 'PU-PHY-E3PRO',
        puCategory: 'physical',
        puMetric: 'Piece',
        serviceType: null,
        contractType: null,
        description: 'Stockable · VIN + serial tracked',
        quantity: 2,
        priceUnit: 2800,
        priceSubtotal: 5600,
        durationMonths: null,
      },
      {
        id: 'line-15',
        productId: 201,
        productName: 'Swap Privilege — MotBat 45Ah',
        sku: 'PU-CTR-SWPRIV-45',
        puCategory: 'contract',
        puMetric: 'Duration',
        serviceType: 'deposit',
        contractType: 'entitlement',
        description: 'Deposit / entitlement · 12-month term',
        quantity: 2,
        priceUnit: 200,
        priceSubtotal: 400,
        durationMonths: 12,
      },
      {
        id: 'line-16',
        productId: 201,
        productName: 'Limited Warranty — E3-Pro — 24 Months',
        sku: 'PU-CTR-WARR-E3P-24',
        puCategory: 'contract',
        puMetric: 'Duration',
        serviceType: 'warranty',
        contractType: 'warranty',
        description: 'Warranty contract',
        quantity: 2,
        priceUnit: 100,
        priceSubtotal: 200,
        durationMonths: 24,
      },
    ],
    invoices: [
      {
        id: 'inv-2',
        name: 'INV-2026-0112',
        state: 'posted',
        amountTotal: 7192,
        amountResidual: 3192,
        createdAt: '2026-03-04T15:00:00Z',
      },
    ],
    payments: [
      {
        id: 'pay-2',
        amount: 4000,
        paymentDate: '2026-03-04',
        memo: 'Initial deposit',
        paymentMethod: 'Bank Transfer',
        transactionRef: 'BT-20260304-001',
      },
    ],
    approval: {
      submittedBy: 'Faith Wanjiku',
      submittedAt: '2026-03-03T11:00:00Z',
      approvedBy: 'David Kamau',
      approvedAt: '2026-03-03T14:00:00Z',
      notes: 'Approved. Standard deal.',
    },
    timeline: [
      { title: 'Quotation SO-2026-0112 Created', meta: 'Mar 2, 09:00 AM · Faith Wanjiku', color: 'green' },
      { title: 'Quotation Sent', meta: 'Mar 2, 09:30 AM', color: 'blue' },
      { title: 'Order Confirmed', meta: 'Mar 3, 10:00 AM', color: 'green' },
      { title: 'Proforma approved by David Kamau', meta: 'Mar 3, 02:00 PM', color: 'green' },
      { title: 'Partial Payment — $4,000 via Bank Transfer', meta: 'Mar 4, 03:00 PM', color: 'orange' },
      { title: 'Invoice INV-2026-0112 Created', meta: 'Mar 4, 03:00 PM · Balance: $3,192', color: 'purple' },
    ],
    createdAt: '2026-03-02T09:00:00Z',
    updatedAt: '2026-03-04T15:00:00Z',
  },
];

// ============================================================================
// Mock data fetch functions (simulate async API calls)
// ============================================================================

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMockOrders(
  filters?: OrdersFilterInput
): Promise<{ data: OrderEntity[]; pagination: PaginationMeta }> {
  await delay();

  let filtered = [...MOCK_ORDERS];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.partnerName.toLowerCase().includes(q) ||
        o.clientOrderRef?.toLowerCase().includes(q)
    );
  }

  if (filters?.state) {
    filtered = filtered.filter((o) => o.state === filters.state);
  }

  if (filters?.approvalStatus) {
    filtered = filtered.filter((o) => o.approvalStatus === filters.approvalStatus);
  }

  if (filters?.paymentStatus) {
    filtered = filtered.filter((o) => o.paymentStatus === filters.paymentStatus);
  }

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    },
  };
}

export async function getMockOrder(id: string): Promise<OrderEntity | null> {
  await delay();
  return MOCK_ORDERS.find((o) => o.id === id) ?? null;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getOrderStepIndex(order: OrderEntity): number {
  if (order.state === 'draft') return 0;
  if (order.state === 'sent') return 1;

  if (order.state === 'sale' || order.state === 'done') {
    if (order.invoiceCount > 0 && order.paymentStatus === 'paid') return 6;
    if (order.paymentStatus === 'partial' || order.paymentStatus === 'paid') return 5;
    if (order.approvalStatus === 'approved') return 5;
    if (order.approvalStatus === 'pending') return 4;
    return 3;
  }

  return 0;
}

export const ORDER_PIPELINE_STEPS = [
  { label: 'Quotation' },
  { label: 'Send to Customer' },
  { label: 'Revise & Confirm' },
  { label: 'Proforma Invoice' },
  { label: 'Approval' },
  { label: 'Payment' },
  { label: 'Final Invoice' },
];
