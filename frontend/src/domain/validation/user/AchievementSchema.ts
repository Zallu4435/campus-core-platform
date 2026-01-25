import { z } from 'zod';

export const ReferenceContactSchema = z.object({
  firstName: z.string().trim().min(1, { message: 'First name is required' }),
  lastName: z.string().trim().min(1, { message: 'Last name is required' }),
  position: z.string().trim().min(1, { message: 'Position is required' }),
  email: z.string().trim().email({ message: 'Invalid email address' }).min(1, { message: 'Email is required' }),
  phone: z.object({
    country: z.string().trim().min(1, { message: 'Country code is required' }),
    area: z.string().trim().min(1, { message: 'Area code is required' }),
    number: z.string().trim().min(1, { message: 'Phone number is required' }),
  }),
});

export const AchievementSchema = z.object({
  activity: z.string().trim().min(1, { message: 'Activity is required' }),
  level: z.string().trim().min(1, { message: 'Level is required' }),
  levelOfAchievement: z.string().trim().min(1, { message: 'Level of achievement is required' }),
  positionHeld: z.string().trim().min(1, { message: 'Position held is required' }),
  organizationName: z.string().trim().min(1, { message: 'Organization name is required' }),
  fromDate: z.string().trim().regex(
    /^(0[1-9]|1[0-2])\/(19|20)\d{2}$/,
    { message: 'Enter a valid date (MM/YYYY)' }
  ),
  toDate: z.string().trim().regex(
    /^(0[1-9]|1[0-2])\/(19|20)\d{2}$/,
    { message: 'Enter a valid date (MM/YYYY)' }
  ),
  description: z.string().trim().min(1, { message: 'Description is required' }).max(1000, {
    message: 'Description cannot exceed 1000 characters',
  }),
  reference: ReferenceContactSchema,
}).refine(
  (data) => {
    const fromDateParts = data.fromDate.split('/');
    const toDateParts = data.toDate.split('/');
    if (fromDateParts.length !== 2 || toDateParts.length !== 2) return true;

    const fromDate = new Date(
      parseInt(fromDateParts[1]),
      parseInt(fromDateParts[0]) - 1
    );
    const toDate = new Date(
      parseInt(toDateParts[1]),
      parseInt(toDateParts[0]) - 1
    );
    return toDate >= fromDate;
  },
  {
    message: 'To date must be on or after From date',
    path: ['toDate'],
  }
);

export const QuestionsSchema = z.object({
  1: z.string().trim().min(1, { message: 'Question 1 is required' }).max(1000, {
    message: 'Question 1 cannot exceed 1000 characters',
  }),
  2: z.string().trim().min(1, { message: 'Question 2 is required' }).max(1000, {
    message: 'Question 2 cannot exceed 1000 characters',
  }),
  3: z.string().trim().min(1, { message: 'Question 3 is required' }).max(1000, {
    message: 'Question 3 cannot exceed 1000 characters',
  }),
  4: z.string().trim().min(1, { message: 'Question 4 is required' }).max(500, {
    message: 'Question 4 cannot exceed 500 characters',
  }),
  5: z.string().trim().min(1, { message: 'Question 5 is required' }).max(500, {
    message: 'Question 5 cannot exceed 500 characters',
  }),
});

export const AchievementSectionSchema = z.object({
  questions: QuestionsSchema,
  achievements: z.array(AchievementSchema).max(4, { message: 'Cannot add more than 4 achievements' }).optional(),
  hasNoAchievements: z.boolean(),
  newAchievement: AchievementSchema.optional(),
}).refine(
  (data) => data.hasNoAchievements || (data.achievements && data.achievements.length > 0),
  {
    message: 'At least one achievement is required unless "No Achievements to Report" is selected',
    path: ['achievements'],
  }
);


export type AchievementFormData = z.infer<typeof AchievementSectionSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type ReferenceContact = z.infer<typeof ReferenceContactSchema>;