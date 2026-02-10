import mongoose, { Schema } from 'mongoose';
import type { ITopic } from '../interface/ITopic.ts';

const TopicSchema: Schema = new Schema(
    {
        course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        title: { type: String, required: true, maxlength: 255 },
        description: { type: String, default: null },
    },
    { timestamps: false }
);

export const Topic = mongoose.model<ITopic>('Topic', TopicSchema);
