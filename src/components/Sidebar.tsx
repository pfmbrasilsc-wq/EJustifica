import React from "react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCodeModal: () => void;
  onOpenNewModal: () => void;
  profEmail: string;
  profName: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCodeModal,
  onOpenNewModal,
  profEmail,
  profName,
  onLogout,
}) => {
  return (
    <aside className="hidden md:flex h-full w-72 fixed left-0 top-0 bg-[#f8f9ff] border-r border-[#c3c6d7] flex-col gap-1 p-4 z-50">
      <div className="px-4 py-6 mb-2 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#004ac6] tracking-tight">
          Justifica-E
        </h1>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#dbe1ff] text-[#00174b] rounded-full">
          v2.0 GAS
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {/* Início */}
        <button
          onClick={() => setCurrentTab("inicio")}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-left font-medium text-sm ${
            currentTab === "inicio"
              ? "bg-[#7cf994] text-[#007230] font-bold shadow-sm"
              : "text-[#434655] hover:bg-[#d3e4fe]"
          }`}
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span>Início</span>
        </button>

        {/* Pendentes */}
        <button
          onClick={() => setCurrentTab("pendentes")}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-left font-medium text-sm ${
            currentTab === "pendentes"
              ? "bg-[#7cf994] text-[#007230] font-bold shadow-sm"
              : "text-[#434655] hover:bg-[#d3e4fe]"
          }`}
        >
          <span className="material-symbols-outlined text-xl">pending_actions</span>
          <span>Pendentes</span>
        </button>

        {/* Histórico */}
        <button
          onClick={() => setCurrentTab("historico")}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-left font-medium text-sm ${
            currentTab === "historico"
              ? "bg-[#7cf994] text-[#007230] font-bold shadow-sm"
              : "text-[#434655] hover:bg-[#d3e4fe]"
          }`}
        >
          <span className="material-symbols-outlined text-xl">history</span>
          <span>Histórico</span>
        </button>

        {/* Ver Código Code.gs & Index.html */}
        <button
          onClick={onOpenCodeModal}
          className="flex items-center gap-3 px-4 py-2.5 text-[#004ac6] bg-[#e5eeff] hover:bg-[#d3e4fe] border border-[#b4c5ff] rounded-full transition-all text-left font-bold text-sm mt-2"
        >
          <span className="material-symbols-outlined text-xl">code</span>
          <span>Código Code.gs / HTML</span>
        </button>

        {/* Cadastrar Atestado */}
        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-3 px-4 py-2.5 text-white bg-[#004ac6] hover:bg-[#003ea8] rounded-full transition-all text-left font-bold text-sm mt-1 shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span>Novo Atestado</span>
        </button>
      </nav>

      {/* Profile Card / Footer */}
      <div className="mt-auto border-t border-[#c3c6d7] pt-4 px-1 flex items-center justify-between">
        <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#eff4ff] transition-colors cursor-pointer overflow-hidden flex-1">
          <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold overflow-hidden shadow-xs shrink-0">
            <span className="text-xs">
              {profName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("") || "JS"}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[#0b1c30] truncate">{profName}</p>
            <p className="text-[10px] text-[#434655] truncate">{profEmail}</p>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            title="Desconectar / Sair para Tela de Login"
            className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-lg transition-colors ml-1"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};
