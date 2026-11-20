'use client';

import React from 'react';
import { AlunoFarolStatus, Turma } from '@/types/school';
import { Printer, X, ShieldAlert, School, Calendar, MapPin, Phone, User, FileCheck } from 'lucide-react';

interface ModalFicaiProps {
  alunoStatus: AlunoFarolStatus | null;
  turma: Turma;
  onClose: () => void;
  onConfirmarNotificacao: (alunoId: string, oficio: string) => void;
}

export function ModalFicai({ alunoStatus, turma, onClose, onConfirmarNotificacao }: ModalFicaiProps) {
  const [numeroOficio, setNumeroOficio] = React.useState('OF-2026/042-CT');
  const [conselheiro, setConselheiro] = React.useState('Conselheiro Tutelar Plantonista');
  const [motivo, setMotivo] = React.useState('Infrequência contínua superior a 30% do limite legal previsto na LDB (Lei 9.394/96 alterada pela Lei 13.803/2019).');
  const [dataEmissao, setDataEmissao] = React.useState('20/03/2026');

  React.useEffect(() => {
    setDataEmissao(new Date().toLocaleDateString('pt-BR'));
  }, []);

  if (!alunoStatus) return null;

  const aluno = alunoStatus.aluno;

  const handlePrint = () => {
    window.print();
  };

  const handleSalvar = () => {
    onConfirmarNotificacao(aluno.id, numeroOficio);
    alert(`Ofício ${numeroOficio} registrado com sucesso para o Conselho Tutelar!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Barra superior de controle */}
        <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 print:hidden">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <ShieldAlert className="w-5 h-5" />
            <span>Ficha FICAI & Notificação do Conselho Tutelar (Oficial)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir A4
            </button>
            <button
              onClick={handleSalvar}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              Registrar Notificação
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modelo Oficial FICAI (Folha de Impressão) */}
        <div className="p-8 bg-white text-zinc-900 print:p-0 print:m-0 font-sans">
          {/* Cabeçalho Oficial */}
          <div className="text-center border-b-2 border-zinc-900 pb-4 mb-6">
            <div className="text-xs uppercase font-bold tracking-widest text-zinc-600">Estado de São Paulo</div>
            <div className="text-lg font-black uppercase text-zinc-900">{turma.municipio}</div>
            <div className="text-sm font-bold uppercase text-zinc-800">Secretaria Municipal de Educação</div>
            <div className="text-sm font-semibold text-zinc-700">{turma.escola}</div>
            <div className="mt-3 inline-block px-3 py-1 bg-zinc-100 border border-zinc-400 rounded text-xs font-bold uppercase">
              FICAI - Ficha de Comunicação de Aluno Infrequente (Busca Ativa)
            </div>
          </div>

          {/* Dados do Ofício */}
          <div className="flex justify-between items-center text-xs mb-4 pb-2 border-b border-zinc-200">
            <div><strong>Ofício nº:</strong> {numeroOficio}</div>
            <div><strong>Data de Emissão:</strong> {dataEmissao}</div>
            <div><strong>Ano Letivo:</strong> {turma.anoLetivo}</div>
          </div>

          {/* Destinatário */}
          <div className="mb-4 bg-zinc-50 p-3 rounded border border-zinc-200 text-xs space-y-1">
            <p><strong>AO:</strong> CONSELHO TUTELAR DE FRANCISCO MORATO / VARA DA INFÂNCIA E DA JUVENTUDE</p>
            <p><strong>A/C:</strong> {conselheiro}</p>
            <p><strong>Assunto:</strong> Encaminhamento de Infrequência Escolar grave conforme Lei Federal nº 13.803/2019 e Art. 56 do ECA.</p>
          </div>

          {/* Dados do Educando */}
          <div className="mb-4 text-xs space-y-2">
            <h4 className="font-bold uppercase text-zinc-800 border-b border-zinc-300 pb-1">1. Identificação do Aluno(a)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div><strong>Nome Completo:</strong> {aluno.nome}</div>
              <div><strong>Nº Chamada:</strong> {aluno.numero} | <strong>Turma:</strong> {turma.nome} ({turma.turno})</div>
              <div><strong>Responsável Legal:</strong> {aluno.responsavel || 'Não informado'}</div>
              <div><strong>Telefone de Contato:</strong> {aluno.telefoneResponsavel || 'Não informado'}</div>
              <div className="col-span-2"><strong>Endereço Residencial:</strong> {aluno.endereco || 'Endereço escolar cadastrado na unidade'}</div>
              <div><strong>Professora Titular:</strong> {turma.professora}</div>
              <div><strong>Curso / Segmento:</strong> {turma.curso}</div>
            </div>
          </div>

          {/* Demonstrativo de Faltas */}
          <div className="mb-4 text-xs space-y-2">
            <h4 className="font-bold uppercase text-zinc-800 border-b border-zinc-300 pb-1">2. Demonstrativo da Infrequência Escolar</h4>
            <div className="grid grid-cols-3 gap-2 p-3 bg-rose-50 border border-rose-200 rounded">
              <div>
                <div className="text-zinc-600">Total de Faltas Acumuladas:</div>
                <div className="text-base font-black text-rose-700">{alunoStatus.totalFaltas} faltas</div>
              </div>
              <div>
                <div className="text-zinc-600">Limite Legal (25% LDB):</div>
                <div className="text-base font-bold text-zinc-800">50 faltas no ano</div>
              </div>
              <div>
                <div className="text-zinc-600">Gatilho de Notificação (30% do limite):</div>
                <div className="text-base font-black text-rose-700">15 faltas (ATINGIDO)</div>
              </div>
            </div>
            <p className="text-[11px] text-zinc-600 italic">
              * Observação: O estudante encontra-se com índice de infrequência que compromete a continuidade do processo pedagógico e a garantia constitucional do direito à educação.
            </p>
          </div>

          {/* Providências da Escola */}
          <div className="mb-6 text-xs space-y-2">
            <h4 className="font-bold uppercase text-zinc-800 border-b border-zinc-300 pb-1">3. Ações Preliminares Adotadas pela Unidade Escolar</h4>
            <ul className="list-disc pl-5 space-y-1 text-zinc-700">
              <li>Tentativas de contato telefônico e via aplicativo de mensagens com os responsáveis legais sem retorno satisfatório;</li>
              <li>Aviso prévio quanto aos termos da Lei Federal nº 13.803/2019 e necessidade de regularização da assiduidade;</li>
              <li>Esgotamento das medidas administrativas pedagógicas internas ao alcance da equipe diretiva.</li>
            </ul>
          </div>

          {/* Assinaturas */}
          <div className="pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-zinc-800 w-4/5 mx-auto mb-1"></div>
              <div className="font-bold">{turma.professora}</div>
              <div className="text-zinc-600">Professora Titular</div>
            </div>
            <div>
              <div className="border-b border-zinc-800 w-4/5 mx-auto mb-1"></div>
              <div className="font-bold">Direção Escolar</div>
              <div className="text-zinc-600">{turma.escola}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
