import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Partner } from '../../types';
import {
  Handshake,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Sparkles,
  Globe,
  Youtube,
  MessageSquare,
} from 'lucide-react';

export const AdminPartnerships: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingPartner, setEditingPartner] = useState<Partial<Partner> | null>(null);

  const { data: partners, isLoading } = useQuery<Partner[]>({
    queryKey: ['adminPartners'],
    queryFn: () => api.getAdminPartners(),
  });

  const saveMutation = useMutation({
    mutationFn: (partner: Partial<Partner>) => api.savePartner(partner),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartners'] });
      setEditingPartner(null);
    },
    onError: (err: any) => {
      alert(`Failed to save partner: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    saveMutation.mutate(editingPartner);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Partnerships & Creator Affiliates
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage sponsored server partners, hosting alliances, and YouTube/Twitch content creators.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingPartner({
              name: '',
              category: 'Content Creator',
              description: '',
              logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
              website: '',
              discord: '',
              isFeatured: true,
              isPublished: true,
              displayOrder: (partners?.length || 0) + 1,
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
            Loading partner entities...
          </div>
        ) : partners?.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-4 relative group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={p.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider">
                    {p.category}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingPartner(p)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                title="Edit partner"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 line-clamp-2">{p.description}</p>

            <div className="flex items-center gap-3 pt-1 text-xs">
              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Site</span>
                </a>
              )}
              {p.discord && (
                <a
                  href={p.discord}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discord</span>
                </a>
              )}
              {p.youtube && (
                <a
                  href={p.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Channel</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingPartner.id ? 'Edit Partner' : 'Register New Partner'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Partner / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={editingPartner.name || ''}
                  onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  placeholder="e.g. Apex Hosting or Doom Gaming"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={editingPartner.category || ''}
                  onChange={(e) => setEditingPartner({ ...editingPartner, category: e.target.value })}
                  placeholder="e.g. Server Sponsor, Content Creator, Media"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  required
                  value={editingPartner.logo || ''}
                  onChange={(e) => setEditingPartner({ ...editingPartner, logo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingPartner.description || ''}
                  onChange={(e) =>
                    setEditingPartner({ ...editingPartner, description: e.target.value })
                  }
                  placeholder="Partnership context or creator bio..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={editingPartner.website || ''}
                    onChange={(e) =>
                      setEditingPartner({ ...editingPartner, website: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Discord / Social
                  </label>
                  <input
                    type="url"
                    value={editingPartner.discord || ''}
                    onChange={(e) =>
                      setEditingPartner({ ...editingPartner, discord: e.target.value })
                    }
                    placeholder="https://discord.gg/..."
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
