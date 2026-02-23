import { Heart, Github, Linkedin, Mail, Code } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-light-gray bg-white/80 backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-pumpkin to-transparent" />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Section */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-pumpkin to-salad rounded-lg blur-sm opacity-50" />
              <div className="relative bg-navy p-1.5 rounded-lg">
                <Code className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">
              Built with{" "}
              <Heart className="w-3 h-3 inline-block text-pumpkin mx-0.5 fill-pumpkin" />{" "}
              by
            </span>
          </div>

          {/* Developer Credit */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="group flex items-center space-x-2">
              <span className="text-sm font-bold text-navy group-hover:text-pumpkin transition-colors">
                Aderoute
              </span>
            </Link>

            <span className="text-light-gray">|</span>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                Eric Lumumba
              </span>

              <div className="flex items-center space-x-1">
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-navy rounded-full hover:bg-light-gray transition-all duration-200"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-navy hover:text-navy-light rounded-full hover:bg-light-gray transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="mailto:eric@aderoute.com"
                  className="p-2 text-pumpkin hover:text-pumpkin-light rounded-full hover:bg-light-gray transition-all duration-200"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-400">
            © {currentYear} All rights reserved
          </div>
        </div>

        {/* Mobile view */}
        <div className="mt-4 text-center md:hidden">
          <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <span>Created with</span>
            <Heart className="w-3 h-3 text-pumpkin fill-pumpkin" />
            <span>by Eric Lumumba for Aderoute</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
