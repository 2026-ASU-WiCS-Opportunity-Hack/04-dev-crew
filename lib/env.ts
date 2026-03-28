const requiredServerVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function readEnvVar(name: string, required = true): string {
  const value = process.env[name];

  if (!value && required) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value ?? "";
}

export function getSupabaseEnv() {
  for (const name of requiredServerVars) {
    readEnvVar(name);
  }

  return {
    url: readEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: readEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: readEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getOpenAIKey() {
  return readEnvVar("OPENAI_API_KEY");
}

export function getStripeEnv() {
  return {
    secretKey: readEnvVar("STRIPE_SECRET_KEY"),
    webhookSecret: readEnvVar("STRIPE_WEBHOOK_SECRET"),
    publishableKey: readEnvVar("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    siteUrl: readEnvVar("NEXT_PUBLIC_SITE_URL"),
  };
}

export function getOptionalPayPalEnv() {
  return {
    clientId: readEnvVar("PAYPAL_CLIENT_ID", false),
    clientSecret: readEnvVar("PAYPAL_CLIENT_SECRET", false),
    siteUrl: readEnvVar("NEXT_PUBLIC_SITE_URL", false),
  };
}

export function getOptionalResendKey() {
  return readEnvVar("RESEND_API_KEY", false);
}
