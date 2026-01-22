export interface UserDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    blocked?: boolean;
    pending?: boolean;
}

export interface UserDTOWithPassword extends UserDTO {
    password: string;
}

export interface FacultyDTO {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    qualification: string;
    experience: string;
    aboutMe: string;
    cvUrl?: string;
    certificatesUrl?: string[];
}
