import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TeamMember } from '../../types';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Users,
  Gamepad2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const AdminStaff: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);

  const { data: team, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['team'],
    queryFn: () => api.getTeam(),
  });

  const saveMutation = useMutation({
    mutationFn: (member: Partial<TeamMember>) => api.saveTeamMember(member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setEditingMember(null);
    },
    onError: (err: any) => {
      alert(`Failed to save staff member: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (err: any) => {
      alert(`Failed to delete staff member: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    saveMutation.mutate(editingMember);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Staff & Leadership Roster
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage public staff listings, server ranks, roles, and Minecraft avatars displayed on the Community Team page.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingMember({
              name: '',
              minecraftUsername: '',
              role: 'Trial Helper',
              department: 'Helpers',
              bio: '',
              isActive: true,
              displayOrder: (team?.length || 0) + 1,
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
            Loading team roster...
          </div>
        ) : team?.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-4 relative group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    m.avatarUrl ||
                    (m.minecraftUsername
                      ? `https://minotar.net/avatar/${m.minecraftUsername}/48.png`
                      : 'https://minotar.net/avatar/MHF_Steve/48.png')
                  }
                  alt={m.name}
                  className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{m.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>{m.minecraftUsername}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingMember(m)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  title="Edit staff member"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove ${m.name} from staff roster?`)) {
                      deleteMutation.mutate(m.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400"
                  title="Delete staff member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-[11px] font-bold text-purple-300 font-mono">
                {m.role}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono uppercase">
                {m.department}
              </span>
            </div>

            <p className="text-xs text-zinc-400 line-clamp-2">{m.bio || 'Network staff member.'}</p>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingMember.id ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  placeholder="e.g. Mahfuz Hasan"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Minecraft IGN
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.minecraftUsername || ''}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, minecraftUsername: e.target.value })
                    }
                    placeholder="e.g. MR_DOOM_YT"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Department
                  </label>
                  <select
                    value={editingMember.department || 'Helpers'}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        department: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="Management">Management</option>
                    <option value="Administration">Administration</option>
                    <option value="Moderation">Moderation</option>
                    <option value="Helpers">Helpers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Role Title (In-Game Tag)
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.role || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                  placeholder="e.g. Lead Administrator, Senior Mod"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Bio / Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  placeholder="Short description of staff responsibilities..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
