import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ServerSettings } from '../../types';
import {
  Server,
  Save,
  CheckCircle2,
  AlertCircle,
  Network,
  Shield,
  Radio,
  Gamepad2,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

export const AdminServerSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [serverName, setServerName] = useState('');
  const [tagline, setTagline] = useState('');
  const [serverIp, setServerIp] = useState('');
  const [bedrockIp, setBedrockIp] = useState('');
  const [javaPort, setJavaPort] = useState(25565);
  const [bedrockPort, setBedrockPort] = useState(19132);
  const [version, setVersion] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { data: settings, isLoading } = useQuery<ServerSettings>({
    queryKey: ['serverSettings'],
    queryFn: () => api.getCMS(),
  });

  useEffect(() => {
    if (settings) {
      setServerName(settings.serverName || 'IRON CLOUD MC');
      setTagline(settings.tagline || 'Experience Minecraft Like Never Before.');
      setServerIp(settings.serverIp || 'play.ironcloudmc.fun');
      setBedrockIp(settings.bedrockIp || 'play.ironcloudmc.fun');
      setJavaPort(settings.javaPort || 25565);
      setBedrockPort(settings.bedrockPort || 19132);
      setVersion(settings.version || '1.19 - 1.21+ (Java & Bedrock)');
      setDiscordUrl(settings.discordUrl || 'https://discord.gg/Jr2XBcYDSH');
      setSupportEmail(settings.supportEmail || 'ironcloudmc@gmail.com');
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<ServerSettings>) => api.updateAdminSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverSettings'] });
      queryClient.invalidateQueries({ queryKey: ['serverStatus'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
    onError: (err: any) => {
      alert(`Failed to save server settings: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      serverName,
      tagline,
      serverIp,
      bedrockIp,
      javaPort: Number(javaPort),
      bedrockPort: Number(bedrockPort),
      version,
      discordUrl,
      supportEmail,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Server Infrastructure & Network Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure authoritative connection endpoints, ports for Java & Bedrock crossplay, and public contact information.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Server configurations updated and propagated across the network!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Connection Endpoints */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Radio className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Network Connection Endpoints
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1 font-mono">
                Java Edition Server IP
              </label>
              <input
                type="text"
                required
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Default: play.ironcloudmc.fun</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1 font-mono">
                Java Port
              </label>
              <input
                type="number"
                required
                value={javaPort}
                onChange={(e) => setJavaPort(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Default Minecraft Java port: 25565</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1 font-mono">
                Bedrock Server IP / Host
              </label>
              <input
                type="text"
                required
                value={bedrockIp}
                onChange={(e) => setBedrockIp(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">For GeyserMC / Floodgate bedrock crossplay</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1 font-mono">
                Bedrock Port
              </label>
              <input
                type="number"
                required
                value={bedrockPort}
                onChange={(e) => setBedrockPort(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Default Bedrock port: 19132</p>
            </div>
          </div>
        </div>

        {/* Server Identity & Versioning */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Server className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Server Identity & Versioning
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Brand Name</label>
              <input
                type="text"
                required
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Supported Versions</label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-300 mb-1">Tagline</label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Support & Community Links */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Mail className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Support & Community Channels
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Official Discord Invite</label>
              <input
                type="url"
                required
                value={discordUrl}
                onChange={(e) => setDiscordUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-purple-950/40"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Saving Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
