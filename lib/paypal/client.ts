import { getOptionalPayPalEnv } from "@/lib/env";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const env = getOptionalPayPalEnv();

  if (!env.clientId || !env.clientSecret) {
    throw new Error("Missing PayPal credentials.");
  }

  const auth = Buffer.from(`${env.clientId}:${env.clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with PayPal.");
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(input: {
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: input.currency.toUpperCase(),
            value: (input.amount / 100).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to create PayPal order.");
  }

  return response.json();
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to capture PayPal order.");
  }

  return response.json();
}
