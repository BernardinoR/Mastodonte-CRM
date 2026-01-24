import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <LayoutDashboard className="w-16 h-16 text-gray-600 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-300 mb-2">Dashboard</h1>
      <p className="text-gray-500 max-w-md">
        Esta página será usada para exibir métricas e resumos do CRM.
      </p>
    </div>
  );
}
