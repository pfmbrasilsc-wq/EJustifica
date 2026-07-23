import React from "react";

interface SummaryCardsProps {
  pendentesCount: number;
  justificadosHojeCount: number;
  onFilterPendentesClick?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  pendentesCount,
  justificadosHojeCount,
  onFilterPendentesClick,
}) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Atestados Pendentes Card */}
      <div
        onClick={onFilterPendentesClick}
        className="bg-white p-6 rounded-xl border border-[#c3c6d7] relative overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300"
      >
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="text-xs font-bold text-[#434655] uppercase tracking-wider mb-1">
              Atestados Pendentes
            </h3>
            <p className="text-4xl font-black text-[#004ac6] tracking-tight">
              {String(pendentesCount).padStart(2, "0")}
            </p>
            <p className="text-xs text-[#434655] font-medium mt-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#ba1a1a]">
                error_outline
              </span>
              <span>Ação necessária imediata</span>
            </p>
          </div>
          <div className="w-14 h-14 bg-[#ffdad6] rounded-full flex items-center justify-center text-[#93000a] shadow-xs">
            <span className="material-symbols-outlined text-2xl">
              pending_actions
            </span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
          <span className="material-symbols-outlined text-[130px] text-[#004ac6]">
            analytics
          </span>
        </div>
      </div>

      {/* Justificados Hoje Card */}
      <div className="bg-white p-6 rounded-xl border border-[#c3c6d7] relative overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="text-xs font-bold text-[#434655] uppercase tracking-wider mb-1">
              Justificados Hoje
            </h3>
            <p className="text-4xl font-black text-[#006e2d] tracking-tight">
              {String(justificadosHojeCount).padStart(2, "0")}
            </p>
            <p className="text-xs text-[#434655] font-medium mt-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#006e2d]">
                check_circle
              </span>
              <span>Fluxo atualizado</span>
            </p>
          </div>
          <div className="w-14 h-14 bg-[#7cf994] rounded-full flex items-center justify-center text-[#007230] shadow-xs">
            <span className="material-symbols-outlined text-2xl">
              task_alt
            </span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
          <span className="material-symbols-outlined text-[130px] text-[#006e2d]">
            event_available
          </span>
        </div>
      </div>
    </section>
  );
};
