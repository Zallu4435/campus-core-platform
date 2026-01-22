// ProfileConstants.ts

export const ProfileConstants = {
    VALIDATION: {
        MIN_NAME_LENGTH: 2,
        MAX_NAME_LENGTH: 100,
        MIN_PASSWORD_LENGTH: 8,
    },

    MESSAGES: {
        PROFILE_UPDATED: "Profile updated successfully",
        PASSWORD_CHANGED: "Password changed successfully",
        PICTURE_UPDATED: "Profile picture updated successfully",
    },

    REGEX: {
        EMAIL: /^\\S+@\\S+\\.\\S+$/,
        PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$/,
    },
};
