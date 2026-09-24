"use client";

import { useEffect, useState } from "react";

export default function PaymentHandler() {
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "verifying" }
    | { kind: "success"; planLabel: string; autoPublish: boolean }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const reference = params.get("reference");
    if (payment !== "success" || !reference) return;

    // Clean the URL right away so refresh doesn't re-verify.
    const cleanUrl = window.location.pathname;
    window.history.replaceState(null, "", cleanUrl);

    setState({ kind: "verifying" });
    (async () => {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error ?? "Payment verification failed");
        }
        const autoPublish =
          window.sessionStorage.getItem("diy_pending_publish") === "1";
        window.sessionStorage.removeItem("diy_pending_publish");
        window.dispatchEvent(new CustomEvent("subscription-updated"));
        setState({
          kind: "success",
          planLabel: json.subscription?.planLabel ?? "Premium",
          autoPublish,
        });
        if (autoPublish) {
          // Give TemplateStudio a beat to refresh subscription, then auto-publish.
          window.setTimeout(() => {
            window.dispatchEvent(new CustomEvent("diy-auto-publish"));
          }, 1200);
        }
      } catch (err) {
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Payment verification failed",
        });
      }
    })();
  }, []);

  if (state.kind === "idle") return null;

  if (state.kind === "verifying") {
    return (
      <div className="mb-6 bg-brand/10 border border-brand/40 rounded-2xl px-5 py-4 flex items-center gap-3">
        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        <p className="text-sm font-semibold">Verifying your payment…</p>
      </div>
    );
  }

  if (state.kind === "success") {
    return (
      <div className="mb-6 bg-green-500/10 border border-green-500/40 rounded-2xl px-5 py-4">
        <p className="font-bold text-green-300">
          🎉 Payment successful — {state.planLabel} activated!
        </p>
        <p className="text-sm text-gray-300 mt-1">
          {state.autoPublish
            ? "Publishing your site now…"
            : "You can now publish your site with the button below."}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-red-500/10 border border-red-500/40 rounded-2xl px-5 py-4">
      <p className="font-bold text-red-300">Payment verification failed</p>
      <p className="text-sm text-gray-300 mt-1">{state.message}</p>
    </div>
  );
}
