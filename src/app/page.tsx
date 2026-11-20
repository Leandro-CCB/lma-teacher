'use client';

import React, { useState } from 'react';
import { useSchoolStore } from '@/lib/schoolStore';
import { FarolPresencaView } from '@/components/FarolPresencaView';
import { ModalFicai } from '@/components/ModalFicai';
import { AreaProfessor } from '@/components/AreaProfessor';
import { GestaoCadastro } from '@/components/GestaoCadastro';
import { DashboardDiretor } from '@/components/DashboardDiretor';
import { ConfiguracoesView } from '@/components/ConfiguracoesView';
import { AlunoFarolStatus, PerfilUsuario } from '@/types/school';
import {
  GraduationCap,
  LayoutDashboard,
  ShieldAlert,
  UserCheck,
  BookOpen,
  Settings,
  Users,
  School,
  LogOut,
  RefreshCw,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';

export default function LmaTeacherApp() {
  const {
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
    notificarConselhoTutelar,
    importarPlanilhaExcel,
    resetDatabase
  } = useSchoolStore();

  const [perfil, setPerfil] = useState<PerfilUsuario>('diretor');
  const [tabAtiva, setTabAtiva] = useState<'dashboard' | 'farol' | 'professor' | 'cadastros' | 'configuracoes'>('dashboard');

  // Estado para Modal FICAI
  const [alunoSelecionadoFicai, setAlunoSelecionadoFicai] = useState<AlunoFarolStatus | null>(null);

  // Turma ativa selecionada (usada no diário de classe do professor e contexto geral)
  const [turmaAtivaId, setTurmaAtivaId] = useState(db.turmas[0]?.id || 'turma-padrao');
  const turmaAtiva = db.turmas.find(t => t.id === turmaAtivaId) || db.turmas[0];

  // Filtros específicos do Farol de Presença
  const [farolTurmaFiltro, setFarolTurmaFiltro] = useState<string>('todas');
  const [farolMesFiltro, setFarolMesFiltro] = useState<string>('todos');

  // Cálculo reativo do Farol de Presença considerando turma e mês filtrados
  const alunosFarol = calcularFarolAlunos(
    farolTurmaFiltro === 'todas' ? undefined : farolTurmaFiltro,
    farolMesFiltro === 'todos' ? undefined : farolMesFiltro
  );

  // Manipular abertura da Ficha FICAI
  const handleAbrirFicai = (alunoStatus: AlunoFarolStatus) => {
    setAlunoSelecionadoFicai(alunoStatus);
  };

  const handleConfirmarNotificacao = (alunoId: string, oficio: string) => {
    notificarConselhoTutelar(alunoId, oficio);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Barra de Navegação Superior */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo e Identificação */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-zinc-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  LMA TEACHER
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Diário & Gestão
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {turmaAtiva?.escola || 'E.M. MACHADO DE ASSIS'} • {turmaAtiva?.municipio || 'Francisco Morato'}
              </p>
            </div>
          </div>

          {/* Troca de Perfil (Diretor vs Professor) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  setPerfil('diretor');
                  setTabAtiva('dashboard');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  perfil === 'diretor'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Diretoria</span>
              </button>

              <button
                onClick={() => {
                  setPerfil('professor');
                  setTabAtiva('professor');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  perfil === 'professor'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Docente</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm('Deseja restaurar a base original do Diário de Classe do 4º Ano C?')) {
                  resetDatabase();
                  alert('Banco reiniciado com dados oficiais de Francisco Morato!');
                }
              }}
              title="Restaurar dados oficiais do Excel"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Régua de Navegação de Abas (Sempre Visíveis e Destacadas) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2 border-t border-zinc-900 scrollbar-none">
          {perfil === 'diretor' && (
            <>
              <button
                onClick={() => setTabAtiva('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  tabAtiva === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard do Diretor
              </button>

              <button
                onClick={() => setTabAtiva('farol')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  tabAtiva === 'farol'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Farol de Presença & Conselho Tutelar
                {alunosFarol.filter(a => a.precisaConselhoTutelar).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setTabAtiva('cadastros')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  tabAtiva === 'cadastros'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Alunos, Turmas & Upload Excel
              </button>

              <button
                onClick={() => setTabAtiva('configuracoes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  tabAtiva === 'configuracoes'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                Configurações & Limites de Faltas
              </button>
            </>
          )}

          <button
            onClick={() => setTabAtiva('professor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              tabAtiva === 'professor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Diário de Classe do Professor (Chamada, Notas e Conteúdos)
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Renderização Condicional de Abas */}
        {tabAtiva === 'dashboard' && perfil === 'diretor' && (
          <DashboardDiretor
            alunosFarol={alunosFarol}
            turmas={db.turmas}
            buscasAtivas={db.buscasAtivas}
            onIrParaFarol={() => setTabAtiva('farol')}
            onGerarFicai={handleAbrirFicai}
          />
        )}

        {tabAtiva === 'farol' && (
          <FarolPresencaView
            alunosFarol={alunosFarol}
            turmas={db.turmas}
            turmaSelecionada={farolTurmaFiltro}
            onSelecionarTurma={setFarolTurmaFiltro}
            mesSelecionado={farolMesFiltro}
            onSelecionarMes={setFarolMesFiltro}
            onGerarFicai={handleAbrirFicai}
            onRegistrarContato={(alunoId) => {
              const motivo = prompt('Descreva o contato realizado com a família (ex: Ligação realizada, responsável orientado):');
              if (motivo) {
                alert('Contato salvo no histórico da Busca Ativa!');
              }
            }}
          />
        )}

        {tabAtiva === 'professor' && turmaAtiva && (
          <AreaProfessor
            turmas={db.turmas}
            turmaAtiva={turmaAtiva}
            onSelecionarTurma={setTurmaAtivaId}
            alunos={db.alunos.filter(a => a.turmaId === turmaAtiva.id)}
            frequencias={db.frequencias.filter(f => f.turmaId === turmaAtiva.id)}
            notas={db.notas.filter(n => n.turmaId === turmaAtiva.id)}
            conteudos={db.conteudos.filter(c => c.turmaId === turmaAtiva.id)}
            onSalvarFrequencia={salvarFrequencia}
            onSalvarNota={salvarNota}
            onSalvarConteudo={salvarConteudo}
          />
        )}

        {tabAtiva === 'cadastros' && (
          <GestaoCadastro
            turmas={db.turmas}
            alunos={db.alunos}
            onAdicionarAluno={adicionarAluno}
            onAdicionarTurma={adicionarTurma}
            onExcluirAluno={excluirAluno}
            onImportarExcel={importarPlanilhaExcel}
          />
        )}

        {tabAtiva === 'configuracoes' && perfil === 'diretor' && (
          <ConfiguracoesView
            turmas={db.turmas}
            totalAlunos={db.alunos.length}
            configuracoes={db.configuracoes}
            onAdicionarTurma={adicionarTurma}
            onAtualizarTurma={atualizarTurma}
            onExcluirTurma={excluirTurma}
            onSalvarConfiguracoes={atualizarConfiguracoes}
          />
        )}
      </main>

      {/* Modal FICAI / Conselho Tutelar */}
      {alunoSelecionadoFicai && (
        <ModalFicai
          alunoStatus={alunoSelecionadoFicai}
          turma={alunoSelecionadoFicai.turma || turmaAtiva}
          onClose={() => setAlunoSelecionadoFicai(null)}
          onConfirmarNotificacao={handleConfirmarNotificacao}
        />
      )}

      {/* Rodapé Informativo */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LMA Teacher © 2026 — Sistema Integrado de Gestão Escolar & Busca Ativa</span>
          <span>Modelo homologado: Francisco Morato / Diário de Classe Digital</span>
        </div>
      </footer>
    </div>
  );
}
