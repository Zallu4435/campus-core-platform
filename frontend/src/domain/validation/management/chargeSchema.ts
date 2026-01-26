import { z } from 'zod';

export const chargeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/, 'Valid amount is required'),
  term: z.string().min(1, 'Term is required'),
  dueDate: z.string().min(10, 'Due date is required').refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, {
    message: 'Due date cannot be in the past',
  }),
  applicableFor: z.string().min(1, 'Applicable for is required'),
});

export type ChargeFormDataRaw = z.infer<typeof chargeSchema>; 