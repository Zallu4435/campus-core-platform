import { z } from 'zod';

export const diplomaSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional().or(z.literal('')),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  thumbnail: z.string().url('Thumbnail must be a valid URL').optional().or(z.literal('')),
  duration: z.string().min(1, 'Duration is required'),
  prerequisites: z.array(z.string()).optional(),
  status: z.boolean().default(true),
});

export type DiplomaFormData = z.infer<typeof diplomaSchema>; 