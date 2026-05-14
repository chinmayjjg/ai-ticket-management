import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI } from '@/services/api';
import { ArrowLeft, Loader2, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateTicketData } from '@/types';

const CreateTicket: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTicketData>();

  const watchedDescription = watch('description', '');

  const handleRewriteDescription = async () => {
    const description = watchedDescription.trim();

    if (description.length < 10) {
      toast.error('Add at least 10 characters before using AI rewrite.');
      return;
    }

    setIsRewriting(true);
    try {
      const response = await ticketsAPI.rewriteDescription({ description });

      if (response.success && response.data?.rewrittenDescription) {
        setValue('description', response.data.rewrittenDescription, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });

        toast.success(
          response.data.source === 'groq'
            ? 'Description rewritten with AI.'
            : 'Description polished with local fallback.'
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to rewrite description';
      toast.error(errorMessage);
    } finally {
      setIsRewriting(false);
    }
  };

  const onSubmit = async (data: CreateTicketData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        ...(data.priority ? {} : { priority: undefined }),
      };

      const response = await ticketsAPI.create(payload);

      if (response.success) {
        toast.success('Ticket created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create ticket';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-header sticky top-0 z-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 rounded-lg border border-[#c7c4d8] bg-white/70 p-2 text-[#464555] transition hover:border-[#3525cd] hover:text-[#3525cd]"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[#0b1c30]">Create New Ticket</h1>
              <p className="hidden text-xs muted-text sm:block">AI-assisted intake and routing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card animate-slide-up">
          <div className="mb-6">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold uppercase text-[#004666]">
              <Sparkles className="h-3.5 w-3.5" />
              AI-assisted submission
            </p>
            <h2 className="section-title">Describe your issue or request</h2>
            <p className="mt-2 text-sm muted-text">
              SuperOps will categorize, prioritize, and prepare this ticket for routing after submission.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-[#0b1c30]">
                Title <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 5, message: 'Title must be at least 5 characters' },
                  maxLength: { value: 200, message: 'Title must be less than 200 characters' },
                })}
                type="text"
                className={`input-field mt-2 ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Database latency after deployment"
              />
              {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="description" className="block text-sm font-semibold text-[#0b1c30]">
                  Description <span className="text-[#ba1a1a]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleRewriteDescription}
                  disabled={isRewriting || watchedDescription.trim().length < 10}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#00D1FF]/40 bg-[#00D1FF]/10 px-3 py-2 text-sm font-semibold text-[#004666] transition hover:bg-[#00D1FF]/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRewriting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Rewrite with AI
                </button>
              </div>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' },
                  maxLength: { value: 2000, message: 'Description must be less than 2000 characters' },
                })}
                rows={6}
                className={`input-field mt-2 ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Include impact, affected users, error messages, and when the issue started."
              />
              <div className="mt-2 flex justify-between">
                {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
                <span className="ml-auto text-sm muted-text">{watchedDescription.length}/2000</span>
              </div>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-[#0b1c30]">Priority</label>
              <select {...register('priority')} className="input-field mt-2">
                <option value="">Let AI determine priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <p className="mt-2 text-sm muted-text">
                Leave this empty when you want AI to infer urgency from impact and outage language.
              </p>
            </div>

            <div className="ai-panel">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#004666]">
                <Sparkles className="h-4 w-4" />
                AI-powered processing
              </h3>
              <ul className="space-y-1 text-sm text-[#004666]">
                <li>Automatic categorization for technical, billing, bug report, and general requests.</li>
                <li>Smart priority detection based on urgency, impact, and outage language.</li>
                <li>Intelligent assignment signals for faster resolution.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Ticket...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
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
