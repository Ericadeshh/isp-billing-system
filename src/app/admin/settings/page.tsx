"use client";

import { useState } from "react";
import {
  Save,
  RefreshCw,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Phone,
  Wifi,
  Server,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Aderoute Internet",
    supportEmail: "support@aderoute.co.ke",
    supportPhone: "+254 700 000 000",
    mpesaEnv: "sandbox",
    mpesaShortcode: "174379",
    mikrotikHost: "192.168.88.1",
    mikrotikUsername: "admin",
    currency: "KES",
    timezone: "Africa/Nairobi",
    emailNotifications: true,
    paymentAlerts: true,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-2xl font-bold text-amber-500">
            <Shield />
            Settings
          </span>
          <p className="text-sm text-gray-300 mt-1">
            Configure your system preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <span className="text-lg font-semibold text-blue-950 mb-4 flex items-center">
            <Globe className="w-5 h-5 text-amber-500 mr-2" />
            General
          </span>
          <div className="space-y-4">
            <div>
              <label className="label">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Support Phone</label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) =>
                  setSettings({ ...settings, supportPhone: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* M-Pesa Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <span className="text-lg font-semibold text-blue-950 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 text-amber-500 mr-2" />
            M-Pesa
          </span>
          <div className="space-y-4">
            <div>
              <label className="label">Environment</label>
              <select
                value={settings.mpesaEnv}
                onChange={(e) =>
                  setSettings({ ...settings, mpesaEnv: e.target.value })
                }
                className="input-field"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production (Live)</option>
              </select>
            </div>

            <div>
              <label className="label">Shortcode</label>
              <input
                type="text"
                value={settings.mpesaShortcode}
                onChange={(e) =>
                  setSettings({ ...settings, mpesaShortcode: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* MikroTik Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <span className="text-lg font-semibold text-blue-950 mb-4 flex items-center">
            <Server className="w-5 h-5 text-amber-500 mr-2" />
            MikroTik
          </span>
          <div className="space-y-4">
            <div>
              <label className="label">Router IP</label>
              <input
                type="text"
                value={settings.mikrotikHost}
                onChange={(e) =>
                  setSettings({ ...settings, mikrotikHost: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={settings.mikrotikUsername}
                onChange={(e) =>
                  setSettings({ ...settings, mikrotikUsername: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <span className="text-lg font-semibold text-blue-950 mb-4 flex items-center">
            <Bell className="w-5 h-5 text-amber-500 mr-2" />
            Notifications
          </span>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">
                  Receive system alerts via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailNotifications: e.target.checked,
                  })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Payment Alerts</p>
                <p className="text-xs text-gray-500">
                  Get notified on successful payments
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.paymentAlerts}
                onChange={(e) =>
                  setSettings({ ...settings, paymentAlerts: e.target.checked })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
