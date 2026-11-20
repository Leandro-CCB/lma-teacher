export type PerfilUsuario = 'diretor' | 'professor';

export type Bimestre = 1 | 2 | 3 | 4;

export interface Aluno {
  id: string;
  numero: number;
  nome: string;
  turmaId: string;
  dataNascimento?: string;
  responsavel?: string;
  telefoneResponsavel?: string;
  endereco?: string;
  observacoes?: string;
}

export interface Turma {
  id: string;
  nome: string; // Ex: 4º ANO - C
  escola: string; // Ex: E.M. MACHADO DE ASSIS
  municipio: string; // Ex: Francisco Morato
  turno: string; // Ex: Tarde
  anoLetivo: number; // 2026
  curso: string; // Ensino Fundamental I
  professora: string; // Ex: Bruna Guedes da Silva Maia
  sala?: string;
}

export interface RegistroFrequencia {
  id: string;
  alunoId: string;
  turmaId: string;
  bimestre: Bimestre;
  mes: string; // 'fevereiro', 'marco', 'abril', etc.
  dia: number;
  dataIso: string; // YYYY-MM-DD
  status: 'P' | 'F' | 'FJ'; // P=Presente, F=Falta, FJ=Falta Justificada
  justificativa?: string;
}

export interface RegistroNota {
  id: string;
  alunoId: string;
  turmaId: string;
  bimestre: Bimestre;
  portugues: 'S' | 'I' | 'EP' | string; // S=Satisfatório, I=Insuficiente, EP=Em Processo
  matematica: 'S' | 'I' | 'EP' | string;
  ciencias: 'S' | 'I' | 'EP' | string;
  historia: 'S' | 'I' | 'EP' | string;
  geografia: 'S' | 'I' | 'EP' | string;
  arte: 'S' | 'I' | 'EP' | string;
  educacaoFisica?: 'S' | 'I' | string;
  observacao?: string;
}

export interface RegistroConteudo {
  id: string;
  turmaId: string;
  bimestre: Bimestre;
  data: string;
  componenteCurricular: string;
  conteudo: string;
  habilidadesBNCC?: string;
}

export interface RegistroBuscaAtiva {
  id: string;
  alunoId: string;
  turmaId: string;
  dataAbertura: string;
  faltasConsecutivas: number;
  faltasTotaisAcumuladas: number;
  statusProtocolo: 'Alerta Preventivo' | 'Contato com Responsável' | 'Notificado Conselho Tutelar' | 'Regularizado' | 'Visita Domiciliar';
  tentativasContato: {
    data: string;
    tipo: 'WhatsApp' | 'Ligacao' | 'Visita' | 'Oficio';
    detalhes: string;
    sucesso: boolean;
  }[];
  notificadoConselhoTutelar: boolean;
  dataNotificacaoCT?: string;
  numeroOficio?: string;
  conselheiroResponsavel?: string;
  fichaFicaiGerada?: boolean;
}

export type StatusFarol = 'verde' | 'amarelo' | 'laranja' | 'vermelho';

export interface AlunoFarolStatus {
  aluno: Aluno;
  turma?: Turma;
  totalFaltas: number;
  faltasJustificadas: number;
  faltasNaoJustificadas: number;
  porcentagemFrequencia: number;
  porcentagemFaltasLimite: number; // Em relação ao limite máximo legal (50 faltas)
  statusFarol: StatusFarol;
  precisaConselhoTutelar: boolean; // >= 15 faltas não justificadas (30% do limite de 50)
  riscoReprovacao: boolean; // > 50 faltas (25% dos 200 dias)
  motivoAlerta: string;
}
