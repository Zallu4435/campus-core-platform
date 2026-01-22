export interface GetProfileRequestDTO {
    userId: string;
  }
  
  export interface UpdateProfileRequestDTO {
    userId: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    email: string;
  }
  
  export interface ChangePasswordRequestDTO {
    userId: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  export interface UpdateProfilePictureRequestDTO {
    userId: string;
    filePath: string;
  }