import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ticketsAPI } from '@/services/api';
import { 
  Plus, 
  Filter, 
  Search, 
  RefreshCw, 
  LogOut,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { Ticket, TicketFilters, TicketStats } from '@/types';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Load tickets and stats
  const loadData = async (showRefresh = false) => {
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
  };

  useEffect(() => {
    loadData();
  }, [filters]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">SuperOps Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <span className={`badge ${user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.total}</p>
                <p className="text-sm text-gray-600">Total Tickets</p>
              </div>
            </div>
            
            <div className="card flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.open}</p>
                <p className="text-sm text-gray-600">Open</p>
              </div>
            </div>

            <div className="card flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.inProgress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>

            <div className="card flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.resolved}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <Link
            to="/create-ticket"
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Ticket
          </Link>

          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined, page: 1 }))}
              className="input-field w-auto"
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
              className="input-field w-auto"
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
              className="input-field w-auto"
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
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Your Tickets {user?.role === 'admin' && '(All)'}
            </h3>

            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {Object.keys(filters).some(key => filters[key as keyof TicketFilters] && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder')
                    ? 'Try adjusting your filters'
                    : 'Get started by creating a new ticket'
                  }
                </p>
                {!Object.keys(filters).some(key => filters[key as keyof TicketFilters] && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder') && (
                  <div className="mt-6">
                    <Link to="/create-ticket" className="btn-primary">
                      <Plus className="h-5 w-5 mr-2" />
                      Create your first ticket
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {ticket.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {ticket.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                            aria-label={`Change status for ticket ${ticket.title}`}
                            className={`badge ${getStatusBadgeClass(ticket.status)} border-0 bg-transparent text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity`}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {ticket.category.replace('-', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/tickets/${ticket._id}`}
                            className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                          >
                            View
                          </Link>
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