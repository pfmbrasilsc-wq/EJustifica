/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { SummaryCards } from "./components/SummaryCards";
import { PendingTable } from "./components/PendingTable";
import { HistoryView } from "./components/HistoryView";
import { NewAtestadoModal } from "./components/NewAtestadoModal";
import { CodeModal } from "./components/CodeModal";
import { LoginScreen } from "./components/LoginScreen";
import {
  getAtestadosPendentesSimulado,
  salvarJustificativaSimulado,
  cadastrarAtestadoSimulado,
  setupPlanilhaSimulada,
  AtestadoPendenteDTO,
} from "./gasSimulator";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState("inicio");
  const [selectedTurma, setSelectedTurma] = useState("TODAS");
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<string[]>([]);

  const [pendentes, setPendentes] = useState<AtestadoPendenteDTO[]>([]);
  const [pendentesCount, setPendentesCount] = useState(0);
  const [justificadosHojeCount, setJustificadosHojeCount] = useState(0);
  const [profEmail, setProfEmail] = useState("joao.silva@escola.edu");
  const [profName, setProfName] = useState("Prof. João Silva");

  const [loading, setLoading] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carregar dados simulando google.script.run.getAtestadosPendentes()
  const fetchAtestados = () => {
    setLoading(true);
    setTimeout(() => {
      const res = getAtestadosPendentesSimulado(profEmail);
      setPendentes(res.pendentes);
      setPendentesCount(res.estatisticas.pendentesTotal);
      setJustificadosHojeCount(res.estatisticas.justificadosHoje);
      if (res.professor) {
        setProfEmail(res.professor.email);
        setProfName(res.professor.nome);
        if (res.professor.turmas && res.professor.turmas.length > 0) {
          setTurmasDisponiveis(res.professor.turmas);
        }
      }
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAtestados();
    }
  }, [isLoggedIn, profEmail]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = (userData: {
    email: string;
    nome: string;
    webAppUrl: string;
    connectionType: string;
  }) => {
    setProfEmail(userData.email);
    setProfName(userData.nome);
    setIsLoggedIn(true);
    showToast("🔓 Conexão estabelecida e autenticada com sucesso!");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast("🔒 Desconectado do sistema.");
  };

  // Salvar justificativa (google.script.run.salvarJustificativa)
  const handleJustificar = async (idAtestado: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const res = salvarJustificativaSimulado(idAtestado, profEmail);
    if (res.success) {
      showToast("✅ Atestado marcado como Justificado e salvo no Google Sheets!");
      fetchAtestados();
    }
  };

  // Criar novo atestado
  const handleCreateAtestado = (dados: {
    matricula: string;
    estudante: string;
    turma: string;
    dataInicio: string;
    dataFim: string;
    diasAfastamento: number;
    observacao: string;
  }) => {
    const res = cadastrarAtestadoSimulado(dados);
    if (res.success) {
      showToast("✨ Novo atestado registrado com sucesso na planilha!");
      fetchAtestados();
    }
  };

  // Rodar setupPlanilha
  const handleRunSetupPlanilha = () => {
    const res = setupPlanilhaSimulada();
    showToast(`📊 ${res.message}`);
    fetchAtestados();
  };

  // If user is not yet logged in / verified connection, show LoginScreen
  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
        />
        <CodeModal
          isOpen={isCodeModalOpen}
          onClose={() => setIsCodeModalOpen(false)}
          onRunSetupPlanilha={handleRunSetupPlanilha}
        />
      </>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-screen text-[#0b1c30] flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#004ac6] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="material-symbols-outlined text-lg">info</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        profEmail={profEmail}
        profName={profName}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="md:ml-72 min-h-screen relative flex flex-col">
        {/* Top Header */}
        <Header
          selectedTurma={selectedTurma}
          setSelectedTurma={setSelectedTurma}
          turmasDisponiveis={turmasDisponiveis}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
          {currentTab === "historico" ? (
            <HistoryView onBack={() => setCurrentTab("inicio")} />
          ) : (
            <>
              {/* Bento Grid Summary Cards */}
              <SummaryCards
                pendentesCount={pendentesCount}
                justificadosHojeCount={justificadosHojeCount}
                onFilterPendentesClick={() => setCurrentTab("inicio")}
              />

              {/* Main Pending Table */}
              <PendingTable
                atestados={pendentes}
                loading={loading}
                onJustificar={handleJustificar}
                selectedTurma={selectedTurma}
              />
            </>
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => setIsNewModalOpen(true)}
          title="Cadastrar Novo Atestado"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#004ac6] text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 border border-[#b4c5ff]"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>

        {/* Mobile Bottom Bar */}
        <nav className="md:hidden sticky bottom-0 w-full z-40 bg-white border-t border-[#c3c6d7] shadow-lg flex justify-around items-center h-16 px-4">
          <button
            onClick={() => setCurrentTab("inicio")}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentTab === "inicio"
                ? "bg-[#7cf994] text-[#007230] font-bold"
                : "text-[#434655]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="text-[10px]">Início</span>
          </button>

          <button
            onClick={() => setCurrentTab("pendentes")}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentTab === "pendentes"
                ? "bg-[#7cf994] text-[#007230] font-bold"
                : "text-[#434655]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              pending_actions
            </span>
            <span className="text-[10px]">Pendentes</span>
          </button>

          <button
            onClick={() => setCurrentTab("historico")}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentTab === "historico"
                ? "bg-[#7cf994] text-[#007230] font-bold"
                : "text-[#434655]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">history</span>
            <span className="text-[10px]">Histórico</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center py-1 px-3 text-[#ba1a1a]"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-[10px]">Sair</span>
          </button>
        </nav>
      </main>

      {/* Code Modal */}
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onRunSetupPlanilha={handleRunSetupPlanilha}
      />

      {/* New Atestado Modal */}
      <NewAtestadoModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={handleCreateAtestado}
      />
    </div>
  );
}
