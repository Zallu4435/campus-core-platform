import { z } from 'zod';

export const chargeSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  amount: z.string()
    .min(1, 'Amount is required')
    .regex(/^[0-9]+(\.[0-9]{1,2})?$/, 'Amount must be a valid number (e.g., 100 or 100.50)')
    .refine((val) => {
      const num = parseFloat(val);
      return num > 0;
    }, {
      message: 'Amount must be greater than 0',
    })
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 1000000;
    }, {
      message: 'Amount must not exceed $1,000,000',
    }),
  term: z.string()
    .min(1, 'Term is required')
    .refine((val) => val !== '', {
      message: 'Please select a valid term',
    }),
  dueDate: z.string()
    .min(1, 'Due date is required')
    .refine((date) => {
      if (!date) return false;
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, {
      message: 'Due date cannot be in the past',
    }),
  applicableFor: z.string()
    .min(1, 'Applicable for is required')
    .refine((val) => val !== '', {
      message: 'Please select who this charge applies to',
    }),
});

export type ChargeFormDataRaw = z.infer<typeof chargeSchema>; 