// app/[lang]/(dashboard)/list/energy/page.tsx
import EnergyPriceChart from "@/components/EnergyPriceChart";

export default function EnergyPage() {
  return (
    <div className="p-4 bg-white rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold"></h1>
      </div>
      <EnergyPriceChart />
    </div>
  );
}