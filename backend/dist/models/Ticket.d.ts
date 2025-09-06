import mongoose, { Document } from 'mongoose';
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
    attachments?: string[];
}
export declare const Ticket: mongoose.Model<ITicket, {}, {}, {}, mongoose.Document<unknown, {}, ITicket, {}, {}> & ITicket & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
