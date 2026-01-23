import { MaterialProps, CreateMaterialProps } from "./MaterialTypes";
import { MaterialValidationError } from "../errors/MaterialErrors";

export type { MaterialProps };

export class Material {
  constructor(public props: MaterialProps) { }

  get id() { return this.props.id; }
  get title() { return this.props.title; }
  get description() { return this.props.description; }
  get subject() { return this.props.subject; }
  get course() { return this.props.course; }
  get semester() { return this.props.semester; }
  get type() { return this.props.type; }
  get fileUrl() { return this.props.fileUrl; }
  get thumbnailUrl() { return this.props.thumbnailUrl; }
  get tags() { return this.props.tags; }
  get difficulty() { return this.props.difficulty; }
  get estimatedTime() { return this.props.estimatedTime; }
  get isNewMaterial() { return this.props.isNewMaterial; }
  get isRestricted() { return this.props.isRestricted; }
  get uploadedBy() { return this.props.uploadedBy; }
  get uploadedAt() { return this.props.uploadedAt; }
  get views() { return this.props.views; }
  get downloads() { return this.props.downloads; }
  get rating() { return this.props.rating; }

  static create(props: CreateMaterialProps): Material {
    if (!props.title) throw new MaterialValidationError("Title is required");
    if (!props.description) throw new MaterialValidationError("Description is required");
    if (!props.subject) throw new MaterialValidationError("Subject is required");
    if (!props.course) throw new MaterialValidationError("Course is required");
    if (!props.semester) throw new MaterialValidationError("Semester is required");
    if (!props.type) throw new MaterialValidationError("Material type is required");
    if (!props.fileUrl) throw new MaterialValidationError("File URL is required");
    if (!props.thumbnailUrl) throw new MaterialValidationError("Thumbnail URL is required");
    if (!props.difficulty) throw new MaterialValidationError("Difficulty level is required");
    if (!props.estimatedTime) throw new MaterialValidationError("Estimated time is required");
    if (props.isNewMaterial === undefined) throw new MaterialValidationError("isNewMaterial flag is required");
    if (props.isRestricted === undefined) throw new MaterialValidationError("isRestricted flag is required");
    if (!props.uploadedBy) throw new MaterialValidationError("Uploaded by (User ID) is required");

    const now = new Date().toISOString();
    return new Material({
      ...props,
      id: undefined,
      uploadedAt: now,
      views: 0,
      downloads: 0,
      rating: 0,
    });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      subject: this.subject,
      course: this.course,
      semester: this.semester,
      type: this.type,
      fileUrl: this.fileUrl,
      thumbnailUrl: this.thumbnailUrl,
      tags: this.tags,
      difficulty: this.difficulty,
      estimatedTime: this.estimatedTime,
      isNewMaterial: this.isNewMaterial,
      isRestricted: this.isRestricted,
      uploadedBy: this.uploadedBy,
      uploadedAt: this.uploadedAt,
      views: this.views,
      downloads: this.downloads,
      rating: this.rating,
    };
  }

  static update(existingProps: MaterialProps, updateData: Partial<MaterialProps>): Material {
    const updatedProps: MaterialProps = {
      ...existingProps,
      ...updateData,
      id: existingProps.id,
      uploadedAt: existingProps.uploadedAt,
      uploadedBy: existingProps.uploadedBy,
      views: existingProps.views,
      downloads: existingProps.downloads,
      rating: existingProps.rating,
    };

    return new Material(updatedProps);
  }
}