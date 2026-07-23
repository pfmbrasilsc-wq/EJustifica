import React from "react";
import { loadDatabase } from "../gasSimulator";

interface HistoryViewProps {
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const db = loadDatabase();

  // Cross reference justificativas with atestados and alunos
  const historyItems = db.justificativas.map((j) => {
    const atestado = db.atestados.find((a) => a.idAtestado === j.idAtestado);
    const aluno = atestado
      ? db.alunos.find((al) => al.matricula === atestado.matricula)
      : null;

    return {
      idJustificativa: j.idJustificativa,
      idAtestado: j.idAtestado,
      estudante: aluno?.estudante || "Estudante Não Identificado",
      turma: aluno?.turma || "N/A",
      dias: atestado?.diasAfastamento || 1,
      observacao: atestado?.observacao || "",
      dataInicio: atestado?.dataInicio || "",
      dataFim: atestado?.dataFim || "",
      dataHoraBaixa: new Date(j.dataHoraBaixa).toLocaleString("pt-BR"),
      status: j.status,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-[#c3c6d7] overflow-hidden shadow-xs p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#c3c6d7]">
        <div>
          <h2 className="text-xl font-bold text-[#004ac6] flex items-center gap-2">
            <span className="material-symbols-outlined">history</span>
            <span>Histórico de Atestados Justificados</span>
          </h2>
          <p className="text-xs text-[#434655]">
            Atestados baixados na aba{" "}
            <code className="bg-[#e5eeff] px-1 rounded">
              Justificativas_Professores
            </code>
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#e5eeff] text-[#004ac6] hover:bg-[#d3e4fe] font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Voltar ao Início</span>
        </button>
      </div>

      {historyItems.length === 0 ? (
        <div className="p-12 text-center text-[#434655]">
          <span className="material-symbols-outlined text-4xl text-[#c3c6d7] mb-2">
            history_toggle_off
          </span>
          <p className="font-bold">Nenhum histórico registrado ainda.</p>
          <p className="text-xs">
            Ao clicar em "Marcar como Justificado", os atestados aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#c3c6d7] text-xs font-bold text-[#434655] uppercase">
                <th className="p-3">ID Justificativa</th>
                <th className="p-3">Estudante</th>
                <th className="p-3">Turma</th>
                <th className="p-3">Período</th>
                <th className="p-3">Data / Hora Baixa</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d7] text-sm text-[#0b1c30]">
              {historyItems.map((item) => (
                <tr key={item.idJustificativa} className="hover:bg-[#f8f9ff]">
                  <td className="p-3 font-mono text-xs font-bold text-[#004ac6]">
                    {item.idJustificativa}
                  </td>
                  <td className="p-3 font-bold">{item.estudante}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#e5eeff] text-[#004ac6] font-bold rounded text-xs">
                      Turma {item.turma}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-[#434655]">
                    {item.dataInicio} a {item.dataFim} ({item.dias} dias)
                  </td>
                  <td className="p-3 text-xs font-medium text-[#434655]">
                    {item.dataHoraBaixa}
                  </td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-1 bg-[#7cf994] text-[#007230] font-bold text-xs rounded-full inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        check
                      </span>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
