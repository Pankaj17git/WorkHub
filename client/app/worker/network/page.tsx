'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldCheck,
  Clock,
  Briefcase,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { getToken, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';
import api from '@/lib/api';

interface WorkerConnection {
  id: string;
  workerId: string;
  connectedWorkerId: string;
  status: string;
  createdAt: string;
  connectedWorker?: {
    id: string;
    userId: string;
    headline?: string;
    user?: {
      name?: string;
      email?: string;
      profileImage?: string;
    };
    skills?: Array<{ name: string }>;
  };
  worker?: {
    id: string;
    userId: string;
    headline?: string;
    user?: {
      name?: string;
      email?: string;
      profileImage?: string;
    };
  };
}

export default function WorkerNetworkPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [activeTab, setActiveTab] = useState<'CONNECTIONS' | 'PENDING' | 'CONNECT'>('CONNECTIONS');
  const [connections, setConnections] = useState<WorkerConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<WorkerConnection[]>([]);
  const [loading, setLoading] = useState(true);

  // New connection form
  const [targetWorkerId, setTargetWorkerId] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadNetworkData = async (showLoading = false) => {
    const token = getToken();
    if (!token) {
      router.push('/login?role=WORKER&redirect=/worker/network');
      return;
    }

    if (showLoading) setLoading(true);
    try {
      // 1. Accepted connections
      const connRes = await api.get('/api/worker-connections?status=ACCEPTED');
      if (connRes.data) {
        setConnections(connRes.data.connections || connRes.data.data?.connections || []);
      }

      // 2. Pending connection requests
      const pendingRes = await api.get('/api/worker-connections?status=PENDING');
      if (pendingRes.data) {
        setPendingRequests(pendingRes.data.connections || pendingRes.data.data?.connections || []);
      }
    } catch (err) {
      console.error('Failed to load network:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadNetworkData();
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAcceptConnection = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await api.post(`/api/worker-connections/${id}/accept`);
      if (res.data) {
        loadNetworkData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectConnection = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await api.post(`/api/worker-connections/${id}/reject`);
      if (res.data) {
        loadNetworkData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkerId.trim()) return;

    const token = getToken();
    if (!token) return;

    setSendingRequest(true);
    setNotice(null);

    try {
      const res = await api.post('/api/worker-connections', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetWorkerId: targetWorkerId.trim() }),
      });

      if (!res.data) {
        setNotice({ type: 'error', message: 'Failed to send connection request.' });
        setSendingRequest(false);
        return;
      }

      setNotice({ type: 'success', message: 'Connection request sent successfully!' });
      setTargetWorkerId('');
      loadNetworkData();
    } catch (err) {
      setNotice({ type: 'error', message: 'Error sending request.' });
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#091426] tracking-tight">
              Trade Professional Network
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#0051d5] text-xs font-bold font-geist border border-[#bfdbfe]">
              Crew Collaboration
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Build your circle of trusted tradespeople to collaborate on multi-worker jobs and share assignments.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('CONNECT')}
          className="px-4 py-2.5 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Connect with Worker</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] w-fit">
        <button
          onClick={() => setActiveTab('CONNECTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-geist transition-all ${
            activeTab === 'CONNECTIONS'
              ? 'bg-[#0051d5] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#091426]'
          }`}
        >
          My Connections ({connections.length})
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-geist transition-all flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-[#0051d5] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#091426]'
          }`}
        >
          <span>Pending Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('CONNECT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-geist transition-all ${
            activeTab === 'CONNECT'
              ? 'bg-[#0051d5] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#091426]'
          }`}
        >
          Find & Connect
        </button>
      </div>

      {/* Tab 1: Accepted Connections */}
      {activeTab === 'CONNECTIONS' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#64748b]">Loading your network...</div>
          ) : connections.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded-2xl space-y-2">
              <Users className="w-8 h-8 text-[#94a3b8] mx-auto" />
              <h4 className="text-sm font-bold text-[#091426]">No network connections yet</h4>
              <p className="text-xs text-[#64748b]">
                Add fellow electricians, plumbers, or carpenters to invite them on large jobs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {connections.map((conn) => {
                const partner = conn.connectedWorker || conn.worker;
                const partnerUser = partner?.user;

                return (
                  <div
                    key={conn.id}
                    className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#091426] text-white font-bold flex items-center justify-center text-sm">
                        {partnerUser?.name?.[0] || 'W'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#091426]">
                          {partnerUser?.name || 'Verified Specialist'}
                        </h4>
                        <p className="text-xs text-[#475569]">{partner?.headline || 'Trade Specialist'}</p>
                        <span className="text-[10px] text-[#0d9488] font-semibold font-geist">
                          Connected Partner
                        </span>
                      </div>
                    </div>

                    {partner?.userId && (
                      <Link
                        href={`/messages?userId=${partner.userId}`}
                        className="p-2.5 bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#0051d5] rounded-xl border border-[#e2e8f0] transition-colors"
                        title="Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pending Requests */}
      {activeTab === 'PENDING' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#0d9488] mx-auto" />
              <h4 className="text-sm font-bold text-[#091426]">All caught up</h4>
              <p className="text-xs text-[#64748b]">No pending connection requests awaiting approval.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0051d5] text-white font-bold flex items-center justify-center">
                      {req.worker?.user?.name?.[0] || 'W'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#091426]">
                        {req.worker?.user?.name || 'Specialist'}
                      </h4>
                      <p className="text-xs text-[#64748b]">{req.worker?.headline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptConnection(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectConnection(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] text-xs font-semibold transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Connect Form */}
      {activeTab === 'CONNECT' && (
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 max-w-lg shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#091426]">Send Connection Request</h3>
            <p className="text-xs text-[#64748b]">
              Enter the partner Worker ID to form a verified professional connection.
            </p>
          </div>

          {notice && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                notice.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{notice.message}</span>
            </div>
          )}

          <form onSubmit={handleSendConnection} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#091426] mb-1">
                Target Worker ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1"
                value={targetWorkerId}
                onChange={(e) => setTargetWorkerId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
              />
            </div>

            <button
              type="submit"
              disabled={sendingRequest}
              className="px-5 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {sendingRequest ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
