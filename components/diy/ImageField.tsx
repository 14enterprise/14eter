"use client";

import { useRef, useState } from "react";
import { fileToCompressedDataUrl } from "@/lib/image-upload";

export default function ImageField({
  value,
  onChange,
  placeholder = "Paste an image URL or upload one",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(file?: File | null) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErr("File too large — please pick one under 10MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const { dataUrl } = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed. Try a different image.");
    } finally {
      setBusy(false);
    }
  }

  const isData = value.startsWith("data:image/");

  return (
    <div>
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt="Uploaded preview"
            className="w-14 h-14 rounded-xl object-cover border border-gray-700 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-600 text-xs shrink-0">
            none
          </div>
        )}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <input
            type="url"
            value={isData ? "" : value}
            onChange={(e) => {
              setErr("");
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full bg-black/40 border border-gray-700 rounded-xl p-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:border-brand hover:text-brand transition disabled:opacity-50"
            >
              {busy ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-gray-500 border-t-white rounded-full align-middle animate-spin mr-1" />
                  Processing…
                </>
              ) : (
                <>⬆ {value ? "Replace" : "Upload"}</>
              )}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition"
              >
                Remove
              </button>
            )}
            {isData && (
              <span className="text-[10px] text-gray-600">stored on-site</span>
            )}
          </div>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {err && <p className="text-xs text-red-400 mt-1.5">{err}</p>}
    </div>
  );
}