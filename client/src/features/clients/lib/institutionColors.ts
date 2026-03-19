export const institutionColors: Record<string, { bg: string; text: string; border: string }> = {
  Avenue: { bg: "bg-green-900/50", text: "text-green-300", border: "border-green-800" },
  BB: { bg: "bg-yellow-900/50", text: "text-yellow-300", border: "border-yellow-800" },
  Bradesco: { bg: "bg-rose-900/50", text: "text-rose-300", border: "border-rose-800" },
  BTG: { bg: "bg-blue-900/50", text: "text-blue-300", border: "border-blue-800" },
  C6: { bg: "bg-zinc-800/50", text: "text-zinc-300", border: "border-zinc-700" },
  Fidelity: { bg: "bg-emerald-900/50", text: "text-emerald-300", border: "border-emerald-800" },
  IB: { bg: "bg-red-900/50", text: "text-red-300", border: "border-red-800" },
  Itaú: { bg: "bg-orange-900/50", text: "text-orange-300", border: "border-orange-800" },
  Santander: { bg: "bg-red-950/50", text: "text-red-400", border: "border-red-900" },
  Smart: { bg: "bg-cyan-900/50", text: "text-cyan-300", border: "border-cyan-800" },
  Toro: { bg: "bg-amber-900/50", text: "text-amber-300", border: "border-amber-800" },
  Warren: { bg: "bg-pink-900/50", text: "text-pink-300", border: "border-pink-800" },
  XP: { bg: "bg-zinc-900/50", text: "text-zinc-300", border: "border-zinc-700" },
  Sicoob: { bg: "bg-teal-900/50", text: "text-teal-300", border: "border-teal-800" },
  Safra: { bg: "bg-indigo-900/50", text: "text-indigo-300", border: "border-indigo-800" },
  Revolut: { bg: "bg-violet-900/50", text: "text-violet-300", border: "border-violet-800" },
  "Mercado Bitcoin": { bg: "bg-lime-900/50", text: "text-lime-300", border: "border-lime-800" },
  Singulare: { bg: "bg-fuchsia-900/50", text: "text-fuchsia-300", border: "border-fuchsia-800" },
};

const defaultColor = { bg: "bg-gray-900/50", text: "text-gray-300", border: "border-gray-700" };

export function getInstitutionColor(institution: string) {
  return institutionColors[institution] || defaultColor;
}
