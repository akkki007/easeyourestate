"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Upload, Download, CheckCircle, AlertCircle, FileText } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import toast from "react-hot-toast";

type UploadResult = {
  success: boolean;
  summary: {
    total: number;
    validRows: number;
    created: number;
    failed: number;
  };
  createdListings: string[];
  validationErrors: Array<{
    row: number;
    field: string;
    value: string;
    error: string;
  }>;
  creationErrors?: Array<{
    rowIndex: number;
    error: string;
  }>;
  message: string;
};

export default function BulkUploadPage() {
  const [user, setUser] = useState<{ name?: { first?: string; last?: string } | string; email?: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/agent/listings/bulk-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      setResult(data);
      toast.success(
        `${data.summary.created} listings created${data.summary.failed > 0 ? ` with ${data.summary.failed} errors` : ""}`
      );
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/agent/listings/bulk-upload", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "property-bulk-upload-template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const userName =
    user && typeof user.name === "object"
      ? `${user.name?.first || ""} ${user.name?.last || ""}`.trim()
      : (user?.name as string) || "User";
  const userEmail = user?.email || "";

  return (
    <>
      <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Bulk Upload" />
      <main className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Instructions */}
        <div className="bg-info/10 rounded-xl border border-info/20 p-6">
          <h3 className="font-semibold text-info mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            How to use bulk upload
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Download the CSV template below</li>
            <li>2. Fill in your property details following the template format</li>
            <li>3. Save the file as CSV (comma-separated values)</li>
            <li>4. Upload the file using the form below</li>
            <li>5. Review any errors and fix them in the CSV</li>
          </ol>
        </div>

        {/* Download Template Button */}
        <div className="flex justify-center">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-accent text-accent font-medium hover:bg-accent/10 transition"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </button>
        </div>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition"
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">Drag and drop your CSV file here</p>
          <p className="text-sm text-muted-foreground mb-4">or click to select a file</p>
          {file && <p className="text-sm text-accent font-medium">{file.name}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Upload Button */}
        {file && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="px-6 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-hover transition"
            >
              Clear
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2.5 rounded-lg bg-accent text-primary-foreground font-medium hover:bg-accent-hover transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div
              className={`rounded-xl border p-6 ${
                result.summary.failed === 0
                  ? "bg-success/10 border-success/20"
                  : "bg-warning/10 border-warning/20"
              }`}
            >
              <div className="flex items-start gap-4">
                {result.summary.failed === 0 ? (
                  <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{result.message}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Rows</p>
                      <p className="font-bold text-foreground">{result.summary.total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valid</p>
                      <p className="font-bold text-foreground">{result.summary.validRows}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-bold text-success">{result.summary.created}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Failed</p>
                      <p className="font-bold text-error">{result.summary.failed}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {result.validationErrors.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h4 className="font-semibold text-foreground mb-4">Validation Errors</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Row</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Field</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Value</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.validationErrors.slice(0, 10).map((err, idx) => (
                        <tr key={idx} className="border-b border-border">
                          <td className="py-2 px-3 text-error font-medium">{err.row}</td>
                          <td className="py-2 px-3 text-foreground">{err.field}</td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">{String(err.value).slice(0, 30)}</td>
                          <td className="py-2 px-3 text-error text-xs">{err.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.validationErrors.length > 10 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ... and {result.validationErrors.length - 10} more errors
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Creation Errors */}
            {result.creationErrors && result.creationErrors.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h4 className="font-semibold text-foreground mb-4">Creation Errors</h4>
                <div className="space-y-2">
                  {result.creationErrors.slice(0, 5).map((err, idx) => (
                    <p key={idx} className="text-sm text-error">
                      Row {err.rowIndex}: {err.error}
                    </p>
                  ))}
                  {result.creationErrors.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {result.creationErrors.length - 5} more errors
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Back to Listings */}
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard/listings"
                className="px-6 py-2.5 rounded-lg bg-accent text-primary-foreground font-medium hover:bg-accent-hover transition"
              >
                View All Listings
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
