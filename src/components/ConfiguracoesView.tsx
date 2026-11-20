'use client';

import React, { useState } from 'react';
import { Turma } from '@/types/school';
import { SchoolDatabase } from '@/lib/schoolStore';
import {
  Settings,
  Sliders,
  School,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Save,
  Users,
  BookOpen
} from 'lucide-react';

interface ConfiguracoesViewProps {
  turmas: Turma[];
  totalAlunos: number;
  configuracoes: SchoolDatabase['configuracoes'];
  onAdicionarTurma: (turma: Omit<Turma, 'id'>) => void;
  onAtualizarTurma: (id: string, dados: Partial<Turma>) => void;
  onExcluirTurma: (id: string) => void;
  onSalvarConfiguracoes: (novasConfig: Partial<SchoolDatabase['configuracoes']>) => void;
}

export function ConfiguracoesView({
  turmas,
  totalAlunos,
  configuracoes,
  onAdicionarTurma,
  onAtualizarTurma,
  onExcluirTurma,
  onSalvarConfiguracoes
}: ConfiguracoesViewProps) {
  // Estado local para parâmetros de faltas
  const [diasLetivos, setDiasLetivos] = useState(configuracoes.diasLetivosAno || 200);
  const [limiteFaltas, setLimiteFaltas] = useState(configuracoes.limiteFaltasMaximo || 50);
  const [gatilhoCT, setGatilhoCT] = useState(configuracoes.percentualAlertaConselhoTutelar || 15);
  const [conselhoNome, setConselhoNome] = useState(configuracoes.conselhoTutelarNome || 'Conselho Tutelar de Francisco Morato');
  const [conselhoTelefone, setConselhoTelefone] = useState(configuracoes.conselhoTutelarTelefone || '(11) 4488-2020');
  const [conselhoEmail, setConselhoEmail] = useState(configuracoes.conselhoTutelarEmail || 'conselhotutelar@franciscomorato.sp.gov.br');
  const [mensagemSucessoConfig, setMensagemSucessoConfig] = useState(false);

  // Estado para cadastro de nova turma
  const [mostrarModalTurma, setMostrarModalTurma] = useState(false);
  const [editandoTurmaId, setEditandoTurmaId] = useState<string | null>(null);

  const [formTurma, setFormTurma] = useState({
    nome: '',
    escola: 'E.M. MACHADO DE ASSIS',
    municipio: 'Prefeitura Municipal de Francisco Morato',
    turno: 'Manhã',
    anoLetivo: 2026,
    curso: 'Ensino Fundamental I - Polivalente',
    professora: '',
    sala: ''
  });

  const handleSalvarRegrasFaltas = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarConfiguracoes({
      diasLetivosAno: Number(diasLetivos),
      limiteFaltasMaximo: Number(limiteFaltas),
      percentualAlertaConselhoTutelar: Number(gatilhoCT),
      conselhoTutelarNome: conselhoNome,
      conselhoTutelarTelefone: conselhoTelefone,
      conselhoTutelarEmail: conselhoEmail
    });

    setMensagemSucessoConfig(true);
    setTimeout(() => setMensagemSucessoConfig(false), 3000);
  };

  const handleAbrirCriarTurma = () => {
    setEditandoTurmaId(null);
    setFormTurma({
      nome: '',
      escola: 'E.M. MACHADO DE ASSIS',
      municipio: 'Prefeitura Municipal de Francisco Morato',
      turno: 'Manhã',
      anoLetivo: 2026,
      curso: 'Ensino Fundamental I - Polivalente',
      professora: '',
      sala: ''
    });
    setMostrarModalTurma(true);
  };

  const handleAbrirEditarTurma = (t: Turma) => {
    setEditandoTurmaId(t.id);
    setFormTurma({
      nome: t.nome,
      escola: t.escola,
      municipio: t.municipio,
      turno: t.turno,
      anoLetivo: t.anoLetivo,
      curso: t.curso,
      professora: t.professora,
      sala: t.sala || ''
    });
    setMostrarModalTurma(true);
  };

  const handleSalvarTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTurma.nome.trim()) {
      alert('Preencha o nome da turma!');
      return;
    }

    if (editandoTurmaId) {
      onAtualizarTurma(editandoTurmaId, formTurma);
    } else {
      onAdicionarTurma(formTurma);
    }

    setMostrarModalTurma(false);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-black text-zinc-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Configurações do Sistema & Cadastro de Turmas
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Gerencie as turmas ativas da unidade escolar e configure os parâmetros e limites oficiais de faltas e Conselho Tutelar.
        </p>
      </div>

      {/* Grid Principal: Parâmetros de Faltas e Turmas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Regras e Limites de Faltas (LDB / Conselho Tutelar) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100 text-base">Parâmetros de Limite de Faltas</h3>
                <p className="text-xs text-zinc-400">Regras do Farol de Presença e Alerta Tutelar</p>
              </div>
            </div>

            {mensagemSucessoConfig && (
              <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Limites e parâmetros salvos com sucesso no sistema!
              </div>
            )}

            <form onSubmit={handleSalvarRegrasFaltas} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Dias Letivos Anuais Obrigatórios
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max="300"
                    value={diasLetivos}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDiasLetivos(val);
                      // Calcular automaticamente o limite de 25% (LDB)
                      const calcMax = Math.round(val * 0.25);
                      setLimiteFaltas(calcMax);
                      // Calcular 30% do limite máximo para gatilho CT (Lei 13.803/2019)
                      setGatilhoCT(Math.round(calcMax * 0.30));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-zinc-500">dias</span>
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Padrão LDB (Art. 24): 200 dias de efetivo trabalho escolar.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-zinc-300">
                    Limite Máximo de Faltas (Reprovação - 25%)
                  </label>
                  <span className="text-xs font-black text-rose-400">{limiteFaltas} faltas</span>
                </div>
                <input
                  type="number"
                  min="10"
                  max="150"
                  value={limiteFaltas}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLimiteFaltas(val);
                    setGatilhoCT(Math.round(val * 0.30));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
                  required
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Alunos com faltas ≥ a este limite entram na faixa <strong>Vermelha</strong> de reprovação.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-zinc-300">
                    Gatilho Notificação Conselho Tutelar (Ficha FICAI)
                  </label>
                  <span className="text-xs font-black text-amber-400">{gatilhoCT} faltas</span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={gatilhoCT}
                  onChange={(e) => setGatilhoCT(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Conforme Lei 13.803/2019: 30% do percentual permitido de faltas (30% de {limiteFaltas} = {gatilhoCT} faltas).
                </span>
              </div>

              {/* Informações de Contato do Conselho Tutelar */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Dados do Conselho Tutelar Local
                </h4>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Órgão / Vara</label>
                  <input
                    type="text"
                    value={conselhoNome}
                    onChange={(e) => setConselhoNome(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Telefone Plantão</label>
                    <input
                      type="text"
                      value={conselhoTelefone}
                      onChange={(e) => setConselhoTelefone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">E-mail Notificação</label>
                    <input
                      type="email"
                      value={conselhoEmail}
                      onChange={(e) => setConselhoEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-xs"
              >
                <Save className="w-4 h-4" />
                Salvar Regras de Limites e Conselho
              </button>
            </form>
          </div>
        </div>

        {/* Lado Direito: Cadastro e Gestão de Turmas */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-base">Turmas Cadastradas ({turmas.length})</h3>
                  <p className="text-xs text-zinc-400">Total de {totalAlunos} alunos matriculados na unidade</p>
                </div>
              </div>

              <button
                onClick={handleAbrirCriarTurma}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nova Turma
              </button>
            </div>

            {/* Lista de Turmas com Cartões Grandes e Destaque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {turmas.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-500/30">
                        {t.turno} • {t.anoLetivo}
                      </span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAbrirEditarTurma(t)}
                          title="Editar turma"
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {turmas.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir a turma ${t.nome}? Alunos vinculados também serão removidos.`)) {
                                onExcluirTurma(t.id);
                              }
                            }}
                            title="Excluir turma"
                            className="p-1.5 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-lg font-black text-zinc-100 tracking-tight">{t.nome}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{t.curso}</p>
                    {t.sala && (
                      <p className="text-xs font-semibold text-zinc-400 mt-1">Sala: {t.sala}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900 text-xs text-zinc-400 space-y-1">
                    <div><strong>Docente:</strong> {t.professora || 'A definir'}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{t.escola}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Criar / Editar Turma */}
      {mostrarModalTurma && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-black text-zinc-100 mb-4 pb-3 border-b border-zinc-800 flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-400" />
              {editandoTurmaId ? 'Editar Dados da Turma' : 'Cadastrar Nova Turma'}
            </h3>

            <form onSubmit={handleSalvarTurma} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Nome da Turma *</label>
                <input
                  type="text"
                  placeholder="Ex: 4º ANO - C ou 5º ANO - A"
                  value={formTurma.nome}
                  onChange={(e) => setFormTurma({ ...formTurma, nome: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Turno</label>
                  <select
                    value={formTurma.turno}
                    onChange={(e) => setFormTurma({ ...formTurma, turno: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500"
                  >
                    <option value="Manhã">Manhã (07:00 - 12:00)</option>
                    <option value="Tarde">Tarde (12:30 - 17:30)</option>
                    <option value="Integral">Integral</option>
                    <option value="Noite">Noite / EJA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Ano Letivo</label>
                  <input
                    type="number"
                    value={formTurma.anoLetivo}
                    onChange={(e) => setFormTurma({ ...formTurma, anoLetivo: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Professor(a) Regente</label>
                <input
                  type="text"
                  placeholder="Ex: Bruna Guedes da Silva Maia"
                  value={formTurma.professora}
                  onChange={(e) => setFormTurma({ ...formTurma, professora: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Sala / Bloco</label>
                  <input
                    type="text"
                    placeholder="Ex: Sala 04"
                    value={formTurma.sala}
                    onChange={(e) => setFormTurma({ ...formTurma, sala: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Curso / Etapa</label>
                  <input
                    type="text"
                    value={formTurma.curso}
                    onChange={(e) => setFormTurma({ ...formTurma, curso: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Unidade Escolar</label>
                <input
                  type="text"
                  value={formTurma.escola}
                  onChange={(e) => setFormTurma({ ...formTurma, escola: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMostrarModalTurma(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Salvar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
