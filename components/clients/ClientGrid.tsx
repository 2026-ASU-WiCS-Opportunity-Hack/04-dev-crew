"use client";

import { ClientCard } from "@/components/clients/ClientCard";

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
}

interface ClientGridProps {
  clients: Client[];
}

export function ClientGrid({ clients }: ClientGridProps) {
  if (clients.length === 0) {
    return <p className="text-sm text-gray-500">No clients added yet.</p>;
  }

  return (
    <div className="card-grid">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
