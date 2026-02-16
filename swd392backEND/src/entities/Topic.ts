import mongoose, { Schema } from 'mongoose';
import type { ITopic } from '../interface/ITopic.ts';

const TopicSchema: Schema = new Schema(
    {
        course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        title: { type: String, required: true, maxlength: 255, unique: true },
        description: { type: String, default: null },
        content_json: { type: Schema.Types.Mixed, default: {} }
    },
    { timestamps: false }
);

export const Topic = mongoose.model<ITopic>('Topic', TopicSchema);
