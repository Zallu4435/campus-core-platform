import { IconType } from "react-icons";

export interface ProfileData {
    id?: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    studentId?: string;
    facultyId?: string;
    passwordChangedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ImageCropperProps {
    selectedImage: string;
    cropData: {
        x: number;
        y: number;
        size: number;
        scale: number;
        rotate: number;
    };
    onCropChange: (data: { x: number; y: number; size: number; scale: number; rotate: number }) => void;
    onCropApply: (file: File) => void;
    onCancel: () => void;
    onChooseDifferent: () => void;
}

export interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPasswordChange: (passwords: PasswordChangeData) => void;
    isLoading?: boolean;
    error?: Error | null;
}

export interface Theme {
    id: string;
    name: string;
    icon: IconType;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        text: string;
        border: string;
    };
}

export interface ProfilePictureModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentImage: string | null;
    onImageUpdate: (file: File) => void;
}