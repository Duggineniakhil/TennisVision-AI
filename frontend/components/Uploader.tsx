"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadVideo } from "@/lib/api";

export default function Uploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      const { job_id } = await uploadVideo(file);
      router.push(`/analysis/${job_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to upload video");
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 hover:border-slate-600"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-slate-300">Uploading Video...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="space-y-1">
              <p className="text-xl font-medium text-slate-200">Drag & drop your tennis match</p>
              <p className="text-slate-400">or click to browse (.mp4, .mov, .avi)</p>
            </div>
            <label className="px-6 py-3 mt-4 text-sm font-medium text-white transition-colors rounded-lg cursor-pointer bg-emerald-600 hover:bg-emerald-500">
              Browse Files
              <input type="file" className="hidden" accept="video/mp4,video/quicktime,video/x-msvideo" onChange={onChange} />
            </label>
          </div>
        )}
      </div>
      {error && (
        <div className="p-4 mt-4 text-sm text-red-200 bg-red-900/50 rounded-lg border border-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
