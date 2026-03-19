const palette = [
  { bg: "bg-blue-900/50", text: "text-blue-300", border: "border-blue-800" },
  { bg: "bg-purple-900/50", text: "text-purple-300", border: "border-purple-800" },
  { bg: "bg-green-900/50", text: "text-green-300", border: "border-green-800" },
  { bg: "bg-rose-900/50", text: "text-rose-300", border: "border-rose-800" },
  { bg: "bg-amber-900/50", text: "text-amber-300", border: "border-amber-800" },
  { bg: "bg-teal-900/50", text: "text-teal-300", border: "border-teal-800" },
  { bg: "bg-indigo-900/50", text: "text-indigo-300", border: "border-indigo-800" },
  { bg: "bg-pink-900/50", text: "text-pink-300", border: "border-pink-800" },
  { bg: "bg-cyan-900/50", text: "text-cyan-300", border: "border-cyan-800" },
  { bg: "bg-orange-900/50", text: "text-orange-300", border: "border-orange-800" },
  { bg: "bg-violet-900/50", text: "text-violet-300", border: "border-violet-800" },
  { bg: "bg-fuchsia-900/50", text: "text-fuchsia-300", border: "border-fuchsia-800" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getClientAvatarColor(name: string) {
  return palette[hashString(name) % palette.length];
}
