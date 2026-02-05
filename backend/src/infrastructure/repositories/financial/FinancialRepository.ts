import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from 'mongoose';
import { v2 as cloudinary } from "cloudinary";
import { StudentFinancialInfoModel, ChargeModel, PaymentModel } from "../../database/mongoose/financial/financial.model"
import { ProgramModel } from "../../database/mongoose/academic/studentProgram.model";
import { FinancialErrorType } from "../../../domain/financial/enums/FinancialErrorType";
import { IFinancialRepository } from "../../../application/financial/repositories/IFinancialRepository";
import { CreateChargeParams, UploadDocumentParams, ChargeFilter, PaymentFilter } from "../../../domain/financial/types/FinancialTypes";
import { Charge } from "../../../domain/financial/entities/FinancialEntities";
import { FinancialMapper } from "./FinancialMapper";

import { User as UserModel } from "../../database/mongoose/auth/user.model";
import { Register as RegisterModel } from "../../database/mongoose/auth/register.model";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

import { IPaymentSource, IChargeSource, IStudentFinancialInfoSource, IFinancialInfoAggregated } from "./infraTypes";

export class FinancialRepository implements IFinancialRepository {
    async getStudentFinancialInfo(studentId: string) {
        try {
            const studentProgram = await ProgramModel.findOne({ studentId: studentId }).lean();
            if (!studentProgram) {
                return {
                    info: [],
                    history: [],
                };
            }

            const allCharges = await ChargeModel.find({}).lean() as unknown as IChargeSource[];

            const applicableCharges = allCharges.filter((charge) => {
                const term = charge.applicableFor; // Check usage in filter logic

                if (term === "All Students" || term === "all_students") {
                    return true;
                }

                if (studentProgram.degree === term) {
                    return true;
                }

                return false;
            });

            const studentFinancialInfo = await StudentFinancialInfoModel.find({
                studentId: studentId
            }).populate('paymentId').lean() as unknown as IStudentFinancialInfoSource[];

            const formattedCharges: IFinancialInfoAggregated[] = applicableCharges.map((charge) => {
                const financialInfo = studentFinancialInfo.find((info) =>
                    info.chargeId.toString() === charge._id.toString() &&
                    info.status === "Paid"
                );

                const isPaid = !!financialInfo;

                return {
                    id: charge._id.toString(),
                    studentId: studentId,
                    chargeId: charge._id.toString(),
                    amount: charge.amount,
                    paymentDueDate: charge.dueDate instanceof Date ? charge.dueDate.toISOString() : charge.dueDate,
                    status: isPaid ? "Paid" : "Pending",
                    term: charge.term,
                    issuedAt: charge.createdAt instanceof Date ? charge.createdAt.toISOString() : new Date().toISOString(),
                    paidAt: isPaid && financialInfo?.paidAt ? (financialInfo.paidAt instanceof Date ? financialInfo.paidAt.toISOString() : financialInfo.paidAt) : undefined,
                    method: isPaid ? financialInfo?.method : undefined,
                    createdAt: charge.createdAt instanceof Date ? charge.createdAt.toISOString() : new Date().toISOString(),
                    updatedAt: charge.updatedAt instanceof Date ? charge.updatedAt.toISOString() : new Date().toISOString(),
                    chargeTitle: charge.title as string, // Cast if necessary
                    chargeDescription: charge.description as string,
                };
            });

            // Get user email to find linked Register/Application ID
            // Get user email to find linked Register/Application ID
            const user = await UserModel.findById(studentId).select('email').lean();
            const associatedIds: string[] = [studentId];

            if (user) {
                const registerDoc = await RegisterModel.findOne({ email: user.email! }).select('_id').lean();
                if (registerDoc) {
                    const registerId = (registerDoc._id as unknown as mongoose.Types.ObjectId).toString();
                    associatedIds.push(registerId);
                }
            }

            // Convert string IDs to Mongoose ObjectIds for strict type matching
            const queryIds = associatedIds.map(id => new mongoose.Types.ObjectId(id));

            // Fetch actual payment history from PaymentModel including both User ID and Register ID
            const payments = await PaymentModel.find({
                studentId: { $in: queryIds },
                status: 'Completed'
            }).sort({ date: -1 }).lean() as unknown as IPaymentSource[];

            const formattedHistory = payments.map((payment) => ({
                id: payment._id.toString(),
                paidAt: payment.date instanceof Date ? payment.date.toISOString() : String(payment.date),
                date: payment.date instanceof Date ? payment.date.toISOString() : String(payment.date),
                chargeTitle: payment.description || "Payment",
                description: payment.description,
                method: payment.method,
                amount: payment.amount,
                status: payment.status
            }));


            const unpaidCharges = formattedCharges.filter(charge => charge.status === "Pending");

            return {
                info: unpaidCharges.map(c => FinancialMapper.toStudentFinancialInfo(c).toJSON()),
                history: formattedHistory,
            };
        } catch (error) {
            console.error('[FinancialRepository] Error in getStudentFinancialInfo:', error);
            throw error;
        }
    }

    private mapPaymentFilter(filter: PaymentFilter): Record<string, unknown> {
        const query: Record<string, unknown> = {};
        if (filter.startDate || filter.endDate) {
            const dateFilter: Record<string, unknown> = {};
            if (filter.startDate) dateFilter.$gte = filter.startDate;
            if (filter.endDate) dateFilter.$lte = filter.endDate;
            query.date = dateFilter;
        }
        if (filter.status) query.status = filter.status;
        if (filter.studentId) {
            if (mongoose.Types.ObjectId.isValid(filter.studentId)) {
                query.studentId = filter.studentId;
            }
        }
        if (filter.method) query.method = filter.method;
        return query;
    }

    async getAllPayments(filter: PaymentFilter, page: number, limit: number) {
        const query = this.mapPaymentFilter(filter);

        const total = await PaymentModel.countDocuments(query);
        const payments = await PaymentModel.find(query)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean() as unknown as IPaymentSource[];

        const totalPages = Math.ceil(total / limit);

        // Store original IDs to recover if population fails
        const originalIds = new Map(payments.map(p => [p._id.toString(), p.studentId]));

        // First pass: Populate from User collection
        await mongoose.model('User').populate(payments, {
            path: 'studentId',
            select: 'firstName lastName email'
        });

        // Identify ones that weren't found in User collection (studentId became null or stayed as ID)
        const unpopulated = payments.filter(p => {
            const current = p.studentId;
            return !current || typeof current !== 'object' || !('firstName' in current || 'lastName' in current);
        });

        if (unpopulated.length > 0) {
            // Restore IDs and try Register collection
            unpopulated.forEach(p => {
                p.studentId = originalIds.get(p._id.toString())!;
            });

            await mongoose.model('Register').populate(unpopulated, {
                path: 'studentId',
                select: 'firstName lastName email'
            });
        }

        return {
            data: payments.map((payment) => {
                const paymentEntity = FinancialMapper.toPayment(payment);
                return paymentEntity.toJSON();
            }),
            totalPayments: total,
            totalPages,
            currentPage: page,
        };
    }

    async getOnePayment(paymentId: string) {
        let payment = await PaymentModel.findById(paymentId)
            .lean() as unknown as IPaymentSource;

        if (!payment) {
            throw new Error(FinancialErrorType.PaymentNotFound);
        }

        const originalStudentId = payment.studentId;

        // Try User first
        await mongoose.model('User').populate(payment, {
            path: 'studentId',
            select: 'firstName lastName email'
        });

        // If not found, try Register
        if (!payment.studentId || typeof payment.studentId !== 'object' || !('firstName' in (payment.studentId))) {
            payment.studentId = originalStudentId;
            await mongoose.model('Register').populate(payment, {
                path: 'studentId',
                select: 'firstName lastName email'
            });
        }

        const paymentEntity = FinancialMapper.toPayment(payment);
        return {
            payment: paymentEntity.toJSON(),
        };
    }

    async makePayment(studentId: string, chargeId: string, amount: number, term: string, method: string, razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string) {
        // Validate amount first
        if (!amount || amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        if (!chargeId) {
            throw new Error('Charge ID is required for payment');
        }

        const charge = await ChargeModel.findById(chargeId).lean() as unknown as IChargeSource;
        if (!charge) {
            throw new Error(`Charge with ID ${chargeId} not found`);
        }

        const existingPending = await StudentFinancialInfoModel.findOne({
            studentId: studentId,
            chargeId: chargeId,
            status: "Pending",
            paymentId: { $exists: false }
        }).lean() as unknown as IStudentFinancialInfoSource;

        if (existingPending) {
            const timeSinceStart = Date.now() - new Date(existingPending.issuedAt).getTime();
            const fiveMinutesInMs = 5 * 60 * 1000;

            if (timeSinceStart < fiveMinutesInMs) {
                throw new Error("Payment for this charge is already in progress. Please complete the transaction in your other tab or wait for the pending transaction to expire.");
            } else {
                await StudentFinancialInfoModel.deleteOne({
                    _id: existingPending._id
                });
            }
        }

        const existingPaid = await StudentFinancialInfoModel.findOne({
            studentId: studentId,
            chargeId: chargeId,
            status: "Paid"
        }).lean();

        if (existingPaid) {
            throw new Error("This charge has already been paid.");
        }

        const transactionLock = new StudentFinancialInfoModel({
            studentId: studentId,
            chargeId: charge._id,
            amount: amount,
            status: "Pending",
            term: term,
            issuedAt: new Date(),
            paymentDueDate: charge.dueDate,
            method: method
        });

        await transactionLock.save();

        try {
            if (method === "Razorpay") {
                if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
                    const generatedSignature = crypto
                        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
                        .digest("hex");

                    if (generatedSignature !== razorpaySignature) {
                        throw new Error(FinancialErrorType.InvalidPaymentSignature);
                    }

                    const payment = await PaymentModel.findOneAndUpdate(
                        { "metadata.razorpayOrderId": razorpayOrderId, studentId: studentId },
                        {
                            $set: {
                                "metadata.razorpayPaymentId": razorpayPaymentId,
                                "metadata.razorpaySignature": razorpaySignature,
                                status: "Completed",
                                date: new Date(),
                                description: `Payment for ${term}`,
                            },
                        },
                        { new: true }
                    ).lean() as unknown as IPaymentSource;

                    if (!payment) {
                        throw new Error(FinancialErrorType.PaymentNotFound);
                    }

                    await StudentFinancialInfoModel.findByIdAndUpdate(
                        transactionLock._id,
                        {
                            paymentId: payment._id,
                            status: "Paid",
                            paidAt: new Date(),
                        }
                    );


                    return {
                        id: payment._id.toString(),
                        date: typeof payment.date === 'string' ? payment.date : (payment.date as Date).toISOString(),
                        description: payment.description,
                        method: payment.method as 'Credit Card' | 'Bank Transfer' | 'Financial Aid' | 'Razorpay' | 'stripe',
                        amount: payment.amount,
                        status: payment.status as 'Completed' | 'Pending' | 'Failed',
                        metadata: payment.metadata,
                    };
                } else {
                    const shortStudentId = studentId.slice(-6);
                    const shortReceipt = `r_${shortStudentId}_${Date.now()}`;
                    const order = await razorpay.orders.create({
                        amount: amount * 100,
                        currency: "INR",
                        receipt: shortReceipt,
                    });

                    const payment = new PaymentModel({
                        studentId: studentId,
                        amount: amount,
                        method: method,
                        term: term,
                        date: new Date(),
                        description: `Payment for ${term}`,
                        status: "Pending",
                        metadata: {
                            razorpayOrderId: order.id,
                            chargeId: chargeId,
                            transactionLockId: transactionLock._id
                        },
                    });

                    await payment.save();

                    await StudentFinancialInfoModel.findByIdAndUpdate(
                        transactionLock._id,
                        {
                            paymentId: payment._id
                        }
                    );

                    return {
                        id: payment._id.toString(),
                        orderId: order.id,
                        amount: payment.amount,
                        currency: "INR",
                        status: payment.status as 'Completed' | 'Pending' | 'Failed',
                    };
                }
            } else {
                const payment = new PaymentModel({
                    studentId: studentId,
                    date: new Date(),
                    description: `Payment for ${term}`,
                    method: method,
                    amount: amount,
                    status: "Completed",
                    metadata: {
                        chargeId: chargeId,
                        transactionLockId: transactionLock._id
                    },
                });

                await payment.save();

                await StudentFinancialInfoModel.findByIdAndUpdate(
                    transactionLock._id,
                    {
                        paymentId: payment._id,
                        status: "Paid",
                        paidAt: new Date(),
                    }
                );


                return {
                    id: payment._id.toString(),
                    date: payment.date.toISOString(),
                    description: payment.description,
                    method: payment.method as 'Credit Card' | 'Bank Transfer' | 'Financial Aid' | 'Razorpay' | 'stripe',
                    amount: payment.amount,
                    status: payment.status as 'Completed' | 'Pending' | 'Failed',
                };
            }
        } catch (error) {
            console.error('[FinancialRepository] Error during payment processing:', error);
            await StudentFinancialInfoModel.findByIdAndDelete(transactionLock._id);

            // Re-throw the error with a clear message
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Payment processing failed. Please try again.');
        }
    }

    async uploadDocument(params: UploadDocumentParams) {
        const result = await cloudinary.uploader.upload(params.file.path, {
            folder: "financial-documents",
        });
        return {
            url: result.secure_url,
        };
    }

    async getPaymentReceipt(paymentId: string) {
        const payment = await PaymentModel.findById(paymentId).lean() as unknown as IPaymentSource;
        if (!payment) throw new Error(FinancialErrorType.PaymentNotFound);
        return {
            url: payment.receiptUrl || "",
        };
    }

    async createCharge(params: CreateChargeParams) {
        const charge = new ChargeModel({
            title: params.title,
            description: params.description,
            amount: params.amount,
            term: params.term,
            dueDate: params.dueDate,
            applicableFor: params.applicableFor,
            createdBy: params.createdBy,
            status: "Active",
        });
        await charge.save();

        const chargeEntity = FinancialMapper.toCharge(charge.toObject() as unknown as IChargeSource);
        return {
            charge: chargeEntity.toJSON(),
            studentFinancialInfos: [],
        };
    }

    private mapChargeFilter(filter: ChargeFilter): Record<string, unknown> {
        const query: Record<string, unknown> = {};
        if (filter.title) query.title = { $regex: filter.title, $options: 'i' };
        if (filter.description) query.description = { $regex: filter.description, $options: 'i' };
        if (filter.term) query.term = filter.term;
        if (filter.applicableFor) query.applicableFor = filter.applicableFor;
        if (filter.status) query.status = filter.status;
        if (filter.ids && filter.ids.length > 0) query._id = { $in: filter.ids };
        // Charge model does not have studentId based on schema, removing if (filter.studentId) query.studentId = filter.studentId; 
        // Or if it's supposed to be filtered by student program match, that logic is in getStudentFinancialInfo, not basic charge filter?
        // Actually ChargeFilter type has studentId? Let's assume schema is source of truth. Schema has no studentId.

        if (filter.startDate || filter.endDate) {
            const dateQuery: Record<string, unknown> = {};
            if (filter.startDate) dateQuery.$gte = filter.startDate;
            if (filter.endDate) dateQuery.$lte = filter.endDate;
            query.date = dateQuery;
        }

        if (filter.searchQuery) {
            const searchRegex = new RegExp(filter.searchQuery.trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { term: searchRegex },
                { applicableFor: searchRegex }
            ];
        }

        return query;
    }

    async getAllCharges(filter: ChargeFilter, page: number, limit: number) {
        const query = this.mapChargeFilter(filter);

        const total = await ChargeModel.countDocuments(query);
        const charges = await ChargeModel.find(query)
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean() as unknown as IChargeSource[];

        return {
            data: charges.map((charge) => {
                const chargeEntity = FinancialMapper.toCharge(charge);
                return chargeEntity.toJSON();
            }),
            total,
        };
    }

    async updateCharge(chargeId: string, updateFields: Partial<Charge>) {
        const updated = await ChargeModel.findByIdAndUpdate(
            chargeId,
            { $set: updateFields },
            { new: true }
        ).lean() as unknown as IChargeSource;
        if (!updated) throw new Error('Charge not found');

        const chargeEntity = FinancialMapper.toCharge(updated);
        return {
            charge: chargeEntity.toJSON(),
        };
    }

    async deleteCharge(chargeId: string) {
        const deleted = await ChargeModel.findByIdAndDelete(chargeId);
        return { success: !!deleted };
    }

    async hasPendingPayment(studentId: string): Promise<boolean> {
        const pending = await PaymentModel.exists({ studentId, status: 'Pending' });
        return !!pending;
    }

    async clearPendingPayment(studentId: string): Promise<boolean> {
        try {
            await StudentFinancialInfoModel.deleteMany({
                studentId: studentId,
                status: "Pending",
                paymentId: { $exists: false }
            });

            await PaymentModel.updateMany(
                {
                    studentId: studentId,
                    status: 'Pending'
                },
                {
                    $set: {
                        status: 'Cancelled',
                        updatedAt: new Date()
                    }
                }
            );

            const cancelledPayments = await PaymentModel.find({
                studentId: studentId,
                status: 'Cancelled'
            }).select('_id').lean() as unknown as Pick<IPaymentSource, '_id'>[];

            if (cancelledPayments.length > 0) {
                const cancelledPaymentIds = cancelledPayments.map(p => p._id);
                await StudentFinancialInfoModel.deleteMany({
                    studentId: studentId,
                    paymentId: { $in: cancelledPaymentIds },
                    status: 'Pending'
                });
            }
            return true;
        } catch (error) {
            console.error('[FinancialRepository] Error clearing pending payment:', error);
            return false;
        }
    }

}