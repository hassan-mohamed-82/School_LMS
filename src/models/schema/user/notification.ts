import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    school: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    recipientModel: 'Teacher' | 'Parent' | 'SchoolAdmin';
    title: string;
    body: string;
    type: 'period_reminder' | 'attendance' | 'homework' | 'announcement' | 'fee' | 'general';
    data?: Record<string, any>;
    isRead: boolean;
    sentAt: Date;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        recipient: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'recipientModel',
        },
        recipientModel: {
            type: String,
            required: true,
            enum: ['Teacher', 'Parent', 'SchoolAdmin'],
        },
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['period_reminder', 'attendance', 'homework', 'announcement', 'fee', 'general'],
        },
        data: {
            type: Schema.Types.Mixed,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        sentAt: {
            type: Date,
            default: Date.now,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);


export default mongoose.model<INotification>('Notification', notificationSchema);
