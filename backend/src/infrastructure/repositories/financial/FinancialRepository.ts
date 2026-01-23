import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from 'mongoose';
import { v2 as cloudinary } from "cloudinary";
import { StudentFinancialInfoModel, ChargeModel, PaymentModel } from "../../database/mongoose/financial/financial.model"
import { ProgramModel } from "../../database/mongoose/academic/studentProgram.model";
import { FinancialErrorType } from "../../../domain/financial/enums/FinancialErrorType";
import { IFinancialRepository } from "../../../application/financial/repositories/IFinancialRepository";
import { ChargeFilter } from "../../../domain/financial/entities/FinancialTypes";
import { Charge } from "../../../domain/financial/entities/FinancialEntities";
import { FinancialMapper } from "./FinancialMapper";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

            const allCharges = await ChargeModel.find({}).lean();

            const applicableCharges = allCharges.filter((charge) => {
                if (charge.applicableFor === "All Students" || charge.applicableFor === "all_students") {
                    return true;
                }

                if (studentProgram.degree === charge.applicableFor) {
                    return true;
                }

                return false;
            });

            const studentFinancialInfo = await StudentFinancialInfoModel.find({
                studentId: studentId
            }).populate('paymentId').lean();

            const formattedCharges = applicableCharges.map((charge) => {
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
                    paymentDueDate: charge.dueDate.toISOString(),
                    status: isPaid ? "Paid" as const : "Pending" as const,
                    term: charge.term,
                    issuedAt: charge.createdAt?.toISOString() || new Date().toISOString(),
                    paidAt: isPaid ? financialInfo.paidAt?.toISOString() : undefined,
                    method: isPaid ? financialInfo.method : undefined,
                    createdAt: charge.createdAt?.toISOString() || new Date().toISOString(),
                    updatedAt: charge.updatedAt?.toISOString() || new Date().toISOString(),
                    chargeTitle: charge.title,
                    chargeDescription: charge.description,
                };
            });

            const formattedHistory = studentFinancialInfo
                .filter((info) => info.status === "Paid")
                .map((info) => ({
                    id: info.paymentId ? info.paymentId.toString() : undefined,
                    paidAt: info.paidAt.toISOString(),
                    chargeTitle: info.chargeId ? "Payment for " + info.term : "Payment",
                    method: info.method,
                    amount: info.amount,
                }))
                .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());


            const unpaidCharges = formattedCharges.filter(charge => charge.status === "Pending");

            return {
                info: unpaidCharges,
                history: formattedHistory,
            };
        } catch (error) {
            console.error('[FinancialRepository] Error in getStudentFinancialInfo:', error);
            throw error;
        }
    }

    async getAllPayments(startDate: string, endDate: string, status: string, studentId: string, page: number, limit: number) {
        const query: ChargeFilter = {};
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (startDate) {
            query.date = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.date = { $lte: new Date(endDate) };
        }
        if (status) query.status = status;
        if (studentId) {
            if (mongoose.Types.ObjectId.isValid(studentId)) {
                query.studentId = studentId;
            } else {
                return { data: [], totalPages: 1, totalPayments: 0, currentPage: page };
            }
        }

        const total = await PaymentModel.countDocuments(query);
        const payments = await PaymentModel.find(query)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(total / limit);

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
        const payment = await PaymentModel.findById(paymentId).lean();
        if (!payment) {
            throw new Error(FinancialErrorType.PaymentNotFound);
        }

        const paymentEntity = FinancialMapper.toPayment(payment);
        return {
            payment: paymentEntity.toJSON(),
        };
    }

    async makePayment(studentId: string, chargeId: string, amount: number, term: string, method: string, razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string) {
        if (!chargeId) {
            throw new Error('Charge ID is required for payment');
        }

        const charge = await ChargeModel.findById(chargeId).lean();
        if (!charge) {
            throw new Error(`Charge with ID ${chargeId} not found`);
        }

        const existingPending = await StudentFinancialInfoModel.findOne({
            studentId: studentId,
            chargeId: chargeId,
            status: "Pending",
            paymentId: { $exists: false }
        }).lean();

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
                    ).lean();

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
                        date: payment.date.toISOString(),
                        description: payment.description,
                        method: payment.method,
                        amount: payment.amount,
                        status: payment.status,
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
                        status: payment.status,
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
                    method: payment.method,
                    amount: payment.amount,
                    status: payment.status,
                };
            }
        } catch (error) {
            console.error('[FinancialRepository] Error during payment processing:', error);
            await StudentFinancialInfoModel.findByIdAndDelete(transactionLock._id);
            throw error;
        }
    }

    async uploadDocument(params) {
        const result = await cloudinary.uploader.upload(params.file.path, {
            folder: "financial-documents",
        });
        return {
            url: result.secure_url,
        };
    }

    async getPaymentReceipt(params) {
        const payment = await PaymentModel.findById(params.paymentId).lean();
        if (!payment) throw new Error(FinancialErrorType.PaymentNotFound);
        return {
            url: payment.receiptUrl || "",
        };
    }

    async createCharge(params) {
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

        const chargeEntity = FinancialMapper.toCharge(charge.toObject());
        return {
            charge: chargeEntity.toJSON(),
            studentFinancialInfos: [],
        };
    }

    async getAllCharges(term: string, status: string, search: string, page: number, limit: number) {
        const query: ChargeFilter = {};

        if (term && term !== 'All Terms') query.term = term;
        if (status && status !== 'All Statuses') query.status = status;

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { term: searchRegex },
                { applicableFor: searchRegex }
            ];
        }

        const total = await ChargeModel.countDocuments(query);
        const charges = await ChargeModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

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
        ).lean();
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
            }).select('_id').lean();

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