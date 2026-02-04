import { X } from "lucide-react";
import { IconPicker, getIconComponent, type IconName } from "./IconPicker";

export interface ContextCardData {
  id: string;
  icon: IconName | null;
  text: string;
}

interface ContextCardEditorProps {
  card: ContextCardData;
  onChange: (card: ContextCardData) => void;
  onRemove: () => void;
}

export function ContextCardEditor({ card, onChange, onRemove }: ContextCardEditorProps) {
  const IconComponent = card.icon ? getIconComponent(card.icon) : null;

  return (
    <div className="group relative flex items-start gap-3 rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-4 transition-all hover:border-[#444444] hover:bg-[#222222]">
      <div className="mt-0.5 flex-shrink-0">
        <IconPicker
          selectedIcon={card.icon}
          onSelect={(iconName) => onChange({ ...card, icon: iconName })}
        />
      </div>

      <textarea
        value={card.text}
        onChange={(e) => onChange({ ...card, text: e.target.value })}
        placeholder="Descreva um contexto relevante..."
        rows={2}
        className="font-inherit flex-1 resize-none border-none bg-transparent text-[0.8125rem] leading-[1.5] text-[#b0b0b0] outline-none placeholder:text-[#555555]"
      />

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded border-none bg-transparent text-[#555555] opacity-0 transition-all hover:bg-[#3d2424] hover:text-[#ef4444] group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

interface ContextSectionEditorProps {
  clientName: string;
  onClientNameChange: (name: string) => void;
  cards: ContextCardData[];
  onCardsChange: (cards: ContextCardData[]) => void;
}

export function ContextSectionEditor({
  clientName,
  onClientNameChange,
  cards,
  onCardsChange,
}: ContextSectionEditorProps) {
  const addCard = () => {
    const newCard: ContextCardData = {
      id: crypto.randomUUID(),
      icon: null,
      text: "",
    };
    onCardsChange([...cards, newCard]);
  };

  const updateCard = (index: number, updatedCard: ContextCardData) => {
    const newCards = [...cards];
    newCards[index] = updatedCard;
    onCardsChange(newCards);
  };

  const removeCard = (index: number) => {
    onCardsChange(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-[#3a3a3a] bg-[#1a1a1a] p-4 pt-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[#a78bfa]">
          CONTEXTO DA CLIENTE -
        </span>
        <input
          type="text"
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          placeholder="NOME"
          className="w-32 border-none bg-transparent text-[0.6875rem] font-semibold uppercase tracking-wider text-[#a78bfa] outline-none placeholder:text-[#7c5cbf]"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {cards.map((card, index) => (
          <ContextCardEditor
            key={card.id}
            card={card}
            onChange={(updatedCard) => updateCard(index, updatedCard)}
            onRemove={() => removeCard(index)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addCard}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#3a3a3a] bg-transparent p-4 text-[0.8125rem] text-[#555555] transition-all hover:border-[#444444] hover:bg-[#1a1a1a] hover:text-[#888888]"
      >
        <span className="text-lg">+</span>
        Adicionar contexto
      </button>
    </div>
  );
}
