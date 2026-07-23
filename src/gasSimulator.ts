/**
 * Simulador do Google Sheets e Google Apps Script para o Frontend
 * Mantém a exata mesma estrutura de dados e índices requeridos no Code.gs
 */

export interface Aluno {
  matricula: string;
  turma: string;
  estudante: string;
}

export interface ProfessorTurma {
  emailProfessor: string;
  nomeProfessor: string;
  turma: string;
}

export interface Atestado {
  idAtestado: string;
  matricula: string;
  dataInicio: string;
  dataFim: string;
  diasAfastamento: number;
  observacao: string;
  dataCadastro: string;
}

export interface JustificativaProfessor {
  idJustificativa: string;
  idAtestado: string;
  emailProfessor: string;
  dataHoraBaixa: string;
  status: string;
}

export interface AtestadoPendenteDTO {
  idAtestado: string;
  matricula: string;
  estudante: string;
  turma: string;
  dataInicio: string;
  dataFim: string;
  diasAfastamento: number;
  observacao: string;
  dataCadastro: string;
}

const STORAGE_KEY = "justifica_e_database_v2";

const INITIAL_ALUNOS: Aluno[] = [];

const INITIAL_PROFESSORES: ProfessorTurma[] = [];

const INITIAL_ATESTADOS: Atestado[] = [];

const INITIAL_JUSTIFICATIVAS: JustificativaProfessor[] = [];

export interface DatabaseState {
  alunos: Aluno[];
  professores: ProfessorTurma[];
  atestados: Atestado[];
  justificativas: JustificativaProfessor[];
}

export function loadDatabase(): DatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.alunos) && Array.isArray(parsed.atestados)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar banco local", e);
  }

  const initialDb: DatabaseState = {
    alunos: [],
    professores: [],
    atestados: [],
    justificativas: []
  };

  saveDatabase(initialDb);
  return initialDb;
}

export function saveDatabase(db: DatabaseState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Erro ao salvar banco local", e);
  }
}

export function setupPlanilhaSimulada(): { success: boolean; message: string; db: DatabaseState } {
  const db: DatabaseState = {
    alunos: [],
    professores: [],
    atestados: [],
    justificativas: []
  };
  saveDatabase(db);
  return {
    success: true,
    message: "Planilha zerada e configurada com sucesso sem dados de teste!",
    db
  };
}

/**
 * Simula a execução da função getAtestadosPendentes() do Code.gs
 */
export function getAtestadosPendentesSimulado(emailProf = "joao.silva@escola.edu"): {
  professor: { email: string; nome: string; turmas: string[] };
  pendentes: AtestadoPendenteDTO[];
  estatisticas: { pendentesTotal: number; justificadosHoje: number };
} {
  const db = loadDatabase();

  // 1. Turmas do professor
  const profTurmas = db.professores.filter(
    (p) => p.emailProfessor.toLowerCase() === emailProf.toLowerCase()
  );
  const turmasList = profTurmas.map((p) => p.turma);
  const nomeProfessor = profTurmas[0]?.nomeProfessor || "Prof. João Silva";

  // 2. Mapear Alunos
  const alunosMap: Record<string, Aluno> = {};
  db.alunos.forEach((a) => {
    if (turmasList.length === 0 || turmasList.includes(a.turma)) {
      alunosMap[a.matricula] = a;
    }
  });

  // 3. Justificativas do professor
  const justificadosSet = new Set<string>();
  let justificadosHojeCount = 0;
  const hoje = new Date().toISOString().split("T")[0];

  db.justificativas.forEach((j) => {
    if (j.emailProfessor.toLowerCase() === emailProf.toLowerCase()) {
      justificadosSet.add(j.idAtestado);
      if (j.dataHoraBaixa && j.dataHoraBaixa.startsWith(hoje)) {
        justificadosHojeCount++;
      }
    }
  });

  // 4. Filtrar Atestados pendentes
  const pendentes: AtestadoPendenteDTO[] = [];
  db.atestados.forEach((at) => {
    const aluno = alunosMap[at.matricula];
    if (aluno && !justificadosSet.has(at.idAtestado)) {
      pendentes.push({
        idAtestado: at.idAtestado,
        matricula: at.matricula,
        estudante: aluno.estudante,
        turma: aluno.turma,
        dataInicio: at.dataInicio,
        dataFim: at.dataFim,
        diasAfastamento: at.diasAfastamento,
        observacao: at.observacao,
        dataCadastro: at.dataCadastro
      });
    }
  });

  return {
    professor: {
      email: emailProf,
      nome: nomeProfessor,
      turmas: turmasList
    },
    pendentes,
    estatisticas: {
      pendentesTotal: pendentes.length,
      justificadosHoje: justificadosHojeCount
    }
  };
}

/**
 * Simula a execução de salvarJustificativa(idAtestado)
 */
export function salvarJustificativaSimulado(
  idAtestado: string,
  emailProf = "joao.silva@escola.edu"
) {
  const db = loadDatabase();
  const idJustificativa = `JUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const agoraISO = new Date().toISOString();

  db.justificativas.push({
    idJustificativa,
    idAtestado,
    emailProfessor: emailProf,
    dataHoraBaixa: agoraISO,
    status: "Justificado"
  });

  saveDatabase(db);

  return {
    success: true,
    idJustificativa,
    idAtestado,
    mensagem: "Atestado marcado como Justificado no Google Sheets com sucesso!"
  };
}

/**
 * Simula cadastro de novo atestado
 */
export function cadastrarAtestadoSimulado(dados: {
  matricula: string;
  estudante: string;
  turma: string;
  dataInicio: string;
  dataFim: string;
  diasAfastamento: number;
  observacao: string;
}) {
  const db = loadDatabase();

  // Verificar se o aluno já existe ou adicionar
  let aluno = db.alunos.find((a) => a.matricula === dados.matricula);
  if (!aluno) {
    aluno = {
      matricula: dados.matricula,
      estudante: dados.estudante.toUpperCase(),
      turma: dados.turma
    };
    db.alunos.push(aluno);
  }

  const idAtestado = `ATEST-${Math.floor(1000 + Math.random() * 9000)}`;
  const dataCad = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  const novoAtestado: Atestado = {
    idAtestado,
    matricula: dados.matricula,
    dataInicio: dados.dataInicio,
    dataFim: dados.dataFim,
    diasAfastamento: Number(dados.diasAfastamento) || 1,
    observacao: dados.observacao,
    dataCadastro: dataCad
  };

  db.atestados.unshift(novoAtestado);
  saveDatabase(db);

  return {
    success: true,
    idAtestado,
    mensagem: "Novo atestado registrado com sucesso na planilha!"
  };
}
