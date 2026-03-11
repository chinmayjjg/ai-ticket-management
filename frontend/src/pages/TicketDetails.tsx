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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Ticket Details</h1>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={handleDeleteTicket}
                  disabled={isDeleting}
                  className="inline-flex items-center rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors duration-200"
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

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="card space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{ticket.title}</h2>
              <p className="mt-2 text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Tag className="h-4 w-4 mr-2" />
                Category
              </div>
              <p className="text-gray-900 capitalize">{ticket.category.replace('-', ' ')}</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Created
              </div>
              <p className="text-gray-900">{formatDate(ticket.createdAt)}</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <User className="h-4 w-4 mr-2" />
                Created By
              </div>
              <p className="text-gray-900">{ticket.createdBy?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-500">{ticket.createdBy?.email || ''}</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <User className="h-4 w-4 mr-2" />
                Assigned To
              </div>
              <p className="text-gray-900">{ticket.assignedTo?.name || 'Unassigned'}</p>
              <p className="text-sm text-gray-500">{ticket.assignedTo?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
