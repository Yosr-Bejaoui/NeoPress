import React from 'react';
import { Mail, Globe, Rss, FileText, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <h3 
              className="text-2xl font-serif tracking-wide text-white mb-4"
              style={{
                fontFamily: "'Times New Roman', Times, serif"
              }}
            >
              NeoPress
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your trusted source for AI-powered news and insights. We combine cutting-edge technology 
              with journalistic excellence to deliver accurate, comprehensive, and timely coverage 
              of the stories that matter most.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  <Globe size={16} />
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  <Mail size={16} />
                  Contact
                </a>
              </li>
              <li>
                <a href="/feed" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  <Rss size={16} />
                  RSS Feed
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  <FileText size={16} />
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  Privacy Policy
                  <ExternalLink size={14} />
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  Terms of Service
                  <ExternalLink size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} NeoPress. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Created by Yosr Bejaoui
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;