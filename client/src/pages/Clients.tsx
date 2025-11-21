import { useState } from "react";
import { ClientCard } from "@/components/ClientCard";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewClientDialog } from "@/components/NewClientDialog";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newClientOpen, setNewClientOpen] = useState(false);

  const clients = [
    {
      id: "1",
      name: "Alessandro Cuçulin Mazer",
      cpf: "XXX.XXX.XXX-XX",
      email: "mazer.ale@hotmail.com",
      phone: "+55 16 99708-716",
      status: "Ativo",
      folderLink: "https://vault.repl.ai/file/com.google.drive/id/example",
    },
    {
      id: "2",
      name: "Ademar João Gréguer",
      email: "ademar@example.com",
      phone: "+55 11 98765-4321",
      status: "Ativo",
    },
    {
      id: "3",
      name: "Fernanda Carolina De Faria",
      email: "fernanda@example.com",
      phone: "+55 21 99999-8888",
      status: "Ativo",
    },
    {
      id: "4",
      name: "Gustavo Samconi Soares",
      email: "gustavo@example.com",
      status: "Prospect",
    },
    {
      id: "5",
      name: "Israel Schuster Da Fonseca",
      email: "israel@example.com",
      phone: "+55 11 97777-6666",
      status: "Ativo",
    },
    {
      id: "6",
      name: "Marcia Mozzato Ciampi De Andrade",
      email: "marcia@example.com",
      phone: "+55 11 96666-5555",
      status: "Ativo",
    },
  ];

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
          <ClientCard key={client.id} {...client} />
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
