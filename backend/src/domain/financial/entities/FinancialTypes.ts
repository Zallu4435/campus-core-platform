// Financial domain types and interfaces

export interface ChargeFilter {
    title?: string | { $regex: string; $options: string };
    description?: string | { $regex: string; $options: string };
    term?: string | { $regex: string; $options: string };
    applicableFor?: string | { $regex: string; $options: string };
    status?: string;
    _id?: string | { $in: string[] };
    date?: { $gte?: Date; $lte?: Date };
    studentId?: string;
    $or?: Array<Record<string, any>>;
    [key: string]: unknown;
}

export type CreateChargeParams = {
    title: string;
    description: string;
    amount: number;
    term: string;
    dueDate: Date;
    applicableFor: string;
    createdBy: string;
};

export type UploadDocumentParams = {
    file: Express.Multer.File;
    type: string;
};
