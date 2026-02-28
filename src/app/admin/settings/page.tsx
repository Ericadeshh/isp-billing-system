"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
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
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Settings interface matching your database schema
interface SystemSettings {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  mpesaEnv: "sandbox" | "production";
  mpesaConsumerKey: string;
  mpesaConsumerSecret: string;
  mpesaPasskey: string;
  mpesaShortcode: string;
  mikrotikHost: string;
  mikrotikUsername: string;
  mikrotikPassword: string;
  mikrotikPort: number;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  paymentAlerts: boolean;
  expiryAlerts: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
}

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    mpesaConsumerKey: false,
    mpesaConsumerSecret: false,
    mpesaPasskey: false,
    mikrotikPassword: false,
  });

  // In a real implementation, you would have a settings table in Convex
  // For now, we'll use state with plans to simulate settings storage
  const plans = useQuery(api.plans.queries.getAllPlans);
  const customers = useQuery(api.customers.queries.getAllCustomers);
  const payments = useQuery(api.payments.queries.getAllPayments);

  // Settings state with defaults
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Aderoute Internet",
    supportEmail: "support@aderoute.co.ke",
    supportPhone: "+254 741 091 661",
    mpesaEnv: "sandbox",
    mpesaConsumerKey: "****************",
    mpesaConsumerSecret: "****************",
    mpesaPasskey: "****************",
    mpesaShortcode: "174379",
    mikrotikHost: "192.168.88.1",
    mikrotikUsername: "admin",
    mikrotikPassword: "********",
    mikrotikPort: 8728,
    currency: "KES",
    timezone: "Africa/Nairobi",
    emailNotifications: true,
    paymentAlerts: true,
    expiryAlerts: true,
    smsNotifications: false,
    maintenanceMode: false,
  });

  // Load settings from localStorage or API (in production, this would be from Convex)
  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to load settings");
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      // In production, this would save to a Convex settings table
      // For now, we'll simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage as temporary storage
      localStorage.setItem("adminSettings", JSON.stringify(settings));

      toast.success("Settings saved successfully", {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });

      // Log the settings that would be saved (for debugging)
      console.log("Settings saved:", {
        ...settings,
        mpesaConsumerKey: settings.mpesaConsumerKey.substring(0, 4) + "****",
        mpesaConsumerSecret: "****",
        mpesaPasskey: "****",
        mikrotikPassword: "****",
      });
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleSecret = (field: keyof typeof showSecrets) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Calculate some stats from real data
  const totalPlans = plans?.length || 0;
  const totalCustomers = customers?.length || 0;
  const totalPayments = payments?.length || 0;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            System Settings
          </span>
          <p className="text-sm text-gray-400 mt-1">
            Configure your system preferences and integrations
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
            {totalPlans} Plans
          </span>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            {totalCustomers} Users
          </span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
            {totalPayments} Payments
          </span>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            General Settings
          </span>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Aderoute Internet"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Africa/Nairobi">Nairobi (EAT)</option>
                  <option value="Africa/Johannesburg">
                    Johannesburg (SAST)
                  </option>
                  <option value="Africa/Lagos">Lagos (WAT)</option>
                  <option value="Africa/Cairo">Cairo (EET)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Support Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, supportEmail: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="support@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Support Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  value={settings.supportPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, supportPhone: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* M-Pesa Settings */}
        <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            M-Pesa Integration
          </span>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Environment
              </label>
              <select
                value={settings.mpesaEnv}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    mpesaEnv: e.target.value as "sandbox" | "production",
                  })
                }
                className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production (Live)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Consumer Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets.mpesaConsumerKey ? "text" : "password"}
                  value={settings.mpesaConsumerKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mpesaConsumerKey: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-20"
                  placeholder="Enter consumer key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret("mpesaConsumerKey")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-amber-500"
                >
                  {showSecrets.mpesaConsumerKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Consumer Secret
              </label>
              <div className="relative">
                <input
                  type={showSecrets.mpesaConsumerSecret ? "text" : "password"}
                  value={settings.mpesaConsumerSecret}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mpesaConsumerSecret: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-20"
                  placeholder="Enter consumer secret"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret("mpesaConsumerSecret")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-amber-500"
                >
                  {showSecrets.mpesaConsumerSecret ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Passkey
              </label>
              <div className="relative">
                <input
                  type={showSecrets.mpesaPasskey ? "text" : "password"}
                  value={settings.mpesaPasskey}
                  onChange={(e) =>
                    setSettings({ ...settings, mpesaPasskey: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-20"
                  placeholder="Enter passkey"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret("mpesaPasskey")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-amber-500"
                >
                  {showSecrets.mpesaPasskey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Shortcode
              </label>
              <input
                type="text"
                value={settings.mpesaShortcode}
                onChange={(e) =>
                  setSettings({ ...settings, mpesaShortcode: e.target.value })
                }
                className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="174379"
              />
            </div>
          </div>
        </div>

        {/* MikroTik Settings */}
        <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2" />
            MikroTik Router
          </span>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Router IP/Host
                </label>
                <input
                  type="text"
                  value={settings.mikrotikHost}
                  onChange={(e) =>
                    setSettings({ ...settings, mikrotikHost: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="192.168.88.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  API Port
                </label>
                <input
                  type="number"
                  value={settings.mikrotikPort}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mikrotikPort: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="8728"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={settings.mikrotikUsername}
                onChange={(e) =>
                  setSettings({ ...settings, mikrotikUsername: e.target.value })
                }
                className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showSecrets.mikrotikPassword ? "text" : "password"}
                  value={settings.mikrotikPassword}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mikrotikPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-20"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret("mikrotikPassword")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-amber-500"
                >
                  {showSecrets.mikrotikPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Settings
          </span>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-navy/50 rounded-lg cursor-pointer border border-gray-800 hover:border-amber-500/50 transition-colors">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-xs text-gray-400">
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
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 bg-navy border-gray-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-navy/50 rounded-lg cursor-pointer border border-gray-800 hover:border-amber-500/50 transition-colors">
              <div>
                <p className="font-medium text-white">Payment Alerts</p>
                <p className="text-xs text-gray-400">
                  Get notified on successful payments
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.paymentAlerts}
                onChange={(e) =>
                  setSettings({ ...settings, paymentAlerts: e.target.checked })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 bg-navy border-gray-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-navy/50 rounded-lg cursor-pointer border border-gray-800 hover:border-amber-500/50 transition-colors">
              <div>
                <p className="font-medium text-white">Expiry Alerts</p>
                <p className="text-xs text-gray-400">
                  Notify users before subscription expires
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.expiryAlerts}
                onChange={(e) =>
                  setSettings({ ...settings, expiryAlerts: e.target.checked })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 bg-navy border-gray-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-navy/50 rounded-lg cursor-pointer border border-gray-800 hover:border-amber-500/50 transition-colors">
              <div>
                <p className="font-medium text-white">SMS Notifications</p>
                <p className="text-xs text-gray-400">
                  Send SMS alerts to customers
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smsNotifications: e.target.checked,
                  })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 bg-navy border-gray-600"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <span className="text-amber-500 font-medium">
                Maintenance Mode
              </span>
              <p className="text-sm text-gray-400">
                When enabled, only admins can access the system
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) =>
                setSettings({ ...settings, maintenanceMode: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-6 border border-red-800/50">
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Danger Zone
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-500/20 rounded-lg">
            <div>
              <p className="font-medium text-red-400">Reset All Settings</p>
              <p className="text-xs text-red-400/70">
                Restore all settings to default values
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to reset all settings?")) {
                  // Reset to defaults
                  setSettings({
                    siteName: "Aderoute Internet",
                    supportEmail: "support@aderoute.co.ke",
                    supportPhone: "+254 741 091 661",
                    mpesaEnv: "sandbox",
                    mpesaConsumerKey: "****************",
                    mpesaConsumerSecret: "****************",
                    mpesaPasskey: "****************",
                    mpesaShortcode: "174379",
                    mikrotikHost: "192.168.88.1",
                    mikrotikUsername: "admin",
                    mikrotikPassword: "********",
                    mikrotikPort: 8728,
                    currency: "KES",
                    timezone: "Africa/Nairobi",
                    emailNotifications: true,
                    paymentAlerts: true,
                    expiryAlerts: true,
                    smsNotifications: false,
                    maintenanceMode: false,
                  });
                  toast.success("Settings reset to defaults");
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Save Button (Sticky) */}
      <div className="sticky bottom-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save All Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
