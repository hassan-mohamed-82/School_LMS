import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacherSession extends Document {
    school: mongoose.Types.ObjectId;
    teacher: mongoose.Types.ObjectId;
    schedule: mongoose.Types.ObjectId;
    class: mongoose.Types.ObjectId;
    grade: mongoose.Types.ObjectId;
    subject: mongoose.Types.ObjectId;
    period: mongoose.Types.ObjectId;
    date: Date;
    startedAt: Date;
    endedAt?: Date;
    status: 'active' | 'completed' | 'cancelled';
    attendanceCount: {
        present: number;
        absent: number;
        late: number;
        excused: number;
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
            required: true,
        },
        endedAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active',
        },
        attendanceCount: {
            present: { type: Number, default: 0 },
            absent: { type: Number, default: 0 },
            late: { type: Number, default: 0 },
            excused: { type: Number, default: 0 },
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