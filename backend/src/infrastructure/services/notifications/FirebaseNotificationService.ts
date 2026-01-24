import { INotificationService, NotificationPayload } from "../../../application/notifications/services/INotificationService";
import { IAuthRepository } from "../../../application/auth/repositories/IAuthRepository";
import { NotificationRecipientType } from "../../../domain/notifications/entities/NotificationTypes";

export class FirebaseNotificationService implements INotificationService {
    constructor(private _authRepository: IAuthRepository) { }

    async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
        const tokens = await this._authRepository.findTokensByUserId(userId);
        await this.sendBulk(tokens, payload);
    }

    async sendToTopic(topic: string, payload: NotificationPayload): Promise<void> {
        const { getMessaging } = await import("firebase-admin/messaging");
        const message = {
            notification: {
                title: payload.title,
                body: payload.message,
            },
            data: payload.data,
            topic: topic,
        };
        await getMessaging().send(message);
    }

    async sendToToken(token: string, payload: NotificationPayload): Promise<void> {
        const { getMessaging } = await import("firebase-admin/messaging");
        const message = {
            notification: {
                title: payload.title,
                body: payload.message,
            },
            data: payload.data,
            token: token,
        };
        try {
            await getMessaging().send(message);
        } catch (error: any) {
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                await this._authRepository.removeFcmToken(token);
            }
            throw error;
        }
    }

    async sendBulk(tokens: string[], payload: NotificationPayload): Promise<void> {
        if (tokens.length === 0) return;
        const { getMessaging } = await import("firebase-admin/messaging");

        const message = {
            notification: {
                title: payload.title,
                body: payload.message,
            },
            data: payload.data,
        };

        const batchSize = 500;
        for (let i = 0; i < tokens.length; i += batchSize) {
            const batch = tokens.slice(i, i + batchSize);
            const result = await getMessaging().sendEachForMulticast({
                ...message,
                tokens: batch,
            });

            for (let idx = 0; idx < result.responses.length; idx++) {
                const response = result.responses[idx];
                if (!response.success && response.error) {
                    if (response.error.code === 'messaging/invalid-registration-token' ||
                        response.error.code === 'messaging/registration-token-not-registered') {
                        await this._authRepository.removeFcmToken(batch[idx]);
                    }
                }
            }
        }
    }

    async sendToAllStudents(payload: NotificationPayload): Promise<void> {
        const tokens = await this._authRepository.findTokensByCollection("user");
        await this.sendBulk(tokens, payload);
    }

    async sendToAllFaculty(payload: NotificationPayload): Promise<void> {
        const tokens = await this._authRepository.findTokensByCollection("faculty");
        await this.sendBulk(tokens, payload);
    }

    async sendToAll(payload: NotificationPayload): Promise<void> {
        const studentTokens = await this._authRepository.findTokensByCollection("user");
        const facultyTokens = await this._authRepository.findTokensByCollection("faculty");
        const allTokens = [...new Set([...studentTokens, ...facultyTokens])];
        await this.sendBulk(allTokens, payload);
    }

    async sendByRecipientType(recipientType: NotificationRecipientType, recipientId: string | undefined, payload: NotificationPayload): Promise<void> {
        switch (recipientType) {
            case NotificationRecipientType.INDIVIDUAL:
                if (recipientId) await this.sendToToken(recipientId, payload);
                break;
            case NotificationRecipientType.ALL_STUDENTS:
                await this.sendToAllStudents(payload);
                break;
            case NotificationRecipientType.ALL_FACULTY:
                await this.sendToAllFaculty(payload);
                break;
            case NotificationRecipientType.ALL:
            case NotificationRecipientType.ALL_STUDENTS_AND_FACULTY:
                await this.sendToAll(payload);
                break;
        }
    }
}
