import {
  CreateEnquiryRequestDTO,
  GetEnquiriesRequestDTO,
  GetEnquiryByIdRequestDTO,
  UpdateEnquiryStatusRequestDTO,
  DeleteEnquiryRequestDTO,
  SendEnquiryReplyRequestDTO,
} from "../dtos/EnquiryRequestDTOs";
import {
  CreateEnquiryResponseDTO,
  GetEnquiriesResponseDTO,
  GetEnquiryByIdResponseDTO,
  UpdateEnquiryStatusResponseDTO,
  DeleteEnquiryResponseDTO,
  SendEnquiryReplyResponseDTO,
} from "../dtos/EnquiryResponseDTOs";
import { IEnquiryRepository } from "../repositories/IEnquiryRepository";
import { Enquiry } from "../../../domain/enquiry/entities/Enquiry";
import { EnquiryFilter, EnquiryStatus } from "../../../domain/enquiry/entities/EnquiryTypes";
import { IEmailService } from "../../auth/service/IEmailService";
import { ENQUIRY_CONSTANTS } from "../constants/EnquiryConstants";
import {
  EnquiryNotFoundError,
  InvalidEnquiryIdError,
  InvalidEmailError,
  EnquiryValidationError,
  EnquiryReplyFailedError,
} from "../../../domain/enquiry/errors/EnquiryErrors";
import {
  ICreateEnquiryUseCase,
  IGetEnquiriesUseCase,
  IGetEnquiryByIdUseCase,
  IUpdateEnquiryStatusUseCase,
  IDeleteEnquiryUseCase,
  ISendEnquiryReplyUseCase
} from './IEnquiryUseCases';

export class CreateEnquiryUseCase implements ICreateEnquiryUseCase {
  constructor(private _enquiryRepository: IEnquiryRepository) { }

  async execute(params: CreateEnquiryRequestDTO): Promise<CreateEnquiryResponseDTO> {
    if (!ENQUIRY_CONSTANTS.REGEX.EMAIL.test(params.email)) {
      throw new InvalidEmailError(params.email);
    }

    const enquiry = Enquiry.create({
      ...params,
      status: EnquiryStatus.PENDING,
    });

    const dbResult = await this._enquiryRepository.create(enquiry);

    return {
      enquiry: dbResult.props,
    };
  }
}

export class GetEnquiriesUseCase implements IGetEnquiriesUseCase {
  constructor(private _enquiryRepository: IEnquiryRepository) { }

  async execute(params: GetEnquiriesRequestDTO): Promise<GetEnquiriesResponseDTO> {
    const {
      page = ENQUIRY_CONSTANTS.PAGINATION.DEFAULT_PAGE,
      limit = ENQUIRY_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      status,
      startDate,
      endDate,
      search
    } = params;

    const skip = (page - 1) * limit;

    const filter: EnquiryFilter = {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
    };

    const sort = { createdAt: -1 };
    const enquiries = await this._enquiryRepository.find(filter, { skip, limit, sort });
    const total = await this._enquiryRepository.count(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      enquiries: enquiries.map(e => e.props),
      total,
      page,
      limit,
      totalPages,
    };
  }
}

export class GetEnquiryByIdUseCase implements IGetEnquiryByIdUseCase {
  constructor(private _enquiryRepository: IEnquiryRepository) { }

  async execute(params: GetEnquiryByIdRequestDTO): Promise<GetEnquiryByIdResponseDTO> {
    if (!params.id) {
      throw new InvalidEnquiryIdError();
    }

    const enquiry = await this._enquiryRepository.findById(params.id);
    if (!enquiry) {
      throw new EnquiryNotFoundError(params.id);
    }

    return {
      enquiry: enquiry.props,
    };
  }
}

export class UpdateEnquiryStatusUseCase implements IUpdateEnquiryStatusUseCase {
  constructor(private _enquiryRepository: IEnquiryRepository) { }

  async execute(params: UpdateEnquiryStatusRequestDTO): Promise<UpdateEnquiryStatusResponseDTO> {
    if (!params.id) {
      throw new InvalidEnquiryIdError();
    }

    const existingEnquiry = await this._enquiryRepository.findById(params.id);
    if (!existingEnquiry) {
      throw new EnquiryNotFoundError(params.id);
    }

    const updatedEnquiry = existingEnquiry.updateStatus(params.status);

    const dbResult = await this._enquiryRepository.update(params.id, updatedEnquiry);
    if (!dbResult) {
      throw new EnquiryNotFoundError(params.id);
    }

    return {
      enquiry: dbResult.props,
    };
  }
}

export class DeleteEnquiryUseCase implements IDeleteEnquiryUseCase {
  constructor(private _enquiryRepository: IEnquiryRepository) { }

  async execute(params: DeleteEnquiryRequestDTO): Promise<DeleteEnquiryResponseDTO> {
    if (!params.id) {
      throw new InvalidEnquiryIdError();
    }

    const enquiry = await this._enquiryRepository.findById(params.id);
    if (!enquiry) {
      throw new EnquiryNotFoundError(params.id);
    }

    await this._enquiryRepository.delete(params.id);

    return {
      success: true,
      message: ENQUIRY_CONSTANTS.MESSAGES.DELETE_SUCCESS,
    };
  }
}

export class SendEnquiryReplyUseCase implements ISendEnquiryReplyUseCase {
  constructor(
    private _enquiryRepository: IEnquiryRepository,
    private _emailService: IEmailService
  ) { }

  async execute(params: SendEnquiryReplyRequestDTO): Promise<SendEnquiryReplyResponseDTO> {
    if (!params.id) {
      throw new InvalidEnquiryIdError();
    }

    if (!params.replyMessage || params.replyMessage.trim().length === 0) {
      throw new EnquiryValidationError("replyMessage", "Reply message is required");
    }

    const enquiry = await this._enquiryRepository.findById(params.id);
    if (!enquiry) {
      throw new EnquiryNotFoundError(params.id);
    }

    try {
      await this._emailService.sendEnquiryReplyEmail({
        to: enquiry.email,
        name: enquiry.name,
        originalSubject: enquiry.subject,
        originalMessage: enquiry.message,
        replyMessage: params.replyMessage,
        adminName: ENQUIRY_CONSTANTS.MESSAGES.SUPPORT_TEAM_NAME
      });

      return {
        success: true,
        message: ENQUIRY_CONSTANTS.MESSAGES.REPLY_SUCCESS,
      };
    } catch (error) {
      throw new EnquiryReplyFailedError(ENQUIRY_CONSTANTS.MESSAGES.REPLY_FAILED);
    }
  }
}