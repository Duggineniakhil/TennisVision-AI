export const API_BASE = "http://localhost:8000/api";

export async function uploadVideo(file: File): Promise<{ job_id: string; message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Upload failed");
  }

  return res.json();
}

export async function getStatus(jobId: string) {
  const res = await fetch(`${API_BASE}/status/${jobId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch status");
  }
  return res.json();
}

export async function getAnalysis(jobId: string) {
  const res = await fetch(`${API_BASE}/analysis/${jobId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch analysis");
  }
  return res.json();
}
