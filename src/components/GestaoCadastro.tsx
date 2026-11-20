'use client';

import React, { useState } from 'react';
import { Aluno, Turma } from '@/types/school';
import * as XLSX from 'xlsx';
import { UserPlus, Upload, Users, FileSpreadsheet, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface GestaoCadastroProps {
  turmas: Turma[];
  alunos: Aluno[];
  onAdicionarAluno: (aluno: Omit<Aluno, 'id'>) => void;
  onAdicionarTurma: (turma: Omit<Turma, 'id'>) => void;
  onExcluirAluno: (id: string) => void;
  onImportarExcel: (dados: {
    turma: Partial<Turma>;
    alunos: { numero: number; nome: string }[];
    faltas?: Record<string, number>;
  }) => void;
}

export function GestaoCadastro({
  turmas,
  alunos,
  onAdicionarAluno,
  onAdicionarTurma,
  onExcluirAluno,
  onImportarExcel
}: GestaoCadastroProps) {
  const [subAba, setSubAba] = useState<'alunos' | 'importar' | 'turmas'>('importar');

  // Formulário Aluno Manual
  const [nomeAluno, setNomeAluno] = useState('');
  const [numeroAluno, setNumeroAluno] = useState<number>(alunos.length + 1);
  const [turmaAluno, setTurmaAluno] = useState(turmas[0]?.id || '');
  const [responsavelAluno, setResponsavelAluno] = useState('');
  const [telResponsavelAluno, setTelResponsavelAluno] = useState('');
  const [enderecoAluno, setEnderecoAluno] = useState('');

  // Formulário Nova Turma
  const [nomeTurma, setNomeTurma] = useState('');
  const [escolaTurma, setEscolaTurma] = useState('E.M. MACHADO DE ASSIS');
  const [professoraTurma, setProfessoraTurma] = useState('');
  const [turnoTurma, setTurnoTurma] = useState('Tarde');

  // Estado de Upload Excel
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(null);

  const handleSalvarAlunoManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeAluno.trim()) return;

    onAdicionarAluno({
      nome: nomeAluno.trim().toUpperCase(),
      numero: Number(numeroAluno),
      turmaId: turmaAluno || turmas[0]?.id || 'turma-padrao',
      responsavel: responsavelAluno.trim() || undefined,
      telefoneResponsavel: telResponsavelAluno.trim() || undefined,
      endereco: enderecoAluno.trim() || undefined
    });

    setNomeAluno('');
    setNumeroAluno(alunos.length + 2);
    setResponsavelAluno('');
    setTelResponsavelAluno('');
    setEnderecoAluno('');
    alert('Aluno cadastrado com sucesso!');
  };

  const handleSalvarNovaTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeTurma.trim()) return;

    onAdicionarTurma({
      nome: nomeTurma.trim().toUpperCase(),
      escola: escolaTurma.trim(),
      municipio: 'Francisco Morato',
      turno: turnoTurma,
      anoLetivo: 2026,
      curso: 'Ensino Fundamental I - Polivalente',
      professora: professoraTurma.trim() || 'Professora Titular'
    });

    setNomeTurma('');
    setProfessoraTurma('');
    alert('Turma criada com sucesso!');
  };

  // Parser do Excel Modelo Diário de Classe
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadFeedback(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'binary' });

        // Extrair capa ou metadados
        let nomeTurmaExtraida = '4º ANO - IMPORTADO';
        let escolaExtraida = 'E.M. MACHADO DE ASSIS';
        let professoraExtraida = 'Professora Titular';

        if (wb.SheetNames.includes('CAPA ')) {
          const capa = wb.Sheets['CAPA '];
          const valEscola = capa['G10']?.v || capa['E9']?.v;
          if (valEscola) escolaExtraida = String(valEscola);
        }

        // Tentar buscar aba de frequência ou notas para listar alunos
        let sheetAlunos = wb.Sheets['FREQUÊNCIA - 1º BIM.'] || wb.Sheets['NOTAS - 1º BIMESTRE '] || wb.Sheets[wb.SheetNames[1]];
        const alunosExtraidos: { numero: number; nome: string }[] = [];
        const faltasExtraidas: Record<string, number> = {};

        if (sheetAlunos) {
          // Ler linhas de alunos
          for (let r = 5; r <= 50; r++) {
            const cellNum = sheetAlunos[`A${r}`]?.v;
            const cellNome = sheetAlunos[`B${r}`]?.v;
            if (cellNome && typeof cellNome === 'string' && cellNome.trim().length > 3) {
              const nomeLimpo = cellNome.trim().toUpperCase();
              alunosExtraidos.push({
                numero: Number(cellNum) || alunosExtraidos.length + 1,
                nome: nomeLimpo
              });
            }
          }
        }

        // Ler aba de busca ativa para coletar faltas se houver
        if (wb.SheetNames.includes('BUSCA ATIVA - 1º BIM')) {
          const ba = wb.Sheets['BUSCA ATIVA - 1º BIM'];
          for (let r = 6; r <= 50; r++) {
            const nome = ba[`B${r}`]?.v;
            if (nome && typeof nome === 'string') {
              const f1 = Number(ba[`C${r}`]?.v || 0);
              const f2 = Number(ba[`D${r}`]?.v || 0);
              const f3 = Number(ba[`E${r}`]?.v || 0);
              faltasExtraidas[nome.trim().toUpperCase()] = f1 + f2 + f3;
            }
          }
        }

        if (alunosExtraidos.length === 0) {
          throw new Error('Nenhum aluno identificado nas abas do diário.');
        }

        onImportarExcel({
          turma: {
            nome: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
            escola: escolaExtraida,
            professora: professoraExtraida,
            anoLetivo: 2026
          },
          alunos: alunosExtraidos,
          faltas: faltasExtraidas
        });

        setUploadFeedback({
          tipo: 'sucesso',
          mensagem: `Sucesso! Foram importados ${alunosExtraidos.length} alunos e os registros de frequência da planilha.`
        });
      } catch (err: any) {
        console.error(err);
        setUploadFeedback({
          tipo: 'erro',
          mensagem: `Falha na leitura do arquivo Excel: ${err.message || 'Estrutura incompatível'}.`
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      {/* Menu Superior de Cadastros */}
      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl">
        <button
          onClick={() => setSubAba('importar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subAba === 'importar'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          Importação via Excel (.xlsx)
        </button>

        <button
          onClick={() => setSubAba('alunos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subAba === 'alunos'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Cadastro Manual de Alunos
        </button>

        <button
          onClick={() => setSubAba('turmas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subAba === 'turmas'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Turmas & Salas
        </button>
      </div>

      {/* ABA 1: IMPORTAR EXCEL */}
      {subAba === 'importar' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Importação Direta de Diário Oficial (Excel)
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Faça o upload do arquivo oficial (como o <strong>4º ANO - C.xlsx</strong>). O sistema lê automaticamente a relação nominal dos alunos, números de chamada, faltas acumuladas e cria a turma com 1 clique.
            </p>
          </div>

          <div className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-colors bg-zinc-950/50">
            <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <h4 className="font-semibold text-zinc-200 text-sm mb-1">Selecione ou arraste a planilha .xlsx</h4>
            <p className="text-xs text-zinc-500 mb-4">Formatos suportados: .xlsx, .xls</p>
            
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg transition-all">
              <span>{isProcessing ? 'Processando arquivo...' : 'Escolher Arquivo do Diário'}</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </div>

          {uploadFeedback && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-xs ${
              uploadFeedback.tipo === 'sucesso'
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}>
              {uploadFeedback.tipo === 'sucesso' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{uploadFeedback.mensagem}</span>
            </div>
          )}

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-2">
            <h5 className="font-bold text-zinc-300">Compatibilidade do Sistema:</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lê a aba <strong>FREQUÊNCIA - 1º BIM.</strong> ou <strong>NOTAS</strong> para extrair a lista nominal.</li>
              <li>Calcula o somatório de faltas da <strong>BUSCA ATIVA</strong> para alimentar o Farol de Presença imediatamente.</li>
              <li>Preserva os 200 dias letivos e a regra dos 25% de infrequência da LDB.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ABA 2: CADASTRO MANUAL DE ALUNO */}
      {subAba === 'alunos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Novo Aluno (Manual)
            </h3>

            <form onSubmit={handleSalvarAlunoManual} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nome Completo do Aluno:</label>
                <input
                  type="text"
                  value={nomeAluno}
                  onChange={(e) => setNomeAluno(e.target.value)}
                  placeholder="Ex: LUCAS SILVA DOS SANTOS"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Nº Chamada:</label>
                  <input
                    type="number"
                    value={numeroAluno}
                    onChange={(e) => setNumeroAluno(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Turma:</label>
                  <select
                    value={turmaAluno}
                    onChange={(e) => setTurmaAluno(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                  >
                    {turmas.map(t => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Nome do Responsável:</label>
                <input
                  type="text"
                  value={responsavelAluno}
                  onChange={(e) => setResponsavelAluno(e.target.value)}
                  placeholder="Mãe, Pai ou Tutor"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">WhatsApp / Telefone:</label>
                <input
                  type="text"
                  value={telResponsavelAluno}
                  onChange={(e) => setTelResponsavelAluno(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Endereço Residencial:</label>
                <input
                  type="text"
                  value={enderecoAluno}
                  onChange={(e) => setEnderecoAluno(e.target.value)}
                  placeholder="Rua, Número, Bairro"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Cadastrar Aluno
              </button>
            </form>
          </div>

          {/* Relação de Alunos Cadastrados */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-100 mb-3">Alunos Matriculados ({alunos.length})</h3>
            <div className="max-h-[450px] overflow-y-auto divide-y divide-zinc-800/60 pr-2">
              {alunos.map(aluno => (
                <div key={aluno.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-zinc-800/20 px-2 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-400 font-bold px-1.5 py-0.5 bg-zinc-800 rounded">
                      {String(aluno.numero).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="font-semibold text-zinc-200">{aluno.nome}</div>
                      <div className="text-[11px] text-zinc-500">{aluno.responsavel || 'Responsável'} • {aluno.telefoneResponsavel || 'Sem tel'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja excluir o aluno ${aluno.nome}?`)) {
                        onExcluirAluno(aluno.id);
                      }
                    }}
                    className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: TURMAS */}
      {subAba === 'turmas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Criar Nova Turma
            </h3>

            <form onSubmit={handleSalvarNovaTurma} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nome da Turma:</label>
                <input
                  type="text"
                  value={nomeTurma}
                  onChange={(e) => setNomeTurma(e.target.value)}
                  placeholder="Ex: 5º ANO - B"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 uppercase"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Escola:</label>
                <input
                  type="text"
                  value={escolaTurma}
                  onChange={(e) => setEscolaTurma(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Professora Titular:</label>
                <input
                  type="text"
                  value={professoraTurma}
                  onChange={(e) => setProfessoraTurma(e.target.value)}
                  placeholder="Nome do docente"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Turno:</label>
                <select
                  value={turnoTurma}
                  onChange={(e) => setTurnoTurma(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200"
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Integral">Integral</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Salvar Turma
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-100 mb-3">Turmas Ativas ({turmas.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {turmas.map(t => (
                <div key={t.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-100 text-sm">{t.nome}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                      {t.turno}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400">{t.escola}</div>
                  <div className="text-xs text-zinc-500">Docente: {t.professora}</div>
                  <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                    Alunos nesta turma: <strong>{alunos.filter(a => a.turmaId === t.id).length}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
