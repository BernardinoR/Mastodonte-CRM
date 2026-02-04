import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <LayoutDashboard className="mb-4 h-16 w-16 text-gray-600" />
      <h1 className="mb-2 text-2xl font-semibold text-gray-300">Dashboard</h1>
      <p className="max-w-md text-gray-500">
        Esta página será usada para exibir métricas e resumos do CRM.
      </p>
    </div>
  );
}
