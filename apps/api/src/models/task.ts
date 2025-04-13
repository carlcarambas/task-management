// import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './user'; // Import the user interface

// Interface for Task document
export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  owner: Types.ObjectId | IUser;
  createdAt: Date;
}

// Task model interface
// interface ITaskModel extends Model<ITask> {}

const taskSchema = new Schema<ITask>(
  // const taskSchema = new Schema<ITask, ITaskModel>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Prevent modification after creation
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for better query performance
taskSchema.index({ owner: 1, completed: 1 });
taskSchema.index({ createdAt: -1 });

// Optional: Add query helpers if needed
// taskSchema.query.byOwner = function(ownerId: Types.ObjectId) {
//   return this.where({ owner: ownerId });
// };

const Task = mongoose.model<ITask>('Task', taskSchema);
// const Task = mongoose.model<ITask, ITaskModel>('Task', taskSchema);
export default Task;
