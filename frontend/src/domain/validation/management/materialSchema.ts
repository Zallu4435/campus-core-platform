import { z } from 'zod';

export const materialSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  subject: z.string().min(1, 'Subject is required'),
  course: z.string().min(1, 'Course is required'),
  semester: z.string().min(1, 'Semester is required'),
  type: z.enum(['pdf']),
  file: z.unknown().optional(),
  thumbnail: z.unknown().optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  estimatedTime: z.string().min(1, 'Estimated time is required'),
  isNewMaterial: z.boolean(),
  isRestricted: z.boolean(),
});

export type MaterialFormData = z.infer<typeof materialSchema>; 