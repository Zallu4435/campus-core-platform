import { IUserDiplomaRepository } from "../../../application/diploma/repositories/IUserDiplomaRepository";
import { Diploma as DiplomaModel } from "../../database/mongoose/diploma/diploma.model";
import { UserProgress } from "../../database/mongoose/video/userProgress.model";
import { Video } from "../../database/mongoose/video/video.model";
import { VideoStatus } from "../../../domain/video/enums/VideoStatus";
import { IDiplomaDocument, DiplomaFilter, IVideoDocument } from "./infraTypes";
import { UserDiplomaMapper } from "./mappers/UserDiplomaMapper";
import { GetUserDiplomasRequestDTO } from "../../../application/diploma/dtos/UserDiplomaRequestDTOs";
import { DIPLOMA_FILTERS, DIPLOMA_SORT } from "../../../application/diploma/constants/DiplomaConstants";

export class UserDiplomaRepository implements IUserDiplomaRepository {
  async getUserDiplomas(params: GetUserDiplomasRequestDTO) {
    const { userId, page, limit, category, status, dateRange } = params;
    const skip = (page - 1) * limit;

    const query: DiplomaFilter = { status: true };
    if (category && category !== DIPLOMA_FILTERS.ALL) query.category = category;
    if (status && status !== DIPLOMA_FILTERS.ALL) query.status = status === 'published';

    if (dateRange && dateRange !== DIPLOMA_FILTERS.ALL) {
      const date = new Date();
      switch (dateRange) {
        case 'week':
          date.setDate(date.getDate() - 7);
          break;
        case 'month':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - 1);
          break;
      }
      query.createdAt = { $gte: date };
    }

    const [diplomaDocs, total] = await Promise.all([
      DiplomaModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(DIPLOMA_SORT.DEFAULT)
        .lean<IDiplomaDocument[]>(),
      DiplomaModel.countDocuments(query)
    ]);

    const courses = await Promise.all(diplomaDocs.map(async (doc) => {
      const [videoCount, completedVideoCount] = await Promise.all([
        Video.countDocuments({ diplomaId: doc._id, status: VideoStatus.Published }),
        UserProgress.countDocuments({ userId, courseId: doc._id, isCompleted: true })
      ]);

      return UserDiplomaMapper.toDiplomaCourse(doc, videoCount, completedVideoCount);
    }));

    return {
      data: courses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getUserDiplomaById(id: string) {
    const diploma = await DiplomaModel.findOne({
      _id: id,
      status: true
    }).lean<IDiplomaDocument>();

    if (!diploma) return null;

    const videos = await Video.find({
      diplomaId: diploma._id,
      status: VideoStatus.Published
    }).sort({ module: 1 }).lean<IVideoDocument[]>();

    const chapters = videos.map(video => UserDiplomaMapper.toChapter(video));

    return UserDiplomaMapper.toDiplomaCourseWithChapters(diploma, chapters);
  }

  async getUserDiplomaChapter(courseId: string, chapterId: string) {
    const diplomaExists = await DiplomaModel.exists({
      _id: courseId,
      status: true
    });
    if (!diplomaExists) return null;

    const chapter = await Video.findOne({ _id: chapterId }).lean<IVideoDocument>();
    if (!chapter) return null;

    return UserDiplomaMapper.toChapter(chapter);
  }


  async updateVideoProgress(userId: string, courseId: string, chapterId: string, progress: number) {
    const userProgress = await UserProgress.findOneAndUpdate(
      { userId, courseId, chapterId },
      { progress },
      { upsert: true, new: true }
    );

    return {
      message: 'Progress updated successfully',
      progress: userProgress.progress
    };
  }

  async markChapterComplete(userId: string, courseId: string, chapterId: string) {
    await UserProgress.findOneAndUpdate(
      { userId, courseId, chapterId },
      { isCompleted: true },
      { upsert: true, new: true }
    );

    return {
      message: 'Chapter marked as complete',
      completed: true
    };
  }

  async toggleBookmark(userId: string, courseId: string, chapterId: string) {
    const userProgress = await UserProgress.findOne({ userId, courseId, chapterId });
    let isBookmarked = false;

    if (!userProgress) {
      await UserProgress.create({
        userId,
        courseId,
        chapterId,
        isBookmarked: true
      });
      isBookmarked = true;
    } else {
      userProgress.isBookmarked = !userProgress.isBookmarked;
      await userProgress.save();
      isBookmarked = userProgress.isBookmarked;
    }

    return {
      message: isBookmarked ? 'Chapter bookmarked' : 'Chapter unbookmarked',
      bookmarked: isBookmarked
    };
  }

  async getCompletedChapters(userId: string, courseId: string) {
    const completedChapters = await UserProgress.find({
      userId,
      courseId,
      isCompleted: true
    }).select('chapterId');

    return completedChapters.map(chapter => chapter.chapterId.toString());
  }

  async getBookmarkedChapters(userId: string, courseId: string) {
    const bookmarkedChapters = await UserProgress.find({
      userId,
      courseId,
      isBookmarked: true
    }).select('chapterId');

    return bookmarkedChapters.map(chapter => chapter.chapterId.toString());
  }
}
