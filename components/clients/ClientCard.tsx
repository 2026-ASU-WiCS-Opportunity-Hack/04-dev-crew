"use client";

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    logo_url: string | null;
    website_url: string | null;
    description: string | null;
  };
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <div className="feature-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {client.logo_url && (
        <img
          src={client.logo_url}
          alt={client.name}
          style={{ width: "3rem", height: "3rem", borderRadius: "0.5rem", objectFit: "contain" }}
          loading="lazy"
        />
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <strong className="truncate" style={{ display: "block" }}>{client.name}</strong>
        {client.description && (
          <p style={{ marginTop: "0.25rem", color: "var(--muted)", fontSize: "0.9rem" }} className="line-clamp-2">{client.description}</p>
        )}
        {client.website_url && (
          <a
            href={client.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="home-link"
            style={{ marginTop: "0.35rem", fontSize: "0.8rem" }}
          >
            Visit website &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
