import Stripe from "stripe";

import { getStripeEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeEnv().secretKey, {
      apiVersion: "2024-06-20",
    });
  }

  return stripeClient;
}

export function calculatePaymentAmount(
  paymentType: "enrollment" | "certification",
  studentCount: number,
) {
  const unitAmount = paymentType === "enrollment" ? 5000 : 3000;
  return unitAmount * studentCount;
}
