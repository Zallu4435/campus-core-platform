import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getDiplomaComposer } from "../../../infrastructure/services/diploma/DiplomaComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import { diplomaSchemas } from "../../../shared/validation/schemas/DiplomaSchemas";

const diplomaRouter = Router();
const diplomaController = getDiplomaComposer();

diplomaRouter.get("/", authMiddleware, validate(diplomaSchemas.getDiplomas, 'query'), (req, res, next) => {
  expressAdapter(req, res, next, diplomaController.getDiplomas.bind(diplomaController));
});

diplomaRouter.get("/:id", authMiddleware, validate(diplomaSchemas.diplomaIdParam, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, diplomaController.getDiplomaById.bind(diplomaController));
});

diplomaRouter.post("/", authMiddleware, validate(diplomaSchemas.createDiploma, 'body'), (req, res, next) => {
  expressAdapter(req, res, next, diplomaController.createDiploma.bind(diplomaController));
});

diplomaRouter.put("/:id", authMiddleware, validate(diplomaSchemas.diplomaIdParam, 'params'), validate(diplomaSchemas.updateDiploma, 'body'), (req, res, next) => {
  expressAdapter(req, res, next, diplomaController.updateDiploma.bind(diplomaController));
});

diplomaRouter.delete("/:id", authMiddleware, validate(diplomaSchemas.diplomaIdParam, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, diplomaController.deleteDiploma.bind(diplomaController));
});

diplomaRouter.post("/:diplomaId/diploma-enrollments", authMiddleware, validate(diplomaSchemas.enrollParam, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, diplomaController.enrollStudent.bind(diplomaController));
});

diplomaRouter.delete("/:diplomaId/diploma-enrollments", authMiddleware, validate(diplomaSchemas.enrollParam, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, diplomaController.unenrollStudent.bind(diplomaController));
});



export default diplomaRouter;

