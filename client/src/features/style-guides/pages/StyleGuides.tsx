import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Progress } from "@/shared/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useToast } from "@/shared/hooks/use-toast";
import LayoutExamples from "../components/LayoutExamples";
import FormExamples from "../components/FormExamples";
import FeedbackExamples from "../components/FeedbackExamples";
import DataExamples from "../components/DataExamples";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Copy,
  Info,
  Palette,
  Type,
  Layers,
  Box,
  Component,
  BookOpen,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Color Palette Data
// ---------------------------------------------------------------------------
const COLOR_GROUPS = [
  {
    title: "Base",
    colors: [
      { name: "--background", twClass: "bg-background", label: "Background" },
      { name: "--foreground", twClass: "bg-foreground", label: "Foreground" },
      { name: "--border", twClass: "bg-border", label: "Border" },
      { name: "--input", twClass: "bg-input", label: "Input" },
      { name: "--ring", twClass: "bg-ring", label: "Ring" },
    ],
  },
  {
    title: "Semantic",
    colors: [
      { name: "--primary", twClass: "bg-primary", label: "Primary" },
      { name: "--primary-foreground", twClass: "bg-primary-foreground", label: "Primary FG" },
      { name: "--secondary", twClass: "bg-secondary", label: "Secondary" },
      { name: "--secondary-foreground", twClass: "bg-secondary-foreground", label: "Secondary FG" },
      { name: "--muted", twClass: "bg-muted", label: "Muted" },
      { name: "--muted-foreground", twClass: "bg-muted-foreground", label: "Muted FG" },
      { name: "--accent", twClass: "bg-accent", label: "Accent" },
      { name: "--accent-foreground", twClass: "bg-accent-foreground", label: "Accent FG" },
      { name: "--destructive", twClass: "bg-destructive", label: "Destructive" },
      {
        name: "--destructive-foreground",
        twClass: "bg-destructive-foreground",
        label: "Destructive FG",
      },
    ],
  },
  {
    title: "Card & Popover",
    colors: [
      { name: "--card", twClass: "bg-card", label: "Card" },
      { name: "--card-foreground", twClass: "bg-card-foreground", label: "Card FG" },
      { name: "--popover", twClass: "bg-popover", label: "Popover" },
      { name: "--popover-foreground", twClass: "bg-popover-foreground", label: "Popover FG" },
    ],
  },
  {
    title: "Sidebar",
    colors: [
      { name: "--sidebar", twClass: "bg-sidebar", label: "Sidebar" },
      { name: "--sidebar-foreground", twClass: "bg-sidebar-foreground", label: "Sidebar FG" },
      { name: "--sidebar-border", twClass: "bg-sidebar-border", label: "Sidebar Border" },
      { name: "--sidebar-primary", twClass: "bg-sidebar-primary", label: "Sidebar Primary" },
      { name: "--sidebar-accent", twClass: "bg-sidebar-accent", label: "Sidebar Accent" },
    ],
  },
  {
    title: "Chart",
    colors: [
      { name: "--chart-1", twClass: "bg-chart-1", label: "Chart 1" },
      { name: "--chart-2", twClass: "bg-chart-2", label: "Chart 2" },
      { name: "--chart-3", twClass: "bg-chart-3", label: "Chart 3" },
      { name: "--chart-4", twClass: "bg-chart-4", label: "Chart 4" },
      { name: "--chart-5", twClass: "bg-chart-5", label: "Chart 5" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component catalog
// ---------------------------------------------------------------------------
const COMPONENT_CATEGORIES = [
  {
    title: "Layout & Navegação",
    items: [
      "accordion",
      "breadcrumb",
      "carousel",
      "collapsible",
      "navigation-menu",
      "pagination",
      "resizable",
      "scroll-area",
      "separator",
      "sidebar",
      "tabs",
    ],
  },
  {
    title: "Formulários & Inputs",
    items: [
      "button",
      "calendar",
      "checkbox",
      "date-input",
      "form",
      "input",
      "input-otp",
      "label",
      "radio-group",
      "searchable-multi-select",
      "select",
      "slider",
      "switch",
      "textarea",
      "toggle",
      "toggle-group",
    ],
  },
  {
    title: "Feedback & Overlay",
    items: [
      "alert",
      "alert-dialog",
      "dialog",
      "drawer",
      "hover-card",
      "popover",
      "sheet",
      "toast",
      "toaster",
      "tooltip",
    ],
  },
  {
    title: "Data Display",
    items: [
      "avatar",
      "badge",
      "card",
      "chart",
      "context-menu",
      "dropdown-menu",
      "menubar",
      "progress",
      "skeleton",
      "table",
    ],
  },
  {
    title: "Utilitários",
    items: [
      "aspect-ratio",
      "command",
      "editable-cell",
      "expandable-filter-bar",
      "task-assignees",
      "task-badges",
    ],
  },
];

// ---------------------------------------------------------------------------
// Section nav
// ---------------------------------------------------------------------------
const SECTIONS = [
  { id: "colors", label: "Cores", icon: Palette },
  { id: "typography", label: "Tipografia", icon: Type },
  { id: "elevation", label: "Elevação & Sombras", icon: Layers },
  { id: "spacing", label: "Espaçamento & Radius", icon: Box },
  { id: "components", label: "Componentes", icon: Component },
  { id: "patterns", label: "Padrões de Uso", icon: BookOpen },
];

// ---------------------------------------------------------------------------
// Helper: copy to clipboard
// ---------------------------------------------------------------------------
function useCopyToClipboard() {
  const { toast } = useToast();
  return (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: text });
  };
}

// ---------------------------------------------------------------------------
// Color Swatch
// ---------------------------------------------------------------------------
function ColorSwatch({ name, twClass, label }: { name: string; twClass: string; label: string }) {
  const copy = useCopyToClipboard();
  return (
    <button
      type="button"
      onClick={() => copy(name)}
      className="group flex cursor-pointer flex-col items-center gap-1.5"
    >
      <div
        className={`h-16 w-16 rounded-md border border-border ${twClass} transition-shadow group-hover:ring-2 group-hover:ring-ring`}
      />
      <span className="text-[11px] font-medium leading-tight text-foreground">{label}</span>
      <span className="font-mono text-[10px] leading-tight text-muted-foreground">{name}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SECTIONS
// ---------------------------------------------------------------------------

function ColorsSection() {
  return (
    <section id="colors" className="space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Palette className="h-5 w-5 text-primary" />
          Paleta de Cores
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Todas as cores utilizam variáveis CSS HSL definidas em{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">index.css</code>. Clique para
          copiar.
        </p>
      </div>

      {COLOR_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{group.title}</h3>
          <div className="flex flex-wrap gap-4">
            {group.colors.map((c) => (
              <ColorSwatch key={c.name} {...c} />
            ))}
          </div>
        </div>
      ))}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Como usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-sm">
          <p>
            Tailwind:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">
              className="bg-primary text-primary-foreground"
            </code>
          </p>
          <p>
            CSS: <code className="rounded bg-muted px-1.5 py-0.5">color: hsl(var(--primary));</code>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function TypographySection() {
  const sizes = [
    { cls: "text-xs", label: "text-xs (12px)" },
    { cls: "text-sm", label: "text-sm (14px)" },
    { cls: "text-base", label: "text-base (16px)" },
    { cls: "text-lg", label: "text-lg (18px)" },
    { cls: "text-xl", label: "text-xl (20px)" },
    { cls: "text-2xl", label: "text-2xl (24px)" },
    { cls: "text-3xl", label: "text-3xl (30px)" },
    { cls: "text-4xl", label: "text-4xl (36px)" },
  ];

  const weights = [
    { cls: "font-normal", label: "font-normal (400)" },
    { cls: "font-medium", label: "font-medium (500)" },
    { cls: "font-semibold", label: "font-semibold (600)" },
    { cls: "font-bold", label: "font-bold (700)" },
  ];

  return (
    <section id="typography" className="space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Type className="h-5 w-5 text-primary" />
          Tipografia
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fontes definidas via{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">--font-sans</code>,{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">--font-serif</code>,{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">--font-mono</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sans (Inter)</CardTitle>
          </CardHeader>
          <CardContent className="font-sans text-lg">
            O rato roeu a roupa do rei de Roma.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Serif (Georgia)</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-lg">
            O rato roeu a roupa do rei de Roma.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mono (Menlo)</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-lg">const x = 42;</CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Tamanhos</h3>
        <div className="space-y-3">
          {sizes.map(({ cls, label }) => (
            <div key={cls} className="flex items-baseline gap-4">
              <code className="w-40 shrink-0 font-mono text-xs text-muted-foreground">{label}</code>
              <span className={cls}>O rato roeu a roupa do rei de Roma</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Pesos</h3>
        <div className="space-y-3">
          {weights.map(({ cls, label }) => (
            <div key={cls} className="flex items-baseline gap-4">
              <code className="w-40 shrink-0 font-mono text-xs text-muted-foreground">{label}</code>
              <span className={`text-lg ${cls}`}>O rato roeu a roupa do rei de Roma</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ElevationSection() {
  return (
    <section id="elevation" className="space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Layers className="h-5 w-5 text-primary" />
          Elevação & Sombras
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sistema de elevação baseado em overlay de opacidade. Sombras definidas via{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">--shadow-*</code>.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Elevation Utilities</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">hover-elevate</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Passe o mouse para ver o efeito de elevação sutil.
            </CardContent>
          </Card>
          <Card className="hover-elevate-2 cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">hover-elevate-2</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Passe o mouse — efeito mais intenso.
            </CardContent>
          </Card>
          <Card className="active-elevate cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">active-elevate</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Clique e segure para ver o efeito.
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Variáveis de Sombra</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {["2xs", "xs", "sm", "DEFAULT", "md", "lg", "xl", "2xl"].map((size) => {
            const varName = size === "DEFAULT" ? "--shadow" : `--shadow-${size}`;
            return (
              <div key={size} className="flex flex-col items-center gap-2">
                <div
                  className="h-20 w-20 rounded-md border border-border bg-card"
                  style={{ boxShadow: `var(${varName})` }}
                />
                <code className="font-mono text-[10px] text-muted-foreground">{varName}</code>
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Uso do sistema de elevação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 font-mono text-sm">
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">className="hover-elevate"</code> —
            hover sutil
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">className="hover-elevate-2"</code> —
            hover intenso
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">className="active-elevate"</code> — ao
            clicar
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">
              className="toggle-elevate toggle-elevated"
            </code>{" "}
            — toggle ativo
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function SpacingSection() {
  const radii = [
    { cls: "rounded-sm", label: "rounded-sm (3px)" },
    { cls: "rounded-md", label: "rounded-md (6px)" },
    { cls: "rounded-lg", label: "rounded-lg (9px)" },
    { cls: "rounded-xl", label: "rounded-xl" },
    { cls: "rounded-full", label: "rounded-full" },
  ];

  const spacings = [
    { cls: "p-1", label: "p-1 (4px)" },
    { cls: "p-2", label: "p-2 (8px)" },
    { cls: "p-3", label: "p-3 (12px)" },
    { cls: "p-4", label: "p-4 (16px)" },
    { cls: "p-6", label: "p-6 (24px)" },
    { cls: "p-8", label: "p-8 (32px)" },
  ];

  return (
    <section id="spacing" className="space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Box className="h-5 w-5 text-primary" />
          Espaçamento & Border Radius
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Base spacing:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">--spacing: 0.25rem</code> · Base
          radius: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">--radius: 0.5rem</code>
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Border Radius</h3>
        <div className="flex flex-wrap gap-4">
          {radii.map(({ cls, label }) => (
            <div key={cls} className="flex flex-col items-center gap-2">
              <div className={`h-20 w-20 border-2 border-primary bg-primary/20 ${cls}`} />
              <code className="font-mono text-[10px] text-muted-foreground">{label}</code>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Espaçamento (padding)</h3>
        <div className="flex flex-wrap items-end gap-4">
          {spacings.map(({ cls, label }) => (
            <div key={cls} className="flex flex-col items-center gap-2">
              <div className="inline-flex rounded-md bg-muted">
                <div className={cls}>
                  <div className="h-8 w-8 rounded-sm bg-primary/30" />
                </div>
              </div>
              <code className="font-mono text-[10px] text-muted-foreground">{label}</code>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Padrões de espaçamento usados no projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 font-mono text-sm">
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">p-6</code> — padding de página
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">space-y-6</code> — gap entre seções
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">gap-4</code> — gap entre cards em grid
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">p-4</code> — padding interno de cards
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function ComponentsSection() {
  const copy = useCopyToClipboard();
  return (
    <section id="components" className="space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Component className="h-5 w-5 text-primary" />
          Componentes Disponíveis
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          52 componentes shadcn/ui instalados em{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">@/shared/components/ui/</code>
        </p>
      </div>

      {COMPONENT_CATEGORIES.map((cat) => (
        <div key={cat.title}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{cat.title}</h3>
          <div className="flex flex-wrap gap-2">
            {cat.items.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => copy(`@/shared/components/ui/${name}`)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-muted px-2.5 py-1 font-mono text-xs transition-colors hover:bg-accent"
              >
                {name}
                <Copy className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <Separator />

      {/* Exemplos visuais organizados por categoria */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Exemplos Visuais</h3>

        <Tabs defaultValue="forms" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="forms">Formulários</TabsTrigger>
            <TabsTrigger value="data">Data Display</TabsTrigger>
            <TabsTrigger value="feedback">Feedback & Overlay</TabsTrigger>
            <TabsTrigger value="layout">Layout & Nav</TabsTrigger>
          </TabsList>

          <TabsContent value="forms">
            <div className="space-y-6">
              {/* Button */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Button</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled>Disabled</Button>
                  </div>
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Button } from "@/shared/components/ui/button"`}
                  </code>
                </CardContent>
              </Card>

              {/* Input */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Input & Textarea</CardTitle>
                </CardHeader>
                <CardContent className="max-w-md space-y-3">
                  <Input placeholder="Placeholder text..." />
                  <Input disabled placeholder="Disabled..." />
                  <Textarea placeholder="Textarea placeholder..." />
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Input } from "@/shared/components/ui/input"`}
                  </code>
                </CardContent>
              </Card>

              {/* Select */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Select</CardTitle>
                </CardHeader>
                <CardContent className="max-w-md space-y-3">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opt1">Opção 1</SelectItem>
                      <SelectItem value="opt2">Opção 2</SelectItem>
                      <SelectItem value="opt3">Opção 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"`}
                  </code>
                </CardContent>
              </Card>

              {/* Checkbox, Switch, Label */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Checkbox & Switch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="check1" />
                    <Label htmlFor="check1">Checkbox label</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="switch1" />
                    <Label htmlFor="switch1">Switch label</Label>
                  </div>
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Checkbox } from "@/shared/components/ui/checkbox"`}
                  </code>
                </CardContent>
              </Card>

              {/* Slider, RadioGroup, Toggle, ToggleGroup, Calendar, InputOTP */}
              <FormExamples />
            </div>
          </TabsContent>

          <TabsContent value="data">
            <div className="space-y-6">
              {/* Badge */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Badge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Badge } from "@/shared/components/ui/badge"`}
                  </code>
                </CardContent>
              </Card>

              {/* Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <Card className="max-w-sm">
                    <CardHeader>
                      <CardTitle>Título do Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Conteúdo do card com texto descritivo.
                      </p>
                    </CardContent>
                  </Card>
                  <code className="mt-3 block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"`}
                  </code>
                </CardContent>
              </Card>

              {/* Avatar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avatar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>CD</AvatarFallback>
                    </Avatar>
                  </div>
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"`}
                  </code>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Progress</CardTitle>
                </CardHeader>
                <CardContent className="max-w-md space-y-3">
                  <Progress value={25} />
                  <Progress value={50} />
                  <Progress value={75} />
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Progress } from "@/shared/components/ui/progress"`}
                  </code>
                </CardContent>
              </Card>

              {/* Skeleton */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Skeleton</CardTitle>
                </CardHeader>
                <CardContent className="max-w-md space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Skeleton } from "@/shared/components/ui/skeleton"`}
                  </code>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Empresa Alpha</TableCell>
                        <TableCell>
                          <Badge>Ativo</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Ver <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Empresa Beta</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Pendente</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Ver <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <code className="mt-3 block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"`}
                  </code>
                </CardContent>
              </Card>

              {/* DropdownMenu, ContextMenu, Menubar, Command, Custom Components */}
              <DataExamples />
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-6">
              {/* Alert */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Alert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Info</AlertTitle>
                    <AlertDescription>Mensagem informativa para o usuário.</AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>Algo deu errado. Tente novamente.</AlertDescription>
                  </Alert>
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"`}
                  </code>
                </CardContent>
              </Card>

              {/* Tooltip */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tooltip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Passe o mouse aqui</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Conteúdo do tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                  <code className="block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"`}
                  </code>
                </CardContent>
              </Card>

              {/* Dialog, Sheet, Drawer, AlertDialog, Popover, HoverCard */}
              <FeedbackExamples />
            </div>
          </TabsContent>

          <TabsContent value="layout">
            <div className="space-y-6">
              {/* Tabs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tabs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="tab1">
                    <TabsList>
                      <TabsTrigger value="tab1">Aba 1</TabsTrigger>
                      <TabsTrigger value="tab2">Aba 2</TabsTrigger>
                      <TabsTrigger value="tab3">Aba 3</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" className="p-4 text-sm text-muted-foreground">
                      Conteúdo da aba 1
                    </TabsContent>
                    <TabsContent value="tab2" className="p-4 text-sm text-muted-foreground">
                      Conteúdo da aba 2
                    </TabsContent>
                    <TabsContent value="tab3" className="p-4 text-sm text-muted-foreground">
                      Conteúdo da aba 3
                    </TabsContent>
                  </Tabs>
                  <code className="mt-3 block rounded bg-muted px-2 py-1 text-xs">
                    {`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"`}
                  </code>
                </CardContent>
              </Card>

              {/* Accordion, Breadcrumb, Collapsible, Pagination, ScrollArea, Separator, Resizable, Carousel */}
              <LayoutExamples />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function PatternsSection() {
  const { toast } = useToast();
  const [showSkeleton, setShowSkeleton] = useState(false);

  return (
    <section id="patterns" className="space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          Padrões de Uso
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Padrões comuns usados no projeto para feedback, loading e confirmação.
        </p>
      </div>

      {/* Toast */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">useToast()</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Import:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {'import { useToast } from "@/shared/hooks/use-toast"'}
            </code>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast({ title: "Sucesso", description: "Operação realizada com sucesso" })
              }
            >
              Toast Default
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast({
                  title: "Erro",
                  description: "Algo deu errado. Tente novamente.",
                  variant: "destructive",
                })
              }
            >
              Toast Destructive
            </Button>
          </div>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{`const { toast } = useToast();

// Sucesso
toast({
  title: "Sucesso",
  description: "Operação realizada com sucesso",
});

// Erro
toast({
  title: "Erro",
  description: "Algo deu errado",
  variant: "destructive",
});`}</pre>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Loading com Skeleton</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" size="sm" onClick={() => setShowSkeleton((v) => !v)}>
            {showSkeleton ? "Mostrar conteúdo" : "Simular loading"}
          </Button>
          <div className="max-w-md space-y-2">
            {showSkeleton ? (
              <>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <p className="font-medium">Lista de clientes</p>
                <p className="text-sm text-muted-foreground">3 resultados encontrados</p>
                <div className="rounded-md border p-3 text-sm">Empresa Alpha</div>
                <div className="rounded-md border p-3 text-sm">Empresa Beta</div>
                <div className="rounded-md border p-3 text-sm">Empresa Gamma</div>
              </>
            )}
          </div>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{`import { Skeleton } from "@/shared/components/ui/skeleton";

if (isLoading) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}`}</pre>
        </CardContent>
      </Card>

      {/* AlertDialog */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Confirmação com AlertDialog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Usar para ações destrutivas (exclusão, cancelamento).
          </p>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{`import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">Excluir</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita. Tem certeza?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}</pre>
        </CardContent>
      </Card>

      {/* TanStack Query pattern */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Padrão TanStack Query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Padrão para hooks de query e mutation usados no projeto.
          </p>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{`// Hook de leitura
import { useQuery } from "@tanstack/react-query";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Erro ao carregar");
      return res.json();
    },
  });
}

// Hook de escrita
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Sucesso", description: "Cliente criado" });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}`}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function StyleGuides() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 p-6">
      <header>
        <h1 className="text-3xl font-bold">Style Guides</h1>
        <p className="mt-2 text-muted-foreground">
          Documentação viva do design system. Consulte antes de criar qualquer UI.
        </p>
      </header>

      {/* Quick nav */}
      <nav className="flex flex-wrap gap-2">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </a>
        ))}
      </nav>

      <Separator />

      <ColorsSection />
      <Separator />
      <TypographySection />
      <Separator />
      <ElevationSection />
      <Separator />
      <SpacingSection />
      <Separator />
      <ComponentsSection />
      <Separator />
      <PatternsSection />
    </div>
  );
}
