'use client';

import { useState, useEffect } from 'react';
import { Aluno, Turma, RegistroFrequencia, RegistroNota, RegistroConteudo, RegistroBuscaAtiva, AlunoFarolStatus, StatusFarol } from '@/types/school';
import seedData from '@/data/seedData.json';

const STORAGE_KEY = 'lma_teacher_db_v1';

export interface SchoolDatabase {
  turmas: Turma[];
  alunos: Aluno[];
  frequencias: RegistroFrequencia[];
  notas: RegistroNota[];
  conteudos: RegistroConteudo[];
  buscasAtivas: RegistroBuscaAtiva[];
  configuracoes: {
    diasLetivosAno: number; // 200
    limiteFaltasMaximo: number; // 50 (25% de 200)
    percentualAlertaConselhoTutelar: number; // 30% do limite (15 faltas)
    faltasConsecutivasAlerta: number; // 5 faltas
    conselhoTutelarNome: string;
    conselhoTutelarTelefone: string;
    conselhoTutelarEmail: string;
  };
}

export function initializeDatabase(): SchoolDatabase {
  const turmaId = 'turma-4c-2026';
  
  const turmaPadrao: Turma = {
    id: turmaId,
    nome: seedData.turma || '4º ANO - C',
    escola: seedData.escola || 'E.M. MACHADO DE ASSIS',
    municipio: seedData.municipio || 'Prefeitura Municipal de Francisco Morato',
    turno: seedData.turno || 'Tarde',
    anoLetivo: seedData.ano_letivo || 2026,
    curso: seedData.curso || 'Ensino Fundamental I - Polivalente',
    professora: seedData.professora || 'Bruna Guedes da Silva Maia',
    sala: 'Sala 04'
  };

  const alunosPadrao: Aluno[] = (seedData.alunos || []).map((a, idx) => ({
    id: `aluno-${idx + 1}`,
    numero: a.numero,
    nome: a.nome,
    turmaId: turmaId,
    responsavel: `Responsável de ${a.nome.split(' ')[0]}`,
    telefoneResponsavel: `(11) 98765-${String(1000 + idx).padStart(4, '0')}`,
    endereco: `Rua Central, nº ${10 + idx}, Francisco Morato - SP`
  }));

  // Frequencias iniciais baseadas no seed
  const frequenciasPadrao: RegistroFrequencia[] = [];
  const faltasIniciais = seedData.faltas_iniciais as Record<string, { fev: number; mar: number; abr: number; total: number }>;

  alunosPadrao.forEach((aluno) => {
    const fAluno = faltasIniciais[aluno.nome];
    const totalFaltas = fAluno ? fAluno.total : 0;
    
    // Gerar registros pontuais simulados para demonstrar as faltas do bimestre
    for (let f = 0; f < totalFaltas; f++) {
      frequenciasPadrao.push({
        id: `freq-${aluno.id}-${f}`,
        alunoId: aluno.id,
        turmaId: turmaId,
        bimestre: 1,
        mes: f < (fAluno?.fev || 0) ? 'fevereiro' : f < ((fAluno?.fev || 0) + (fAluno?.mar || 0)) ? 'marco' : 'abril',
        dia: (f * 3) + 2,
        dataIso: `2026-03-${String((f * 3) + 2).padStart(2, '0')}`,
        status: 'F'
      });
    }
  });

  // Notas iniciais
  const notasIniciais = seedData.notas_iniciais as Record<string, Record<string, string>>;
  const notasPadrao: RegistroNota[] = alunosPadrao.map((aluno) => {
    const n = notasIniciais[aluno.nome] || {};
    return {
      id: `nota-${aluno.id}-b1`,
      alunoId: aluno.id,
      turmaId: turmaId,
      bimestre: 1,
      portugues: n.portugues || 'S',
      matematica: n.matematica || 'S',
      ciencias: n.ciencias || 'S',
      historia: n.historia || 'S',
      geografia: n.geografia || 'S',
      arte: n.arte || 'S',
      educacaoFisica: 'S'
    };
  });

  // Conteudos iniciais
  const conteudosPadrao: RegistroConteudo[] = (seedData.conteudos_iniciais || []).map((c, idx) => ({
    id: `cont-${idx + 1}`,
    turmaId: turmaId,
    bimestre: 1,
    data: c.dia || `Aula ${idx + 1}`,
    componenteCurricular: 'Polivalente',
    conteudo: c.conteudo
  }));

  // Buscas ativas para alunos com muitas faltas
  const buscasAtivasPadrao: RegistroBuscaAtiva[] = [];
  alunosPadrao.forEach((aluno) => {
    const fAluno = faltasIniciais[aluno.nome];
    const total = fAluno ? fAluno.total : 0;
    if (total >= 10) {
      buscasAtivasPadrao.push({
        id: `ba-${aluno.id}`,
        alunoId: aluno.id,
        turmaId: turmaId,
        dataAbertura: '2026-03-15',
        faltasConsecutivas: 6,
        faltasTotaisAcumuladas: total,
        statusProtocolo: total >= 15 ? 'Notificado Conselho Tutelar' : 'Contato com Responsável',
        tentativasContato: [
          {
            data: '2026-03-10',
            tipo: 'WhatsApp',
            detalhes: 'Mensagem enviada à mãe alertando sobre faltas consecutivas.',
            sucesso: true
          },
          {
            data: '2026-03-14',
            tipo: 'Ligacao',
            detalhes: 'Ligação realizada para orientar sobre risco de FICAI.',
            sucesso: true
          }
        ],
        notificadoConselhoTutelar: total >= 15,
        dataNotificacaoCT: total >= 15 ? '2026-03-20' : undefined,
        numeroOficio: total >= 15 ? 'OF-2026/042-CT' : undefined,
        fichaFicaiGerada: total >= 15
      });
    }
  });

  return {
    turmas: [turmaPadrao],
    alunos: alunosPadrao,
    frequencias: frequenciasPadrao,
    notas: notasPadrao,
    conteudos: conteudosPadrao,
    buscasAtivas: buscasAtivasPadrao,
    configuracoes: {
      diasLetivosAno: 200,
      limiteFaltasMaximo: 50, // 25% de 200
      percentualAlertaConselhoTutelar: 15, // 30% do limite legal de 50
      faltasConsecutivasAlerta: 5,
      conselhoTutelarNome: 'Conselho Tutelar de Francisco Morato',
      conselhoTutelarTelefone: '(11) 4488-2500',
      conselhoTutelarEmail: 'conselhotutelar@franciscomorato.sp.gov.br'
    }
  };
}

export function useSchoolStore() {
  const [db, setDb] = useState<SchoolDatabase>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Erro ao ler DB:', e);
        }
      }
    }
    return initializeDatabase();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  }, [db]);

  const resetDatabase = () => {
    const fresh = initializeDatabase();
    setDb(fresh);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    }
  };

  // Calcular Farol de Presença
  const calcularFarolAlunos = (turmaId?: string, mesFiltro?: string): AlunoFarolStatus[] => {
    const listaAlunos = turmaId ? db.alunos.filter(a => a.turmaId === turmaId) : db.alunos;
    
    return listaAlunos.map(aluno => {
      const turmaDoAluno = db.turmas.find(t => t.id === aluno.turmaId);
      let faltasRegistradas = db.frequencias.filter(f => f.alunoId === aluno.id && (f.status === 'F' || f.status === 'FJ'));
      
      if (mesFiltro && mesFiltro !== 'todos') {
        faltasRegistradas = faltasRegistradas.filter(f => f.mes.toLowerCase() === mesFiltro.toLowerCase());
      }

      const faltasJustificadas = faltasRegistradas.filter(f => f.status === 'FJ').length;
      const faltasNaoJustificadas = faltasRegistradas.filter(f => f.status === 'F').length;
      const totalFaltas = faltasNaoJustificadas; // Para efeito legal LDB
      
      const diasLetivos = db.configuracoes.diasLetivosAno || 200;
      const limiteFaltas = db.configuracoes.limiteFaltasMaximo || 50;
      const gatilhoCT = db.configuracoes.percentualAlertaConselhoTutelar || 15;

      const presencas = Math.max(0, diasLetivos - totalFaltas);
      const porcentagemFrequencia = Math.round((presencas / diasLetivos) * 100);
      const porcentagemFaltasLimite = Math.round((totalFaltas / limiteFaltas) * 100);

      let statusFarol: StatusFarol = 'verde';
      let motivoAlerta = 'Frequência regular e assídua.';
      const precisaConselhoTutelar = totalFaltas >= gatilhoCT;
      const riscoReprovacao = totalFaltas >= limiteFaltas;

      if (totalFaltas >= limiteFaltas) {
        statusFarol = 'vermelho';
        motivoAlerta = `Limite de 25% ultrapassado (${totalFaltas}/${limiteFaltas} faltas). Risco direto de reprovação escolar por infrequência!`;
      } else if (totalFaltas >= gatilhoCT) {
        statusFarol = 'laranja';
        motivoAlerta = `Atingiu 30% do limite legal de faltas (${totalFaltas} faltas). Notificação OBRIGATÓRIA ao Conselho Tutelar (Lei 13.803/2019)!`;
      } else if (totalFaltas >= 10) {
        statusFarol = 'amarelo';
        motivoAlerta = `Alerta preventivo (${totalFaltas} faltas). Orientação para contato com os responsáveis para evitar evasão.`;
      }

      return {
        aluno,
        turma: turmaDoAluno,
        totalFaltas,
        faltasJustificadas,
        faltasNaoJustificadas,
        porcentagemFrequencia,
        porcentagemFaltasLimite,
        statusFarol,
        precisaConselhoTutelar,
        riscoReprovacao,
        motivoAlerta
      };
    });
  };

  // Funções de CRUD
  const adicionarAluno = (aluno: Omit<Aluno, 'id'>) => {
    const novo: Aluno = {
      ...aluno,
      id: `aluno-${Date.now()}`
    };
    setDb(prev => ({
      ...prev,
      alunos: [...prev.alunos, novo]
    }));
    return novo;
  };

  const atualizarAluno = (id: string, dados: Partial<Aluno>) => {
    setDb(prev => ({
      ...prev,
      alunos: prev.alunos.map(a => a.id === id ? { ...a, ...dados } : a)
    }));
  };

  const excluirAluno = (id: string) => {
    setDb(prev => ({
      ...prev,
      alunos: prev.alunos.filter(a => a.id !== id),
      frequencias: prev.frequencias.filter(f => f.alunoId !== id),
      notas: prev.notas.filter(n => n.alunoId !== id)
    }));
  };

  const adicionarTurma = (turma: Omit<Turma, 'id'>) => {
    const nova: Turma = {
      ...turma,
      id: `turma-${Date.now()}`
    };
    setDb(prev => ({
      ...prev,
      turmas: [...prev.turmas, nova]
    }));
    return nova;
  };

  const salvarFrequencia = (registros: RegistroFrequencia[]) => {
    setDb(prev => {
      // Filtrar registros antigos que coincidem com os novos e mesclar
      const novosIds = new Set(registros.map(r => `${r.alunoId}-${r.dataIso}`));
      const mantidos = prev.frequencias.filter(f => !novosIds.has(`${f.alunoId}-${f.dataIso}`));
      return {
        ...prev,
        frequencias: [...mantidos, ...registros]
      };
    });
  };

  const salvarNota = (nota: RegistroNota) => {
    setDb(prev => {
      const idx = prev.notas.findIndex(n => n.alunoId === nota.alunoId && n.bimestre === nota.bimestre);
      if (idx >= 0) {
        const cop = [...prev.notas];
        cop[idx] = nota;
        return { ...prev, notas: cop };
      }
      return { ...prev, notas: [...prev.notas, nota] };
    });
  };

  const salvarConteudo = (conteudo: RegistroConteudo) => {
    setDb(prev => {
      const idx = prev.conteudos.findIndex(c => c.id === conteudo.id);
      if (idx >= 0) {
        const cop = [...prev.conteudos];
        cop[idx] = conteudo;
        return { ...prev, conteudos: cop };
      }
      return { ...prev, conteudos: [conteudo, ...prev.conteudos] };
    });
  };

  const registrarContatoBuscaAtiva = (alunoId: string, contato: { data: string; tipo: 'WhatsApp' | 'Ligacao' | 'Visita' | 'Oficio'; detalhes: string; sucesso: boolean }) => {
    setDb(prev => {
      const idx = prev.buscasAtivas.findIndex(b => b.alunoId === alunoId);
      if (idx >= 0) {
        const cop = [...prev.buscasAtivas];
        cop[idx].tentativasContato.push(contato);
        return { ...prev, buscasAtivas: cop };
      }
      const novo: RegistroBuscaAtiva = {
        id: `ba-${Date.now()}`,
        alunoId,
        turmaId: prev.alunos.find(a => a.id === alunoId)?.turmaId || 'turma-padrao',
        dataAbertura: new Date().toISOString().split('T')[0],
        faltasConsecutivas: 3,
        faltasTotaisAcumuladas: 10,
        statusProtocolo: 'Contato com Responsável',
        tentativasContato: [contato],
        notificadoConselhoTutelar: false
      };
      return { ...prev, buscasAtivas: [...prev.buscasAtivas, novo] };
    });
  };

  const notificarConselhoTutelar = (alunoId: string, numeroOficio: string) => {
    setDb(prev => {
      const cop = [...prev.buscasAtivas];
      const idx = cop.findIndex(b => b.alunoId === alunoId);
      if (idx >= 0) {
        cop[idx].notificadoConselhoTutelar = true;
        cop[idx].dataNotificacaoCT = new Date().toISOString().split('T')[0];
        cop[idx].numeroOficio = numeroOficio;
        cop[idx].fichaFicaiGerada = true;
        cop[idx].statusProtocolo = 'Notificado Conselho Tutelar';
      } else {
        cop.push({
          id: `ba-${Date.now()}`,
          alunoId,
          turmaId: prev.alunos.find(a => a.id === alunoId)?.turmaId || 'turma-padrao',
          dataAbertura: new Date().toISOString().split('T')[0],
          faltasConsecutivas: 5,
          faltasTotaisAcumuladas: 15,
          statusProtocolo: 'Notificado Conselho Tutelar',
          tentativasContato: [],
          notificadoConselhoTutelar: true,
          dataNotificacaoCT: new Date().toISOString().split('T')[0],
          numeroOficio,
          fichaFicaiGerada: true
        });
      }
      return { ...prev, buscasAtivas: cop };
    });
  };

  // Importador de Excel do Diário
  const importarPlanilhaExcel = (dadosExtraidos: {
    turma: Partial<Turma>;
    alunos: { numero: number; nome: string }[];
    faltas?: Record<string, number>;
    notas?: Record<string, Record<string, string>>;
    conteudos?: { data: string; conteudo: string }[];
  }) => {
    setDb(prev => {
      const turmaId = `turma-${Date.now()}`;
      const novaTurma: Turma = {
        id: turmaId,
        nome: dadosExtraidos.turma.nome || 'Nova Turma Importada',
        escola: dadosExtraidos.turma.escola || 'E.M. MACHADO DE ASSIS',
        municipio: dadosExtraidos.turma.municipio || 'Francisco Morato',
        turno: dadosExtraidos.turma.turno || 'Tarde',
        anoLetivo: dadosExtraidos.turma.anoLetivo || 2026,
        curso: dadosExtraidos.turma.curso || 'Ensino Fundamental I',
        professora: dadosExtraidos.turma.professora || 'Professora Titular',
        sala: 'Sala 01'
      };

      const novosAlunos: Aluno[] = dadosExtraidos.alunos.map((a, idx) => ({
        id: `aluno-imp-${Date.now()}-${idx + 1}`,
        numero: a.numero || idx + 1,
        nome: a.nome,
        turmaId: turmaId,
        responsavel: `Responsável de ${a.nome.split(' ')[0]}`,
        telefoneResponsavel: '(11) 99999-0000',
        endereco: 'Francisco Morato - SP'
      }));

      // Adicionar frequencias das faltas
      const novasFreqs: RegistroFrequencia[] = [];
      if (dadosExtraidos.faltas) {
        novosAlunos.forEach(aluno => {
          const qtdFaltas = dadosExtraidos.faltas?.[aluno.nome] || 0;
          for (let f = 0; f < qtdFaltas; f++) {
            novasFreqs.push({
              id: `freq-${aluno.id}-${f}`,
              alunoId: aluno.id,
              turmaId: turmaId,
              bimestre: 1,
              mes: 'marco',
              dia: f + 1,
              dataIso: `2026-03-${String(f + 1).padStart(2, '0')}`,
              status: 'F'
            });
          }
        });
      }

      return {
        ...prev,
        turmas: [...prev.turmas, novaTurma],
        alunos: [...prev.alunos, ...novosAlunos],
        frequencias: [...prev.frequencias, ...novasFreqs]
      };
    });
  };

  const atualizarConfiguracoes = (novasConfig: Partial<SchoolDatabase['configuracoes']>) => {
    setDb(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        ...novasConfig
      }
    }));
  };

  const atualizarTurma = (id: string, dados: Partial<Turma>) => {
    setDb(prev => ({
      ...prev,
      turmas: prev.turmas.map(t => t.id === id ? { ...t, ...dados } : t)
    }));
  };

  const excluirTurma = (id: string) => {
    setDb(prev => ({
      ...prev,
      turmas: prev.turmas.filter(t => t.id !== id),
      alunos: prev.alunos.filter(a => a.turmaId !== id),
      frequencias: prev.frequencias.filter(f => f.turmaId !== id),
      notas: prev.notas.filter(n => n.turmaId !== id),
      conteudos: prev.conteudos.filter(c => c.turmaId !== id),
      buscasAtivas: prev.buscasAtivas.filter(b => b.turmaId !== id)
    }));
  };

  return {
    db,
    calcularFarolAlunos,
    adicionarAluno,
    atualizarAluno,
    excluirAluno,
    adicionarTurma,
    atualizarTurma,
    excluirTurma,
    atualizarConfiguracoes,
    salvarFrequencia,
    salvarNota,
    salvarConteudo,
    registrarContatoBuscaAtiva,
    notificarConselhoTutelar,
    importarPlanilhaExcel,
    resetDatabase
  };
}
