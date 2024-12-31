// app/[lang]/(dashboard)/list/calculator/page.tsx
import CalculatorContainer from "@/components/CalculatorContainer";

export default function CalculatorPage() {
  return (
    <div className="p-4 bg-white rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold"></h1>
      </div>
      <CalculatorContainer />
    </div>
  );
}