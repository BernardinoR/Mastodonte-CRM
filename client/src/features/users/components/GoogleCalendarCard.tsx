import { Calendar, Unplug } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useGoogleCalendar } from "../hooks/useGoogleCalendar";

export default function GoogleCalendarCard() {
  const { isConnected, isLoading, googleEmail, connect, disconnect } = useGoogleCalendar();

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Verificando conexão...</p>
        ) : isConnected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                Conectado
              </Badge>
              {googleEmail && <span className="text-sm text-muted-foreground">{googleEmail}</span>}
            </div>
            <Button variant="outline" size="sm" onClick={disconnect}>
              <Unplug className="mr-1 h-4 w-4" />
              Desconectar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Não conectado</span>
            <Button size="sm" onClick={connect}>
              <Calendar className="mr-1 h-4 w-4" />
              Conectar Google Calendar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
