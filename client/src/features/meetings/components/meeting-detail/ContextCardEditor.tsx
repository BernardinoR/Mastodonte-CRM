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
    <div className="group relative flex items-start gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg transition-all hover:bg-[#1e1e1e] hover:border-[#333333]">
      <div className="flex-shrink-0 mt-0.5">
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
        className="flex-1 bg-transparent border-none outline-none text-[0.8125rem] text-[#b0b0b0] leading-[1.5] resize-none font-inherit placeholder:text-[#555555]"
      />

      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 w-5 h-5 bg-transparent border-none rounded flex items-center justify-center text-[#555555] cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:bg-[#3d2424] hover:text-[#ef4444]"
      >
        <X className="w-3 h-3" />
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
    <div className="p-4 pt-4 bg-[#151515] border-t border-[#2a2a2a]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[#a78bfa]">
          CONTEXTO DA CLIENTE -
        </span>
        <input
          type="text"
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          placeholder="NOME"
          className="bg-transparent border-none outline-none text-[0.6875rem] font-semibold uppercase tracking-wider text-[#a78bfa] w-32 placeholder:text-[#7c5cbf]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        className="mt-3 w-full flex items-center justify-center gap-2 p-4 bg-transparent border-2 border-dashed border-[#2a2a2a] rounded-lg text-[#555555] text-[0.8125rem] cursor-pointer transition-all hover:bg-[#1a1a1a] hover:border-[#444444] hover:text-[#888888]"
      >
        <span className="text-lg">+</span>
        Adicionar contexto
      </button>
    </div>
  );
}
