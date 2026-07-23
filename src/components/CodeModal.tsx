import React, { useState } from "react";
import { CODE_GS_SOURCE, INDEX_HTML_SOURCE } from "../gasCode";

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSetupPlanilha: () => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  onRunSetupPlanilha,
}) => {
  const [activeTab, setActiveTab] = useState<"code" | "html" | "setup">("code");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeToCopy = activeTab === "code" ? CODE_GS_SOURCE : INDEX_HTML_SOURCE;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === "code" ? "Code.gs" : "Index.html";
    const blob = new Blob([codeToCopy], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#c3c6d7] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#004ac6] text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <span className="material-symbols-outlined">integration_instructions</span>
              <span>Código Completo - Google Apps Script (GAS)</span>
            </h3>
            <p className="text-xs text-[#dbe1ff]">
              Copie para o seu projeto no Google Workspace ou baixe os arquivos prontos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-[#003ea8] p-1.5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2 bg-[#eff4ff] border-b border-[#c3c6d7] flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("code")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "code"
                  ? "bg-[#004ac6] text-white shadow-xs"
                  : "bg-white text-[#434655] hover:bg-[#d3e4fe]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">code</span>
              <span>Code.gs (Backend)</span>
            </button>

            <button
              onClick={() => setActiveTab("html")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "html"
                  ? "bg-[#004ac6] text-white shadow-xs"
                  : "bg-white text-[#434655] hover:bg-[#d3e4fe]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">html</span>
              <span>Index.html (Frontend)</span>
            </button>

            <button
              onClick={() => setActiveTab("setup")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "setup"
                  ? "bg-[#006e2d] text-white shadow-xs"
                  : "bg-white text-[#006e2d] hover:bg-[#7cf994]/30"
              }`}
            >
              <span className="material-symbols-outlined text-sm">table_chart</span>
              <span>Instruções & setupPlanilha()</span>
            </button>
          </div>

          {activeTab !== "setup" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 bg-[#e5eeff] hover:bg-[#d3e4fe] text-[#004ac6] border border-[#b4c5ff] font-bold text-xs rounded-lg flex items-center gap-1 transition-all"
              >
                <span className="material-symbols-outlined text-sm">
                  {copied ? "check" : "content_copy"}
                </span>
                <span>{copied ? "Copiado!" : "Copiar Código"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-[#003ea8] text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Baixar {activeTab === "code" ? "Code.gs" : "Index.html"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0b1c30] text-[#eaf1ff]">
          {activeTab === "setup" ? (
            <div className="space-y-6 text-sm text-[#eaf1ff] max-w-3xl mx-auto">
              <div className="bg-[#213145] p-5 rounded-xl border border-[#737686]">
                <h4 className="text-base font-bold text-[#7ffc97] flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined">auto_fix_high</span>
                  <span>1. Inicialização Automática com setupPlanilha()</span>
                </h4>
                <p className="text-xs text-[#c3c6d7] leading-relaxed mb-4">
                  A função <code className="text-[#ffddb8] font-bold">setupPlanilha()</code> em <code className="text-[#ffddb8] font-bold">Code.gs</code> verifica a existência e cria automaticamente as 4 abas estruturadas na planilha ativa do Google Sheets:
                </p>
                <ul className="list-disc pl-5 text-xs text-[#c3c6d7] space-y-1 mb-4">
                  <li><strong className="text-white">Alunos:</strong> [Matricula, Turma, Estudante]</li>
                  <li><strong className="text-white">Professores_Turmas:</strong> [Email_Professor, Nome_Professor, Turma]</li>
                  <li><strong className="text-white">Atestados:</strong> [ID_Atestado, Matricula, Data_Inicio, Data_Fim, Dias_Afastamento, Observacao, Data_Cadastro]</li>
                  <li><strong className="text-white">Justificativas_Professores:</strong> [ID_Justificativa, ID_Atestado, Email_Professor, Data_Hora_Baixa, Status]</li>
                </ul>
                <button
                  onClick={onRunSetupPlanilha}
                  className="px-4 py-2 bg-[#006e2d] hover:bg-[#005320] text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  <span>Executar setupPlanilha() no Simulador Agora</span>
                </button>
              </div>

              <div className="bg-[#213145] p-5 rounded-xl border border-[#737686] space-y-3">
                <h4 className="text-base font-bold text-[#b4c5ff] flex items-center gap-2">
                  <span className="material-symbols-outlined">checklist</span>
                  <span>2. Passo a Passo de Instalação no Google Workspace</span>
                </h4>
                <ol className="list-decimal pl-5 text-xs text-[#c3c6d7] space-y-2">
                  <li>Abra o seu Google Sheets ou crie uma nova planilha vazia.</li>
                  <li>Vá no menu superior: <strong>Extensões &gt; Apps Script</strong>.</li>
                  <li>Substitua todo o conteúdo de <code>Code.gs</code> pelo código da aba <strong>Code.gs (Backend)</strong>.</li>
                  <li>Clique no botão <strong>+</strong> ao lado de Arquivos no Apps Script e adicione um arquivo chamado <strong>Index.html</strong>.</li>
                  <li>Cole o conteúdo da aba <strong>Index.html (Frontend)</strong>.</li>
                  <li>Selecione a função <code>setupPlanilha</code> no topo do Apps Script e clique em <strong>Executar</strong> para criar e formatar as abas automaticamente.</li>
                  <li>Clique em <strong>Implantar &gt; Nova implantação</strong>. Escolha <i>App da Web</i>, marque <i>Executar como: Eu</i> e <i>Quem tem acesso: Qualquer pessoa</i>.</li>
                  <li>Pronto! O link gerado é o seu Web App 100% funcional.</li>
                </ol>
              </div>
            </div>
          ) : (
            <pre className="font-mono text-xs text-[#7ffc97] leading-relaxed whitespace-pre-wrap select-all">
              {codeToCopy}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#eff4ff] border-t border-[#c3c6d7] flex justify-between items-center text-xs text-[#434655]">
          <span>Justifica-E Framework Google Apps Script</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004ac6] text-white font-bold rounded-lg hover:bg-[#003ea8]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
