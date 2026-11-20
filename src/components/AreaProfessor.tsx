'use client';

import React, { useState } from 'react';
import { Aluno, Turma, RegistroFrequencia, RegistroNota, RegistroConteudo, Bimestre } from '@/types/school';
import { Check, X, BookOpen, Award, Calendar, Plus, Save, Clock, HelpCircle, School, CheckCircle2 } from 'lucide-react';

interface AreaProfessorProps {
  turmas: Turma[];
  turmaAtiva: Turma;
  onSelecionarTurma: (turmaId: string) => void;
  alunos: Aluno[];
  frequencias: RegistroFrequencia[];
  notas: RegistroNota[];
  conteudos: RegistroConteudo[];
  onSalvarFrequencia: (registros: RegistroFrequencia[]) => void;
  onSalvarNota: (nota: RegistroNota) => void;
  onSalvarConteudo: (conteudo: RegistroConteudo) => void;
}

export function AreaProfessor({
  turmas,
  turmaAtiva,
  onSelecionarTurma,
  alunos,
  frequencias,
  notas,
  conteudos,
  onSalvarFrequencia,
  onSalvarNota,
  onSalvarConteudo
}: AreaProfessorProps) {
  const [subAba, setSubAba] = useState<'chamada' | 'notas' | 'conteudo'>('chamada');
  const [bimestre, setBimestre] = useState<Bimestre>(1);
  const [mesSelecionado, setMesSelecionado] = useState('marco');
  const [diaSelecionado, setDiaSelecionado] = useState<number>(20);

  // Estados locais para edição rápida de chamada
  const [chamadaState, setChamadaState] = useState<Record<string, 'P' | 'F' | 'FJ'>>({});

  // Novo Conteúdo Diário
  const [novoConteudoData, setNovoConteudoData] = useState('2026-03-20');
  const [novoConteudoComponente, setNovoConteudoComponente] = useState('Língua Portuguesa');
  const [novoConteudoTexto, setNovoConteudoTexto] = useState('');

  React.useEffect(() => {
    setNovoConteudoData(new Date().toISOString().split('T')[0]);
  }, []);

  // Carregar status atual dos alunos no dia selecionado
  React.useEffect(() => {
    const dataIso = `2026-03-${String(diaSelecionado).padStart(2, '0')}`;
    const initial: Record<string, 'P' | 'F' | 'FJ'> = {};
    alunos.forEach(a => {
      const reg = frequencias.find(f => f.alunoId === a.id && f.dataIso === dataIso);
      initial[a.id] = reg ? reg.status : 'P';
    });
    setChamadaState(initial);
  }, [diaSelecionado, alunos, frequencias]);

  const togglePresenca = (alunoId: string) => {
    setChamadaState(prev => {
      const atual = prev[alunoId] || 'P';
      let proximo: 'P' | 'F' | 'FJ' = 'P';
      if (atual === 'P') proximo = 'F';
      else if (atual === 'F') proximo = 'FJ';
      else proximo = 'P';
      return { ...prev, [alunoId]: proximo };
    });
  };

  const handleSalvarChamada = () => {
    const dataIso = `2026-03-${String(diaSelecionado).padStart(2, '0')}`;
    const novosRegistros: RegistroFrequencia[] = alunos.map(aluno => ({
      id: `freq-${aluno.id}-${dataIso}`,
      alunoId: aluno.id,
      turmaId: turmaAtiva.id,
      bimestre,
      mes: mesSelecionado,
      dia: diaSelecionado,
      dataIso,
      status: chamadaState[aluno.id] || 'P'
    }));

    onSalvarFrequencia(novosRegistros);
    alert(`Chamada da turma ${turmaAtiva.nome} salva com sucesso!`);
  };

  const marcarTodosPresentes = () => {
    const todosP: Record<string, 'P' | 'F' | 'FJ'> = {};
    alunos.forEach(a => todosP[a.id] = 'P');
    setChamadaState(todosP);
  };

  const handleAdicionarConteudo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoConteudoTexto.trim()) return;

    onSalvarConteudo({
      id: `cont-${Date.now()}`,
      turmaId: turmaAtiva.id,
      bimestre,
      data: novoConteudoData,
      componenteCurricular: novoConteudoComponente,
      conteudo: novoConteudoTexto.trim()
    });

    setNovoConteudoTexto('');
    alert('Conteúdo registrado no diário de classe!');
  };

  return (
    <div className="space-y-6">
      
      {/* SELETOR DE TURMA DESTACADO E COM BOTÕES GRANDES PARA PREVENIR ERROS */}
      <div className="bg-zinc-900 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                  Etapa Obrigatória de Segurança
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Turma Selecionada: {turmaAtiva.nome}
                </span>
              </div>
              <h2 className="text-xl font-black text-zinc-100">
                Selecione a Turma para Fazer os Lançamentos
              </h2>
            </div>
          </div>
          <div className="text-xs text-zinc-400 md:text-right">
            <div><strong>{turmas.length} turmas</strong> disponíveis para chamada</div>
            <div className="text-[11px] text-zinc-500">Clique na turma correspondente abaixo</div>
          </div>
        </div>

        {/* BOTÕES GRANDES E COM ALTO DESTAQUE VISUAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
          {turmas.map((t) => {
            const isAtiva = t.id === turmaAtiva.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelecionarTurma(t.id)}
                type="button"
                className={`p-4 rounded-xl text-left border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isAtiva
                    ? 'bg-gradient-to-br from-indigo-950 via-zinc-900 to-indigo-900/60 border-indigo-500 shadow-xl shadow-indigo-950/80 ring-2 ring-indigo-500/40 scale-[1.02]'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 opacity-75 hover:opacity-100'
                }`}
              >
                {isAtiva && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 rounded bg-indigo-600 text-white shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ativa
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {t.turno} • {t.anoLetivo}
                  </span>
                  <div className="text-lg font-black text-zinc-100 mt-2 tracking-tight">
                    {t.nome}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5 truncate">{t.curso}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex justify-between items-center">
                  <span className="truncate">Docente: {t.professora || 'A definir'}</span>
                  {t.sala && <span className="font-semibold text-zinc-300">{t.sala}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cabeçalho da Área do Professor (Idêntico ao Diário Oficial da Turma Ativa) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30">
                Diário de Classe Digital
              </span>
              <span className="text-xs text-zinc-400">{turmaAtiva.escola} • {turmaAtiva.anoLetivo}</span>
            </div>
            <h2 className="text-2xl font-black text-zinc-100 mt-1">{turmaAtiva.nome} — {turmaAtiva.curso}</h2>
            <p className="text-xs text-zinc-400">
              Professora: <strong>{turmaAtiva.professora || 'Regente'}</strong> • Turno: <strong>{turmaAtiva.turno}</strong> {turmaAtiva.sala && `• ${turmaAtiva.sala}`}
            </p>
          </div>

          {/* Seletor de Bimestre */}
          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 self-start md:self-auto">
            <span className="text-xs font-bold text-zinc-400 px-2">Bimestre:</span>
            {([1, 2, 3, 4] as Bimestre[]).map(b => (
              <button
                key={b}
                onClick={() => setBimestre(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  bimestre === b
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {b}º Bim
              </button>
            ))}
          </div>
        </div>

        {/* Sub-abas: Chamada, Notas, Conteúdo */}
        <div className="flex items-center gap-3 mt-6 border-t border-zinc-800 pt-4">
          <button
            onClick={() => setSubAba('chamada')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subAba === 'chamada'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            1. Chamada Diária & Frequência
          </button>

          <button
            onClick={() => setSubAba('notas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subAba === 'notas'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Award className="w-4 h-4" />
            2. Notas & Menções Bimestrais
          </button>

          <button
            onClick={() => setSubAba('conteudo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subAba === 'conteudo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            3. Registro Diário de Conteúdo
          </button>
        </div>
      </div>

      {/* SUB-ABA 1: CHAMADA DIÁRIA */}
      {subAba === 'chamada' && (
        <div className="space-y-4">
          {/* Barra de Controles da Chamada */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">Mês:</span>
                <select
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-semibold focus:border-indigo-500"
                >
                  <option value="fevereiro">Fevereiro</option>
                  <option value="marco">Março</option>
                  <option value="abril">Abril</option>
                  <option value="maio">Maio</option>
                  <option value="junho">Junho</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">Dia Letivo:</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diaSelecionado}
                  onChange={(e) => setDiaSelecionado(Number(e.target.value))}
                  className="w-16 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-center text-zinc-200 font-bold focus:border-indigo-500"
                />
              </div>

              <span className="text-xs text-zinc-500 hidden sm:inline">•</span>

              <div className="text-xs text-zinc-400 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  P = Presente
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  F = Falta
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  FJ = Falta Justificada
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={marcarTodosPresentes}
                type="button"
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
              >
                Todos Presentes (P)
              </button>

              <button
                onClick={handleSalvarChamada}
                type="button"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                Salvar Chamada
              </button>
            </div>
          </div>

          {/* Tabela de Alunos e Chamada */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Nº</th>
                    <th className="py-3 px-4">Nome do Aluno(a)</th>
                    <th className="py-3 px-4 text-center w-36">Status no Dia {diaSelecionado}</th>
                    <th className="py-3 px-4 text-center w-32">Faltas Acumuladas</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {alunos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">
                        Nenhum aluno cadastrado nesta turma ainda. Cadastre alunos na aba Alunos ou importe via Excel!
                      </td>
                    </tr>
                  ) : (
                    alunos.map((aluno) => {
                      const status = chamadaState[aluno.id] || 'P';
                      const faltasDoAluno = frequencias.filter(f => f.alunoId === aluno.id && f.status === 'F').length;

                      return (
                        <tr key={aluno.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4 text-center font-mono font-bold text-zinc-500">
                            {String(aluno.numero).padStart(2, '0')}
                          </td>
                          <td className="py-3 px-4 font-bold text-zinc-200">
                            {aluno.nome}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => togglePresenca(aluno.id)}
                              className={`w-14 py-1 rounded-lg font-black text-xs transition-all shadow-sm ${
                                status === 'P'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : status === 'F'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {status}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-black text-xs ${faltasDoAluno >= 15 ? 'text-rose-400 font-extrabold' : 'text-zinc-400'}`}>
                              {faltasDoAluno} {faltasDoAluno === 1 ? 'falta' : 'faltas'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => togglePresenca(aluno.id)}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                            >
                              Alternar P/F/FJ
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 2: NOTAS BIMESTRAIS (CONCEITOS S / I / EP) */}
      {subAba === 'notas' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Grade de Menções e Avaliações — {bimestre}º Bimestre
              </h3>
              <p className="text-xs text-zinc-400">
                Escala oficial da rede: <strong>S</strong> (Satisfatório), <strong>I</strong> (Insuficiente), <strong>EP</strong> (Em Processo).
              </p>
            </div>
            <div className="text-xs text-zinc-500">
              * Clique na nota para alternar o conceito do aluno.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">Nº</th>
                  <th className="py-3 px-3">Nome do Aluno</th>
                  <th className="py-3 px-3 text-center">Português</th>
                  <th className="py-3 px-3 text-center">Matemática</th>
                  <th className="py-3 px-3 text-center">Ciências</th>
                  <th className="py-3 px-3 text-center">História</th>
                  <th className="py-3 px-3 text-center">Geografia</th>
                  <th className="py-3 px-3 text-center">Arte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {alunos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500">
                      Nenhum aluno cadastrado nesta turma.
                    </td>
                  </tr>
                ) : (
                  alunos.map((aluno) => {
                    const notaAluno = notas.find(n => n.alunoId === aluno.id && n.bimestre === bimestre) || {
                      id: `nota-${aluno.id}-b${bimestre}`,
                      alunoId: aluno.id,
                      turmaId: turmaAtiva.id,
                      bimestre,
                      portugues: 'S',
                      matematica: 'S',
                      ciencias: 'S',
                      historia: 'S',
                      geografia: 'S',
                      arte: 'S'
                    };

                    const renderBotaoConceito = (disciplina: keyof RegistroNota) => {
                      const val = (notaAluno[disciplina] as string) || 'S';
                      return (
                        <button
                          onClick={() => {
                            const next = val === 'S' ? 'I' : val === 'I' ? 'EP' : 'S';
                            onSalvarNota({
                              ...notaAluno,
                              [disciplina]: next
                            } as RegistroNota);
                          }}
                          className={`w-9 h-8 rounded-lg font-black text-xs transition-all ${
                            val === 'S'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : val === 'I'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    };

                    return (
                      <tr key={aluno.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-500">
                          {String(aluno.numero).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-zinc-200">
                          {aluno.nome}
                        </td>
                        <td className="py-2.5 px-3 text-center">{renderBotaoConceito('portugues')}</td>
                        <td className="py-2.5 px-3 text-center">{renderBotaoConceito('matematica')}</td>
                        <td className="py-2.5 px-3 text-center">{renderBotaoConceito('ciencias')}</td>
                        <td className="py-2.5 px-3 text-center">{renderBotaoConceito('historia')}</td>
                        <td className="py-2.5 px-3 text-center">{renderBotaoConceito('geografia')}</td>
                        <td className="py-2.5 px-3 text-center">{renderBotaoConceito('arte')}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA 3: CONTEÚDO MINISTRADO */}
      {subAba === 'conteudo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário Novo Conteúdo */}
          <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-zinc-100 mb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Lançar Conteúdo Diário
            </h3>

            <form onSubmit={handleAdicionarConteudo} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Data / Aula</label>
                  <input
                    type="date"
                    value={novoConteudoData}
                    onChange={(e) => setNovoConteudoData(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Componente</label>
                  <select
                    value={novoConteudoComponente}
                    onChange={(e) => setNovoConteudoComponente(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500"
                  >
                    <option value="Língua Portuguesa">Língua Portuguesa</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Ciências">Ciências</option>
                    <option value="História / Geografia">História / Geografia</option>
                    <option value="Arte">Arte</option>
                    <option value="Polivalente / Projetos">Polivalente / Projetos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Descrição do Conteúdo e Objetivos</label>
                <textarea
                  rows={4}
                  placeholder="Ex: Leitura compartilhada do conto de fadas; atividades de interpretação textual no livro didático pág. 45-48..."
                  value={novoConteudoTexto}
                  onChange={(e) => setNovoConteudoTexto(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Registrar no Diário de Classe
              </button>
            </form>
          </div>

          {/* Histórico de Conteúdos da Turma */}
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-zinc-100 mb-3 flex items-center justify-between">
              <span>Conteúdos Registrados ({conteudos.length})</span>
              <span className="text-xs text-zinc-500">{turmaAtiva.nome} • {bimestre}º Bimestre</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {conteudos.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">Nenhum conteúdo lançado para este bimestre ainda.</p>
              ) : (
                conteudos.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">{c.componenteCurricular}</span>
                      <span className="text-[11px] font-mono text-zinc-500">{c.data}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{c.conteudo}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
