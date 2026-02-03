import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/shared/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { CalendarDays } from "lucide-react";

export default function FeedbackExamples() {
  return (
    <div className="space-y-6">
      {/* Dialog */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Dialog</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Abrir Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Título do Dialog</DialogTitle>
                <DialogDescription>
                  Descrição do dialog com informações adicionais para o usuário.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dialog-name">Nome</Label>
                  <Input id="dialog-name" placeholder="Digite o nome..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"`}
          </code>
        </CardContent>
      </Card>

      {/* Sheet */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Sheet</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Direita</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Painel Lateral</SheetTitle>
                  <SheetDescription>
                    Conteúdo do painel lateral que desliza da direita.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 text-sm text-muted-foreground">
                  Conteúdo do sheet aqui...
                </div>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Esquerda</Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Painel Esquerdo</SheetTitle>
                  <SheetDescription>
                    Painel lateral que desliza da esquerda.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet"`}
          </code>
        </CardContent>
      </Card>

      {/* Drawer */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Drawer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Abrir Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Drawer de Baixo</DrawerTitle>
                <DrawerDescription>Painel que desliza de baixo para cima.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 text-sm text-muted-foreground">
                Conteúdo do drawer aqui...
              </div>
              <DrawerFooter>
                <Button>Confirmar</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/shared/components/ui/drawer"`}
          </code>
        </CardContent>
      </Card>

      {/* AlertDialog */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">AlertDialog</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Excluir item</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O item será removido permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/shared/components/ui/alert-dialog"`}
          </code>
        </CardContent>
      </Card>

      {/* Popover */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Popover</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Abrir Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Configurações</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="pop-width" className="text-xs">Largura</Label>
                    <Input id="pop-width" defaultValue="100%" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pop-height" className="text-xs">Altura</Label>
                    <Input id="pop-height" defaultValue="auto" />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"`}
          </code>
        </CardContent>
      </Card>

      {/* HoverCard */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">HoverCard</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" className="px-0 underline">@usuario</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-72">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">@usuario</h4>
                  <p className="text-xs text-muted-foreground">Desenvolvedor full-stack no projeto.</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    Entrou em Janeiro 2024
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card"`}
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
