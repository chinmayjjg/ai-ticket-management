import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI } from '@/services/api';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateTicketData } from '@/types';

const CreateTicket: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateTicketData>();

  const watchedDescription = watch('description', '');

  const onSubmit = async (data: CreateTicketData) => {
    setIsSubmitting(true);
    try {
      const response = await ticketsAPI.create(data);
      
      if (response.success) {
        toast.success('Ticket created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create ticket';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Create New Ticket</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="card animate-slide-up">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              Describe your issue or request
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Our AI will automatically categorize and prioritize your ticket for faster resolution.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters',
                  },
                  maxLength: {
                    value: 200,
                    message: 'Title must be less than 200 characters',
                  },
                })}
                type="text"
                className={`mt-1 input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Brief description of your issue..."
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters',
                  },
                  maxLength: {
                    value: 2000,
                    message: 'Description must be less than 2000 characters',
                  },
                })}
                rows={6}
                className={`mt-1 input-field ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Provide detailed information about your issue, including steps to reproduce, expected vs actual behavior, error messages, etc."
              />
              <div className="flex justify-between mt-2">
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
                <span className="text-sm text-gray-500 ml-auto">
                  {watchedDescription.length}/2000
                </span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority (Optional)
              </label>
              <select
                {...register('priority')}
                className="mt-1 input-field"
              >
                <option value="">Let AI determine priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <p className="mt-2 text-sm text-gray-600">
                If not specified, our AI will automatically determine the priority based on your description.
              </p>
            </div>

            {/* AI Helper Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                🤖 AI-Powered Processing
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Automatic categorization (Technical, Billing, Bug Report, etc.)</li>
                <li>• Smart priority detection based on urgency keywords</li>
                <li>• Intelligent agent assignment for faster resolution</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Creating Ticket...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Create Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;