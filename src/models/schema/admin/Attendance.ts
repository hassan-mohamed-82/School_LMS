// src/models/Attendance.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export type AttendanceStatus = 'present' | 'absent' ;

export interface IAttendance extends Document {
    school: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    class: mongoose.Types.ObjectId;
    date: Date;
    status: AttendanceStatus;
    recordedBy: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schema
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
            required: [true, 'الطالب مطلوب'],
        },
        class: {
            type: Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'الفصل مطلوب'],
        },
        date: {
            type: Date,
            required: [true, 'التاريخ مطلوب'],
        },
        status: {
            type: String,
            enum: ['present', 'absent'],
            required: [true, 'حالة الحضور مطلوبة'],
        },
        recordedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'المدرس مطلوب'],
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
