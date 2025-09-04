import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ITicket extends Document {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'feature-request' | 'bug-report';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: mongoose.Types.ObjectId | IUser;
  assignedTo: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  attachments?: string[]; // URLs to uploaded files
}

const TicketSchema = new Schema<ITicket>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'general', 'feature-request', 'bug-report'],
    default: 'general',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    type: String,
    trim: true
  }],
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for faster queries
TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ createdBy: 1 });

// Update resolvedAt when status changes to resolved
TicketSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    } else if (this.status !== 'resolved') {
      this.resolvedAt = undefined;
    }
  }
  next();
});

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);