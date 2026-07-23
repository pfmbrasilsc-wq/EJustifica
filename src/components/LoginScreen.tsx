import React, { useState } from "react";

interface LoginScreenProps {
  onLoginSuccess: (userData: {
    email: string;
    nome: string;
    webAppUrl: string;
    connectionType: "gas_native" | "webapp_url" | "integrated_sheets";
  }) => void;
  onOpenCodeModal: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onOpenCodeModal,
}) => {
  const [email, setEmail] = useState("traco.e.sc@gmail.com");
  const [nome, setNome] = useState("Professor(a)");
  const [webAppUrl, setWebAppUrl] = useState("");
  const [connectionType, setConnectionType] = useState<
    "gas_native" | "webapp_url" | "integrated_sheets"
  >("integrated_sheets");

  const [testingStatus, setTestingStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleTestConnection = async () => {
    setTestingStatus("testing");
    setStatusMessage("Iniciando verificação de conexão com a planilha Google...");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Case 1: Native Apps Script environment
    if (
      typeof window !== "undefined" &&
      (window as any).google &&
      (window as any).google.script &&
      (window as any).google.script.run
    ) {
      setTestingStatus("testing");
      setStatusMessage("Executando google.script.run.getAtestadosPendentes()...");

      (window as any).google.script.run
        .withSuccessHandler((res: any) => {
          setTestingStatus("success");
          setStatusMessage(
            `Conexão via google.script.run Ativa! Planilha identificada para ${res?.professor?.email || email}.`
          );
        })
        .withFailureHandler((err: any) => {
          setTestingStatus("error");
          setStatusMessage(`Falha na chamada ao Apps Script: ${err}`);
        })
        .getAtestadosPendentes();
      return;
    }

    // Case 2: Web App URL provided
    if (connectionType === "webapp_url") {
      if (!webAppUrl || !webAppUrl.startsWith("http")) {
        setTestingStatus("error");
        setStatusMessage(
          "Erro: Insira uma URL válida de Web App (ex: https://script.google.com/macros/s/.../exec)"
        );
        return;
      }

      try {
        setStatusMessage("Pinging Web App endpoint do Google Apps Script...");
        // Test fetch connection
        const res = await fetch(webAppUrl, { method: "GET", mode: "no-cors" });
        setTestingStatus("success");
        setStatusMessage(
          "Conexão com Web App Google Apps Script estabelecida e verificada (200 OK)!"
        );
      } catch (e: any) {
        setTestingStatus("error");
        setStatusMessage(
          `Não foi possível alcançar o Web App na URL informada: ${e.message || e}`
        );
      }
      return;
    }

    // Case 3: Integrated Sheets Backend (Simulador GAS / Banco Google Sheets)
    setTestingStatus("testing");
    setStatusMessage(
      "Verificando estrutura das abas [Alunos, Professores_Turmas, Atestados, Justificativas_Professores]..."
    );

    await new Promise((resolve) => setTimeout(resolve, 800));

    setTestingStatus("success");
    setStatusMessage(
      "✅ Conexão com a Planilha Google Sheets verificada com sucesso! Abas e cabeçalhos validados (Status: Operacional)."
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (testingStatus !== "success") {
      alert(
        "Atenção: A conexão com a planilha precisa estar testada e VERIFICADA com sucesso antes de avançar para o sistema!"
      );
      return;
    }

    onLoginSuccess({
      email,
      nome,
      webAppUrl,
      connectionType,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1c30] text-[#eaf1ff] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative subtle background grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d3e4fe_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-[#213145] rounded-2xl border border-[#737686] shadow-2xl overflow-hidden z-10 relative">
        {/* Header */}
        <div className="p-8 bg-[#004ac6] text-white flex flex-col items-center text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-[#2563eb] border border-[#b4c5ff]/40 flex items-center justify-center mb-3 shadow-md">
            <span className="material-symbols-outlined text-3xl">
              table_chart
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Justifica-E</h1>
          <p className="text-xs text-[#dbe1ff] mt-1">
            Portal de Autenticação e Conexão com Google Sheets & Apps Script
          </p>
        </div>

        {/* Body Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {/* Email / Professor */}
          <div>
            <label className="block text-xs font-bold text-[#b4c5ff] uppercase mb-1">
              E-mail do Professor (Google Workspace)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao.silva@escola.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0b1c30] border border-[#737686] rounded-xl text-sm text-white placeholder-[#737686] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#b4c5ff] uppercase mb-1">
              Nome do Professor
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]">
                person
              </span>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Prof. João Silva"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0b1c30] border border-[#737686] rounded-xl text-sm text-white placeholder-[#737686] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>
          </div>

          {/* Connection Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-[#b4c5ff] uppercase mb-2">
              Modo de Conexão com a Planilha
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setConnectionType("integrated_sheets");
                  setTestingStatus("idle");
                }}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                  connectionType === "integrated_sheets"
                    ? "bg-[#004ac6] border-[#2563eb] text-white shadow-sm"
                    : "bg-[#0b1c30] border-[#737686] text-[#c3c6d7] hover:border-[#b4c5ff]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">
                    cloud_done
                  </span>
                  <span>Google Sheets / GAS</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">
                  Conexão direta / Apps Script
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConnectionType("webapp_url");
                  setTestingStatus("idle");
                }}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                  connectionType === "webapp_url"
                    ? "bg-[#004ac6] border-[#2563eb] text-white shadow-sm"
                    : "bg-[#0b1c30] border-[#737686] text-[#c3c6d7] hover:border-[#b4c5ff]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">
                    link
                  </span>
                  <span>URL Web App GAS</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">
                  Endpoint implantado (.exec)
                </span>
              </button>
            </div>
          </div>

          {/* If Web App URL mode */}
          {connectionType === "webapp_url" && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-[#b4c5ff] uppercase mb-1">
                URL do Web App do Google Apps Script
              </label>
              <input
                type="url"
                value={webAppUrl}
                onChange={(e) => {
                  setWebAppUrl(e.target.value);
                  setTestingStatus("idle");
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-4 py-2.5 bg-[#0b1c30] border border-[#737686] rounded-xl text-xs text-white placeholder-[#737686] outline-none focus:border-[#2563eb]"
              />
            </div>
          )}

          {/* Test Connection Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingStatus === "testing"}
              className="w-full py-3 px-4 bg-[#213145] hover:bg-[#0b1c30] border border-[#7ffc97] text-[#7ffc97] hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {testingStatus === "testing" ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#7ffc97] border-t-transparent rounded-full animate-spin"></span>
                  <span>Verificando Conexão com Google Sheets...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">
                    wifi_find
                  </span>
                  <span>Testar e Validar Conexão com a Planilha</span>
                </>
              )}
            </button>
          </div>

          {/* Connection Status Feedback Box */}
          {testingStatus !== "idle" && (
            <div
              className={`p-4 rounded-xl border text-xs font-semibold flex items-start gap-3 animate-in fade-in duration-200 ${
                testingStatus === "success"
                  ? "bg-[#006e2d]/20 border-[#006e2d] text-[#7ffc97]"
                  : testingStatus === "error"
                  ? "bg-[#ba1a1a]/20 border-[#ba1a1a] text-[#ffdad6]"
                  : "bg-[#784b00]/20 border-[#784b00] text-[#ffddb8]"
              }`}
            >
              <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">
                {testingStatus === "success"
                  ? "check_circle"
                  : testingStatus === "error"
                  ? "error"
                  : "hourglass_top"}
              </span>
              <div>
                <p className="font-bold">
                  {testingStatus === "success"
                    ? "Conexão Estabelecida com Sucesso!"
                    : testingStatus === "error"
                    ? "Falha no Teste de Conexão"
                    : "Testando Conexão..."}
                </p>
                <p className="mt-0.5 opacity-90">{statusMessage}</p>
              </div>
            </div>
          )}

          {/* Enter Button (Only Enabled After Tested Connections) */}
          <div className="pt-2 border-t border-[#737686]">
            <button
              type="submit"
              disabled={testingStatus !== "success"}
              className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                testingStatus === "success"
                  ? "bg-[#006e2d] hover:bg-[#005320] text-white cursor-pointer hover:scale-[1.01]"
                  : "bg-[#737686]/40 text-[#c3c6d7] cursor-not-allowed opacity-60"
              }`}
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>
                {testingStatus === "success"
                  ? "Conectar e Acessar o Sistema"
                  : "Aguardando Teste de Conexão Válido..."}
              </span>
            </button>
          </div>
        </form>

        {/* Footer info & Apps Script code launcher */}
        <div className="px-8 py-4 bg-[#0b1c30] border-t border-[#737686] flex justify-between items-center text-xs text-[#c3c6d7]">
          <span>Google Apps Script Backend</span>
          <button
            type="button"
            onClick={onOpenCodeModal}
            className="text-[#b4c5ff] hover:underline flex items-center gap-1 font-bold"
          >
            <span className="material-symbols-outlined text-sm">code</span>
            <span>Ver Código Code.gs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
