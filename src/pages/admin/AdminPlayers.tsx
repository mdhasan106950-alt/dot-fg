import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { UserProfile } from '../../types';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Crown,
  Gamepad2,
  Calendar,
  Filter,
} from 'lucide-react';

export const AdminPlayers: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const { data: users, isLoading } = useQuery<UserProfile[]>({
    queryKey: ['adminUsers'],
    queryFn: () => api.getAdminUsers(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert('User role updated successfully.');
      setSelectedUser(null);
    },
    onError: (err: any) => {
      alert(`Failed to update role: ${err.message}`);
    },
  });

  const filteredUsers = users?.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.minecraftUsername && u.minecraftUsername.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Player & Account Directory
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review registered network players, manage administrative permissions, and inspect linked Mojang accounts.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">TOTAL REGISTERED</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{users?.length || 0}</div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">STAFF MEMBERS</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {users?.filter((u) => ['OWNER', 'ADMIN', 'MODERATOR'].includes(u.role)).length || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">MINECRAFT VERIFIED</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {users?.filter((u) => u.isMinecraftVerified).length || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <div className="text-[11px] text-zinc-400 font-mono">STANDARD PLAYERS</div>
          <div className="text-2xl font-bold text-purple-400 font-mono mt-1">
            {users?.filter((u) => u.role === 'USER').length || 0}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or IGN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
            <option value="USER">Standard User</option>
          </select>
        </div>
      </div>

      {/* Players Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Player / Account</th>
                <th className="py-3 px-4">In-Game Name (IGN)</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Minecraft Verification</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Loading player records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No players matching the search filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const ign = u.minecraftUsername || 'Unlinked';
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              u.avatarUrl ||
                              (u.minecraftUsername
                                ? `https://minotar.net/avatar/${u.minecraftUsername}/32.png`
                                : `https://minotar.net/avatar/MHF_Steve/32.png`)
                            }
                            alt={u.name}
                            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://minotar.net/avatar/MHF_Steve/32.png';
                            }}
                          />
                          <div>
                            <div className="font-sans font-bold text-white text-xs">{u.name}</div>
                            <div className="text-[11px] text-zinc-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>{ign}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'OWNER'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : u.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : u.role === 'MODERATOR'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isMinecraftVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified Mojang</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500">Unverified</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                        {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-sans font-medium transition-colors"
                        >
                          Manage Role
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                Modify Role for {selectedUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Changing player permissions grants access to moderation or administrative network controls.
            </p>

            <div className="space-y-2">
              {(['USER', 'MODERATOR', 'ADMIN', 'OWNER'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    updateRoleMutation.mutate({ userId: selectedUser.id, role: r })
                  }
                  className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    selectedUser.role === r
                      ? 'border-purple-500 bg-purple-950/40 text-white'
                      : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <span className="font-bold font-mono text-xs">{r}</span>
                  {selectedUser.role === r && (
                    <span className="text-[10px] text-purple-400 font-mono">Current</span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
