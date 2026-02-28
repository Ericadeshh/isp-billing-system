"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Wifi,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  Terminal,
  Users,
  Activity,
  AlertCircle,
  Loader2,
  Plus,
  Edit,
  Power,
  Globe,
  Server,
  HardDrive,
  Clock,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface RouterConfig {
  host: string;
  username: string;
  password: string;
  port: number;
  useSSL: boolean;
}

interface SyncStats {
  total: number;
  synced: number;
  failed: number;
  pending: number;
}

export default function AdminMikroTik() {
  const [connectionStatus, setConnectionStatus] = useState<
    "untested" | "connecting" | "success" | "failed"
  >("untested");
  const [syncing, setSyncing] = useState(false);
  const [creatingProfiles, setCreatingProfiles] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<string>("default");
  const [showAddRouter, setShowAddRouter] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    total: 0,
    synced: 0,
    failed: 0,
    pending: 0,
  });

  // Router configurations (in production, this would come from database)
  const [routers, setRouters] = useState([
    {
      id: "default",
      name: "Main Router",
      host: "192.168.88.1",
      port: 8728,
      status: "active",
    },
    {
      id: "backup",
      name: "Backup Router",
      host: "192.168.88.2",
      port: 8728,
      status: "inactive",
    },
  ]);

  const [config, setConfig] = useState<RouterConfig>({
    host: "",
    username: "admin",
    password: "",
    port: 8728,
    useSSL: false,
  });

  // Fetch real data from Convex
  const customers = useQuery(api.customers.queries.getAllCustomers);
  const activeSubscriptions = useQuery(
    api.subscriptions.queries.getActiveSubscriptions,
  );
  const plans = useQuery(api.plans.queries.getAllPlans);

  // Simulated profiles based on your plans
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (plans) {
      const generatedProfiles = plans.map((plan) => ({
        id: plan._id,
        name: plan.name.replace(/\s+/g, ""),
        speed: plan.speed,
        planName: plan.name,
        status: "pending" as const,
        price: plan.price,
        duration: plan.duration,
        type: plan.planType,
      }));
      setProfiles(generatedProfiles);
    }
  }, [plans]);

  // Calculate sync stats
  useEffect(() => {
    if (customers && activeSubscriptions) {
      const activeUsers = customers.filter((c) =>
        activeSubscriptions.some((s) => s.customerId === c._id),
      ).length;

      setSyncStats({
        total: customers.length,
        synced: Math.floor(activeUsers * 0.8), // Simulated - 80% synced
        failed: Math.floor(activeUsers * 0.1), // Simulated - 10% failed
        pending: activeUsers - Math.floor(activeUsers * 0.9), // Remaining
      });
    }
  }, [customers, activeSubscriptions]);

  const addLog = (message: string) => {
    setLogs((prev) =>
      [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 50),
    );
  };

  const testConnection = async () => {
    if (!config.host) {
      toast.error("Please enter router IP address");
      return;
    }

    setConnectionStatus("connecting");
    addLog(`Testing connection to ${config.host}:${config.port}...`);

    // Simulate connection test with MikroTik API
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      if (success) {
        setConnectionStatus("success");
        addLog(`✅ Successfully connected to ${config.host}`);
        toast.success("Connected to MikroTik router");
      } else {
        setConnectionStatus("failed");
        addLog(`❌ Failed to connect to ${config.host}`);
        toast.error("Connection failed. Check router settings.");
      }
    }, 2000);
  };

  const createProfiles = async () => {
    if (connectionStatus !== "success") {
      toast.error("Please connect to router first");
      return;
    }

    setCreatingProfiles(true);
    addLog("Starting profile creation...");

    // Simulate profile creation
    let successCount = 0;
    for (const profile of profiles) {
      if (profile.status === "pending") {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const success = Math.random() > 0.1; // 90% success rate
        if (success) {
          setProfiles((prev) =>
            prev.map((p) =>
              p.id === profile.id ? { ...p, status: "created" } : p,
            ),
          );
          successCount++;
          addLog(`✅ Created profile: ${profile.name}`);
        } else {
          setProfiles((prev) =>
            prev.map((p) =>
              p.id === profile.id ? { ...p, status: "failed" } : p,
            ),
          );
          addLog(`❌ Failed to create profile: ${profile.name}`);
        }
      }
    }

    setCreatingProfiles(false);
    toast.success(`Created ${successCount} out of ${profiles.length} profiles`);
    addLog(
      `Profile creation complete: ${successCount}/${profiles.length} successful`,
    );
  };

  const syncUsers = async () => {
    if (connectionStatus !== "success") {
      toast.error("Please connect to router first");
      return;
    }

    setSyncing(true);
    addLog("Starting user synchronization...");

    const activeUsers =
      customers?.filter((c) =>
        activeSubscriptions?.some((s) => s.customerId === c._id),
      ) || [];

    let synced = 0;
    let failed = 0;

    for (const user of activeUsers) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const success = Math.random() > 0.15; // 85% success rate
      if (success) {
        synced++;
        addLog(`✅ Synced user: ${user.name || user.phone}`);
      } else {
        failed++;
        addLog(`❌ Failed to sync user: ${user.name || user.phone}`);
      }

      // Update stats progressively
      setSyncStats({
        total: activeUsers.length,
        synced,
        failed,
        pending: activeUsers.length - synced - failed,
      });
    }

    setSyncing(false);
    toast.success(`Sync complete: ${synced} users synced, ${failed} failed`);
    addLog(`Synchronization complete: ${synced} successful, ${failed} failed`);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("Logs cleared");
  };

  const getProfileStatusBadge = (status: string) => {
    switch (status) {
      case "created":
        return (
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" /> Created
          </span>
        );
      case "failed":
        return (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs flex items-center">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </span>
        );
      default:
        return (
          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs flex items-center">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            <Server className="w-6 h-6" />
            MikroTik Router Management
          </span>
          <p className="text-sm text-gray-400 mt-1">
            Configure and manage your router integration
          </p>
        </div>

        {/* Router Selector */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedRouter}
            onChange={(e) => setSelectedRouter(e.target.value)}
            className="bg-navy/50 border border-gray-700 rounded-lg px-4 py-2 text-sm text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {routers.map((router) => (
              <option key={router.id} value={router.id}>
                {router.name} ({router.host})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAddRouter(true)}
            className="p-2 bg-navy/50 border border-gray-700 rounded-lg hover:bg-navy transition-colors"
            title="Add Router"
          >
            <Plus className="w-5 h-5 text-amber-500" />
          </button>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-amber-500 flex items-center">
            <Wifi className="w-5 h-5 mr-2" />
            Router Connection
          </span>
          {connectionStatus === "success" && (
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> Connected
            </span>
          )}
          {connectionStatus === "failed" && (
            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm flex items-center">
              <XCircle className="w-4 h-4 mr-1" /> Connection Failed
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Router IP/Host
            </label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="192.168.88.1"
              className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Port
            </label>
            <input
              type="number"
              value={config.port}
              onChange={(e) =>
                setConfig({ ...config, port: parseInt(e.target.value) })
              }
              placeholder="8728"
              className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={config.username}
              onChange={(e) =>
                setConfig({ ...config, username: e.target.value })
              }
              placeholder="admin"
              className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={config.password}
              onChange={(e) =>
                setConfig({ ...config, password: e.target.value })
              }
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={testConnection}
            disabled={connectionStatus === "connecting" || !config.host}
            className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {connectionStatus === "connecting" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Test Connection"
            )}
          </button>

          <button
            onClick={() => {
              setConfig({
                host: "",
                username: "admin",
                password: "",
                port: 8728,
                useSSL: false,
              });
              setConnectionStatus("untested");
            }}
            className="px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-gray-300 hover:bg-navy transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Hotspot Profiles */}
      <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-amber-500 flex items-center">
            <HardDrive className="w-5 h-5 mr-2" />
            Hotspot Profiles
          </span>
          <button
            onClick={createProfiles}
            disabled={creatingProfiles || connectionStatus !== "success"}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {creatingProfiles ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create All Profiles
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">
                  Profile Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">
                  Speed Limit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="hover:bg-navy/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-sm text-white">
                    {profile.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {profile.speed}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {profile.planName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        profile.type === "hotspot"
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {profile.type || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getProfileStatusBadge(profile.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Tools & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sync Stats */}
        <div className="lg:col-span-2 bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            User Synchronization
          </span>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-navy/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-white">{syncStats.total}</p>
            </div>
            <div className="bg-navy/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Synced</p>
              <p className="text-2xl font-bold text-green-400">
                {syncStats.synced}
              </p>
            </div>
            <div className="bg-navy/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">
                {syncStats.failed}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Sync Progress</span>
              <span>
                {Math.round((syncStats.synced / (syncStats.total || 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(syncStats.synced / (syncStats.total || 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={syncUsers}
              disabled={syncing || connectionStatus !== "success"}
              className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All Users
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-amber-500 flex items-center">
              <Terminal className="w-5 h-5 mr-2" />
              System Logs
            </span>
            <button
              onClick={clearLogs}
              className="text-xs text-gray-400 hover:text-amber-500 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="bg-navy/50 rounded-lg p-3 h-64 overflow-y-auto font-mono text-xs">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="text-gray-300 mb-1 border-b border-gray-800 pb-1"
                >
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center mt-8">
                No logs yet. Start by testing connection.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <span className="text-lg font-semibold text-amber-500">
            Quick Setup Guide
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <span className="text-sm font-medium text-amber-500 mb-3">
              Router Preparation
            </span>
            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
              <li>
                Enable API service on MikroTik:
                <code className="block bg-navy/50 p-2 rounded mt-1 text-xs">
                  /ip service enable api
                </code>
              </li>
              <li>
                Set API port (default 8728):
                <code className="block bg-navy/50 p-2 rounded mt-1 text-xs">
                  /ip service set api port=8728
                </code>
              </li>
              <li>
                Allow API access from your server IP:
                <code className="block bg-navy/50 p-2 rounded mt-1 text-xs">
                  /ip service set api address=0.0.0.0/0
                </code>
              </li>
            </ol>
          </div>

          <div>
            <span className="text-sm font-medium text-amber-500 mb-3">
              Hotspot Setup
            </span>
            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
              <li>
                Create hotspot server (if not exists):
                <code className="block bg-navy/50 p-2 rounded mt-1 text-xs">
                  /ip hotspot setup
                </code>
              </li>
              <li>
                Configure hotspot server profile:
                <code className="block bg-navy/50 p-2 rounded mt-1 text-xs">
                  /ip hotspot profile set [find] name=hsprof1
                </code>
              </li>
              <li>
                Set idle timeout and keepalive:
                <code className="block bg-navy/50 p-2 rounded mt-1 text-xs">
                  /ip hotspot set idle-timeout=15m keepalive-timeout=30s
                </code>
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <p className="text-sm text-gray-300">
            <span className="text-amber-500 font-semibold">Note:</span> After
            configuration, test the connection and create profiles. Users will
            be automatically synced based on active subscriptions.
          </p>
        </div>
      </div>

      {/* Add Router Modal */}
      {showAddRouter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-light rounded-xl max-w-md w-full border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <span className="text-xl font-bold text-amber-500">
                Add New Router
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Router Name
                </label>
                <input
                  type="text"
                  placeholder="Main Router"
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Host/IP Address
                </label>
                <input
                  type="text"
                  placeholder="192.168.88.1"
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  API Port
                </label>
                <input
                  type="number"
                  value="8728"
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddRouter(false);
                    toast.success("Router added successfully");
                  }}
                  className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Add Router
                </button>
                <button
                  onClick={() => setShowAddRouter(false)}
                  className="flex-1 bg-navy/50 text-gray-300 py-2 rounded-lg hover:bg-navy transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
