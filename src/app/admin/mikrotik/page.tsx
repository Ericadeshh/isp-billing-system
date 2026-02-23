"use client";

import { useState } from "react";
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
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function MikroTikSetupPage() {
  const [connectionStatus, setConnectionStatus] = useState<
    "untested" | "success" | "failed"
  >("untested");
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState({
    host: "",
    username: "",
    password: "",
    port: 8728,
  });
  const [profiles, setProfiles] = useState([
    { name: "1Hour-5M", speed: "5M/5M", plan: "1 Hour" },
    { name: "3Hour-5M", speed: "5M/5M", plan: "3 Hours" },
    { name: "6Hour-10M", speed: "10M/10M", plan: "6 Hours" },
    { name: "1Day-10M", speed: "10M/10M", plan: "24 Hours" },
    { name: "Weekly-15M", speed: "15M/15M", plan: "Weekly" },
    { name: "Monthly-20M", speed: "20M/20M", plan: "Monthly" },
  ]);

  const testConnection = async () => {
    setTesting(true);
    // Simulate connection test
    setTimeout(() => {
      setConnectionStatus(Math.random() > 0.3 ? "success" : "failed");
      setTesting(false);
    }, 2000);
  };

  const createProfiles = async () => {
    alert("This would create hotspot profiles on your MikroTik router");
  };

  const syncUsers = async () => {
    alert("This would sync active users from database to MikroTik");
  };

  return (
    <main className="min-h-screen bg-off-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-navy rounded-full mb-4">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-navy-dark mb-2">
            MikroTik Setup
          </h1>
          <p className="text-gray-600">
            Configure and manage your router connection
          </p>
        </div>

        {/* Connection Test Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-navy-dark mb-4 flex items-center">
            <Wifi className="w-5 h-5 mr-2 text-pumpkin" />
            Router Connection
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Router IP/Host
              </label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="192.168.88.1"
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                API Port
              </label>
              <input
                type="number"
                value={config.port}
                onChange={(e) =>
                  setConfig({ ...config, port: parseInt(e.target.value) })
                }
                placeholder="8728"
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Username
              </label>
              <input
                type="text"
                value={config.username}
                onChange={(e) =>
                  setConfig({ ...config, username: e.target.value })
                }
                placeholder="admin"
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Password
              </label>
              <input
                type="password"
                value={config.password}
                onChange={(e) =>
                  setConfig({ ...config, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={testConnection}
              loading={testing}
              className="flex-1"
            >
              Test Connection
            </Button>

            {connectionStatus === "success" && (
              <div className="flex items-center text-salad">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Connected</span>
              </div>
            )}
            {connectionStatus === "failed" && (
              <div className="flex items-center text-red-500">
                <XCircle className="w-5 h-5 mr-2" />
                <span>Failed</span>
              </div>
            )}
          </div>
        </div>

        {/* Hotspot Profiles */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-navy-dark mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-salad" />
            Hotspot Profiles
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Profile Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Speed Limit
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Associated Plan
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {profiles.map((profile) => (
                  <tr key={profile.name}>
                    <td className="px-4 py-3 font-mono">{profile.name}</td>
                    <td className="px-4 py-3">{profile.speed}</td>
                    <td className="px-4 py-3">{profile.plan}</td>
                    <td className="px-4 py-3">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        Not Created
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button onClick={createProfiles} className="mt-4" variant="secondary">
            <Save className="w-4 h-4 mr-2" />
            Create All Profiles
          </Button>
        </div>

        {/* Sync Tools */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-navy-dark mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-bottle" />
            User Synchronization
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-off-white p-4 rounded-xl">
              <h3 className="font-medium text-navy-dark mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-pumpkin">0</p>
              <p className="text-sm text-gray-500">Currently in database</p>
            </div>
            <div className="bg-off-white p-4 rounded-xl">
              <h3 className="font-medium text-navy-dark mb-2">
                Synced to Router
              </h3>
              <p className="text-3xl font-bold text-salad">0</p>
              <p className="text-sm text-gray-500">Successfully synced</p>
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <Button onClick={syncUsers} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All Users
            </Button>
            <Button variant="outline" className="flex-1">
              <Terminal className="w-4 h-4 mr-2" />
              View Logs
            </Button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-medium text-navy-dark mb-2">Quick Setup Guide</h3>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>
              Enable API service on your MikroTik:{" "}
              <code className="bg-white px-2 py-1 rounded">
                /ip service enable api
              </code>
            </li>
            <li>
              Set API port (default 8728):{" "}
              <code className="bg-white px-2 py-1 rounded">
                /ip service set api port=8728
              </code>
            </li>
            <li>Create hotspot server if not exists</li>
            <li>Test connection using the form above</li>
            <li>Create speed profiles for each plan</li>
            <li>Sync existing users to router</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
