import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/shared/components/ui/context-menu";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/shared/components/ui/menubar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { MoreHorizontal, User, Settings, LogOut, Copy, Pencil, Trash2, Calculator, Smile, Calendar } from "lucide-react";

export default function DataExamples() {
  return (
    <div className="space-y-6">
      {/* DropdownMenu */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">DropdownMenu</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"`}
          </code>
        </CardContent>
      </Card>

      {/* ContextMenu */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">ContextMenu</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-24 w-full max-w-md items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Clique com botão direito aqui
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </ContextMenuItem>
              <ContextMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/shared/components/ui/context-menu"`}
          </code>
        </CardContent>
      </Card>

      {/* Menubar */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Menubar</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Arquivo</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Novo</MenubarItem>
                <MenubarItem>Abrir</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Salvar</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Editar</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Desfazer</MenubarItem>
                <MenubarItem>Refazer</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Copiar</MenubarItem>
                <MenubarItem>Colar</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Visualizar</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Zoom In</MenubarItem>
                <MenubarItem>Zoom Out</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/shared/components/ui/menubar"`}
          </code>
        </CardContent>
      </Card>

      {/* Command */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Command</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Command className="rounded-lg border max-w-md">
            <CommandInput placeholder="Buscar comando..." />
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup heading="Sugestões">
                <CommandItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendário
                </CommandItem>
                <CommandItem>
                  <Smile className="mr-2 h-4 w-4" />
                  Emojis
                </CommandItem>
                <CommandItem>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculadora
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command"`}
          </code>
        </CardContent>
      </Card>

      {/* Custom Components Reference */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Componentes Custom do Projeto</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground mb-3">
            Estes componentes são específicos do projeto e não fazem parte do shadcn/ui padrão:
          </p>
          <div className="space-y-1.5 font-mono text-xs">
            <p><code className="bg-muted px-1.5 py-0.5 rounded">@/shared/components/ui/editable-cell</code> — Célula editável inline para tabelas</p>
            <p><code className="bg-muted px-1.5 py-0.5 rounded">@/shared/components/ui/expandable-filter-bar</code> — Barra de filtros expansível</p>
            <p><code className="bg-muted px-1.5 py-0.5 rounded">@/shared/components/ui/searchable-multi-select</code> — Select múltiplo com busca</p>
            <p><code className="bg-muted px-1.5 py-0.5 rounded">@/shared/components/ui/date-input</code> — Input de data customizado</p>
            <p><code className="bg-muted px-1.5 py-0.5 rounded">@/shared/components/ui/task-assignees</code> — Exibição de assignees de task</p>
            <p><code className="bg-muted px-1.5 py-0.5 rounded">@/shared/components/ui/task-badges</code> — Badges de status de task</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
