import React, { useState } from 'react';
import { normalizeOperationsData, generateChecklist, complexStrategicAnalysis } from '../services/geminiService';
import { OperationalEntry } from '../types';
import { ClipboardList, AlertTriangle, CheckCircle, BrainCircuit, Loader2, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Operations: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [entries, setEntries] = useState<OperationalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<OperationalEntry | null>(null);
  const [checklist, setChecklist] = useState<string | null>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);

  // Thinking Mode State
  const [strategyQuery, setStrategyQuery] = useState('');
  const [strategyResult, setStrategyResult] = useState('');
  const [strategyLoading, setStrategyLoading] = useState(false);

  const handleNormalize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const data = await normalizeOperationsData(inputText);
    setEntries(data);
    setLoading(false);
  };

  const handleGenerateChecklist = async (entry: OperationalEntry) => {
    setSelectedEntry(entry);
    setChecklistLoading(true);
    setChecklist(null);
    const result = await generateChecklist(entry);
    setChecklist(result);
    setChecklistLoading(false);
  };

  const handleStrategicAnalysis = async () => {
      if(!strategyQuery.trim()) return;
      setStrategyLoading(true);
      const result = await complexStrategicAnalysis(strategyQuery);
      setStrategyResult(result);
      setStrategyLoading(false);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Operações Diárias</h1>
        <p className="text-slate-500">Gestão e validação de serviços com IA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input & List */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
               <ClipboardList className="w-5 h-5 mr-2 text-teal-600" />
               Registo de Serviços (Texto Livre)
            </h2>
            <textarea
              className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
              placeholder="Ex: Tour às 09:30 no Barco Alpha com 10 pax, Guia João. Rota das Ilhas. À tarde Barco Beta com 15 pax (Atenção: Sobrelotação!)."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNormalize}
                disabled={loading || !inputText}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                Processar & Validar (Flash Lite)
              </button>
            </div>
          </div>

          {entries.length > 0 && (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer ${entry.status === 'FLAGGED' ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}
                  onClick={() => handleGenerateChecklist(entry)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{entry.boatName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{entry.timestamp}</span>
                        {entry.status === 'FLAGGED' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Atenção
                          </span>
                        )}
                        {entry.status === 'VALIDATED' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> Validado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">Guia: {entry.guideName} • {entry.paxCount} Passageiros</p>
                      <p className="text-sm text-slate-500 italic mt-1">{entry.route}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-slate-500 uppercase font-semibold">Comissão</p>
                       <p className="font-mono text-lg font-medium text-teal-700">{entry.commission}€</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Output / Checklist / Thinking */}
        <div className="space-y-6">
            {/* Strategic Thinking Module */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm">
                <h2 className="text-lg font-semibold mb-2 flex items-center text-indigo-900">
                    <BrainCircuit className="w-5 h-5 mr-2" />
                    Análise Estratégica (Thinking Mode)
                </h2>
                <p className="text-xs text-indigo-600 mb-4">Utiliza Gemini 3 Pro com budget de pensamento de 32k tokens para resolver conflitos complexos.</p>
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={strategyQuery}
                        onChange={(e) => setStrategyQuery(e.target.value)}
                        placeholder="Ex: Tenho overbooking no Sábado, como redistribuir a frota?"
                        className="flex-1 p-2 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                        onClick={handleStrategicAnalysis}
                        disabled={strategyLoading}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {strategyLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Pensar'}
                    </button>
                </div>
                {strategyResult && (
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 text-sm prose prose-sm max-w-none max-h-48 overflow-y-auto">
                        <ReactMarkdown>{strategyResult}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Checklist View */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full min-h-[400px]">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">Checklist Operacional</h2>
                {!selectedEntry ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                    <ClipboardList className="w-12 h-12 mb-2 opacity-50" />
                    <p>Selecione um serviço para gerar checklist</p>
                </div>
                ) : (
                <>
                    <div className="mb-4 pb-4 border-b border-slate-100">
                    <h3 className="font-medium text-slate-900">Serviço #{selectedEntry.id}</h3>
                    <p className="text-sm text-slate-500">{selectedEntry.boatName} - {selectedEntry.route}</p>
                    </div>
                    
                    {checklistLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                        <span className="text-sm text-slate-500">A gerar protocolo de segurança...</span>
                        </div>
                    </div>
                    ) : (
                    <div className="prose prose-sm prose-teal max-w-none overflow-y-auto max-h-[500px]">
                        <ReactMarkdown>{checklist || ''}</ReactMarkdown>
                    </div>
                    )}
                </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Operations;
