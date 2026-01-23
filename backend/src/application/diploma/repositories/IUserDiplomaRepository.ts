import { DiplomaCourse, Chapter } from "../../../domain/diploma/types";
import { GetUserDiplomasRequestDTO } from "../dtos/UserDiplomaRequestDTOs";
import { GetUserDiplomasResponseDTO } from "../dtos/UserDiplomaResponseDTOs";

export interface IUserDiplomaRepository {
  getUserDiplomas(params: GetUserDiplomasRequestDTO): Promise<GetUserDiplomasResponseDTO>;
  getUserDiplomaById(id: string): Promise<DiplomaCourse | null>;
  getUserDiplomaChapter(courseId: string, chapterId: string): Promise<Chapter | null>;
  updateVideoProgress(userId: string, courseId: string, chapterId: string, progress: number): Promise<{
    message: string;
    progress: number;
  }>;
  markChapterComplete(userId: string, courseId: string, chapterId: string): Promise<{
    message: string;
    completed: boolean;
  }>;
  toggleBookmark(userId: string, courseId: string, chapterId: string): Promise<{
    message: string;
    bookmarked: boolean;
  }>;
  getCompletedChapters(userId: string, courseId: string): Promise<string[]>;
  getBookmarkedChapters(userId: string, courseId: string): Promise<string[]>;
}
