import React from "react";

interface HeaderProps {
  selectedTurma: string;
  setSelectedTurma: (turma: string) => void;
  turmasDisponiveis: string[];
  onOpenCodeModal: () => void;
  onLogout?: () => void;
  planilhaNome?: string;
}

export const Header: React.FC<HeaderProps> = ({
  selectedTurma,
  setSelectedTurma,
  turmasDisponiveis,
  onOpenCodeModal,
  onLogout,
  planilhaNome = "Planilha Oficial de Atestados da Escola",
}) => {
  return (
    <header className="w-full top-0 sticky bg-[#f8f9ff]/95 backdrop-blur-md border-b border-[#c3c6d7] z-40">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <span className="text-2xl font-black tracking-tight text-[#004ac6]">
            Justifica-E
          </span>

          {/* Turma Selector */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e5eeff] border border-[#c3c6d7] rounded-lg hover:bg-[#d3e4fe] transition-colors">
              <span className="text-xs font-semibold text-[#434655]">Turma:</span>
              <select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="bg-transparent font-bold text-sm text-[#004ac6] outline-none cursor-pointer pr-1"
              >
                <option value="TODAS">Todas as Turmas</option>
                {turmasDisponiveis.map((t) => (
                  <option key={t} value={t}>
                    Turma {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Action Code Button for mobile/tablet */}
          <button
            onClick={onOpenCodeModal}
            className="md:hidden flex items-center gap-1 text-xs px-2.5 py-1 bg-[#e5eeff] text-[#004ac6] border border-[#b4c5ff] font-bold rounded-lg"
          >
            <span className="material-symbols-outlined text-sm">code</span>
            <span>Code.gs</span>
          </button>

          <button
            title="Notificações"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#434655] hover:bg-[#eff4ff] transition-colors relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
          </button>

          <div className="w-px h-8 bg-[#c3c6d7] hidden sm:block"></div>

          <div className="hidden lg:flex items-center gap-2 text-xs bg-[#e5eeff] px-3 py-1.5 rounded-lg border border-[#b4c5ff]">
            <span className="material-symbols-outlined text-sm text-[#004ac6]">table_chart</span>
            <span className="text-[#434655]">Planilha:</span>
            <span className="font-bold text-[#004ac6] truncate max-w-[180px]">{planilhaNome}</span>
            <span className="flex h-2 w-2 rounded-full bg-[#006e2d] animate-pulse ml-1" title="Conexão com Google Sheets Operacional"></span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sair e voltar para a Tela de Conexão com a Planilha"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab] hover:bg-[#ffb4ab]/50 rounded-lg text-xs font-bold transition-all ml-1"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Desconectar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
