// src/application/shared/types/FileTypes.ts
/**
 * Domain-agnostic file interface
 * Abstracts away infrastructure details (Express.Multer, etc.)
 */
export interface IFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    destination?: string;
    filename?: string;
    path?: string;
}

export interface IMultipleFiles extends Array<IFile> { }
