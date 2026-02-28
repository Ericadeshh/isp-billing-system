"use client";

import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  HelpCircle,
  Shield,
  Zap,
  Users,
  Wifi,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function AdminContact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success(
        "Message sent successfully! We'll respond within 24 hours.",
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      details: ["+254 741 091 661", "+254 106 578 415"],
      description: "Mon-Fri, 8am-8pm EAT",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["ericadeshh@gmail.com", "aderoute@gmail.com"],
      description: "Support & Business Inquiries",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: MapPin,
      title: "Headquarters",
      details: ["Eldoret, Kenya"],
      description: "HQ & Operations Center",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Globe,
      title: "Regional Offices",
      details: ["Nakuru", "Nairobi"],
      description: "Branch Locations",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 8am - 8pm",
        "Saturday: 9am - 5pm",
        "Sunday: Closed",
      ],
      description: "EAT Timezone",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: HelpCircle,
      title: "Emergency Support",
      details: ["24/7 Critical Issues", "+254 741 091 661"],
      description: "For urgent network problems",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
  ];

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "#", color: "hover:text-blue-400" },
    {
      name: "Facebook",
      icon: Facebook,
      href: "#",
      color: "hover:text-blue-600",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "#",
      color: "hover:text-blue-500",
    },
    { name: "GitHub", icon: Github, href: "#", color: "hover:text-gray-400" },
  ];

  const faqs = [
    {
      question: "How do I report a network outage?",
      answer:
        "Call our emergency support line at +254 741 091 661 for immediate assistance with network issues.",
    },
    {
      question: "What are your business hours?",
      answer:
        "Our offices are open Monday-Friday 8am-8pm and Saturday 9am-5pm. Emergency support is available 24/7.",
    },
    {
      question: "How can I upgrade my internet plan?",
      answer:
        "Log into your dashboard and navigate to Plans, or contact our support team for assistance.",
    },
    {
      question: "Do you offer corporate accounts?",
      answer:
        "Yes! Contact our business team at ericadeshh@gmail.com for corporate rates and dedicated support.",
    },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <span className="text-2xl font-bold text-amber-500 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Contact & Support
        </span>
        <p className="text-sm text-gray-400 mt-1">
          Get in touch with us for any inquiries or support needs
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contactInfo.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-amber-500/50 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center mb-4`}
              >
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="text-lg font-semibold text-amber-600 mb-2">
                {item.title}
              </span>
              <div className="space-y-1 mb-3">
                {item.details.map((detail, i) => (
                  <p key={i} className="text-sm text-gray-300">
                    {detail}
                  </p>
                ))}
              </div>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Response Time</p>
              <p className="text-xl font-bold text-amber-500">&lt; 1 hour</p>
            </div>
            <Zap className="w-8 h-8 text-amber-500/30" />
          </div>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Support Agents</p>
              <p className="text-xl font-bold text-green-400">24/7</p>
            </div>
            <Users className="w-8 h-8 text-green-500/30" />
          </div>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Satisfaction Rate</p>
              <p className="text-xl font-bold text-blue-400">98%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500/30" />
          </div>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Coverage Areas</p>
              <p className="text-xl font-bold text-purple-400">3 Cities</p>
            </div>
            <Wifi className="w-8 h-8 text-purple-500/30" />
          </div>
        </div>
      </div>

      {/* Contact Form & FAQ Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-xl font-bold text-amber-500 mb-6">
            Send us a Message
          </span>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="How can we help?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Tell us more about your inquiry..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-xl font-bold text-amber-500 mb-6">
            Frequently Asked Questions
          </span>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-4 bg-navy/50 rounded-lg border border-gray-800 hover:border-amber-500/50 transition-colors"
              >
                <span className="text-white font-medium mb-2 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  {faq.question}
                </span>
                <p className="text-sm text-gray-400 pl-6">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="text-sm text-gray-300">
              <span className="text-amber-500 font-semibold">
                Need immediate help?
              </span>{" "}
              Call our emergency support at{" "}
              <a
                href="tel:+254741091661"
                className="text-amber-500 hover:underline"
              >
                +254 741 091 661
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Map/Locations Section */}
      <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
        <span className="text-xl font-bold text-amber-500 mb-6">
          Our Locations
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Eldoret - HQ */}
          <div className="p-4 bg-navy/50 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-white font-semibold">Eldoret (HQ)</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Main Operations Center</p>
            <p className="text-xs text-gray-500">Open Mon-Fri, 8am-8pm</p>
          </div>

          {/* Nairobi */}
          <div className="p-4 bg-navy/50 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-white font-semibold">Nairobi</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Regional Office</p>
            <p className="text-xs text-gray-500">Open Mon-Fri, 9am-6pm</p>
          </div>

          {/* Nakuru */}
          <div className="p-4 bg-navy/50 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-white font-semibold">Nakuru</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Regional Office</p>
            <p className="text-xs text-gray-500">Open Mon-Fri, 9am-6pm</p>
          </div>
        </div>
      </div>

      {/* Social Links & Footer */}
      <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-amber-500 font-semibold mb-2">
              Connect With Us
            </span>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`p-2 bg-navy/50 rounded-lg text-gray-400 ${social.color} transition-colors`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Aderoute. All rights reserved.</p>
            <p className="text-xs mt-1">
              Fast & Reliable Internet Across Kenya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
