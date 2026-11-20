'use client';

import React from 'react';
import { AlunoFarolStatus, StatusFarol, Turma } from '@/types/school';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  FileText,
  Send,
  UserCheck,
  Search,
  Filter,
  Calendar,
  School,
  Users
} from 'lucide-react';

interface FarolPresencaViewProps {
  alunosFarol: AlunoFarolStatus[];
  turmas: Turma[];
  turmaSelecionada: string;
  onSelecionarTurma: (turmaId: string) => void;
  mesSelecionado: string;
  onSelecionarMes: (mes: string) => void;
  onGerarFicai: (alunoStatus: AlunoFarolStatus) => void;
  onRegistrarContato: (alunoId: string) => void;
}

export function FarolPresencaView({
  alunosFarol,
  turmas,
  turmaSelecionada,
  onSelecionarTurma,
  mesSelecionado,
  onSelecionarMes,
  onGerarFicai,
  onRegistrarContato
}: FarolPresencaViewProps) {
  const [filtroStatus, setFiltroStatus] = React.useState<StatusFarol | 'todos'>('todos');
  const [busca, setBusca] = React.useState('');

  const counts = {
    verde: alunosFarol.filter(a => a.statusFarol === 'verde').length,
    amarelo: alunosFarol.filter(a => a.statusFarol === 'amarelo').length,
    laranja: alunosFarol.filter(a => a.statusFarol === 'laranja').length,
    vermelho: alunosFarol.filter(a => a.statusFarol === 'vermelho').length,
  };

  const listaFiltrada = alunosFarol.filter(item => {
    const matchStatus = filtroStatus === 'todos' || item.statusFarol === filtroStatus;
    const matchBusca =
      item.aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
      String(item.aluno.numero).includes(busca) ||
      (item.aluno.responsavel && item.aluno.responsavel.toLowerCase().includes(busca.toLowerCase())) ||
      (item.turma && item.turma.nome.toLowerCase().includes(busca.toLowerCase()));
    return matchStatus && matchBusca;
  });

  // Agrupamento por Turma caso o filtro seja 'todas'
  const turmasIdsUnicos = Array.from(new Set(listaFiltrada.map(i => i.aluno.turmaId)));

  return (
    <div className="space-y-6">
      {/* Banner de Legislação Escolar e Busca Ativa */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                Diretriz de Infrequência Escolar & Conselho Tutelar
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Lei 13.803 / LDB Art. 12
                </span>
              </h3>
              <p className="text-sm text-zinc-400 mt-0.5">
                O diretor tem o dever legal de notificar o <strong>Conselho Tutelar</strong> ao atingir <strong>30% do limite máximo de faltas (15 faltas)</strong> ou em casos de 5 faltas consecutivas sem justificativa.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="text-right">
              <div className="text-xs text-zinc-400">Limite Máximo Legal (25%)</div>
              <div className="text-sm font-bold text-rose-400">50 Faltas no Ano Letivo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Avançados: Turma, Mês e Busca de Aluno */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Campo de Pesquisa de Aluno */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome do aluno, nº chamada, responsável ou turma..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3.5 top-2.5 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filtro de Turma */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
              <School className="w-4 h-4 text-indigo-400" />
              <span>Turma:</span>
            </div>
            <select
              value={turmaSelecionada}
              onChange={(e) => onSelecionarTurma(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="todas">Todas as Turmas ({turmas.length})</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.turno})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Mês */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Mês:</span>
            </div>
            <select
              value={mesSelecionado}
              onChange={(e) => onSelecionarMes(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="todos">Ano Todo (Acumulado)</option>
              <option value="fevereiro">Fevereiro</option>
              <option value="marco">Março</option>
              <option value="abril">Abril</option>
              <option value="maio">Maio</option>
              <option value="junho">Junho</option>
            </select>
          </div>
        </div>

        {/* Resumo da visualização ativa */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
          <div>
            Exibindo <strong>{listaFiltrada.length}</strong> de <strong>{alunosFarol.length}</strong> alunos cadastrados
            {turmaSelecionada !== 'todas' && (
              <span> • Filtrado por: <strong>{turmas.find(t => t.id === turmaSelecionada)?.nome}</strong></span>
            )}
            {mesSelecionado !== 'todos' && (
              <span> • Mês de referência: <strong className="capitalize">{mesSelecionado}</strong></span>
            )}
          </div>
          {busca && (
            <span className="text-indigo-400">Filtrando por busca: &quot;{busca}&quot;</span>
          )}
        </div>
      </div>

      {/* Seletor de Níveis do Farol (Cards Interativos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verde */}
        <button
          onClick={() => setFiltroStatus(filtroStatus === 'verde' ? 'todos' : 'verde')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filtroStatus === 'verde'
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              Frequência Regular
            </div>
            <span className="text-2xl font-black text-emerald-400">{counts.verde}</span>
          </div>
          <div className="text-xs text-zinc-400">&lt; 10 faltas acumuladas (&gt; 95% presença). Alunos com situação assídua.</div>
        </button>

        {/* Amarelo */}
        <button
          onClick={() => setFiltroStatus(filtroStatus === 'amarelo' ? 'todos' : 'amarelo')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filtroStatus === 'amarelo'
              ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/50'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              Alerta Preventivo
            </div>
            <span className="text-2xl font-black text-amber-400">{counts.amarelo}</span>
          </div>
          <div className="text-xs text-zinc-400">10 a 14 faltas. Acionar família preventivamente antes do gatilho legal.</div>
        </button>

        {/* Laranja */}
        <button
          onClick={() => setFiltroStatus(filtroStatus === 'laranja' ? 'todos' : 'laranja')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filtroStatus === 'laranja'
              ? 'bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/30 shadow-lg shadow-orange-950/50'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-orange-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
              Conselho Tutelar
            </div>
            <span className="text-2xl font-black text-orange-400">{counts.laranja}</span>
          </div>
          <div className="text-xs text-zinc-400">≥ 15 faltas (30% do limite). Notificação OBRIGATÓRIA (Ficha FICAI).</div>
        </button>

        {/* Vermelho */}
        <button
          onClick={() => setFiltroStatus(filtroStatus === 'vermelho' ? 'todos' : 'vermelho')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filtroStatus === 'vermelho'
              ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/50'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
              Risco Reprovação
            </div>
            <span className="text-2xl font-black text-rose-400">{counts.vermelho}</span>
          </div>
          <div className="text-xs text-zinc-400">≥ 50 faltas (&gt; 25% faltas). Risco irreversível sem intervenção imediata.</div>
        </button>
      </div>

      {/* Lista de Alunos Segmentados por Turma */}
      <div className="space-y-8">
        {turmasIdsUnicos.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-zinc-300">Nenhum aluno encontrado</h4>
            <p className="text-xs text-zinc-500 mt-1">Verifique os filtros de turma, mês ou termo de pesquisa informado.</p>
          </div>
        ) : (
          turmasIdsUnicos.map((turmaId) => {
            const turmaInfo = turmas.find(t => t.id === turmaId);
            const alunosDestaTurma = listaFiltrada.filter(i => i.aluno.turmaId === turmaId);

            return (
              <div key={turmaId} className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
                {/* Cabeçalho da Segmentação da Turma */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-8 bg-indigo-600 rounded-full"></span>
                    <div>
                      <h3 className="text-lg font-black text-zinc-100 flex items-center gap-2">
                        {turmaInfo?.nome || 'Turma Cadastrada'}
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {turmaInfo?.turno}
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {turmaInfo?.escola} • Docente: {turmaInfo?.professora || 'Regente'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-zinc-400 self-end sm:self-auto">
                    {alunosDestaTurma.length} estudantes listados
                  </div>
                </div>

                {/* Grid de Cards dos Alunos da Turma */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alunosDestaTurma.map((item) => {
                    const { aluno, totalFaltas, porcentagemFrequencia, porcentagemFaltasLimite, statusFarol, precisaConselhoTutelar, motivoAlerta } = item;

                    let bgCard = 'bg-zinc-950/80 border-zinc-800';
                    let corTextoStatus = 'text-emerald-400';
                    let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    let labelStatus = 'Regular';

                    if (statusFarol === 'amarelo') {
                      bgCard = 'bg-amber-950/20 border-amber-500/30';
                      corTextoStatus = 'text-amber-400';
                      badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      labelStatus = 'Alerta Preventivo';
                    } else if (statusFarol === 'laranja') {
                      bgCard = 'bg-orange-950/20 border-orange-500/40';
                      corTextoStatus = 'text-orange-400';
                      badgeBg = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
                      labelStatus = 'Conselho Tutelar';
                    } else if (statusFarol === 'vermelho') {
                      bgCard = 'bg-rose-950/20 border-rose-500/50';
                      corTextoStatus = 'text-rose-400';
                      badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                      labelStatus = 'Risco Reprovação';
                    }

                    return (
                      <div
                        key={aluno.id}
                        className={`p-4 rounded-xl border ${bgCard} flex flex-col justify-between transition-all hover:border-zinc-700 shadow-md`}
                      >
                        <div>
                          {/* Topo do Card */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-mono font-bold text-zinc-400">
                              Nº {String(aluno.numero).padStart(2, '0')}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                              {labelStatus}
                            </span>
                          </div>

                          <h4 className="font-bold text-zinc-100 text-sm leading-snug line-clamp-2">
                            {aluno.nome}
                          </h4>

                          <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
                            <div>Resp: {aluno.responsavel || 'Não informado'}</div>
                            <div>Tel: {aluno.telefoneResponsavel || 'Não cadastrado'}</div>
                          </div>

                          {/* Barra de Progresso do Limite de Faltas */}
                          <div className="mt-3 pt-3 border-t border-zinc-800/80">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-zinc-400">Faltas acumuladas:</span>
                              <span className={`font-black ${corTextoStatus}`}>
                                {totalFaltas} faltas ({porcentagemFrequencia}% freq.)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  statusFarol === 'verde'
                                    ? 'bg-emerald-500'
                                    : statusFarol === 'amarelo'
                                    ? 'bg-amber-500'
                                    : statusFarol === 'laranja'
                                    ? 'bg-orange-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, porcentagemFaltasLimite)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                              <span>0</span>
                              <span>Gatilho CT: 15</span>
                              <span>Limite: 50</span>
                            </div>
                          </div>

                          {/* Motivo do Alerta */}
                          {motivoAlerta && statusFarol !== 'verde' && (
                            <div className="mt-2.5 p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300">
                              <p className="leading-tight">{motivoAlerta}</p>
                            </div>
                          )}
                        </div>

                        {/* Ações Rápidas */}
                        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                          {aluno.telefoneResponsavel ? (
                            <a
                              href={`https://wa.me/55${aluno.telefoneResponsavel.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Olá, somos da direção da ${turmaInfo?.escola || 'Escola'}. Gostaríamos de conversar sobre a frequência escolar do(a) aluno(a) ${aluno.nome}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
                          ) : (
                            <button
                              onClick={() => onRegistrarContato(aluno.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold rounded-lg transition-colors"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              Contato
                            </button>
                          )}

                          {precisaConselhoTutelar && (
                            <button
                              onClick={() => onGerarFicai(item)}
                              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition-colors shadow-md shadow-rose-600/30"
                              title="Emitir Ficha FICAI para Conselho Tutelar"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              FICAI
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
