'use client';

import React, { useState } from 'react';
import { Aluno, Turma, RegistroFrequencia, RegistroNota, RegistroConteudo, Bimestre } from '@/types/school';
import { Check, X, BookOpen, Award, Calendar, Plus, Save, Clock, HelpCircle } from 'lucide-react';

interface AreaProfessorProps {
  turma: Turma;
  alunos: Aluno[];
  frequencias: RegistroFrequencia[];
  notas: RegistroNota[];
  conteudos: RegistroConteudo[];
  onSalvarFrequencia: (registros: RegistroFrequencia[]) => void;
  onSalvarNota: (nota: RegistroNota) => void;
  onSalvarConteudo: (conteudo: RegistroConteudo) => void;
}

export function AreaProfessor({
  turma,
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
      turmaId: turma.id,
      bimestre,
      mes: mesSelecionado,
      dia: diaSelecionado,
      dataIso,
      status: chamadaState[aluno.id] || 'P'
    }));

    onSalvarFrequencia(novosRegistros);
    alert('Chamada do dia salva com sucesso no Diário Digital!');
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
      turmaId: turma.id,
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
      {/* Cabeçalho da Área do Professor (Idêntico ao Diário Oficial) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30">
                Diário de Classe Digital
              </span>
              <span className="text-xs text-zinc-400">{turma.escola} • {turma.anoLetivo}</span>
            </div>
            <h2 className="text-xl font-black text-zinc-100 mt-1">{turma.nome} — {turma.curso}</h2>
            <p className="text-xs text-zinc-400">
              Professora Titular: <strong className="text-zinc-200">{turma.professora}</strong> | Turno: {turma.turno}
            </p>
          </div>

          {/* Seletor de Bimestre */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {([1, 2, 3, 4] as Bimestre[]).map(b => (
              <button
                key={b}
                onClick={() => setBimestre(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  bimestre === b
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {b}º Bimestre
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Abas do Professor */}
        <div className="flex items-center gap-2 mt-6 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setSubAba('chamada')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              subAba === 'chamada'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Lançamento de Frequência (Chamada)
          </button>

          <button
            onClick={() => setSubAba('notas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              subAba === 'notas'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            Lançamento de Notas / Conceitos
          </button>

          <button
            onClick={() => setSubAba('conteudo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              subAba === 'conteudo'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Diário de Conteúdos Ministrados
          </button>
        </div>
      </div>

      {/* ABA 1: LANÇAMENTO DE CHAMADA */}
      {subAba === 'chamada' && (
        <div className="space-y-4">
          {/* Controles de data e ações em lote */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-400 font-semibold">Dia da Chamada:</label>
              <select
                value={diaSelecionado}
                onChange={(e) => setDiaSelecionado(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 font-bold"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>Dia {d} de Março</option>
                ))}
              </select>
              <span className="text-xs text-zinc-500">
                Toque no botão do status para alternar: <strong>P</strong> (Presente) ➔ <strong>F</strong> (Falta) ➔ <strong>FJ</strong> (Justificada).
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={marcarTodosPresentes}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                Marcar Todos P
              </button>
              <button
                onClick={handleSalvarChamada}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar Chamada
              </button>
            </div>
          </div>

          {/* Grid de Alunos para Chamada */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-zinc-800/60">
              {alunos.map(aluno => {
                const status = chamadaState[aluno.id] || 'P';
                return (
                  <div
                    key={aluno.id}
                    className="flex items-center justify-between p-3.5 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                        {String(aluno.numero).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="font-semibold text-zinc-100 text-sm">{aluno.nome}</div>
                        <div className="text-[11px] text-zinc-500">Matrícula regular</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePresenca(aluno.id)}
                        className={`w-14 h-9 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                          status === 'P'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : status === 'F'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 ring-2 ring-rose-500/20'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                      >
                        {status === 'P' && 'P'}
                        {status === 'F' && 'F'}
                        {status === 'FJ' && 'FJ'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: LANÇAMENTO DE NOTAS / CONCEITOS (S / I) */}
      {subAba === 'notas' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl p-4">
          <div className="mb-4 text-xs text-zinc-400 flex items-center justify-between">
            <span>Conceitos oficiais do Diário: <strong>S</strong> (Satisfatório) | <strong>I</strong> (Insuficiente) | <strong>EP</strong> (Em Processo)</span>
            <span className="text-indigo-400 font-semibold">{bimestre}º Bimestre</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-3">Nº</th>
                  <th className="py-3 px-3">Aluno</th>
                  <th className="py-3 px-2 text-center">Português</th>
                  <th className="py-3 px-2 text-center">Matemática</th>
                  <th className="py-3 px-2 text-center">Ciências</th>
                  <th className="py-3 px-2 text-center">História</th>
                  <th className="py-3 px-2 text-center">Geografia</th>
                  <th className="py-3 px-2 text-center">Arte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {alunos.map(aluno => {
                  const n = notas.find(item => item.alunoId === aluno.id && item.bimestre === bimestre) || {
                    id: `nota-${aluno.id}-${bimestre}`,
                    alunoId: aluno.id,
                    turmaId: turma.id,
                    bimestre,
                    portugues: 'S',
                    matematica: 'S',
                    ciencias: 'S',
                    historia: 'S',
                    geografia: 'S',
                    arte: 'S'
                  };

                  const handleChange = (materia: keyof RegistroNota, valor: string) => {
                    const atualizada = { ...n, [materia]: valor };
                    onSalvarNota(atualizada as RegistroNota);
                  };

                  return (
                    <tr key={aluno.id} className="hover:bg-zinc-800/30">
                      <td className="py-2.5 px-3 font-mono text-zinc-400">{String(aluno.numero).padStart(2, '0')}</td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-200">{aluno.nome}</td>
                      {(['portugues', 'matematica', 'ciencias', 'historia', 'geografia', 'arte'] as (keyof RegistroNota)[]).map(mat => {
                        const val = (n[mat] as string) || 'S';
                        return (
                          <td key={mat} className="py-2.5 px-2 text-center">
                            <select
                              value={val}
                              onChange={(e) => handleChange(mat, e.target.value)}
                              className={`px-2 py-1 rounded font-bold text-center border text-xs ${
                                val === 'S'
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                                  : val === 'I'
                                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              <option value="S">S</option>
                              <option value="I">I</option>
                              <option value="EP">EP</option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: CONTEÚDO MINISTRADO */}
      {subAba === 'conteudo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Novo Conteúdo */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl h-fit">
            <h3 className="font-bold text-zinc-100 text-sm mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Novo Registro de Aula Ministrada
            </h3>
            <form onSubmit={handleAdicionarConteudo} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Data / Período:</label>
                <input
                  type="date"
                  value={novoConteudoData}
                  onChange={(e) => setNovoConteudoData(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Componente Curricular:</label>
                <select
                  value={novoConteudoComponente}
                  onChange={(e) => setNovoConteudoComponente(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                >
                  <option value="Polivalente">Polivalente (Geral)</option>
                  <option value="Língua Portuguesa">Língua Portuguesa</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Ciências">Ciências</option>
                  <option value="História">História</option>
                  <option value="Geografia">Geografia</option>
                  <option value="Arte">Arte</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Descrição das Atividades & Habilidades BNCC:</label>
                <textarea
                  rows={4}
                  value={novoConteudoTexto}
                  onChange={(e) => setNovoConteudoTexto(e.target.value)}
                  placeholder="Ex: Leitura e interpretação de texto, substantivos e ortografia..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 placeholder-zinc-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Salvar Conteúdo no Diário
              </button>
            </form>
          </div>

          {/* Lista de Conteúdos Registrados */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="font-bold text-zinc-100 text-sm mb-2">Aulas e Conteúdos Registrados ({conteudos.length})</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {conteudos.map((item, idx) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-400">{item.data}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {item.componenteCurricular || 'Polivalente'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{item.conteudo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
