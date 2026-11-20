'use client';

import React from 'react';
import { AlunoFarolStatus, StatusFarol } from '@/types/school';
import { ShieldAlert, AlertTriangle, CheckCircle2, PhoneCall, FileText, Send, UserCheck } from 'lucide-react';

interface FarolPresencaViewProps {
  alunosFarol: AlunoFarolStatus[];
  onGerarFicai: (alunoStatus: AlunoFarolStatus) => void;
  onRegistrarContato: (alunoId: string) => void;
}

export function FarolPresencaView({ alunosFarol, onGerarFicai, onRegistrarContato }: FarolPresencaViewProps) {
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
    const matchBusca = item.aluno.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       String(item.aluno.numero).includes(busca);
    return matchStatus && matchBusca;
  });

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
          <div className="text-xs text-zinc-400">≥ 50 faltas (25% do ano). Evasão ou reprovação formal por infrequência.</div>
        </button>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome do aluno ou número..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 bg-zinc-950 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {filtroStatus !== 'todos' && (
            <button
              onClick={() => setFiltroStatus('todos')}
              className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Limpar filtro
            </button>
          )}
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2">
          Exibindo <strong>{listaFiltrada.length}</strong> de {alunosFarol.length} alunos
        </div>
      </div>

      {/* Tabela de Alunos com Farol de Presença */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Nº</th>
                <th className="py-3.5 px-4">Aluno</th>
                <th className="py-3.5 px-4 text-center">Faltas (Ano)</th>
                <th className="py-3.5 px-4">Frequência</th>
                <th className="py-3.5 px-4">Status no Farol</th>
                <th className="py-3.5 px-4 text-right">Ações da Direção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {listaFiltrada.map((item) => {
                const f = item.statusFarol;
                const corBadge = {
                  verde: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                  amarelo: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                  laranja: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
                  vermelho: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                }[f];

                const pontoCor = {
                  verde: 'bg-emerald-500',
                  amarelo: 'bg-amber-500',
                  laranja: 'bg-orange-500',
                  vermelho: 'bg-rose-500',
                }[f];

                return (
                  <tr key={item.aluno.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                      {String(item.aluno.numero).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-100">{item.aluno.nome}</div>
                      <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{item.aluno.responsavel || 'Responsável cadastrado'}</span>
                        <span>•</span>
                        <span className="font-mono">{item.aluno.telefoneResponsavel || '(11) 98765-4321'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200">
                        {item.totalFaltas}
                        <span className="text-xs text-zinc-500 font-normal ml-1">/ 50</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-zinc-200">{item.porcentagemFrequencia}%</span>
                          <span className="text-zinc-500 text-[10px]">mín 75%</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              f === 'verde' ? 'bg-emerald-500' :
                              f === 'amarelo' ? 'bg-amber-500' :
                              f === 'laranja' ? 'bg-orange-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, item.porcentagemFrequencia)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${corBadge}`}>
                          <span className={`w-2 h-2 rounded-full ${pontoCor}`}></span>
                          {f === 'verde' && 'Assíduo (Regular)'}
                          {f === 'amarelo' && 'Alerta Preventivo'}
                          {f === 'laranja' && 'Notificar C. Tutelar'}
                          {f === 'vermelho' && 'Risco Reprovação'}
                        </span>
                        <div className="text-[11px] text-zinc-400 max-w-xs line-clamp-1">
                          {item.motivoAlerta}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão de contato rápido com a família */}
                        <a
                          href={`https://wa.me/55${(item.aluno.telefoneResponsavel || '11999999999').replace(/\D/g, '')}?text=Olá,%20aqui%20é%20da%20Direção%20da%20Escola.%20Gostaríamos%20de%20conversar%20sobre%20a%20frequência%20escolar%20do(a)%20aluno(a)%20${encodeURIComponent(item.aluno.nome)}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-emerald-950/50 hover:text-emerald-400 text-zinc-300 border border-zinc-700/60 transition-colors"
                          title="Falar no WhatsApp com o Responsável"
                        >
                          <Send className="w-4 h-4" />
                        </a>

                        {/* Botão de registrar contato */}
                        <button
                          onClick={() => onRegistrarContato(item.aluno.id)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-amber-950/50 hover:text-amber-400 text-zinc-300 border border-zinc-700/60 transition-colors"
                          title="Registrar Contato / Busca Ativa"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>

                        {/* Botão de gerar FICAI Conselho Tutelar */}
                        {item.precisaConselhoTutelar && (
                          <button
                            onClick={() => onGerarFicai(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950 transition-colors"
                            title="Gerar Ficha Oficial FICAI / Conselho Tutelar"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>FICAI / CT</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
