import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ticketsAPI } from '@/services/api';
import { 
  Activity,
  Plus, 
  RefreshCw, 
  LogOut,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import type { Ticket, TicketFilters, TicketStats } from '@/types';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Load tickets and stats
  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const [ticketsResponse, statsResponse] = await Promise.all([
        ticketsAPI.getAll(filters),
        ticketsAPI.getStats()
      ]);

      if (ticketsResponse.success && ticketsResponse.data && Array.isArray(ticketsResponse.data.tickets)) {
        setTickets(ticketsResponse.data.tickets);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load data';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      const response = await ticketsAPI.update(ticketId, { status: newStatus as any });
      
      if (response.success) {
        // Update local state
        setTickets(prev => 
          prev.map(ticket => 
            ticket._id === ticketId 
              ? { ...ticket, status: newStatus as any }
              : ticket
          )
        );
        toast.success('Ticket status updated successfully');
        // Refresh stats
        loadData(true);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update ticket';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTicket = async (ticketId: string, ticketTitle: string) => {
    const confirmed = window.confirm(`Delete ticket "${ticketTitle}"?`);
    if (!confirmed) return;

    try {
      setDeletingTicketId(ticketId);
      const response = await ticketsAPI.delete(ticketId);

      if (response.success) {
        setTickets(prev => prev.filter(ticket => ticket._id !== ticketId));
        toast.success('Ticket deleted successfully');
        loadData(true);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete ticket';
      toast.error(errorMessage);
    } finally {
      setDeletingTicketId(null);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#3525cd]" />
          <p className="muted-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="app-header sticky top-0 z-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#3525cd] text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#0b1c30]">SuperOps Dashboard</h1>
                <p className="hidden text-xs muted-text sm:block">Cognitive operations workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="rounded-lg border border-[#c7c4d8] bg-white/70 p-2 text-[#464555] transition hover:border-[#3525cd] hover:text-[#3525cd] disabled:opacity-50"
                aria-label="Refresh dashboard"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="hidden items-center gap-2 rounded-lg border border-[#c7c4d8] bg-white/70 px-3 py-2 text-sm text-[#464555] sm:flex">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <span className={`badge ${user?.role === 'admin' ? 'bg-[#e9ddff] text-[#5516be]' : 'bg-[#c9e6ff] text-[#004c6e]'}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="rounded-lg border border-[#c7c4d8] bg-white/70 p-2 text-[#464555] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#c7c4d8] bg-white/70 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)] backdrop-blur-xl md:flex-row md:items-end">
          <div>
            <p className="mb-2 inline-flex rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold uppercase text-[#004666]">
              AI-assisted ticket operations
            </p>
            <h2 className="section-title">Support queue control center</h2>
            <p className="mt-2 max-w-2xl muted-text">Scan volume, filter active work, and route issues from a single high-density workspace.</p>
          </div>
          <Link to="/create-ticket" className="btn-primary">
            <Plus className="mr-2 h-5 w-5" />
            Create Ticket
          </Link>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="card flex items-center">
              <div className="mr-4 rounded-lg bg-[#c9e6ff] p-3">
                <Clock className="h-6 w-6 text-[#006591]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0b1c30]">{stats.overview.total}</p>
                <p className="text-sm muted-text">Total Tickets</p>
              </div>
            </div>
            
            <div className="card flex items-center">
              <div className="mr-4 rounded-lg bg-amber-100 p-3">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0b1c30]">{stats.overview.open}</p>
                <p className="text-sm muted-text">Open</p>
              </div>
            </div>

            <div className="card flex items-center">
              <div className="mr-4 rounded-lg bg-[#e2dfff] p-3">
                <RefreshCw className="h-6 w-6 text-[#3525cd]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0b1c30]">{stats.overview.inProgress}</p>
                <p className="text-sm muted-text">In Progress</p>
              </div>
            </div>

            <div className="card flex items-center">
              <div className="mr-4 rounded-lg bg-emerald-100 p-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0b1c30]">{stats.overview.resolved}</p>
                <p className="text-sm muted-text">Resolved</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions & Filters */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#c7c4d8] bg-white/70 p-4 backdrop-blur md:flex-row md:items-center">
          <p className="text-sm font-semibold text-[#0b1c30]">Queue filters</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Status Filter */}
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined, page: 1 }))}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value || undefined, page: 1 }))}
              className="input-field"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Category Filter */}
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined, page: 1 }))}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
              <option value="feature-request">Feature Request</option>
              <option value="bug-report">Bug Report</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="card">
          <div>
            <h3 className="mb-4 text-lg font-semibold leading-6 text-[#0b1c30]">
              Your Tickets {user?.role === 'admin' && '(All)'}
            </h3>

            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-[#777587]" />
                <h3 className="mt-2 text-sm font-semibold text-[#0b1c30]">No tickets found</h3>
                <p className="mt-1 text-sm muted-text">
                  {Object.keys(filters).some(key => filters[key as keyof TicketFilters] && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder')
                    ? 'Try adjusting your filters'
                    : 'Get started by creating a new ticket'
                  }
                </p>
                {!Object.keys(filters).some(key => filters[key as keyof TicketFilters] && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder') && (
                  <div className="mt-6">
                    <Link to="/create-ticket" className="btn-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first ticket
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#c7c4d8]">
                <table className="min-w-full divide-y divide-[#c7c4d8]">
                  <thead className="bg-[#eff4ff]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#464555]">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#464555]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#464555]">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#464555]">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#464555]">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#464555]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5eeff] bg-white">
                    {tickets.map((ticket) => (
                      <tr key={ticket._id} className="transition hover:bg-[#f8f9ff]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="max-w-xs truncate text-sm font-semibold text-[#0b1c30]">
                              {ticket.title}
                            </div>
                            <div className="max-w-xs truncate text-sm muted-text">
                              {ticket.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                            aria-label={`Change status for ticket ${ticket.title}`}
                            className={`badge ${getStatusBadgeClass(ticket.status)} cursor-pointer border-0 text-xs font-semibold transition-opacity hover:opacity-80`}
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0b1c30] capitalize">
                          {ticket.category.replace('-', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm muted-text">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-4">
                            <Link
                              to={`/tickets/${ticket._id}`}
                              className="font-semibold text-[#3525cd] transition hover:text-[#170426]"
                            >
                              View
                            </Link>
                            {user?.role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTicket(ticket._id, ticket.title)}
                                disabled={deletingTicketId === ticket._id}
                                className="inline-flex items-center font-semibold text-red-600 transition hover:text-red-800 disabled:opacity-50"
                              >
                                {deletingTicketId === ticket._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
