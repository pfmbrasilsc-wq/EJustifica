/**
 * Justifica-E - Backend Code.gs & Frontend Index.html definitions
 * Contém o código Apps Script e HTML oficial para exportação/deploy no Google Workspace.
 */

export const CODE_GS_SOURCE = `/**
 * JUSTIFICA-E - SISTEMA DE GESTÃO DE JUSTIFICATIVAS DE FALTAS
 * Backend Google Apps Script (Code.gs)
 * 
 * Instalação:
 * 1. Abra a planilha do Google Sheets.
 * 2. Acesse Extensões > Apps Script.
 * 3. Cole este arquivo em Code.gs e crie o arquivo Index.html.
 * 4. Execute a função setupPlanilha() uma vez para estruturar a planilha.
 * 5. Faça o Deploy como Web App (Executar como: Eu, Acesso: Qualquer pessoa).
 */

// Configurações Globais
const NOME_ABA_ALUNOS = "Alunos";
const NOME_ABA_PROFESSORES = "Professores_Turmas";
const NOME_ABA_ATESTADOS = "Atestados";
const NOME_ABA_JUSTIFICATIVAS = "Justificativas_Professores";

/**
 * Função principal do Web App
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Justifica-E - Gestão de Atestados')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 1. CRIAÇÃO E INICIALIZAÇÃO AUTOMÁTICA DA PLANILHA
 */
function setupPlanilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Definição das Estruturas e Colunas
  const abasRequeridas = [
    {
      nome: NOME_ABA_ALUNOS,
      colunas: ["Matricula", "Turma", "Estudante"],
      corCabecalho: "#2563eb" // Azul
    },
    {
      nome: NOME_ABA_PROFESSORES,
      colunas: ["Email_Professor", "Nome_Professor", "Turma"],
      corCabecalho: "#006e2d" // Verde
    },
    {
      nome: NOME_ABA_ATESTADOS,
      colunas: ["ID_Atestado", "Matricula", "Data_Inicio", "Data_Fim", "Dias_Afastamento", "Observacao", "Data_Cadastro"],
      corCabecalho: "#784b00" // Âmbar
    },
    {
      nome: NOME_ABA_JUSTIFICATIVAS,
      colunas: ["ID_Justificativa", "ID_Atestado", "Email_Professor", "Data_Hora_Baixa", "Status"],
      corCabecalho: "#004ac6" // Azul Escuro
    }
  ];

  abasRequeridas.forEach(config => {
    let aba = ss.getSheetByName(config.nome);
    if (!aba) {
      aba = ss.insertSheet(config.nome);
    }
    
    // Formatar Cabeçalho se estiver vazio
    if (aba.getLastRow() === 0) {
      aba.appendRow(config.colunas);
      const headerRange = aba.getRange(1, 1, 1, config.colunas.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground(config.corCabecalho);
      headerRange.setFontColor("#FFFFFF");
      aba.setFrozenRows(1);
    }
  });

  return { success: true, message: "Planilha e abas zeradas e configuradas com sucesso com cabeçalhos estruturados!" };
}

/**
 * Captura o e-mail do professor ativo
 */
function getProfessorEmail() {
  let email = "";
  try {
    email = Session.getActiveUser().getEmail();
  } catch (e) {
    email = "";
  }
  return email || "joao.silva@escola.edu";
}

/**
 * 2. RETORNA ATESTADOS PENDENTES E ESTATÍSTICAS DO PROFESSOR
 */
function getAtestadosPendentes(emailOverride) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const emailProf = emailOverride || getProfessorEmail();

  // 1. Identifica as turmas associadas ao professor na aba "Professores_Turmas"
  const abaProfs = ss.getSheetByName(NOME_ABA_PROFESSORES);
  const dadosProfs = abaProfs.getDataRange().getValues();
  const turmasProfessor = [];
  let nomeProfessor = "Professor";

  for (let i = 1; i < dadosProfs.length; i++) {
    const [email, nome, turma] = dadosProfs[i];
    if (String(email).trim().toLowerCase() === emailProf.trim().toLowerCase()) {
      turmasProfessor.push(String(turma).trim());
      if (nome) nomeProfessor = String(nome);
    }
  }

  // 2. Mapeia os alunos dessas turmas na aba "Alunos"
  const abaAlunos = ss.getSheetByName(NOME_ABA_ALUNOS);
  const dadosAlunos = abaAlunos.getDataRange().getValues();
  const alunosMap = {}; // Matricula -> { estudante, turma }

  for (let i = 1; i < dadosAlunos.length; i++) {
    const [matricula, turma, estudante] = dadosAlunos[i];
    const turmaStr = String(turma).trim();
    if (turmasProfessor.length === 0 || turmasProfessor.includes(turmaStr)) {
      alunosMap[String(matricula).trim()] = {
        estudante: String(estudante),
        turma: turmaStr
      };
    }
  }

  // 3. Mapeia atestados já justificados por este professor
  const abaJust = ss.getSheetByName(NOME_ABA_JUSTIFICATIVAS);
  const dadosJust = abaJust.getDataRange().getValues();
  const atestadosJustificadosSet = new Set();
  let justificadosHojeCount = 0;
  const hojeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  for (let i = 1; i < dadosJust.length; i++) {
    const [idJust, idAtest, emailP, dataHora, status] = dadosJust[i];
    if (String(emailP).trim().toLowerCase() === emailProf.trim().toLowerCase()) {
      atestadosJustificadosSet.add(String(idAtest).trim());
      
      // Checar se foi hoje
      if (dataHora) {
        const d = new Date(dataHora);
        if (!isNaN(d.getTime())) {
          const dStr = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
          if (dStr === hojeStr) justificadosHojeCount++;
        }
      }
    }
  }

  // 4. Busca os atestados e filtra os pendentes
  const abaAtestados = ss.getSheetByName(NOME_ABA_ATESTADOS);
  const dadosAtestados = abaAtestados.getDataRange().getValues();
  const pendentes = [];

  for (let i = 1; i < dadosAtestados.length; i++) {
    const [idAtestado, matricula, dataInicio, dataFim, dias, observacao, dataCadastro] = dadosAtestados[i];
    const idAtestadoStr = String(idAtestado).trim();
    const matriculaStr = String(matricula).trim();

    // Pertence a um aluno de turma do professor?
    if (alunosMap[matriculaStr]) {
      // Já foi justificado?
      if (!atestadosJustificadosSet.has(idAtestadoStr)) {
        pendentes.push({
          idAtestado: idAtestadoStr,
          matricula: matriculaStr,
          estudante: alunosMap[matriculaStr].estudante,
          turma: alunosMap[matriculaStr].turma,
          dataInicio: formatarDataVisual(dataInicio),
          dataFim: formatarDataVisual(dataFim),
          diasAfastamento: Number(dias) || 1,
          observacao: String(observacao || ""),
          dataCadastro: formatarDataVisual(dataCadastro)
        });
      }
    }
  }

  return {
    professor: {
      email: emailProf,
      nome: nomeProfessor,
      turmas: turmasProfessor
    },
    pendentes: pendentes,
    estatisticas: {
      pendentesTotal: pendentes.length,
      justificadosHoje: justificadosHojeCount
    }
  };
}

/**
 * 3. SALVA UMA JUSTIFICATIVA NA PLANILHA
 */
function salvarJustificativa(idAtestado, emailOverride) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const emailProf = emailOverride || getProfessorEmail();
  const abaJust = ss.getSheetByName(NOME_ABA_JUSTIFICATIVAS);
  
  // Gerar ID_Justificativa único (GUID / Timestamp)
  const idJustificativa = "JUST-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  const agora = new Date();

  // Inserir linha: [ID_Justificativa, ID_Atestado, Email_Professor, Data_Hora_Baixa, Status]
  abaJust.appendRow([
    idJustificativa,
    String(idAtestado).trim(),
    emailProf,
    agora,
    "Justificado"
  ]);

  return {
    success: true,
    idJustificativa: idJustificativa,
    idAtestado: idAtestado,
    mensagem: "Atestado marcado como Justificado com sucesso!"
  };
}

/**
 * Função Auxiliar para adicionar novo atestado
 */
function cadastrarAtestado(dados) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaAtestados = ss.getSheetByName(NOME_ABA_ATESTADOS);
  
  const idAtestado = "ATEST-" + String(Math.floor(1000 + Math.random() * 9000));
  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");

  abaAtestados.appendRow([
    idAtestado,
    dados.matricula,
    dados.dataInicio,
    dados.dataFim,
    dados.dias,
    dados.observacao,
    agora
  ]);

  return { success: true, idAtestado: idAtestado };
}

/**
 * Formatador auxiliar de datas
 */
function formatarDataVisual(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "dd/MM/yyyy");
  }
  return String(val);
}
`;

export const INDEX_HTML_SOURCE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Justifica-E - Gestão de Atestados</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f8f9ff; color: #0b1c30; }
    .glass-card { background: #ffffff; border: 1px solid #c3c6d7; }
    .fade-exit { transition: all 0.5s ease-out; opacity: 0; transform: translateX(50px); }
  </style>
</head>
<body class="bg-[#f8f9ff] text-[#0b1c30]">

  <!-- Sidebar -->
  <aside class="hidden md:flex h-full w-72 fixed left-0 top-0 bg-[#f8f9ff] border-r border-[#c3c6d7] flex-col p-4 z-50">
    <div class="px-4 py-6 mb-2">
      <h1 class="text-xl font-bold text-[#004ac6]">Justifica-E</h1>
    </div>
    <nav class="flex-1 flex flex-col gap-1">
      <a href="#" class="flex items-center gap-3 px-4 py-2 bg-[#7cf994] text-[#007230] font-bold rounded-full transition-all">
        <span class="material-symbols-outlined">dashboard</span>
        <span class="text-sm">Início</span>
      </a>
      <a href="#" class="flex items-center gap-3 px-4 py-2 text-[#434655] hover:bg-[#d3e4fe] rounded-full transition-all">
        <span class="material-symbols-outlined">pending_actions</span>
        <span class="text-sm">Pendentes</span>
      </a>
      <a href="#" class="flex items-center gap-3 px-4 py-2 text-[#434655] hover:bg-[#d3e4fe] rounded-full transition-all">
        <span class="material-symbols-outlined">history</span>
        <span class="text-sm">Histórico</span>
      </a>
    </nav>
    <div class="mt-auto border-t border-[#c3c6d7] pt-4">
      <div class="flex items-center gap-3 p-2 rounded-xl">
        <div class="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold">
          <span id="profInitials">JS</span>
        </div>
        <div class="overflow-hidden">
          <p id="profName" class="text-xs font-bold text-[#0b1c30] truncate">Prof. João Silva</p>
          <p id="profEmail" class="text-[10px] text-[#434655] truncate">joao.silva@escola.edu</p>
        </div>
      </div>
    </div>
  </aside>

  <!-- Conteúdo Principal -->
  <main class="md:ml-72 min-h-screen flex flex-col">
    <!-- Top Bar -->
    <header class="w-full top-0 sticky bg-[#f8f9ff] border-b border-[#c3c6d7] z-40 px-6 py-4">
      <div class="flex justify-between items-center max-w-7xl mx-auto">
        <div class="flex items-center gap-6">
          <span class="text-2xl font-black text-[#004ac6]">Justifica-E</span>
          <div class="relative">
            <select id="selectTurma" onchange="filtrarPorTurma()" class="px-3 py-1.5 bg-[#e5eeff] border border-[#c3c6d7] rounded-lg text-sm text-[#004ac6] font-bold cursor-pointer outline-none">
              <option value="TODAS">Todas as Turmas</option>
              <option value="3A" selected>Turma 3A</option>
              <option value="101">Turma 101</option>
              <option value="102">Turma 102</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs text-[#434655]">Status: <span class="text-[#006e2d] font-bold">● Operacional</span></span>
        </div>
      </div>
    </header>

    <!-- Cards de Resumo Bento Grid -->
    <div class="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card p-6 rounded-xl relative overflow-hidden shadow-sm">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xs text-[#434655] uppercase font-bold tracking-wider mb-1">Atestados Pendentes</h3>
              <p id="cntPendentes" class="text-4xl font-extrabold text-[#004ac6]">0</p>
              <p class="text-xs text-[#434655] mt-2 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-[#ba1a1a]">error_outline</span>
                Ação necessária imediata
              </p>
            </div>
            <div class="w-12 h-12 bg-[#ffdad6] rounded-full flex items-center justify-center text-[#93000a]">
              <span class="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
          </div>
        </div>

        <div class="glass-card p-6 rounded-xl relative overflow-hidden shadow-sm">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xs text-[#434655] uppercase font-bold tracking-wider mb-1">Justificados Hoje</h3>
              <p id="cntJustificados" class="text-4xl font-extrabold text-[#006e2d]">0</p>
              <p class="text-xs text-[#434655] mt-2 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-[#006e2d]">check_circle</span>
                Fluxo atualizado
              </p>
            </div>
            <div class="w-12 h-12 bg-[#7cf994] rounded-full flex items-center justify-center text-[#007230]">
              <span class="material-symbols-outlined text-2xl">task_alt</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Lista de Pendências -->
      <section class="bg-white rounded-xl border border-[#c3c6d7] overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-[#c3c6d7] flex flex-wrap justify-between items-center gap-4 bg-[#eff4ff]">
          <h2 class="text-lg font-bold text-[#0b1c30]">Lista de Pendências</h2>
          <div class="flex gap-2">
            <input type="text" id="inputBusca" oninput="filtrarPorBusca()" placeholder="Buscar aluno..." class="px-3 py-1.5 border border-[#c3c6d7] rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#004ac6]" />
          </div>
        </div>

        <!-- Estado de Loading -->
        <div id="loadingState" class="p-12 text-center">
          <div class="inline-block w-8 h-8 border-4 border-[#004ac6] border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-2 text-sm text-[#434655]">Carregando atestados pendentes do Google Sheets...</p>
        </div>

        <!-- Container da Lista -->
        <div id="listaContainer" class="divide-y divide-[#c3c6d7] hidden">
          <!-- Cards injetados via JS -->
        </div>

        <!-- Estado Vazio -->
        <div id="emptyState" class="p-12 text-center hidden">
          <span class="material-symbols-outlined text-4xl text-[#006e2d]">verified</span>
          <p class="mt-2 text-base font-bold text-[#0b1c30]">Nenhum atestado pendente!</p>
          <p class="text-xs text-[#434655]">Todos os atestados desta turma já foram verificados.</p>
        </div>

        <!-- Rodapé -->
        <div class="px-6 py-3 bg-[#f8f9ff] border-t border-[#c3c6d7] flex justify-between items-center text-xs text-[#434655]">
          <span id="txtTotalResultados">Mostrando 0 resultados</span>
        </div>
      </section>
    </div>
  </main>

  <script>
    let todosAtestados = [];

    window.onload = function() {
      carregarAtestados();
    };

    function carregarAtestados() {
      document.getElementById('loadingState').classList.remove('hidden');
      document.getElementById('listaContainer').classList.add('hidden');
      document.getElementById('emptyState').classList.add('hidden');

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(onSucessoAtestados)
          .withFailureHandler(onError)
          .getAtestadosPendentes();
      } else {
        console.warn('Ambiente local/Simulado');
      }
    }

    function onSucessoAtestados(res) {
      document.getElementById('loadingState').classList.add('hidden');
      if (!res) return;

      todosAtestados = res.pendentes || [];
      
      if (res.professor) {
        document.getElementById('profName').innerText = res.professor.nome || 'Professor';
        document.getElementById('profEmail').innerText = res.professor.email || '';
      }

      if (res.estatisticas) {
        document.getElementById('cntPendentes').innerText = res.estatisticas.pendentesTotal;
        document.getElementById('cntJustificados').innerText = res.estatisticas.justificadosHoje;
      }

      renderizarLista(todosAtestados);
    }

    function renderizarLista(lista) {
      const container = document.getElementById('listaContainer');
      const emptyState = document.getElementById('emptyState');
      container.innerHTML = '';

      if (lista.length === 0) {
        emptyState.classList.remove('hidden');
        container.classList.add('hidden');
        document.getElementById('txtTotalResultados').innerText = 'Nenhum atestado pendente';
        return;
      }

      emptyState.classList.add('hidden');
      container.classList.remove('hidden');
      document.getElementById('txtTotalResultados').innerText = \`Mostrando \${lista.length} resultado(s)\`;

      lista.forEach(item => {
        const card = document.createElement('div');
        card.id = \`atestado-\${item.idAtestado}\`;
        card.className = "p-6 hover:bg-[#eff4ff] transition-all duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4";
        card.innerHTML = \`
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-3">
              <span class="font-bold text-base text-[#0b1c30]">\${item.estudante}</span>
              <span class="px-2 py-0.5 bg-[#ffddb8] text-[#653e00] rounded-full text-[10px] font-bold uppercase">PENDENTE</span>
              <span class="px-2 py-0.5 bg-[#dbe1ff] text-[#00174b] rounded text-xs font-bold">\${item.diasAfastamento} \${item.diasAfastamento === 1 ? 'dia' : 'dias'}</span>
              <span class="text-xs font-semibold text-[#004ac6] bg-[#e5eeff] px-2 py-0.5 rounded">Turma \${item.turma}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-[#434655]">
              <span>\${item.dataInicio} - \${item.dataFim}</span>
              <span>|</span>
              <span class="italic">"\${item.observacao}"</span>
            </div>
          </div>
          <div>
            <button onclick="marcarJustificado('\${item.idAtestado}', this)" class="px-4 py-2 bg-[#006e2d] hover:bg-[#005320] text-white font-bold text-xs rounded-lg shadow transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              Marcar como Justificado
            </button>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    function marcarJustificado(idAtestado, btn) {
      btn.disabled = true;
      btn.classList.add('opacity-50');
      btn.innerHTML = \`<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Salvando...\`;

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(res) {
            removerCardComEfeito(idAtestado);
          })
          .withFailureHandler(function(err) {
            alert('Erro ao salvar justificativa: ' + err);
            btn.disabled = false;
            btn.classList.remove('opacity-50');
            btn.innerHTML = 'Tentar Novamente';
          })
          .salvarJustificativa(idAtestado);
      }
    }

    function removerCardComEfeito(idAtestado) {
      const card = document.getElementById(\`atestado-\${idAtestado}\`);
      if (card) {
        card.classList.add('fade-exit');
        setTimeout(() => {
          card.remove();
          todosAtestados = todosAtestados.filter(x => x.idAtestado !== idAtestado);
          
          // Atualizar contadores
          const cntP = document.getElementById('cntPendentes');
          const cntJ = document.getElementById('cntJustificados');
          cntP.innerText = Math.max(0, parseInt(cntP.innerText || '0') - 1);
          cntJ.innerText = parseInt(cntJ.innerText || '0') + 1;

          if (todosAtestados.length === 0) {
            document.getElementById('emptyState').classList.remove('hidden');
            document.getElementById('listaContainer').classList.add('hidden');
          }
        }, 500);
      }
    }

    function filtrarPorTurma() {
      const turma = document.getElementById('selectTurma').value;
      if (turma === 'TODAS') {
        renderizarLista(todosAtestados);
      } else {
        const filtrados = todosAtestados.filter(x => x.turma === turma);
        renderizarLista(filtrados);
      }
    }

    function filtrarPorBusca() {
      const q = document.getElementById('inputBusca').value.toLowerCase().trim();
      const filtrados = todosAtestados.filter(x => 
        x.estudante.toLowerCase().includes(q) || x.matricula.toLowerCase().includes(q) || x.observacao.toLowerCase().includes(q)
      );
      renderizarLista(filtrados);
    }

    function onError(err) {
      console.error(err);
      alert('Ocorreu um erro no servidor Google Apps Script: ' + err);
    }
  </script>
</body>
</html>
`;
