import React, { useState } from "react";
import { AtestadoPendenteDTO } from "../gasSimulator";

interface PendingTableProps {
  atestados: AtestadoPendenteDTO[];
  loading: boolean;
  onJustificar: (idAtestado: string) => Promise<void>;
  selectedTurma: string;
}

export const PendingTable: React.FC<PendingTableProps> = ({
  atestados,
  loading,
  onJustificar,
  selectedTurma,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter items based on search and turma
  const filtered = atestados.filter((item) => {
    const matchesTurma =
      selectedTurma === "TODAS" || item.turma === selectedTurma;
    const matchesQuery =
      item.estudante.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.observacao.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTurma && matchesQuery;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((p) => p.idAtestado));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleJustifyClick = async (idAtestado: string) => {
    setSavingId(idAtestado);
    try {
      await onJustificar(idAtestado);
    } finally {
      setSavingId(null);
    }
  };

  const handleJustifySelectedBatch = async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await handleJustifyClick(id);
    }
    setSelectedIds([]);
  };

  return (
    <section className="bg-white rounded-xl border border-[#c3c6d7] overflow-hidden shadow-xs">
      {/* Table Header Controls */}
      <div className="px-6 py-4 border-b border-[#c3c6d7] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#eff4ff]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[#0b1c30]">
            Lista de Pendências
          </h2>
          {selectedTurma !== "TODAS" && (
            <span className="text-xs font-bold px-2.5 py-0.5 bg-[#d3e4fe] text-[#004ac6] rounded-full">
              Turma {selectedTurma}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar aluno..."
              className="w-full pl-9 pr-4 py-1.5 border border-[#c3c6d7] rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Batch Justify Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleJustifySelectedBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#006e2d] hover:bg-[#005320] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              <span>Justificar ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-9 h-9 border-4 border-[#004ac6] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm font-semibold text-[#0b1c30]">
            Buscando dados na planilha Google Sheets...
          </p>
          <p className="text-xs text-[#434655] mt-1">
            Executando <code className="bg-[#e5eeff] px-1 rounded">getAtestadosPendentes()</code>
          </p>
        </div>
      ) : paginated.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-[#7cf994] rounded-full flex items-center justify-center text-[#007230] mb-3">
            <span className="material-symbols-outlined text-3xl">verified</span>
          </div>
          <h3 className="text-base font-bold text-[#0b1c30]">
            Nenhum atestado pendente encontrado!
          </h3>
          <p className="text-xs text-[#434655] max-w-md mt-1">
            Todos os atestados desta seleção foram devidamente verificados e baixados no Google Sheets.
          </p>
        </div>
      ) : (
        /* Table List */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#c3c6d7] text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                <th className="px-6 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                  />
                </th>
                <th className="px-2 py-2.5">Estudante / Atestado</th>
                <th className="px-6 py-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d7]">
              {paginated.map((item) => {
                const isSaving = savingId === item.idAtestado;
                const isSelected = selectedIds.includes(item.idAtestado);

                return (
                  <tr
                    key={item.idAtestado}
                    className={`hover:bg-[#eff4ff] transition-all duration-200 ${
                      isSelected ? "bg-[#e5eeff]/50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 align-top pt-5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(item.idAtestado)}
                        className="w-4 h-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                      />
                    </td>

                    <td className="px-2 py-4">
                      <div className="flex flex-col gap-1.5">
                        {/* Student Name & Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-base text-[#0b1c30]">
                            {item.estudante}
                          </span>
                          <span className="px-2 py-0.5 bg-[#ffddb8] text-[#653e00] rounded-full text-[10px] font-bold uppercase border border-[#ffb95f]">
                            PENDENTE
                          </span>
                          <span className="px-2 py-0.5 bg-[#dbe1ff] text-[#00174b] font-bold rounded text-xs">
                            {item.diasAfastamento}{" "}
                            {item.diasAfastamento === 1 ? "dia" : "dias"}
                          </span>
                          <span className="px-2 py-0.5 bg-[#e5eeff] text-[#004ac6] font-bold rounded text-xs">
                            Turma {item.turma}
                          </span>
                        </div>

                        {/* Dates and Observation Quote */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#434655]">
                          <div className="flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-sm text-[#004ac6]">
                              calendar_today
                            </span>
                            <span>
                              {item.dataInicio} - {item.dataFim}
                            </span>
                          </div>
                          <span className="text-[#c3c6d7]">|</span>
                          <span className="italic truncate max-w-xl text-[#0b1c30]/80">
                            "{item.observacao}"
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 align-middle text-right whitespace-nowrap">
                      <button
                        disabled={isSaving}
                        onClick={() => handleJustifyClick(item.idAtestado)}
                        className={`px-4 py-2 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ml-auto ${
                          isSaving
                            ? "bg-[#c3c6d7] text-[#434655] cursor-not-allowed"
                            : "bg-[#006e2d] hover:bg-[#005320] active:scale-95 text-white"
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Salvando...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-base">
                              check_circle
                            </span>
                            <span>Marcar como Justificado</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer / Pagination */}
      <div className="px-6 py-3 bg-[#f8f9ff] border-t border-[#c3c6d7] flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-xs font-semibold text-[#434655]">
          Mostrando {paginated.length} de {filtered.length} resultados pendentes
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded hover:bg-[#d3e4fe] disabled:opacity-30 disabled:hover:bg-transparent text-[#434655]"
            >
              <span className="material-symbols-outlined text-base">
                chevron_left
              </span>
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                    currentPage === page
                      ? "bg-[#004ac6] text-white"
                      : "hover:bg-[#d3e4fe] text-[#434655]"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded hover:bg-[#d3e4fe] disabled:opacity-30 disabled:hover:bg-transparent text-[#434655]"
            >
              <span className="material-symbols-outlined text-base">
                chevron_right
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
