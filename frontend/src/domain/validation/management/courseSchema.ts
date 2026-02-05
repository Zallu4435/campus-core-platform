import { z } from 'zod';

export const courseSchema = z.object({
  title: z
    .string()
    .min(1, 'Course title is required')
    .min(3, 'Course title must be at least 3 characters long')
    .max(100, 'Course title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  specialization: z
    .string()
    .min(1, 'Specialization is required'),
  credits: z
    .number()
    .min(0, 'Credits must be 0 or greater')
    .max(30, 'Credits cannot exceed 30'),
  faculty: z
    .string()
    .min(1, 'Faculty is required'),
  schedule: z
    .string()
    .min(1, 'Schedule is required')
    .max(100, 'Schedule must be less than 100 characters'),
  maxEnrollment: z
    .number()
    .min(1, 'Max enrollment must be at least 1')
    .max(500, 'Max enrollment cannot exceed 500'),
  prerequisites: z
    .array(z.string().min(1, 'Prerequisite cannot be empty'))
    .optional()
    .default([]),
  term: z
    .string()
    .min(1, 'Term is required'),
});

export type CourseFormData = z.infer<typeof courseSchema>; 