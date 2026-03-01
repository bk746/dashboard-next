import { FaChartLine } from "react-icons/fa";

interface BeneficeNetCardProps {
  beneficeNet: number;
}

export default function BeneficeNetCard({ beneficeNet }: BeneficeNetCardProps) {
  return (
    <div className="rounded-2xl md:rounded-xl p-6 md:p-5 h-full flex justify-between overflow-hidden transition-all duration-300 ease-out
      bg-white md:bg-linear-to-br md:from-[#f6f6f6] md:via-[#f6f6f6] md:to-[#ED8600] border border-neutral-300 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] md:shadow-2xl md:shadow-[#0000002b] hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.08)] md:hover:shadow-2xl md:hover:shadow-[#0000002b] hover:scale-[1.01] md:hover:scale-103">
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className="text-gray-500 md:text-[#ED8600] text-xs md:text-lg font-medium md:font-bold uppercase md:normal-case tracking-widest md:tracking-normal">Bénéfice net</p>
        <p className="text-gray-800 md:text-gray-500 text-3xl md:text-[clamp(28px,3vw,40px)] font-bold md:font-semibold tracking-tight tabular-nums">{beneficeNet.toLocaleString("fr-FR")} €</p>
        <div className="flex flex-wrap gap-2 items-center mt-1 md:mt-2">
          <span className={`inline-flex px-2.5 py-1 rounded-lg md:rounded-full text-sm font-medium ${beneficeNet >= 0 ? "text-emerald-700 bg-emerald-500/10 md:bg-green-700 md:text-white" : "text-red-700 bg-red-500/10 md:bg-red-700 md:text-white"}`}>
            {beneficeNet >= 0 ? "+" : ""}{beneficeNet.toLocaleString("fr-FR")} €
          </span>
          <span className="text-gray-400 md:text-gray-500 text-xs md:text-sm">bénéfice net</span>
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaChartLine className="h-10 w-10 sm:h-11 sm:w-11 text-[#ED8600]/80" />
      </div>
    </div>
  );
}
