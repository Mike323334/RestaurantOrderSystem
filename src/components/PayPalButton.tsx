'use client';

import { 
  PayPalButtons, 
  PayPalCardFieldsProvider, 
  usePayPalCardFields,
  PayPalNumberField,
  PayPalExpiryField,
  PayPalCVVField
} from "@paypal/react-paypal-js";
import { useState } from "react";

interface PayPalButtonProps {
  amount: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

function SubmitPayment({ amount, onSuccess, onError }: PayPalButtonProps) {
  const cardFields  = usePayPalCardFields() as any;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (!cardFields) return;
    setIsProcessing(true);
    try {
      const order = await cardFields.submit({
        // You can add more details here if needed
      });
      onSuccess(order);
    } catch (err) {
      console.error(err);
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className="w-full bg-brand-900 text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl mt-4 disabled:opacity-50"
    >
      {isProcessing ? "Processing..." : `Pay $${amount} with Card`}
    </button>
  );
}

export default function PayPalButton({ amount, onSuccess, onError }: PayPalButtonProps) {
  const [showCardFields, setShowCardFields] = useState(false);

  return (
    <div className="space-y-6">
      {/* Standard PayPal Buttons (PayPal, Pay Later, etc.) */}
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "checkout" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: amount,
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          if (actions.order) {
            const details = await actions.order.capture();
            onSuccess(details);
          }
        }}
        onError={(err) => {
          console.error("PayPal Error:", err);
          onError(err);
        }}
      />

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-[10px] uppercase tracking-[0.3em] text-brand-400 font-bold">Or Pay with Card</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      {/* Integrated Card Fields */}
      <div className="bg-brand-800/50 p-6 rounded-2xl border border-white/10">
            <PayPalCardFieldsProvider
        createOrder={async () => {
          // Call your server API to create an order
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }), // send amount or any order data
          });

          const data = await res.json();

          // Return the order ID as a string
          return data.id; 
        }}
        onApprove={async (data) => {
          // `data` contains orderId and payer info
          // Capture the order server-side or via your API
          try {
            const res = await fetch(`/api/orders/${data.orderID}/capture`, {
              method: "POST",
            });
            const details = await res.json();
            onSuccess(details);
          } catch (err) {
            console.error("Card Fields Capture Error:", err);
            onError(err);
          }
        }}
        
        onError={(err) => {
          console.error("Card Fields Error:", err);
          onError(err);
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-brand-400 font-bold ml-1">Card Number</label>
            <div className="bg-brand-800 border-none rounded-xl px-4 py-3 text-white">
              <PayPalNumberField className="text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-brand-400 font-bold ml-1">Expiry Date</label>
              <div className="bg-brand-800 border-none rounded-xl px-4 py-3 text-white">
                <PayPalExpiryField />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-brand-400 font-bold ml-1">CVV</label>
              <div className="bg-brand-800 border-none rounded-xl px-4 py-3 text-white">
                <PayPalCVVField />
              </div>
            </div>
          </div>
          <SubmitPayment amount={amount} onSuccess={onSuccess} onError={onError} />
        </div>
      </PayPalCardFieldsProvider>

      </div>
    </div>
  );
}
