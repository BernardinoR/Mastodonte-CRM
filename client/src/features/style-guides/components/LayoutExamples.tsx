import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/shared/components/ui/breadcrumb";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/shared/components/ui/pagination";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/components/ui/resizable";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/shared/components/ui/carousel";
import { Button } from "@/shared/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function LayoutExamples() {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Accordion */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Accordion</CardTitle></CardHeader>
        <CardContent className="space-y-3 max-w-lg">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>O que é o design system?</AccordionTrigger>
              <AccordionContent>
                Um conjunto de padrões, componentes e diretrizes para manter a consistência visual do projeto.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Quais componentes estão disponíveis?</AccordionTrigger>
              <AccordionContent>
                O projeto conta com 52 componentes shadcn/ui já instalados e prontos para uso.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Como adicionar um novo componente?</AccordionTrigger>
              <AccordionContent>
                Use <code className="bg-muted px-1 rounded text-xs">npx shadcn@latest add [componente]</code> para instalar.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion"`}
          </code>
        </CardContent>
      </Card>

      {/* Breadcrumb */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Breadcrumb</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Clientes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detalhes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/shared/components/ui/breadcrumb"`}
          </code>
        </CardContent>
      </Card>

      {/* Collapsible */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Collapsible</CardTitle></CardHeader>
        <CardContent className="space-y-3 max-w-md">
          <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">3 itens disponíveis</span>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="rounded-md border px-3 py-2 text-sm mt-2">Item principal</div>
            <CollapsibleContent className="space-y-2 mt-2">
              <div className="rounded-md border px-3 py-2 text-sm">Item secundário 1</div>
              <div className="rounded-md border px-3 py-2 text-sm">Item secundário 2</div>
            </CollapsibleContent>
          </Collapsible>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"`}
          </code>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Pagination</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/shared/components/ui/pagination"`}
          </code>
        </CardContent>
      </Card>

      {/* ScrollArea */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">ScrollArea</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ScrollArea className="h-40 w-full max-w-md rounded-md border p-3">
            <div className="space-y-2">
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} className="text-sm py-1 border-b border-border last:border-0">
                  Item {i + 1} — Conteúdo scrollável
                </div>
              ))}
            </div>
          </ScrollArea>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { ScrollArea } from "@/shared/components/ui/scroll-area"`}
          </code>
        </CardContent>
      </Card>

      {/* Separator */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Separator</CardTitle></CardHeader>
        <CardContent className="space-y-3 max-w-md">
          <div>
            <p className="text-sm">Conteúdo acima</p>
            <Separator className="my-3" />
            <p className="text-sm">Conteúdo abaixo</p>
          </div>
          <div className="flex items-center h-6 gap-3">
            <span className="text-sm">Item A</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Item B</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Item C</span>
          </div>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Separator } from "@/shared/components/ui/separator"`}
          </code>
        </CardContent>
      </Card>

      {/* Resizable */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Resizable</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ResizablePanelGroup direction="horizontal" className="max-w-lg rounded-lg border">
            <ResizablePanel defaultSize={50}>
              <div className="flex h-24 items-center justify-center p-4">
                <span className="text-sm font-medium">Painel A</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-24 items-center justify-center p-4">
                <span className="text-sm font-medium">Painel B</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/shared/components/ui/resizable"`}
          </code>
        </CardContent>
      </Card>

      {/* Carousel */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Carousel</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="mx-auto max-w-xs">
            <Carousel>
              <CarouselContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <CarouselItem key={n}>
                    <div className="p-1">
                      <div className="flex aspect-square items-center justify-center rounded-md border bg-muted">
                        <span className="text-2xl font-semibold">{n}</span>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/shared/components/ui/carousel"`}
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
