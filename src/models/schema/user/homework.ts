import mongoose, { Document, Schema } from 'mongoose';

export interface IHomework extends Document {
    school: mongoose.Types.ObjectId;
    teacher: mongoose.Types.ObjectId;
    session?: mongoose.Types.ObjectId;
    class: mongoose.Types.ObjectId;
    grade: mongoose.Types.ObjectId;
    subject: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    file?: string;
    fileType?: 'pdf' | 'image' | 'word' | 'other';
    dueDate?: Date;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const homeworkSchema = new Schema<IHomework>(
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
        session: {
            type: Schema.Types.ObjectId,
            ref: 'TeacherSession',
        },
        class: {
            type: Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        // ⬇️ ضيف ده ⬇️
        grade: {
            type: Schema.Types.ObjectId,
            ref: 'Grade',
            required: true,
        },
        // ⬆️ ضيف ده ⬆️
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'عنوان الواجب مطلوب'],
            trim: true,
        },
        description: {
            type: String,
        },
        file: {
            type: String,
        },
        fileType: {
            type: String,
            enum: ['pdf', 'image', 'word', 'other'],
        },
        dueDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IHomework>('Homework', homeworkSchema);
