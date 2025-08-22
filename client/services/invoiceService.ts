import { JobCard, JobStatus } from '@shared/types';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobCardId: string;
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  paidDate?: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'labor' | 'material' | 'service';
}

/**
 * Auto-generates an invoice when a job card is completed
 * This function is called automatically when a job status changes to COMPLETED
 */
export const generateInvoiceFromJobCard = (jobCard: JobCard): Invoice => {
  if (jobCard.status !== JobStatus.COMPLETED) {
    throw new Error('Invoice can only be generated for completed job cards');
  }

  // Generate unique invoice number
  const invoiceNumber = generateInvoiceNumber();
  
  // Calculate due date (30 days from completion)
  const issueDate = new Date();
  const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Create invoice items from job card data
  const items: InvoiceItem[] = [];

  // Add labor items
  jobCard.laborEntries.forEach((labor, index) => {
    items.push({
      id: `labor-${index + 1}`,
      description: `Labor - ${labor.description}`,
      quantity: labor.hours,
      unitPrice: labor.hourlyRate,
      total: labor.hours * labor.hourlyRate,
      type: 'labor',
    });
  });

  // Add material items
  jobCard.materialsUsed.forEach((material, index) => {
    items.push({
      id: `material-${index + 1}`,
      description: material.name,
      quantity: material.quantity,
      unitPrice: material.unitPrice,
      total: material.totalPrice,
      type: 'material',
    });
  });

  // Add service fees if any
  if (jobCard.estimatedCost?.additionalCosts && jobCard.estimatedCost.additionalCosts > 0) {
    items.push({
      id: 'service-1',
      description: 'Service Fees',
      quantity: 1,
      unitPrice: jobCard.estimatedCost.additionalCosts,
      total: jobCard.estimatedCost.additionalCosts,
      type: 'service',
    });
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.08; // 8% tax rate - this should come from configuration
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const invoice: Invoice = {
    id: generateUniqueId(),
    invoiceNumber,
    jobCardId: jobCard.id,
    customerId: jobCard.customerId,
    issueDate,
    dueDate,
    status: 'pending',
    subtotal,
    tax,
    total,
    items,
  };

  // Auto-save invoice to system (in real app, this would be an API call)
  saveInvoiceToSystem(invoice);

  // Send notification to customer (in real app)
  sendInvoiceNotificationToCustomer(invoice, jobCard.customer);

  // Log the auto-generation for audit trail
  console.log(`Invoice ${invoiceNumber} auto-generated for job card ${jobCard.jobNumber}`);

  return invoice;
};

/**
 * Generates a unique invoice number
 */
const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}-${random}`;
};

/**
 * Generates a unique ID
 */
const generateUniqueId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Saves the invoice to the system
 * In a real application, this would make an API call to the backend
 */
const saveInvoiceToSystem = (invoice: Invoice): void => {
  // Simulate API call
  console.log('Saving invoice to system:', invoice);
  
  // In real app, this would be:
  // return fetch('/api/invoices', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(invoice)
  // });
};

/**
 * Sends invoice notification to customer
 * In a real application, this would send an email with the invoice
 */
const sendInvoiceNotificationToCustomer = (invoice: Invoice, customer: any): void => {
  console.log(`Sending invoice notification to ${customer.email} for invoice ${invoice.invoiceNumber}`);
  
  // In real app, this would trigger an email service:
  // emailService.sendInvoice({
  //   to: customer.email,
  //   subject: `Invoice ${invoice.invoiceNumber} - TrackPro Auto Service`,
  //   invoice: invoice,
  //   customer: customer
  // });
};

/**
 * Hook function to automatically generate invoice when job status changes
 * This should be called whenever a job card status is updated
 */
export const handleJobCardStatusChange = (
  oldJobCard: JobCard, 
  newJobCard: JobCard
): Invoice | null => {
  // Check if job was just completed
  const wasCompleted = oldJobCard.status !== JobStatus.COMPLETED && 
                      newJobCard.status === JobStatus.COMPLETED;

  if (wasCompleted) {
    try {
      const invoice = generateInvoiceFromJobCard(newJobCard);
      console.log(`Auto-generated invoice ${invoice.invoiceNumber} for completed job ${newJobCard.jobNumber}`);
      return invoice;
    } catch (error) {
      console.error('Failed to auto-generate invoice:', error);
      return null;
    }
  }

  return null;
};

/**
 * Validates invoice data before generation
 */
export const validateJobCardForInvoicing = (jobCard: JobCard): string[] => {
  const errors: string[] = [];

  if (jobCard.status !== JobStatus.COMPLETED) {
    errors.push('Job must be completed before generating invoice');
  }

  if (!jobCard.customer) {
    errors.push('Customer information is required');
  }

  if (jobCard.laborEntries.length === 0 && jobCard.materialsUsed.length === 0) {
    errors.push('At least one labor entry or material must be recorded');
  }

  if (jobCard.laborEntries.some(entry => !entry.isApproved)) {
    errors.push('All labor entries must be approved before invoicing');
  }

  if (!jobCard.approvals.some(approval => 
    approval.type === 'completion' && approval.status === 'approved'
  )) {
    errors.push('Job completion must be approved before invoicing');
  }

  return errors;
};

/**
 * Preview invoice before generation
 */
export const previewInvoice = (jobCard: JobCard): Partial<Invoice> => {
  const items: InvoiceItem[] = [];

  // Add labor items
  jobCard.laborEntries.forEach((labor, index) => {
    items.push({
      id: `labor-${index + 1}`,
      description: `Labor - ${labor.description}`,
      quantity: labor.hours,
      unitPrice: labor.hourlyRate,
      total: labor.hours * labor.hourlyRate,
      type: 'labor',
    });
  });

  // Add material items
  jobCard.materialsUsed.forEach((material, index) => {
    items.push({
      id: `material-${index + 1}`,
      description: material.name,
      quantity: material.quantity,
      unitPrice: material.unitPrice,
      total: material.totalPrice,
      type: 'material',
    });
  });

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
    items,
  };
};

export default {
  generateInvoiceFromJobCard,
  handleJobCardStatusChange,
  validateJobCardForInvoicing,
  previewInvoice,
};
