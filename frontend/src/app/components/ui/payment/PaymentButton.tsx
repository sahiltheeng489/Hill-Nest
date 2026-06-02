"use client";

import { useEffect, useRef, useState } from "react";
import { buildApiUrl } from "@/services/api";
import { getToken } from "@/services/authService";

// ── Razorpay window type augmentation ────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface BookingPayload {
  room: string;
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

interface PaymentButtonProps {
  bookingPayload: BookingPayload;
  nights: number;
  pricePerNight: number;
  disabled?: boolean;
  onSuccess: () => void;
  onError?: (msg: string) => void;
}

export default function PaymentButton({
  bookingPayload,
  nights,
  pricePerNight,
  disabled = false,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const totalAmount = nights * pricePerNight;

  // ── Load Razorpay checkout script once ───────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) {
      const timer = setTimeout(() => setScriptReady(true), 0);
      return () => clearTimeout(timer);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => onError?.("Could not load payment gateway. Please refresh and try again.");
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async () => {
    if (!scriptReady) {
      onError?.("Payment gateway is not ready yet. Please wait a moment.");
      return;
    }

    const token = getToken();
    if (!token) {
      onError?.("Please login to complete your booking.");
      return;
    }

    setLoading(true);

    try {
      // ── Step 1: Create Razorpay order on backend ──────────────────────
      const orderRes = await fetch(buildApiUrl("/payment/create-order"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        onError?.(orderData.message || "Failed to initiate payment.");
        setLoading(false);
        return;
      }

      // ── Step 2: Open Razorpay Checkout modal ──────────────────────────
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,      // in paise
        currency: orderData.currency,
        name: "HillNest",
        description: `${orderData.roomName} · ${nights} night${nights !== 1 ? "s" : ""}`,
        image: "/favicon.ico",
        order_id: orderData.orderId,
        prefill: {
          name: bookingPayload.name,
          email: bookingPayload.email,
        },
        theme: {
          color: "#15803d", // green-700
        },

        // ── Step 3: On payment success → verify server-side ──────────────
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch(buildApiUrl("/payment/verify"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                ...bookingPayload,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              onError?.(verifyData.message || "Payment verification failed.");
            } else {
              onSuccess();
            }
          } catch {
            onError?.("Payment was received but confirmation failed. Contact support with your payment ID.");
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: { error: { description: string } }) => {
        onError?.(response.error.description || "Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch {
      onError?.("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Price summary card */}
      <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{typeof pricePerNight === "number" && !isNaN(pricePerNight) ? `₹${pricePerNight.toLocaleString("en-IN")}` : "N/A"} × {nights} night{nights !== 1 ? "s" : ""}</span>
          <span className="font-medium">{typeof totalAmount === "number" && !isNaN(totalAmount) ? `₹${totalAmount.toLocaleString("en-IN")}` : "N/A"}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-green-100 pt-2">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="text-xl font-extrabold text-green-700">
            {typeof totalAmount === "number" && !isNaN(totalAmount) ? `₹${totalAmount.toLocaleString("en-IN")}` : "N/A"}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-400">Secure payment powered by Razorpay</p>
      </div>

      {/* Pay button */}
      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || loading || !scriptReady || nights <= 0 || typeof totalAmount !== "number" || isNaN(totalAmount)}
        className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-green-900/20 transition-all duration-300 hover:from-green-600 hover:to-emerald-500 hover:shadow-xl hover:shadow-green-900/30 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {/* Shimmer effect */}
        {!loading && !disabled && (
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}

        <span className="relative flex items-center justify-center gap-3">
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Processing payment…
            </>
          ) : !scriptReady ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Loading gateway…
            </>
          ) : (
            <>
              {/* Lock icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Pay {typeof totalAmount === "number" && !isNaN(totalAmount) ? `₹${totalAmount.toLocaleString("en-IN")}` : "N/A"} Securely
            </>
          )}
        </span>
      </button>
    </div>
  );
}
