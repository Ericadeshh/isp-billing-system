"use client";

import { useState } from "react";
import {
  Wifi,
  Copy,
  CheckCircle,
  Smartphone,
  Laptop,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function ConnectionPage() {
  const [copied, setCopied] = useState(false);

  const wifiCredentials = {
    ssid: "Aderoute-WiFi",
    password: "ADRT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    ipAddress: "192.168.1.100",
    gateway: "192.168.1.1",
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-off-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pumpkin rounded-full mb-4">
            <Wifi className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-navy-dark mb-2">
            Connection Instructions
          </h1>
          <p className="text-gray-600">
            Follow these steps to connect to your internet
          </p>
        </div>

        {/* Success Alert */}
        {copied && (
          <div className="mb-6 bg-salad/10 border border-salad rounded-lg p-4 flex items-center text-salad">
            <CheckCircle className="w-5 h-5 mr-2" />
            Credentials copied to clipboard!
          </div>
        )}

        {/* WiFi Credentials Card */}
        <div className="card p-8 mb-8">
          <h2 className="text-xl font-semibold text-navy-dark mb-6">
            Your WiFi Credentials
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-off-white rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Network Name (SSID)</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-navy-dark">
                  {wifiCredentials.ssid}
                </p>
                <button
                  onClick={() => copyToClipboard(wifiCredentials.ssid)}
                  className="p-2 hover:bg-light-gray rounded-lg transition"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="bg-off-white rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Password</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-navy-dark font-mono">
                  {wifiCredentials.password}
                </p>
                <button
                  onClick={() => copyToClipboard(wifiCredentials.password)}
                  className="p-2 hover:bg-light-gray rounded-lg transition"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="bg-pumpkin/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-pumpkin" />
            </div>
            <h3 className="font-semibold text-navy-dark mb-2">Step 1</h3>
            <p className="text-sm text-gray-600">
              Open WiFi settings on your device
            </p>
          </div>

          <div className="card p-6 text-center">
            <div className="bg-salad/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-salad" />
            </div>
            <h3 className="font-semibold text-navy-dark mb-2">Step 2</h3>
            <p className="text-sm text-gray-600">
              Select "{wifiCredentials.ssid}" from the list
            </p>
          </div>

          <div className="card p-6 text-center">
            <div className="bg-bottle/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-bottle" />
            </div>
            <h3 className="font-semibold text-navy-dark mb-2">Step 3</h3>
            <p className="text-sm text-gray-600">
              Enter the password and connect
            </p>
          </div>
        </div>

        {/* Network Configuration */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-navy-dark mb-4">
            Advanced Configuration
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">IP Address (DHCP)</p>
              <p className="font-mono text-navy-dark">
                {wifiCredentials.ipAddress}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Gateway</p>
              <p className="font-mono text-navy-dark">
                {wifiCredentials.gateway}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">DNS Servers</p>
              <p className="font-mono text-navy-dark">8.8.8.8, 8.8.4.4</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Authentication</p>
              <p className="font-mono text-navy-dark">WPA2-PSK</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Link href="/dashboard">
            <button className="btn-secondary">Back to Dashboard</button>
          </Link>
          <button
            onClick={() => window.print()}
            className="border-2 border-navy text-navy px-6 py-2 rounded-lg hover:bg-navy hover:text-white transition"
          >
            Print Instructions
          </button>
        </div>
      </div>
    </main>
  );
}
