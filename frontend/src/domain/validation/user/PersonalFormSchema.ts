// PersonalFormSchema.ts
import { z } from "zod";

const postalCodePattern = /^\d{6}$/;

export const personalFormSchema = z.object({
  // Personal details
  salutation: z.string().trim().min(1, "Salutation is required"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(100, "Name is too long"),
  familyName: z.string().trim().min(1, "Family name is required"),
  givenName: z.string().trim().min(1, "Given name is required"),
  gender: z.string().trim().min(1, "Gender is required"),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter date in YYYY-MM-DD format"),

  postalCode: z
    .string()
    .trim()
    .regex(postalCodePattern, "Please enter a valid 6-digit postal code"),
  blockNumber: z.string().trim().min(1, "Block number is required"),
  streetName: z.string().trim().min(1, "Street name is required"),
  buildingName: z.string().trim().optional(),
  floorNumber: z.string().trim().optional(),
  unitNumber: z.string().trim().optional(),
  stateCity: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),

  citizenship: z.string().trim().min(1, "Citizenship is required"),
  residentialStatus: z.string().trim().min(1, "Residential status is required"),
  race: z.string().trim().min(1, "Race is required"),
  religion: z.string().trim().optional(),
  maritalStatus: z.string().trim().min(1, "Marital status is required"),
  passportNumber: z.string().trim().min(5, "Passport number must be at least 5 characters"),

  emailAddress: z.string().trim().email("Please enter a valid email address"),
  alternativeEmail: z
    .string()
    .trim()
    .email("Please enter a valid alternative email")
    .optional()
    .or(z.literal("")),
  mobileCountry: z.string().trim().min(1, "Country code is required"),
  mobileArea: z.string().trim().optional(),
  mobileNumber: z.string().trim().min(8, "Mobile number must be at least 8 digits"),
  phoneCountry: z.string().trim().optional(),
  phoneArea: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),

  alternateContactName: z.string().trim().min(1, "Contact name is required"),
  relationshipWithApplicant: z.string().trim().min(1, "Relationship is required"),
  occupation: z.string().trim().min(1, "Occupation is required"),
  altMobileCountry: z.string().trim().min(1, "Country code is required"),
  altMobileArea: z.string().trim().optional(),
  altMobileNumber: z.string().trim().min(8, "Mobile number must be at least 8 digits"),
  altPhoneCountry: z.string().trim().optional(),
  altPhoneArea: z.string().trim().optional(),
  altPhoneNumber: z.string().trim().optional(),
});

export type PersonalFormData = z.infer<typeof personalFormSchema>;
