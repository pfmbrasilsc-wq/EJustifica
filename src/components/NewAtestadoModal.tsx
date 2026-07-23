import React, { useState } from "react";

interface NewAtestadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (dados: {
    matricula: string;
    estudante: string;
    turma: string;
    dataInicio: string;
    dataFim: string;
    diasAfastamento: number;
    observacao: string;
  }) => void;
}

export const NewAtestadoModal: React.FC<NewAtestadoModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [estudante, setEstudante] = useState("");
  const [matricula, setMatricula] = useState("");
  const [turma, setTurma] = useState("3A");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [diasAfastamento, setDiasAfastamento] = useState(1);
  const [observacao, setObservacao] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudante || !matricula || !dataInicio) {
      alert("Por favor, preencha o nome do aluno, matrícula e data de início.");
      return;
    }

    onCreated({
      matricula,
      estudante,
      turma,
      dataInicio: dataInicio.split("-").reverse().join("/"),
      dataFim: dataFim
        ? dataFim.split("-").reverse().join("/")
        : dataInicio.split("-").reverse().join("/"),
      diasAfastamento,
      observacao: observacao || "Atestado registrado via sistema",
    });

    // Reset
    setEstudante("");
    setMatricula("");
    setObservacao("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#c3c6d7] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#c3c6d7] flex justify-between items-center">
          <h3 className="text-base font-bold text-[#004ac6] flex items-center gap-2">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Cadastrar Novo Atestado</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[#434655] hover:text-[#0b1c30] p-1 rounded"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#434655] uppercase mb-1">
              Nome do Estudante
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Gabriel Souza da Silva"
              value={estudante}
              onChange={(e) => setEstudante(e.target.value)}
              className="w-full px-3 py-2 border border-[#c3c6d7] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#004ac6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#434655] uppercase mb-1">
                Matrícula
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 8820193821"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full px-3 py-2 border border-[#c3c6d7] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#004ac6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#434655] uppercase mb-1">
                Turma
              </label>
              <select
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                className="w-full px-3 py-2 border border-[#c3c6d7] rounded-lg text-sm font-bold text-[#004ac6] outline-none focus:ring-2 focus:ring-[#004ac6]"
              >
                <option value="3A">Turma 3A</option>
                <option value="101">Turma 101</option>
                <option value="102">Turma 102</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#434655] uppercase mb-1">
                Início
              </label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-2 py-2 border border-[#c3c6d7] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#004ac6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#434655] uppercase mb-1">
                Término
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-2 py-2 border border-[#c3c6d7] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#004ac6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#434655] uppercase mb-1">
                Dias
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={diasAfastamento}
                onChange={(e) => setDiasAfastamento(Number(e.target.value))}
                className="w-full px-2 py-2 border border-[#c3c6d7] rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-[#004ac6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#434655] uppercase mb-1">
              Observação / Motivo
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Atestado de consulta odontológica com laudo em anexo"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-3 py-2 border border-[#c3c6d7] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#004ac6]"
            />
          </div>

          <div className="pt-3 border-t border-[#c3c6d7] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#434655] hover:bg-[#eff4ff] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Salvar no Google Sheets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
