import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ITask } from './task';

// Interface for Token subdocument
interface IToken {
  token: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  tokens: IToken[];
  tasks?: Types.ObjectId[] | ITask[];
  generateAuthToken(): Promise<string>;
  toJSON(): Omit<IUser, 'password' | 'tokens'>;
}

interface IUserModel extends Model<IUser> {
  findByCredentials(email: string, password: string): Promise<IUser>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for tasks
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Cascade delete tasks when user is removed
userSchema.pre<IUser>('deleteOne', { document: true }, async function (next) {
  await mongoose.model('Task').deleteMany({ owner: this._id });
  next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = async function (): Promise<string> {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  this.tokens.push({ token });
  await this.save();

  return token;
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

// Find user by credentials
userSchema.statics.findByCredentials = async (
  email: string,
  password: string
): Promise<IUser> => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid login credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }

  return user;
};

const User = mongoose.model<IUser, IUserModel>('User', userSchema);
export default User;
