import { useState } from "react";
import { MessageSquare, Calendar as CalendarIcon, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { DateInput } from "@/shared/components/ui/date-input";
import { useWhatsAppGroups, type WhatsAppGroupStatus } from "@features/tasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UI_CLASSES } from "@features/tasks/lib/statusConfig";
import type { WhatsAppGroup } from "@features/clients";

const STATUS_COLORS: Record<string, string> = {
  Ativo: "bg-[#203828] text-[#6ecf8e]",
  Inativo: "bg-[#333333] text-[#a0a0a0]",
};

interface WhatsAppGroupsTableProps {
  groups: WhatsAppGroup[];
  clientId: string;
  clientName: string;
  onAddGroup?: (group: Omit<WhatsAppGroup, "id">) => void;
  onUpdateGroup?: (groupId: string, updates: Partial<Omit<WhatsAppGroup, "id">>) => void;
  onDeleteGroup?: (groupId: string) => void;
  isAddingExternal?: boolean;
  onCancelAddExternal?: () => void;
}

export function WhatsAppGroupsTable({
  groups,
  clientId,
  clientName,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  isAddingExternal,
  onCancelAddExternal,
}: WhatsAppGroupsTableProps) {
  const [visibleCount, setVisibleCount] = useState(5);

  const {
    isAddingGroup,
    newGroupName,
    setNewGroupName,
    newGroupPurpose,
    setNewGroupPurpose,
    newGroupLink,
    setNewGroupLink,
    newGroupStatus,
    setNewGroupStatus,
    editValue,
    setEditValue,
    datePopoverOpen,
    setDatePopoverOpen,
    statusPopoverOpen,
    setStatusPopoverOpen,
    newStatusPopoverOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    newGroupRowRef,
    datePopoverRef,
    handleStartAddGroup,
    handleCancelAddGroup,
    handleSaveGroup,
    startEditing,
    saveEditing,
    handleEditKeyDown,
    isEditing,
    handleDateChange,
    handleStatusChange,
    handleDeleteClick,
    handleConfirmDelete,
    handleInteractOutside,
    handleNewGroupRowBlur,
    handleNewStatusPopoverChange,
  } = useWhatsAppGroups({
    onAddGroup,
    onUpdateGroup,
    onDeleteGroup,
    isAddingExternal,
    onCancelAddExternal,
  });

  const visibleGroups = groups.slice(0, visibleCount);
  const hasMore = groups.length > visibleCount;
  const remainingCount = groups.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#333333]">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nome do Grupo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Finalidade
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Link
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Data Criação
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleGroups.map((group) => (
            <tr
              key={group.id}
              className="group/row border-b border-[#333333]"
              onContextMenu={(e) => {
                e.preventDefault();
                handleDeleteClick(group.id, group.name);
              }}
            >
              <td className="px-4 py-3">
                <div className="relative flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span
                    className={`-mx-1 cursor-pointer rounded px-1 py-0.5 font-medium text-foreground transition-colors hover:bg-[#2c2c2c] ${isEditing(group.id, "name") ? "invisible" : ""}`}
                    onClick={() => startEditing(group.id, "name", group.name)}
                    data-testid={`cell-group-name-${group.id}`}
                  >
                    {group.name}
                  </span>
                  {isEditing(group.id, "name") && (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={saveEditing}
                      className="absolute bottom-0 left-6 right-0 top-0 border-b border-[#2eaadc] bg-transparent text-sm font-medium text-foreground focus:outline-none"
                      autoFocus
                      data-testid={`input-edit-group-name-${group.id}`}
                    />
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="relative">
                  <div
                    className={`-mx-1 cursor-pointer rounded px-1 py-0.5 text-foreground transition-colors hover:bg-[#2c2c2c] ${isEditing(group.id, "purpose") ? "invisible" : ""}`}
                    onClick={() => startEditing(group.id, "purpose", group.purpose)}
                    data-testid={`cell-group-purpose-${group.id}`}
                  >
                    {group.purpose || (
                      <span className="italic text-muted-foreground">Sem finalidade</span>
                    )}
                  </div>
                  {isEditing(group.id, "purpose") && (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={saveEditing}
                      className="absolute inset-0 border-b border-[#2eaadc] bg-transparent text-sm text-foreground focus:outline-none"
                      autoFocus
                      data-testid={`input-edit-group-purpose-${group.id}`}
                    />
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="relative flex items-center gap-2">
                  <div className={isEditing(group.id, "link") ? "invisible" : ""}>
                    {group.link ? (
                      <a
                        href={group.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2eaadc] hover:underline"
                        data-testid={`link-whatsapp-group-${group.id}`}
                      >
                        Abrir grupo
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Arquivado</span>
                    )}
                  </div>
                  <button
                    onClick={() => startEditing(group.id, "link", group.link || "")}
                    className={`rounded p-1 transition-all hover:bg-[#333333] ${isEditing(group.id, "link") ? "invisible" : "opacity-0 group-hover/row:opacity-100"}`}
                    data-testid={`button-edit-group-link-${group.id}`}
                  >
                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {isEditing(group.id, "link") && (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={saveEditing}
                      placeholder="https://..."
                      className="absolute inset-0 border-b border-[#2eaadc] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      autoFocus
                      data-testid={`input-edit-group-link-${group.id}`}
                    />
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <Popover
                  open={datePopoverOpen === group.id}
                  onOpenChange={(open) => setDatePopoverOpen(open ? group.id : null)}
                >
                  <PopoverTrigger asChild>
                    <div
                      className="-mx-1 inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-foreground transition-colors hover:bg-[#2c2c2c]"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`cell-group-date-${group.id}`}
                    >
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {format(group.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    ref={datePopoverRef}
                    className={`w-auto p-0 ${UI_CLASSES.popover}`}
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    onInteractOutside={handleInteractOutside}
                    onPointerDownOutside={handleInteractOutside}
                    onFocusOutside={handleInteractOutside}
                  >
                    <DateInput
                      value={format(group.createdAt, "yyyy-MM-dd")}
                      onChange={(date) => handleDateChange(group.id, date)}
                      className="font-semibold"
                      dataTestId={`input-date-group-${group.id}`}
                      hideIcon
                      commitOnInput={false}
                    />
                  </PopoverContent>
                </Popover>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Popover
                    open={statusPopoverOpen === group.id}
                    onOpenChange={(open) => setStatusPopoverOpen(open ? group.id : null)}
                  >
                    <PopoverTrigger asChild>
                      <div
                        className="inline-block cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`cell-group-status-${group.id}`}
                      >
                        <Badge
                          className={`${STATUS_COLORS[group.status]} cursor-pointer text-xs transition-opacity hover:opacity-80`}
                        >
                          {group.status}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className={`w-44 p-0 ${UI_CLASSES.popover}`}
                      side="bottom"
                      align="start"
                      sideOffset={6}
                    >
                      <div className="w-full">
                        <div className={`border-b ${UI_CLASSES.border}`}>
                          <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                          <div className="px-3 py-1">
                            <div
                              className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${UI_CLASSES.selectedItem}`}
                            >
                              <Badge className={`${STATUS_COLORS[group.status]} text-xs`}>
                                {group.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                        <div className="pb-1">
                          {(["Ativo", "Inativo"] as const)
                            .filter((s) => s !== group.status)
                            .map((s) => (
                              <div
                                key={s}
                                className={UI_CLASSES.dropdownItem}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(group.id, s);
                                }}
                              >
                                <Badge className={`${STATUS_COLORS[s]} text-xs`}>{s}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <button
                    onClick={() => handleDeleteClick(group.id, group.name)}
                    className="rounded p-1 opacity-0 transition-all hover:bg-[#3a2020] group-hover/row:opacity-100"
                    data-testid={`button-delete-group-${group.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {isAddingGroup && (
            <tr
              ref={newGroupRowRef}
              tabIndex={-1}
              className="group/row border-b border-[#333333]"
              onBlur={handleNewGroupRowBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newGroupName.trim()) {
                  e.preventDefault();
                  handleSaveGroup();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  handleCancelAddGroup();
                }
              }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nome do grupo"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newGroupName.trim()) handleSaveGroup();
                      if (e.key === "Escape") handleCancelAddGroup();
                    }}
                    className="flex-1 border-b border-[#2eaadc] bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                    autoFocus
                    data-testid="input-new-group-name"
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="Finalidade (opcional)"
                  value={newGroupPurpose}
                  onChange={(e) => setNewGroupPurpose(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newGroupName.trim()) handleSaveGroup();
                    if (e.key === "Escape") handleCancelAddGroup();
                  }}
                  className="w-full border-b border-[#2eaadc] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  data-testid="input-new-group-purpose"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="Link (opcional)"
                  value={newGroupLink}
                  onChange={(e) => setNewGroupLink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newGroupName.trim()) handleSaveGroup();
                    if (e.key === "Escape") handleCancelAddGroup();
                  }}
                  className="w-full border-b border-[#2eaadc] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  data-testid="input-new-group-link"
                />
              </td>
              <td className="px-4 py-3">
                <div className="inline-flex items-center gap-1.5 text-foreground">
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Popover open={newStatusPopoverOpen} onOpenChange={handleNewStatusPopoverChange}>
                    <PopoverTrigger asChild>
                      <div
                        className="inline-block cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        data-testid="cell-new-group-status"
                      >
                        <Badge
                          className={`${STATUS_COLORS[newGroupStatus]} cursor-pointer text-xs transition-opacity hover:opacity-80`}
                        >
                          {newGroupStatus}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className={`w-40 p-0 ${UI_CLASSES.popover}`} align="start">
                      <div className="py-1">
                        <div className={`border-b ${UI_CLASSES.border}`}>
                          <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                          <div className="px-3 py-1">
                            <div
                              className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${UI_CLASSES.selectedItem}`}
                            >
                              <Badge className={`${STATUS_COLORS[newGroupStatus]} text-xs`}>
                                {newGroupStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                        <div className="pb-1">
                          {(["Ativo", "Inativo"] as const)
                            .filter((s) => s !== newGroupStatus)
                            .map((s) => (
                              <div
                                key={s}
                                className={UI_CLASSES.dropdownItem}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewGroupStatus(s);
                                  handleNewStatusPopoverChange(false);
                                }}
                              >
                                <Badge className={`${STATUS_COLORS[s]} text-xs`}>{s}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <button
                    onClick={handleCancelAddGroup}
                    className="rounded p-1 opacity-0 transition-all hover:bg-[#3a2020] group-hover/row:opacity-100"
                    data-testid="button-cancel-new-group"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between">
        <div
          className="cursor-pointer px-4 py-3 text-sm text-[#2eaadc] transition-colors hover:bg-[#2c2c2c]"
          onClick={handleStartAddGroup}
          data-testid="button-add-whatsapp-group"
        >
          + Adicionar grupo
        </div>
        {hasMore && (
          <div
            className="cursor-pointer px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-[#2c2c2c] hover:text-foreground"
            onClick={handleLoadMore}
            data-testid="button-load-more-groups"
          >
            Carregar mais +{Math.min(5, remainingCount)}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteConfirmOpen}
        onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}
      >
        <AlertDialogContent className="border-[#333333] bg-[#252525]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir grupo?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir o grupo "{deleteConfirmOpen?.groupName}"? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#444444] bg-[#333333] text-foreground hover:bg-[#3a3a3a]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="button-confirm-delete-group"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
