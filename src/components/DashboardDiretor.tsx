'use client';

import React from 'react';
import { AlunoFarolStatus, Turma, RegistroBuscaAtiva } from '@/types/school';
import {
  Users,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Clock,
  PhoneCall,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardDiretorProps {
  alunosFarol: AlunoFarolStatus[];
  turmas: Turma[];
  buscasAtivas: RegistroBuscaAtiva[];
  onIrParaFarol: () => void;
  onGerarFicai: (aluno: AlunoFarolStatus) => void;
}

export function DashboardDiretor({
  alunosFarol,
  turmas,
  buscasAtivas,
  onIrParaFarol,
  onGerarFicai
}: DashboardDiretorProps) {
  const totalAlunos = alunosFarol.length;
  const alunosVerde = alunosFarol.filter(a => a.statusFarol === 'verde').length;
  const alunosAmarelo = alunosFarol.filter(a => a.statusFarol === 'amarelo').length;
  const alunosLaranja = alunosFarol.filter(a => a.statusFarol === 'laranja').length;
  const alunosVermelho = alunosFarol.filter(a => a.statusFarol === 'vermelho').length;

  const totalEmAlertaCT = alunosFarol.filter(a => a.precisaConselhoTutelar).length;
  const totalRiscoReprovacao = alunosFarol.filter(a => a.riscoReprovacao).length;

  // Média de presença geral
  const mediaPresenca = totalAlunos > 0
    ? Math.round(alunosFarol.reduce((acc, curr) => acc + curr.porcentagemFrequencia, 0) / totalAlunos)
    : 100;

  // Dados para Gráfico de Pizza (Status Farol)
  const dataPie = [
    { name: 'Regular (Verde)', value: alunosVerde, color: '#10b981' },
    { name: 'Preventivo (Amarelo)', value: alunosAmarelo, color: '#f59e0b' },
    { name: 'Conselho Tutelar (Laranja)', value: alunosLaranja, color: '#f97316' },
    { name: 'Risco Reprovação (Vermelho)', value: alunosVermelho, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Top 5 Alunos com maior índice de faltas
  const topFaltosos = [...alunosFarol]
    .sort((a, b) => b.totalFaltas - a.totalFaltas)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Alerta crítico no topo se houver acionamentos pendentes de CT */}
      {totalEmAlertaCT > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 via-orange-950/40 to-zinc-900 border border-rose-500/50 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600/20 text-rose-400 rounded-xl animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500 text-white">
                  Ação Urgente Obrigatória
                </span>
                <span className="text-xs text-rose-300 font-semibold">Lei Federal 13.803 / LDB</span>
              </div>
              <h3 className="text-lg font-black text-zinc-100 mt-1">
                {totalEmAlertaCT} {totalEmAlertaCT === 1 ? 'aluno ultrapassou' : 'alunos ultrapassaram'} os 30% do limite de faltas!
              </h3>
              <p className="text-xs text-zinc-400">
                A direção escolar deve emitir a ficha FICAI e oficiar o Conselho Tutelar e a Vara da Infância imediatamente.
              </p>
            </div>
          </div>

          <button
            onClick={onIrParaFarol}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all self-end md:self-auto whitespace-nowrap"
          >
            Abrir Central do Farol & FICAI
          </button>
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold">Matrícula Total</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-zinc-100 mt-2">{totalAlunos}</div>
          <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
            <span>{turmas.length} turmas ativas</span> • <span>E.M. Machado de Assis</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2 */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold">Média Geral de Presença</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{mediaPresenca}%</div>
          <div className="text-xs text-zinc-500 mt-1">Meta legal LDB: mínimo de 75%</div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 3 */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold">Gatilho Conselho Tutelar</span>
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-orange-400 mt-2">{totalEmAlertaCT}</div>
          <div className="text-xs text-zinc-500 mt-1">Alunos com ≥ 15 faltas no ano</div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 4 */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold">Risco Reprovação (&gt;25%)</span>
            <ShieldCheck className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 mt-2">{totalRiscoReprovacao}</div>
          <div className="text-xs text-zinc-500 mt-1">Estudantes com ≥ 50 faltas</div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Gráficos e Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição do Farol de Presença */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-zinc-100 mb-1 flex items-center justify-between">
            <span>Distribuição do Farol de Presença</span>
            <span className="text-xs text-zinc-500">Total: {totalAlunos}</span>
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Classificação dos estudantes por faixas de risco</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={5}
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Regular: <strong>{alunosVerde}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Preventivo: <strong>{alunosAmarelo}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              Conselho: <strong>{alunosLaranja}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Reprovação: <strong>{alunosVermelho}</strong>
            </div>
          </div>
        </div>

        {/* Top 5 Alunos com Atenção Prioritária */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-zinc-100">Casos Críticos para Busca Ativa (Top Faltas)</h3>
              <button
                onClick={onIrParaFarol}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Ver todos no Farol ➔
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4">Estudantes com maior acúmulo de ausências e intervenção necessária</p>

            <div className="space-y-3">
              {topFaltosos.map((item, idx) => (
                <div
                  key={item.aluno.id}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold w-6 text-zinc-500 text-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100 text-xs sm:text-sm">{item.aluno.nome}</span>
                        {item.turma && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {item.turma.nome}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Resp: {item.aluno.responsavel || 'Cadastrado'} • Tel: {item.aluno.telefoneResponsavel || 'Não inf.'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-rose-400">{item.totalFaltas} faltas</div>
                      <div className="text-[10px] text-zinc-500">{item.porcentagemFrequencia}% freq.</div>
                    </div>

                    {item.precisaConselhoTutelar && (
                      <button
                        onClick={() => onGerarFicai(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-md transition-colors"
                      >
                        Emitir FICAI
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Base legal: Lei Federal 13.803/2019 e Art. 56 da Lei nº 8.069/1990 (ECA).</span>
            <span className="text-zinc-400 font-medium">Francisco Morato - SP</span>
          </div>
        </div>
      </div>

      {/* Quadro de Todas as Turmas da Unidade Escolar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Quadro de Todas as Turmas da Unidade ({turmas.length} turmas cadastradas)
            </h3>
            <p className="text-xs text-zinc-400">Visão consolidada de todas as salas, docentes e turnos da instituição</p>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            Total Geral de Estudantes: <strong className="text-zinc-200">{totalAlunos}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {turmas.map((t) => {
            const alunosDestaTurma = alunosFarol.filter(a => a.aluno.turmaId === t.id);
            const criticosCT = alunosDestaTurma.filter(a => a.precisaConselhoTutelar).length;
            const riscoReprov = alunosDestaTurma.filter(a => a.riscoReprovacao).length;
            const mediaTurma = alunosDestaTurma.length > 0
              ? Math.round(alunosDestaTurma.reduce((acc, curr) => acc + curr.porcentagemFrequencia, 0) / alunosDestaTurma.length)
              : 100;

            return (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {t.turno} • {t.anoLetivo}
                    </span>
                    <h4 className="text-base font-black text-zinc-100 mt-1">{t.nome}</h4>
                    <p className="text-xs text-zinc-400 truncate">{t.curso}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">{mediaTurma}%</span>
                    <div className="text-[10px] text-zinc-500">freq. média</div>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 space-y-1">
                  <div>Docente: <strong className="text-zinc-200">{t.professora || 'Regente a definir'}</strong></div>
                  <div className="flex items-center justify-between">
                    <span>Estudantes: <strong className="text-zinc-200">{alunosDestaTurma.length}</strong></span>
                    {t.sala && <span className="text-zinc-400">{t.sala}</span>}
                  </div>
                </div>

                {/* Badges de alerta da turma */}
                <div className="flex items-center gap-2 pt-1">
                  {criticosCT > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {criticosCT} no Conselho Tutelar
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-400/80">
                      Sem casos críticos de CT
                    </span>
                  )}
                  {riscoReprov > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {riscoReprov} risco reprovação
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
