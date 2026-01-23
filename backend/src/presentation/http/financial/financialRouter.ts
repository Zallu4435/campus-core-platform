import express from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import { getFinancialComposer } from "../../../infrastructure/services/financial/FinancialComposers";
import {
  makePaymentSchema,
  uploadDocumentSchema,
  getPaymentReceiptSchema,
  getAllPaymentsSchema,
  getOnePaymentSchema,
  getAllChargesSchema,
  createChargeSchema,
  updateChargeSchema,
  updateChargeBodySchema,
  deleteChargeSchema
} from "../../../shared/validation/schemas/FinancialSchemas";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const financialController = getFinancialComposer();

// Student Routes
router.get(
  "/student-info",
  authMiddleware,
  (req, res, next) => expressAdapter(req, res, next, financialController.getStudentFinancialInfo.bind(financialController))
);

router.post(
  "/payments",
  authMiddleware,
  validate(makePaymentSchema),
  (req, res, next) => expressAdapter(req, res, next, financialController.makePayment.bind(financialController))
);

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  validate(uploadDocumentSchema),
  (req, res, next) => expressAdapter(req, res, next, financialController.uploadDocument.bind(financialController))
);

router.get(
  "/payments/:paymentId/receipt",
  authMiddleware,
  validate(getPaymentReceiptSchema, 'params'),
  (req, res, next) => expressAdapter(req, res, next, financialController.getPaymentReceipt.bind(financialController))
);

router.post(
  "/check-pending",
  authMiddleware,
  (req, res, next) => expressAdapter(req, res, next, financialController.checkPendingPayment.bind(financialController))
);

router.post(
  "/clear-pending",
  authMiddleware,
  (req, res, next) => expressAdapter(req, res, next, financialController.clearPendingPayment.bind(financialController))
);


// Admin Routes
router.get(
  "/admin/payments",
  authMiddleware,
  validate(getAllPaymentsSchema, 'query'),
  (req, res, next) => expressAdapter(req, res, next, financialController.getAllPayments.bind(financialController))
);

router.get(
  "/admin/payments/:id",
  authMiddleware,
  validate(getOnePaymentSchema, 'params'),
  (req, res, next) => expressAdapter(req, res, next, financialController.getOnePayment.bind(financialController))
);

router.get(
  "/admin/charges",
  authMiddleware,
  validate(getAllChargesSchema, 'query'),
  (req, res, next) => expressAdapter(req, res, next, financialController.getAllCharges.bind(financialController))
);

router.post(
  "/admin/charges",
  authMiddleware,
  validate(createChargeSchema),
  (req, res, next) => expressAdapter(req, res, next, financialController.createCharge.bind(financialController))
);

router.patch(
  '/admin/charges/:id',
  authMiddleware,
  validate(updateChargeSchema, 'params'),
  validate(updateChargeBodySchema),
  (req, res, next) => expressAdapter(req, res, next, financialController.updateCharge.bind(financialController))
);

router.delete(
  '/admin/charges/:id',
  authMiddleware,
  validate(deleteChargeSchema, 'params'),
  (req, res, next) => expressAdapter(req, res, next, financialController.deleteCharge.bind(financialController))
);

export default router;