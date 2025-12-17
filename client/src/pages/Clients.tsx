import { useState } from "react";
import { ClientCard } from "@/components/ClientCard";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewClientDialog } from "@/components/NewClientDialog";
import { useClients } from "@/contexts/ClientsContext";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const { clients } = useClients();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Button onClick={() => setNewClientOpen(true)} data-testid="button-newclient">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showAssignee={false}
        showPriority={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      <NewClientDialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
        onSubmit={(data) => console.log('New client:', data)}
      />
    </div>
  );
}
