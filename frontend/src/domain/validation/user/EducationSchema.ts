import { z } from 'zod';

export const localEducationSchema = z.object({
  schoolName: z.string().trim().min(1, 'School name is required'),
  country: z.string().trim().min(1, 'Country is required'),
  from: z.string().trim().regex(/^\d{4}$/, 'Enter a valid 4-digit year (e.g., 2020)'),
  to: z.string().trim().regex(/^\d{4}$/, 'Enter a valid 4-digit year (e.g., 2023)'),
  nationalID: z.string().trim().min(1, 'National ID is required'),
  localSchoolCategory: z.string().trim().min(1, 'School category is required'),
  stateOrProvince: z.string().trim().min(1, 'State or province is required'),
}).refine(
  (data) => {
    if (data.from && data.to) {
      return parseInt(data.to) >= parseInt(data.from);
    }
    return true;
  },
  {
    path: ['to'],
    message: 'End year must be after start year',
  }
);

export const transferEducationSchema = z.object({
  schoolName: z.string().trim().min(1, 'School name is required'),
  country: z.string().trim().min(1, 'Country is required'),
  from: z.string().trim().regex(/^\d{4}$/, 'Enter a valid 4-digit year (e.g., 2020)'),
  to: z.string().trim().regex(/^\d{4}$/, 'Enter a valid 4-digit year (e.g., 2023)'),
  previousUniversity: z.string().trim().min(1, 'Previous university is required'),
  otherUniversity: z.string().trim().optional(),
  creditsEarned: z.string().trim().regex(/^\d+$/, 'Enter a valid number of credits'),
  gpa: z.string().trim().regex(/^\d(\.\d{1,2})?$/, 'Enter a valid GPA (e.g., 3.5)'),
  programStudied: z.string().trim().min(1, 'Program studied is required'),
  reasonForTransfer: z.string().trim().min(1, 'Reason for transfer is required'),
}).refine(
  (data) => {
    if (data.from && data.to) {
      return parseInt(data.to) >= parseInt(data.from);
    }
    return true;
  },
  {
    path: ['to'],
    message: 'End year must be after start year',
  }
).refine(
  (data) => {
    if (data.previousUniversity === 'other') {
      return !!data.otherUniversity;
    }
    return true;
  },
  {
    path: ['otherUniversity'],
    message: 'Other university name is required when "Other" is selected',
  }
);

export const subjectSchema = z
  .object({
    subject: z.string().trim().min(1, 'Subject is required'),
    otherSubject: z.string().trim().optional(),
    grade: z.string().trim().min(1, 'Grade is required'),
  })
  .refine(
    (data) => {
      if (data.subject === 'other') {
        return !!data.otherSubject;
      }
      return true;
    },
    {
      path: ['otherSubject'],
      message: 'Other subject name is required when "Other" is selected',
    }
  );

export const createSubjectSchema = (existingSubjects: string[]) =>
  subjectSchema.refine(
    (data) => {
      const subjectName = data.subject === 'other' ? data.otherSubject : data.subject;
      if (!subjectName) return true;
      return !existingSubjects.some(s => s.toLowerCase() === subjectName.toLowerCase());
    },
    {
      path: ['subject'],
      message: 'This subject has already been added',
    }
  );

export const ieltsSchema = z.object({
  date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Enter a valid date (MM/YYYY)').optional(),
  overall: z.string().regex(/^\d(\.\d)?$/, 'Enter a valid score (0.0-9.0)').optional(),
  reading: z.string().regex(/^\d(\.\d)?$/, 'Enter a valid score (0.0-9.0)').optional(),
  writing: z.string().regex(/^\d(\.\d)?$/, 'Enter a valid score (0.0-9.0)').optional(),
}).refine(
  (data) => {
    const hasData = data.date || data.overall || data.reading || data.writing;
    if (hasData) {
      return data.date && data.overall && data.reading && data.writing;
    }
    return true;
  },
  { message: 'All IELTS fields are required if any are provided' }
);

export const toeflSchema = z.object({
  date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Enter a valid date (MM/YYYY)').optional(),
  grade: z.string().regex(/^\d+$/, 'Enter a valid score').optional(),
  type: z.enum(['online', 'paper']).optional(),
}).refine(
  (data) => {
    const hasData = data.date || data.grade || data.type;
    if (hasData) {
      return data.date && data.grade && data.type;
    }
    return true;
  },
  { message: 'All TOEFL fields are required if any are provided' }
).refine(
  (data) => {
    if (data.type === 'online' && data.grade) {
      const grade = parseInt(data.grade);
      return grade >= 0 && grade <= 120;
    }
    if (data.type === 'paper' && data.grade) {
      const grade = parseInt(data.grade);
      return grade >= 310 && grade <= 677;
    }
    return true;
  },
  { message: 'Score must be 0-120 for online or 310-677 for paper-based TOEFL' }
);

export const toeflEssentialsSchema = z.object({
  date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Enter a valid date (MM/YYYY)').optional(),
  grade: z.string().regex(/^\d+$/, 'Enter a valid score (1-12)').optional().refine(
    (grade) => {
      if (grade) {
        const num = parseInt(grade);
        return num >= 1 && num <= 12;
      }
      return true;
    },
    { message: 'Score must be between 1 and 12' }
  ),
}).refine(
  (data) => {
    const hasData = data.date || data.grade;
    if (hasData) {
      return data.date && data.grade;
    }
    return true;
  },
  { message: 'Both date and grade are required if any are provided' }
);

export const pteSchema = z.object({
  date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Enter a valid date (MM/YYYY)').optional(),
  overall: z.string().regex(/^\d+$/, 'Enter a valid score (10-90)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 10 && num <= 90;
      }
      return true;
    },
    { message: 'Score must be between 10 and 90' }
  ),
  reading: z.string().regex(/^\d+$/, 'Enter a valid score (10-90)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 10 && num <= 90;
      }
      return true;
    },
    { message: 'Score must be between 10 and 90' }
  ),
  writing: z.string().regex(/^\d+$/, 'Enter a valid score (10-90)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 10 && num <= 90;
      }
      return true;
    },
    { message: 'Score must be between 10 and 90' }
  ),
}).refine(
  (data) => {
    const hasData = data.date || data.overall || data.reading || data.writing;
    if (hasData) {
      return data.date && data.overall && data.reading && data.writing;
    }
    return true;
  },
  { message: 'All PTE fields are required if any are provided' }
);

export const mappedTestSchema = z.object({
  date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Enter a valid date (MM/YYYY)').optional(),
  grade: z.string().optional(),
}).refine(
  (data) => {
    const hasData = data.date || data.grade;
    if (hasData) {
      return data.date && data.grade;
    }
    return true;
  },
  { message: 'Both date and grade are required if any are provided' }
);

export const satSchema = z.object({
  date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Enter a valid date (MM/YYYY)').optional(),
  math: z.string().regex(/^\d+$/, 'Enter a valid score (200-800)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 200 && num <= 800;
      }
      return true;
    },
    { message: 'Score must be between 200 and 800' }
  ),
  reading: z.string().regex(/^\d+$/, 'Enter a valid score (200-800)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 200 && num <= 800;
      }
      return true;
    },
    { message: 'Score must be between 200 and 800' }
  ),
  essay: z.string().regex(/^\d+$/, 'Enter a valid score (2-8)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 2 && num <= 8;
      }
      return true;
    },
    { message: 'Score must be between 2 and 8' }
  ),
}).refine(
  (data) => {
    const hasData = data.date || data.math || data.reading || data.essay;
    if (hasData) {
      return data.date && data.math && data.reading && data.essay;
    }
    return true;
  },
  { message: 'All SAT fields are required if any are provided' }
);

export const actSchema = z.object({
  date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Enter a valid date (MM/YYYY)').optional(),
  composite: z.string().regex(/^\d+$/, 'Enter a valid score (1-36)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 1 && num <= 36;
      }
      return true;
    },
    { message: 'Score must be between 1 and 36' }
  ),
  english: z.string().regex(/^\d+$/, 'Enter a valid score (1-36)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 1 && num <= 36;
      }
      return true;
    },
    { message: 'Score must be between 1 and 36' }
  ),
  math: z.string().regex(/^\d+$/, 'Enter a valid score (1-36)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 1 && num <= 36;
      }
      return true;
    },
    { message: 'Score must be between 1 and 36' }
  ),
  reading: z.string().regex(/^\d+$/, 'Enter a valid score (1-36)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 1 && num <= 36;
      }
      return true;
    },
    { message: 'Score must be between 1 and 36' }
  ),
  science: z.string().regex(/^\d+$/, 'Enter a valid score (1-36)').optional().refine(
    (score) => {
      if (score) {
        const num = parseInt(score);
        return num >= 1 && num <= 36;
      }
      return true;
    },
    { message: 'Score must be between 1 and 36' }
  ),
}).refine(
  (data) => {
    const hasData = data.date || data.composite || data.english || data.math || data.reading || data.science;
    if (hasData) {
      return data.date && data.composite && data.english && data.math && data.reading && data.science;
    }
    return true;
  },
  { message: 'All ACT fields are required if any are provided' }
);

export const apSubjectSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required'),
  score: z.string().trim().regex(/^\d+$/, 'Enter a valid score (1-5)').refine(
    (score) => {
      const num = parseInt(score);
      return num >= 1 && num <= 5;
    },
    { message: 'Score must be between 1 and 5' }
  ),
});

export const apSchema = z.object({
  date: z.string().trim().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Enter a valid date (MM/YYYY)').optional(),
  subjects: z.array(apSubjectSchema).optional().refine(
    (items) => {
      if (!items) return true;
      const names = items.map(i => i.subject.toLowerCase());
      return new Set(names).size === names.length;
    },
    { message: 'Duplicate subjects are not allowed' }
  ),
}).refine(
  (data) => {
    const hasData = data.date || (data.subjects && data.subjects.length > 0);
    if (hasData) {
      return data.date && data.subjects && data.subjects.length > 0;
    }
    return true;
  },
  { message: 'Both date and at least one subject are required if any are provided' }
);

export const internationalEducationSchema = z.object({
  schoolName: z.string().trim().min(1, 'School name is required'),
  country: z.string().trim().min(1, 'Country is required'),
  from: z.string().trim().regex(/^\d{4}$/, 'Enter a valid 4-digit year (e.g., 2020)'),
  to: z.string().trim().regex(/^\d{4}$/, 'Enter a valid 4-digit year (e.g., 2023)'),
  examination: z.string().trim().min(1, 'Examination type is required'),
  examMonthYear: z.string().trim().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Enter a valid month/year (e.g., 06/2023)'),
  resultType: z.enum(['actual', 'predicted']),
  subjects: z
    .array(subjectSchema)
    .min(1, 'At least one subject is required')
    .refine(
      (items) => {
        const names = items.map(i => (i.subject === 'other' ? i.otherSubject : i.subject)?.toLowerCase());
        return new Set(names).size === names.length;
      },
      { message: 'Duplicate subjects are not allowed' }
    ),
  ielts: ieltsSchema.optional(),
  toefl: toeflSchema.optional(),
  toeflEssentials1: toeflEssentialsSchema.optional(),
  toeflEssentials2: toeflEssentialsSchema.optional(),
  pte: pteSchema.optional(),
  el1119: mappedTestSchema.optional(),
  cefer: mappedTestSchema.optional(),
  muet: mappedTestSchema.optional(),
  cambridge: mappedTestSchema.optional(),
  sat: satSchema.optional(),
  act: actSchema.optional(),
  ap: apSchema.optional(),
}).refine(
  (data) => {
    if (data.from && data.to) {
      return parseInt(data.to) >= parseInt(data.from);
    }
    return true;
  },
  {
    path: ['to'],
    message: 'End year must be after start year',
  }
).refine(
  (data) => {
    const englishTests = [
      data.ielts,
      data.toefl,
      data.toeflEssentials1,
      data.toeflEssentials2,
      data.pte,
      data.el1119,
      data.cefer,
      data.muet,
      data.cambridge,
    ];
    return englishTests.some(test => test && Object.values(test).some(val => val !== undefined && val !== ''));
  },
  {
    path: [],
    message: 'At least one English proficiency test (IELTS, TOEFL, TOEFL Essentials, PTE, EL1119, CEFER, MUET, or Cambridge) is required',
  }
);

export const educationSchema = z.object({
  studentType: z.enum(['local', 'transfer', 'international']),
  local: z.union([localEducationSchema, z.undefined()]).optional(),
  transfer: z.union([transferEducationSchema, z.undefined()]).optional(),
  international: z.union([internationalEducationSchema, z.undefined()]).optional(),
}).refine(
  (data) => {
    if (data.studentType === 'local' && !data.local) return false;
    if (data.studentType === 'transfer' && !data.transfer) return false;
    if (data.studentType === 'international' && !data.international) return false;
    return true;
  },
  { message: 'Education data is required for the selected student type' }
).refine(
  (data) => {
    if (data.studentType === 'local') return !data.transfer && !data.international;
    if (data.studentType === 'transfer') return !data.local && !data.international;
    if (data.studentType === 'international') return !data.local && !data.transfer;
    return true;
  },
  { message: 'Only one type of education data should be provided' }
);

export type LocalEducationFormData = z.infer<typeof localEducationSchema>;
export type TransferEducationFormData = z.infer<typeof transferEducationSchema>;
export type InternationalEducationFormData = z.infer<typeof internationalEducationSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;