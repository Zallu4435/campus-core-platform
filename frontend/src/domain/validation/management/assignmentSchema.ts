import { z } from 'zod';

export const assignmentSchema = z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
    subject: z.string().min(1, 'Subject is required'),
    dueDate: z.string().refine((val) => {
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    }, 'Due date must be in the future'),
    maxMarks: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0 && num <= 1000;
    }, 'Maximum marks must be between 1 and 1000'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;
