// src/models/Attendance.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface IAttendance extends Document {
    school: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    class: mongoose.Types.ObjectId;
    grade: mongoose.Types.ObjectId;
    session?: mongoose.Types.ObjectId;
    date: Date;
    status: 'present' | 'absent';
    recordedBy: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
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
        session: {
            type: Schema.Types.ObjectId,
            ref: 'TeacherSession',
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['present', 'absent'],
            required: true,
        },
        recordedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'recordedByModel',
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
