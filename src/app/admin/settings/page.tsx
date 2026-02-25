"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Bell,
  Shield,
  Globe,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Wifi,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Aderoute Internet",
    supportEmail: "support@aderoute.com",
    supportPhone: "+254 700 000 000",

    // M-Pesa Settings
    mpesaBusinessCode: "174379",
    mpesaEnvironment: "sandbox",

    // Router Settings
    routerHost: "192.168.88.1",
    routerUser: "admin",
    routerPassword: "********",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    paymentAlerts: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  const handleSave = () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved successfully!");
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-amber-500" />
          System Settings
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure your ISP billing system preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
            <nav className="space-y-1">
              <a
                href="#general"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-600"
              >
                <Globe className="w-4 h-4 mr-3" />
                General
              </a>
              <a
                href="#mpesa"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-600"
              >
                <Smartphone className="w-4 h-4 mr-3" />
                M-Pesa Integration
              </a>
              <a
                href="#router"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-600"
              >
                <Wifi className="w-4 h-4 mr-3" />
                Router Settings
              </a>
              <a
                href="#notifications"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-600"
              >
                <Bell className="w-4 h-4 mr-3" />
                Notifications
              </a>
              <a
                href="#security"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-600"
              >
                <Shield className="w-4 h-4 mr-3" />
                Security
              </a>
            </nav>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <section
            id="general"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-amber-500" />
              General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, supportEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.supportPhone}
                    onChange={(e) =>
                      setSettings({ ...settings, supportPhone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* M-Pesa Settings */}
          <section
            id="mpesa"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-amber-500" />
              M-Pesa Integration
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Shortcode
                  </label>
                  <input
                    type="text"
                    value={settings.mpesaBusinessCode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mpesaBusinessCode: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Environment
                  </label>
                  <select
                    value={settings.mpesaEnvironment}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mpesaEnvironment: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production (Live)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Router Settings */}
          <section
            id="router"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-amber-500" />
              Router Settings
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Router IP/Host
                  </label>
                  <input
                    type="text"
                    value={settings.routerHost}
                    onChange={(e) =>
                      setSettings({ ...settings, routerHost: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={settings.routerUser}
                    onChange={(e) =>
                      setSettings({ ...settings, routerUser: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={settings.routerPassword}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        routerPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section
            id="notifications"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-amber-500" />
              Notification Settings
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">
                  Email Notifications
                </span>
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
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">SMS Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      smsNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Payment Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.paymentAlerts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentAlerts: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                />
              </label>
            </div>
          </section>

          {/* Security Settings */}
          <section
            id="security"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-amber-500" />
              Security Settings
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">
                  Two-Factor Authentication
                </span>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      twoFactorAuth: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                />
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({ ...settings, sessionTimeout: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min="5"
                  max="120"
                />
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition flex items-center disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
