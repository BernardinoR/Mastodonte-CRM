import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import type { Client } from "@/types/client";
import { CLIENT_STATUS_OUTLINE_COLORS } from "@/lib/statusConfig";

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  const { id, name, initials, emails, phone, status, folderLink } = client;
  const email = emails[client.primaryEmailIndex] || emails[0];
  const [, setLocation] = useLocation();

  const handleCardClick = () => {
    setLocation(`/clients/${id}`);
  };

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (folderLink) {
      window.open(folderLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      className="hover-elevate active-elevate-2 cursor-pointer" 
      data-testid={`card-client-${id}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-base truncate" data-testid={`text-clientname-${id}`}>{name}</h3>
              <Badge variant="outline" className={`text-xs ${CLIENT_STATUS_OUTLINE_COLORS[status] || ""}`}>
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
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                onClick={handleFolderClick}
                data-testid={`link-folder-${id}`}
              >
                <ExternalLink className="w-3 h-3" />
                Pasta do Cliente
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
