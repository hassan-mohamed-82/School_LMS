import mongoose, { Document, Schema } from 'mongoose';

export type SessionStatus = 'pending' | 'inprogress' | 'completed';

export interface ITeacherSession extends Document {
    school: mongoose.Types.ObjectId;
    teacher: mongoose.Types.ObjectId;
    schedule: mongoose.Types.ObjectId;
    class: mongoose.Types.ObjectId;
    grade: mongoose.Types.ObjectId;
    subject: mongoose.Types.ObjectId;
    period: mongoose.Types.ObjectId;
    date: Date;
    startedAt?: Date;
    endedAt?: Date;
    status: SessionStatus;
    attendanceCount: {
        present: number;
        absent: number;
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const teacherSessionSchema = new Schema<ITeacherSession>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        teacher: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true,
        },
        schedule: {
            type: Schema.Types.ObjectId,
            ref: 'Schedule',
            required: true,
        },
        class: {
            type: Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        grade: {
            type: Schema.Types.ObjectId,
            ref: 'Grade',
            required: true,
        },
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },
        period: {
            type: Schema.Types.ObjectId,
            ref: 'Period',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        startedAt: {
            type: Date,
        },
        endedAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['pending', 'inprogress', 'completed'],
            default: 'pending',
        },
        attendanceCount: {
            present: { type: Number, default: 0 },
            absent: { type: Number, default: 0 },
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);


export default mongoose.model<ITeacherSession>('TeacherSession', teacherSessionSchema);
