import { z } from 'zod';

export const clubSchema = z.object({
  name: z.string().min(2, 'Club name must be at least 2 characters'),
  type: z.string().min(1, 'Club type is required'),
  members: z.union([z.string(), z.array(z.string())]).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  role: z.string().min(1, 'Role is required'),
  nextMeeting: z.string().optional(),
  about: z.string().optional(),
  createdBy: z.string().min(2, 'Creator name is required'),
  upcomingEvents: z.array(
    z.object({
      date: z.string().min(10, 'Date is required'),
      description: z.string().min(5, 'Description must be at least 5 characters'),
    })
  ).optional(),
});

export type ClubFormData = z.infer<typeof clubSchema>; 