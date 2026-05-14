import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, User, Calendar, Tag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ticketsAPI } from '@/services/api';
import type { Ticket } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) {
        toast.error('Invalid ticket ID');
        navigate('/dashboard', { replace: true });
        return;
      }

      try {
        const response = await ticketsAPI.getById(id);
        if (response.success && response.data?.ticket) {
          setTicket(response.data.ticket);
        } else {
          toast.error('Ticket not found');
          navigate('/dashboard', { replace: true });
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to load ticket';
        toast.error(errorMessage);
        navigate('/dashboard', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    loadTicket();
  }, [id, navigate]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open': return 'badge-status-open';
      case 'in-progress': return 'badge-status-in-progress';
      case 'resolved': return 'badge-status-resolved';
      case 'closed': return 'badge-status-closed';
      default: return 'badge-status-open';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low': return 'badge-priority-low';
      case 'medium': return 'badge-priority-medium';
      case 'high': return 'badge-priority-high';
      case 'urgent': return 'badge-priority-urgent';
      default: return 'badge-priority-medium';
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;

    const confirmed = window.confirm(`Delete ticket "${ticket.title}"?`);
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const response = await ticketsAPI.delete(ticket._id);

      if (response.success) {
        toast.success('Ticket deleted successfully');
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete ticket';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#3525cd]" />
          <p className="muted-text">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="app-shell">
      <div className="app-header sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 rounded-lg border border-[#c7c4d8] bg-white/70 p-2 text-[#464555] transition hover:border-[#3525cd] hover:text-[#3525cd]"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#0b1c30]">Ticket Details</h1>
                <p className="hidden text-xs muted-text sm:block">Operational context and ownership</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={handleDeleteTicket}
                  disabled={isDeleting}
                  className="inline-flex items-center rounded-lg border border-red-200 bg-white/70 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Ticket
                    </>
                  )}
                </button>
              )}
              <Link to="/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold uppercase text-[#004666]">
                AI-classified ticket
              </p>
              <h2 className="text-2xl font-semibold text-[#0b1c30]">{ticket.title}</h2>
              <p className="mt-2 whitespace-pre-wrap muted-text">{ticket.description}</p>
            </div>
            <div className="flex gap-2">
              <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#c7c4d8] bg-[#f8f9ff] p-4">
              <div className="mb-2 flex items-center text-sm font-semibold text-[#464555]">
                <Tag className="h-4 w-4 mr-2" />
                Category
              </div>
              <p className="text-[#0b1c30] capitalize">{ticket.category.replace('-', ' ')}</p>
            </div>

            <div className="rounded-2xl border border-[#c7c4d8] bg-[#f8f9ff] p-4">
              <div className="mb-2 flex items-center text-sm font-semibold text-[#464555]">
                <Calendar className="h-4 w-4 mr-2" />
                Created
              </div>
              <p className="text-[#0b1c30]">{formatDate(ticket.createdAt)}</p>
            </div>

            <div className="rounded-2xl border border-[#c7c4d8] bg-[#f8f9ff] p-4">
              <div className="mb-2 flex items-center text-sm font-semibold text-[#464555]">
                <User className="h-4 w-4 mr-2" />
                Created By
              </div>
              <p className="text-[#0b1c30]">{ticket.createdBy?.name || 'Unknown'}</p>
              <p className="text-sm muted-text">{ticket.createdBy?.email || ''}</p>
            </div>

            <div className="rounded-2xl border border-[#00D1FF]/45 bg-[#00D1FF]/10 p-4 shadow-[0_0_40px_rgba(0,209,255,0.15)]">
              <div className="mb-2 flex items-center text-sm font-semibold text-[#004666]">
                <User className="h-4 w-4 mr-2" />
                Assigned To
              </div>
              <p className="text-[#0b1c30]">{ticket.assignedTo?.name || 'Unassigned'}</p>
              <p className="text-sm text-[#004666]">{ticket.assignedTo?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
