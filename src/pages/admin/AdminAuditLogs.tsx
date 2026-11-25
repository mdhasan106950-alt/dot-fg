import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { AuditLog } from '../../types';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Database,
  RefreshCw,
  FileText,
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const { data: logs, isLoading, refetch, isFetching } = useQuery<AuditLog[]>({
    queryKey: ['adminAuditLogs'],
    queryFn: () => api.getAuditLogs(),
    refetchInterval: 15000,
  });

  const filteredLogs = logs?.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId.toLowerCase().includes(search.toLowerCase());

    const matchesAction =
      actionFilter === 'ALL' || l.action.startsWith(actionFilter);

    return matchesSearch && matchesAction;
  }) || [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Security & System Audit Logs
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Immutable trace of all administrative mutations, order status updates, coupon edits, and punishment executions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">TOTAL LOGGED EVENTS</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{logs?.length || 0}</div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">ADMIN MUTATIONS</div>
          <div className="text-2xl font-bold text-purple-400 font-mono mt-1">
            {logs?.filter((l) => l.actor !== 'SYSTEM' && l.actor !== 'USER').length || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">RETENTION WINDOW</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">1,000 Events</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, actor, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none font-mono"
          >
            <option value="ALL">All Event Domains</option>
            <option value="ORDER">Orders (STATUS, CREATE)</option>
            <option value="COUPON">Coupons & Promos</option>
            <option value="PRODUCT">Products Catalog</option>
            <option value="PUNISHMENT">Punishments (BANS/MUTES)</option>
            <option value="USER">User & Permissions</option>
            <option value="CMS">CMS & Content</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity Type / ID</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Loading security audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No matching audit log records.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          l.action.includes('PUNISHMENT') || l.action.includes('CANCELLED')
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : l.action.includes('DELIVERED') || l.action.includes('PAID')
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : l.action.includes('COUPON')
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{l.actor}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      <span className="text-zinc-500">{l.entityType}</span> /{' '}
                      <span className="text-white font-bold">{l.entityId}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 max-w-md font-sans text-xs">
                      {l.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
