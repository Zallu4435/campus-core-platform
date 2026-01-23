import { IUserDiplomaRepository } from "../repositories/IUserDiplomaRepository";
import {
  GetUserDiplomasRequestDTO,
  GetUserDiplomaByIdRequestDTO,
  GetUserDiplomaChapterRequestDTO,
  UpdateVideoProgressRequestDTO,
  MarkChapterCompleteRequestDTO,
  ToggleBookmarkRequestDTO
} from "../dtos/UserDiplomaRequestDTOs";
import {
  GetUserDiplomasResponseDTO,
  GetUserDiplomaByIdResponseDTO,
  GetUserDiplomaChapterResponseDTO,
  UpdateVideoProgressResponseDTO,
  MarkChapterCompleteResponseDTO,
  ToggleBookmarkResponseDTO,
  GetCompletedChaptersResponseDTO,
  GetBookmarkedChaptersResponseDTO
} from "../dtos/UserDiplomaResponseDTOs";
import { DiplomaNotFoundError } from "../../../domain/diploma/errors/DiplomaErrors";
import {
  IGetUserDiplomasUseCase,
  IGetUserDiplomaByIdUseCase,
  IGetUserDiplomaChapterUseCase,
  IUpdateVideoProgressUseCase,
  IMarkChapterCompleteUseCase,
  IToggleBookmarkUseCase,
  IGetCompletedChaptersUseCase,
  IGetBookmarkedChaptersUseCase
} from './IUserDiplomaUseCases';

export class GetUserDiplomasUseCase implements IGetUserDiplomasUseCase {
  constructor(private readonly _userDiplomaRepository: IUserDiplomaRepository) { }

  async execute(params: GetUserDiplomasRequestDTO): Promise<GetUserDiplomasResponseDTO> {
    const result = await this._userDiplomaRepository.getUserDiplomas(params);
    return {
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit)
    };
  }
}

export class GetUserDiplomaByIdUseCase implements IGetUserDiplomaByIdUseCase {
  constructor(private readonly _userDiplomaRepository: IUserDiplomaRepository) { }

  async execute(params: GetUserDiplomaByIdRequestDTO): Promise<GetUserDiplomaByIdResponseDTO> {
    const diploma = await this._userDiplomaRepository.getUserDiplomaById(params.id);
    if (!diploma) {
      throw new DiplomaNotFoundError(params.id);
    }
    return diploma;
  }
}

export class GetUserDiplomaChapterUseCase implements IGetUserDiplomaChapterUseCase {
  constructor(private readonly _userDiplomaRepository: IUserDiplomaRepository) { }

  async execute(params: GetUserDiplomaChapterRequestDTO): Promise<GetUserDiplomaChapterResponseDTO> {
    const chapter = await this._userDiplomaRepository.getUserDiplomaChapter(params.courseId, params.chapterId);
    if (!chapter) {
      throw new DiplomaNotFoundError(params.chapterId);
    }
    return chapter;
  }
}

export class UpdateVideoProgressUseCase implements IUpdateVideoProgressUseCase {
  constructor(private readonly _userDiplomaRepository: IUserDiplomaRepository) { }

  async execute(params: UpdateVideoProgressRequestDTO): Promise<UpdateVideoProgressResponseDTO> {
    const userProgress = await this._userDiplomaRepository.updateVideoProgress(params.userId, params.courseId, params.chapterId, params.progress);
    return {
      message: 'Progress updated successfully',
      progress: userProgress.progress
    };
  }
}

export class MarkChapterCompleteUseCase implements IMarkChapterCompleteUseCase {
  constructor(private readonly _userDiplomaRepository: IUserDiplomaRepository) { }

  async execute(params: MarkChapterCompleteRequestDTO): Promise<MarkChapterCompleteResponseDTO> {
    await this._userDiplomaRepository.markChapterComplete(params.userId, params.courseId, params.chapterId);
    return {
      message: 'Chapter marked as complete',
      completed: true
    };
  }
}

export class ToggleBookmarkUseCase implements IToggleBookmarkUseCase {
  constructor(private readonly _userDiplomaRepository: IUserDiplomaRepository) { }

  async execute(params: ToggleBookmarkRequestDTO): Promise<ToggleBookmarkResponseDTO> {
    const userProgress = await this._userDiplomaRepository.toggleBookmark(params.userId, params.courseId, params.chapterId);
    return {
      message: userProgress.bookmarked ? 'Chapter bookmarked' : 'Chapter unbookmarked',
      bookmarked: userProgress.bookmarked
    };
  }
}

export class GetCompletedChaptersUseCase implements IGetCompletedChaptersUseCase {
  constructor(private readonly _userDiplomaRepository: IUserDiplomaRepository) { }

  async execute(userId: string, courseId: string): Promise<GetCompletedChaptersResponseDTO> {
    const completedChapters = await this._userDiplomaRepository.getCompletedChapters(userId, courseId);
    return { chapters: completedChapters };
  }
}

export class GetBookmarkedChaptersUseCase implements IGetBookmarkedChaptersUseCase {
  constructor(private readonly _userDiplomaRepository: IUserDiplomaRepository) { }

  async execute(userId: string, courseId: string): Promise<GetBookmarkedChaptersResponseDTO> {
    const bookmarkedChapters = await this._userDiplomaRepository.getBookmarkedChapters(userId, courseId);
    return { chapters: bookmarkedChapters };
  }
}
