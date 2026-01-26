// infrastructure/services/email.service.ts (Updated)

import nodemailer from "nodemailer";
import { config } from "../../config/config";
import { IEmailService } from "../../application/auth/service/IEmailService";
import {
  AdmissionOfferEmailParams,
  AdmissionRejectionEmailParams,
  FacultyOfferEmailParams,
  FacultyCredentialsEmailParams,
  PasswordResetOtpEmailParams,
  RegistrationConfirmationEmailParams,
  EnquiryReplyEmailParams,
} from "../../application/auth/service/EmailServiceParams";


class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!config.email.host) {
      console.error("EMAIL_HOST is not configured");
      throw new Error("Email host is not configured");
    }
    if (!config.email.user) {
      console.error("EMAIL_USER is not configured");
      throw new Error("Email user is not configured");
    }
    if (!config.email.password) {
      console.error("EMAIL_PASSWORD is not configured");
      throw new Error("Email password is not configured");
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    this.transporter.verify((error: Error | null, success: boolean) => {
      if (error) {
        console.error("Email transporter verification failed:", error);
      } else {
        console.log("Email transporter is ready to send messages");
      }
    });
  }

  async sendAdmissionOfferEmail({
    to,
    name,
    programDetails,
    startDate,
    scholarshipInfo,
    additionalNotes,
    acceptUrl,
    rejectUrl,
    expiryDays,
  }: AdmissionOfferEmailParams): Promise<void> {
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2a5885;">Congratulations, ${name}!</h2>
                <p>We are pleased to inform you that your application to the <strong>${programDetails}</strong> has been reviewed and accepted.</p>
                
                ${programDetails
        ? `<p><strong>Program Details:</strong> ${programDetails}</p>`
        : ""
      }
                ${startDate ? `<p><strong>Start Date:</strong> ${startDate}</p>` : ""}
                ${scholarshipInfo
        ? `<p><strong>Scholarship Information:</strong> ${scholarshipInfo}</p>`
        : ""
      }
                ${additionalNotes
        ? `<p><strong>Additional Information:</strong> ${additionalNotes}</p>`
        : ""
      }
                
                <p>Please confirm your admission by clicking one of the following options:</p>
                
                <div style="margin: 30px 0;">
                    <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-right: 15px;">
                        Accept Offer
                    </a>
                    <a href="${rejectUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                        Decline Offer
                    </a>
                </div>
                
                <p><strong>Important:</strong> This offer will expire in ${expiryDays} days. Please respond before then.</p>
                
                <p>If you have any questions, please contact our admissions office.</p>
                
                <p>Best regards,<br>
                The Admissions Team</p>
            </div>
        `;

    await this.transporter.sendMail({
      from: `"Admissions Team" <${config.email.from}>`,
      to,
      subject: `Admission Offer: ${programDetails}`,
      html: htmlContent,
    });

  }

  async sendAdmissionRejectionEmail({
    to,
    name,
    reason,
  }: AdmissionRejectionEmailParams): Promise<void> {
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2a5885;">Update on Your Application</h2>
                <p>Dear ${name},</p>
                <p>Thank you for giving us the opportunity to review your application for admission to our university.</p>
                <p>After careful consideration, we regret to inform you that we are unable to offer you admission at this time.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #2a5885; padding: 15px; margin: 20px 0;">
                    <p><strong>Reason:</strong> ${reason}</p>
                </div>

                <p>This decision was difficult, as we received many qualified applications this year.</p>
                
                <p>We wish you the very best in your future academic pursuits.</p>
                
                <p>Best regards,<br>
                The Admissions Team</p>
            </div>
        `;

    await this.transporter.sendMail({
      from: `"Admissions Team" <${config.email.from}>`,
      to,
      subject: `Update on Your Admission Application`,
      html: htmlContent,
    });
  }

  async sendFacultyOfferEmail({
    to,
    name,
    department,
    position,
    startDate,
    salary,
    benefits,
    additionalNotes,
    acceptUrl,
    rejectUrl,
    expiryDays,
  }: FacultyOfferEmailParams): Promise<void> {
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2a5885;">Faculty Appointment Offer for ${name}</h2>
                
                <p>Dear ${name},</p>
                
                <p>We are pleased to offer you a faculty position in the <strong>${department}</strong> department at our institution.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #2a5885; padding: 15px; margin: 20px 0;">
                    <p><strong>Department:</strong> ${department}</p>
                    <p><strong>Start Date:</strong> ${startDate}</p>
                    ${salary ? `<p><strong>Salary:</strong> ${salary}</p>` : ""}
                    ${benefits ? `<p><strong>Benefits:</strong> ${benefits}</p>` : ""}
                </div>
                
                ${additionalNotes
        ? `<p><strong>Additional Information:</strong> ${additionalNotes}</p>`
        : ""
      }
                
                <p>We are excited about the possibility of you joining our academic community and believe your expertise will be a valuable addition to our institution.</p>
                
                <p>Please respond to this offer by clicking one of the following options:</p>
                
                <div style="margin: 30px 0;">
                    <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-right: 15px;">
                        Accept Position
                    </a>
                    <a href="${rejectUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                        Decline Position
                    </a>
                </div>
                
                <p><strong>Important:</strong> This offer will expire in ${expiryDays} days. Please respond before then.</p>
                
                <p>Upon acceptance, you will receive your login credentials and further onboarding information.</p>
                
                <p>If you have any questions or need additional information, please do not hesitate to contact us.</p>
                
                <p>Best regards,<br>
                The Faculty Affairs Office</p>
            </div>
        `;

    await this.transporter.sendMail({
      from: `"Faculty Affairs Office" <${config.email.from}>`,
      to,
      subject: `Faculty Position Offer: ${department}`,
      html: htmlContent,
    });

  }

  async sendFacultyCredentialsEmail({
    to,
    name,
    email,
    password,
    loginUrl,
    department,
    additionalInstructions,
  }: FacultyCredentialsEmailParams): Promise<void> {
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2a5885;">Welcome to the Faculty, ${name}!</h2>
                
                <p>Dear ${name},</p>
                
                <p>Thank you for accepting our offer to join the ${department} department. We are excited to have you as part of our academic community.</p>
                
                <p>Below are your login credentials for the faculty dashboard:</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #2a5885; padding: 15px; margin: 20px 0;">
                    <p><strong>Email/Username:</strong> ${email}</p>
                    <p><strong>Temporary Password:</strong> ${password}</p>
                    <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
                </div>
                
                <p><strong>Important:</strong> For security reasons, please change your password after your first login.</p>
                
                ${additionalInstructions
        ? `<p><strong>Additional Instructions:</strong> ${additionalInstructions}</p>`
        : ""
      }
                
                <p>The faculty dashboard will provide you with access to important resources, class schedules, student information, and other administrative tools.</p>
                
                <p>If you have any questions or need assistance, please contact our IT support team.</p>
                
                <p>We look forward to your contributions and collaboration.</p>
                
                <p>Best regards,<br>
                The Faculty Affairs Office</p>
            </div>
        `;

    await this.transporter.sendMail({
      from: `"Faculty Affairs Office" <${config.email.from}>`,
      to,
      subject: `Your Faculty Dashboard Credentials`,
      html: htmlContent,
    });

  }

  async sendPasswordResetOtpEmail({
    to,
    name,
    otp,
  }: PasswordResetOtpEmailParams): Promise<void> {
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2a5885;">Password Reset Request</h2>
                
                <p>Dear ${name},</p>
                
                <p>We received a request to reset the password for your account. Please use the following One-Time Password (OTP) to proceed:</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #2a5885; padding: 15px; margin: 20px 0; text-align: center;">
                    <p style="font-size: 1.5rem; font-weight: bold; letter-spacing: 0.1rem; color: #1f2937;">${otp}</p>
                </div>
                
                <p><strong>Important:</strong> This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                
                <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
                
                <p>Best regards,<br>
                The Support Team</p>
            </div>
        `;

    await this.transporter.sendMail({
      from: `"Support Team" <${config.email.from}>`,
      to,
      subject: `Your Password Reset OTP`,
      html: htmlContent,
    });
  }

  async sendRegistrationConfirmationEmail({
    to,
    name,
    confirmationUrl,
  }: RegistrationConfirmationEmailParams): Promise<void> {
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2a5885;">Confirm Your Email Address</h2>
                <p>Dear ${name},</p>
                <p>Thank you for registering with our university platform. Please confirm your email address by clicking the button below:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${confirmationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Confirm Email Address
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 14px; word-break: break-all;">${confirmationUrl}</p>
                <p style="color: #666; font-size: 14px;">If you did not register for an account, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">This is an automated message from our university registration system.</p>
                <p style="color: #999; font-size: 12px;">Best regards,<br>The University Support Team</p>
            </div>
        `;

    const mailOptions = {
      from: `"Support Team" <${config.email.from}>`,
      to,
      subject: `Confirm your email address`,
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendEnquiryReplyEmail({
    to,
    name,
    originalSubject,
    originalMessage,
    replyMessage,
    adminName = "Support Team",
  }: EnquiryReplyEmailParams): Promise<void> {
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2a5885;">Response to Your Enquiry</h2>
                
                <p>Dear ${name},</p>
                
                <p>Thank you for contacting us. We have received your enquiry and are pleased to provide you with a response.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #2a5885; padding: 15px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2a5885;">Your Original Enquiry</h3>
                    <p><strong>Subject:</strong> ${originalSubject}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background-color: white; padding: 10px; border-radius: 4px; margin: 10px 0;">
                        ${originalMessage.replace(/\n/g, '<br>')}
                    </div>
                </div>
                
                <div style="background-color: #e8f5e8; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2a5885;">Our Response</h3>
                    <div style="background-color: white; padding: 10px; border-radius: 4px; margin: 10px 0;">
                        ${replyMessage.replace(/\n/g, '<br>')}
                    </div>
                </div>
                
                <p>If you have any further questions or need additional assistance, please don't hesitate to contact us again.</p>
                
                <p>Best regards,<br>
                ${adminName}<br>
                Support Team</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666;">
                    This is an automated response to your enquiry. Please do not reply to this email directly.
                </p>
            </div>
        `;

    await this.transporter.sendMail({
      from: `"Support Team" <${config.email.from}>`,
      to,
      subject: `Re: ${originalSubject}`,
      html: htmlContent,
    });
  }
}

export const emailService = new EmailService(); // Export the singleton instance