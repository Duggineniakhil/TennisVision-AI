"use client";

import { ChevronRight, Share2, MoreVertical } from "lucide-react";
import Link from "next/link";

interface BreadcrumbProps {
  category?: string;
  matchType?: string;
  activeTitle?: string;
}

export default function BreadcrumbHeader({
  category = "Demos",
  matchType = "Singles game",
  activeTitle = "Home",
}: BreadcrumbProps) {
  return (
    <div className="w-full bg-[#0B1120] border-b border-[#1E2A40] px-4 md:px-6 py-3 flex items-center justify-between text-xs md:text-sm">
      
      {/* Path Links */}
      <div className="flex items-center gap-2 text-[#8E9BAE]">
        <Link href="/" className="hover:text-white transition-colors">
          {category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#54647B]" />
        <span className="hover:text-white cursor-pointer transition-colors">
          {matchType}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#54647B]" />
        <span className="font-semibold text-white">
          {activeTitle}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              alert("Match link copied to clipboard!");
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131B2E] hover:bg-[#1E2A40] text-[#C6D0DD] hover:text-white border border-[#1E2A40] font-medium text-xs transition-colors"
        >
          <span>Share</span>
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <button className="p-1.5 rounded-lg bg-[#131B2E] hover:bg-[#1E2A40] text-[#8E9BAE] hover:text-white border border-[#1E2A40] transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
