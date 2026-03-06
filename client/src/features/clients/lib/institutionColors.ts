export const institutionColors: Record<string, { bg: string; text: string; border: string }> = {
  Itaú: { bg: "bg-orange-900/50", text: "text-orange-300", border: "border-orange-800" },
  XP: { bg: "bg-yellow-900/50", text: "text-yellow-300", border: "border-yellow-800" },
  BTG: { bg: "bg-blue-900/50", text: "text-blue-300", border: "border-blue-800" },
  Santander: { bg: "bg-red-900/50", text: "text-red-300", border: "border-red-800" },
  Safra: { bg: "bg-indigo-900/50", text: "text-indigo-300", border: "border-indigo-800" },
  Inter: { bg: "bg-green-900/50", text: "text-green-300", border: "border-green-800" },
  Bradesco: { bg: "bg-rose-900/50", text: "text-rose-300", border: "border-rose-800" },
  Nubank: { bg: "bg-purple-900/50", text: "text-purple-300", border: "border-purple-800" },
};

const defaultColor = { bg: "bg-gray-900/50", text: "text-gray-300", border: "border-gray-700" };

export function getInstitutionColor(institution: string) {
  return institutionColors[institution] || defaultColor;
}
