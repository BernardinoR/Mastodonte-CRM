import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { Client } from "@/types/client";

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  const { id, name, initials, email, phone, status, folderLink } = client;

  const statusColors: Record<string, string> = {
    Ativo: "bg-green-500/10 text-green-500 border-green-500/20",
    Inativo: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    Prospect: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  return (
    <Link href={`/clients/${id}`}>
      <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-client-${id}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-base truncate" data-testid={`text-clientname-${id}`}>{name}</h3>
                <Badge variant="outline" className={`text-xs ${statusColors[status] || ""}`}>
                  {status}
                </Badge>
              </div>
              {email && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{phone}</span>
                </div>
              )}
              {folderLink && (
                <a
                  href={folderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`link-folder-${id}`}
                >
                  <ExternalLink className="w-3 h-3" />
                  Pasta do Cliente
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
