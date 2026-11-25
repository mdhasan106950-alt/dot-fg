import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Punishment, PunishmentType } from '../../types';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const AdminPunishments: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New punishment form
  const [targetUsername, setTargetUsername] = useState('');
  const [type, setType] = useState<PunishmentType>('BAN');
  const [reason, setReason] = useState('');
  const [serverRealm, setServerRealm] = useState('Global');
  const [expiresAt, setExpiresAt] = useState('');

  const { data: punishments, isLoading } = useQuery<Punishment[]>({
    queryKey: ['adminPunishments'],
    queryFn: () => api.getPunishments(),
  });

  const createMutation = useMutation({
    mutationFn: (newP: Partial<Punishment>) => api.createPunishment(newP),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPunishments'] });
      setIsModalOpen(false);
      setTargetUsername('');
      setReason('');
      setExpiresAt('');
    },
    onError: (err: any) => {
      alert(`Failed to issue punishment: ${err.message}`);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.revokePunishment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPunishments'] });
    },
    onError: (err: any) => {
      alert(`Failed to revoke punishment: ${err.message}`);
    },
  });

  const filtered = punishments?.filter((p) => {
    const matchesSearch =
      p.targetUsername.toLowerCase().includes(search.toLowerCase()) ||
      p.reason.toLowerCase().includes(search.toLowerCase()) ||
      p.staffActor.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'ALL' || p.type === typeFilter;

    return matchesSearch && matchesType;
  }) || [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      targetUsername,
      type,
      reason,
      serverRealm,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Punishment & Governance Logs
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Enforce server discipline, inspect bans and mutes issued by staff or anti-cheat engines, and manage appeals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Punishment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">ACTIVE BANS</div>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">
            {punishments?.filter((p) => p.active && p.type === 'BAN').length || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">ACTIVE MUTES</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {punishments?.filter((p) => p.active && p.type === 'MUTE').length || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">OFFICIAL WARNINGS</div>
          <div className="text-2xl font-bold text-purple-400 font-mono mt-1">
            {punishments?.filter((p) => p.type === 'WARN').length || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">TOTAL RECORDS</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {punishments?.length || 0}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by target IGN, staff, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Punishment Types</option>
            <option value="BAN">Bans</option>
            <option value="MUTE">Mutes</option>
            <option value="WARN">Warnings</option>
            <option value="KICK">Kicks</option>
          </select>
        </div>
      </div>

      {/* Punishments Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reason & Realm</th>
                <th className="py-3 px-4">Staff Actor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    Loading punishments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No punishment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://minotar.net/avatar/${encodeURIComponent(p.targetUsername)}/24.png`}
                          alt={p.targetUsername}
                          className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://minotar.net/avatar/MHF_Steve/24.png';
                          }}
                        />
                        <span>{p.targetUsername}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.type === 'BAN'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : p.type === 'MUTE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs font-sans">
                      <div className="text-white line-clamp-1">{p.reason}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{p.serverRealm || 'Global'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-purple-400 font-semibold">{p.staffActor}</td>
                    <td className="py-3.5 px-4">
                      {p.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Revoked</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.active && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Pardon/revoke punishment for ${p.targetUsername}?`)) {
                              revokeMutation.mutate(p.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors inline-flex items-center gap-1 font-sans"
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-400" />
                          <span>Pardon</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Punishment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Issue Network Punishment</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Target Minecraft IGN
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cheater123"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Punishment Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PunishmentType)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  >
                    <option value="BAN">Ban</option>
                    <option value="MUTE">Mute</option>
                    <option value="WARN">Warning</option>
                    <option value="KICK">Kick</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Server Realm
                  </label>
                  <select
                    value={serverRealm}
                    onChange={(e) => setServerRealm(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  >
                    <option value="Global">Global Network</option>
                    <option value="Crystal PvP">Crystal PvP</option>
                    <option value="Custom Survival">Custom Survival</option>
                    <option value="Gens & Economy">Gens & Economy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Infraction Reason
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed evidence or violation description..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold uppercase tracking-wider text-white"
                >
                  {createMutation.isPending ? 'Issuing...' : 'Execute Punishment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
