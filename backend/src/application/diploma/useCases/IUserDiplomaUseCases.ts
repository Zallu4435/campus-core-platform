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

export interface IGetUserDiplomasUseCase {
  execute(params: GetUserDiplomasRequestDTO): Promise<GetUserDiplomasResponseDTO>;
}

export interface IGetUserDiplomaByIdUseCase {
  execute(params: GetUserDiplomaByIdRequestDTO): Promise<GetUserDiplomaByIdResponseDTO>;
}

export interface IGetUserDiplomaChapterUseCase {
  execute(params: GetUserDiplomaChapterRequestDTO): Promise<GetUserDiplomaChapterResponseDTO>;
}

export interface IUpdateVideoProgressUseCase {
  execute(params: UpdateVideoProgressRequestDTO): Promise<UpdateVideoProgressResponseDTO>;
}

export interface IMarkChapterCompleteUseCase {
  execute(params: MarkChapterCompleteRequestDTO): Promise<MarkChapterCompleteResponseDTO>;
}

export interface IToggleBookmarkUseCase {
  execute(params: ToggleBookmarkRequestDTO): Promise<ToggleBookmarkResponseDTO>;
}

export interface IGetCompletedChaptersUseCase {
  execute(userId: string, courseId: string): Promise<GetCompletedChaptersResponseDTO>;
}

export interface IGetBookmarkedChaptersUseCase {
  execute(userId: string, courseId: string): Promise<GetBookmarkedChaptersResponseDTO>;
}

