
import React, { useState, useEffect } from 'react';
import { ServiceTask, Boat, ChecklistStep } from '../types';
import { ArrowLeft, Camera, Droplets, CheckCircle, Save, Loader2, Send, Trash2, Brush, Lock, AlertCircle } from 'lucide-react';

interface ServiceDetailProps {
  task: ServiceTask | null;
  onBack: () => void;
  onUpdate: (task: ServiceTask) => void;
  fleet: Boat[];
  adminChecklist?: ChecklistStep[];
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ task, onBack, onUpdate, fleet, adminChecklist }) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // States Locais
  const [fuelLevel, setFuelLevel] = useState(task?.fuelLevel || 75);
  const [completedSteps, setCompletedSteps] = useState<string[]>(task?.completedSteps || []);
  const [fuelPhotoTaken, setFuelPhotoTaken] = useState(task?.fuelPhotoTaken || false);
  const [waterPhotoTaken, setWaterPhotoTaken] = useState(task?.waterPhotoTaken || false);

  // Verificar se o barco já teve foto hoje no sistema global (Simulado via LocalStorage para persistência entre guias)
  const currentBoat = fleet.find(b => b.name === task?.boat);
  const todayStr = new Date().toISOString().split('T')[0];
  const isFuelLocked = localStorage.getItem(`lock_fuel_${task?.boat}_${todayStr}`) === 'true';
  const isWaterLocked = localStorage.getItem(`lock_water_${task?.boat}_${todayStr}`) === 'true';

  if (!task) return null;

  const vibrate = (pattern: number | number[] = 20) => {
      if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const toggleStep = (id: string) => {
      vibrate(15);
      setCompletedSteps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleUploadPhoto = (type: 'FUEL' | 'WATER') => {
      vibrate(30);
      if (type === 'FUEL') {
          setFuelPhotoTaken(true);
          localStorage.setItem(`lock_fuel_${task.boat}_${todayStr}`, 'true');
      } else {
          setWaterPhotoTaken(true);
          localStorage.setItem(`lock_water_${task.boat}_${todayStr}`, 'true');
      }
  };

  const canClose = (fuelPhotoTaken || isFuelLocked) && (waterPhotoTaken || isWaterLocked) && completedSteps.length >= (adminChecklist?.length || 0);

  const handleFinish = () => {
      vibrate([50, 50, 50]); // Success vibration pattern
      setIsSaving(true);
      setTimeout(() => {
          onUpdate({ 
              ...task, 
              status: 'DONE', 
              fuelLevel, 
              fuelPhotoTaken: fuelPhotoTaken || isFuelLocked,
              waterPhotoTaken: waterPhotoTaken || isWaterLocked,
              completedSteps 
          });
          setIsSaving(false);
          onBack();
      }, 1000);
  };

  return (
    <div className="pb-32 max-w-3xl mx-auto px-4 animate-fadeIn">
      <div className="flex items-center mb-8 pt-4">
        <button onClick={() => { vibrate(10); onBack(); }} className="p-3 bg-white rounded-2xl border border-brand-border text-brand-muted active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5"/></button>
        <div className="ml-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Protocolo de Fecho</p>
            <h1 className="text-2xl font-black text-brand-dark font-roboto uppercase tracking-tighter">{task.boat}</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* LOCK STATUS ALERTS */}
        {(isFuelLocked || isWaterLocked) && (
            <div className="bg-brand-primary text-white p-6 rounded-[32px] shadow-lg flex items-start gap-4 border-l-8 border-brand-gold animate-slideUp">
                <Lock className="w-8 h-8 text-brand-gold shrink-0" />
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-1">Status Blindado</p>
                    <p className="text-sm font-medium">As fotos de verificação deste barco já foram submetidas por outro membro da equipa hoje. Foco apenas na limpeza e arrumação.</p>
                </div>
            </div>
        )}

        {/* VERIFICAÇÃO TÉCNICA */}
        <div className="glass-card p-8 rounded-[40px] shadow-glass border border-brand-border space-y-8">
            <div className="space-y-4">
                <label className="text-sm font-bold text-brand-dark uppercase tracking-widest flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-brand-primary" /> Combustível & Água
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        disabled={isFuelLocked}
                        onClick={() => handleUploadPhoto('FUEL')}
                        className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all active:scale-95 ${isFuelLocked || fuelPhotoTaken ? 'bg-green-50 border-green-500 text-green-700' : 'border-dashed border-brand-border text-brand-muted hover:border-brand-primary'}`}
                    >
                        {isFuelLocked || fuelPhotoTaken ? <CheckCircle className="w-8 h-8"/> : <Camera className="w-8 h-8"/>}
                        <span className="text-[10px] font-black uppercase tracking-widest">Foto Combustível</span>
                        {isFuelLocked && <span className="text-[8px] opacity-60">Já submetido</span>}
                    </button>

                    <button 
                        disabled={isWaterLocked}
                        onClick={() => handleUploadPhoto('WATER')}
                        className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all active:scale-95 ${isWaterLocked || waterPhotoTaken ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-dashed border-brand-border text-brand-muted hover:border-brand-primary'}`}
                    >
                        {isWaterLocked || waterPhotoTaken ? <CheckCircle className="w-8 h-8"/> : <Camera className="w-8 h-8"/>}
                        <span className="text-[10px] font-black uppercase tracking-widest">Foto Água</span>
                        {isWaterLocked && <span className="text-[8px] opacity-60">Já submetido</span>}
                    </button>
                </div>
            </div>

            {/* CHECKLIST CUSTOMIZÁVEL PELO ADMIN */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-brand-dark uppercase tracking-widest flex items-center gap-2">
                    <Brush className="w-5 h-5 text-brand-gold" /> Protocolo de Final de Dia
                </label>
                <div className="space-y-2">
                    {(adminChecklist || [
                        {id: '1', label: 'Limpar interiores e convés', category: 'CLEANING'},
                        {id: '2', label: 'Verificar amarrações e cabos', category: 'SAFETY'},
                        {id: '3', label: 'Colocar capa de proteção no motor', category: 'MAINTENANCE'}
                    ]).map(step => (
                        <button 
                            key={step.id}
                            onClick={() => toggleStep(step.id)}
                            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${completedSteps.includes(step.id) ? 'bg-brand-primary text-white border-brand-primary shadow-md' : 'bg-white text-brand-muted border-brand-border hover:bg-brand-bg'}`}
                        >
                            <span className="text-xs font-bold uppercase tracking-widest">{step.label}</span>
                            {completedSteps.includes(step.id) ? <CheckCircle className="w-5 h-5 text-brand-gold" /> : <div className="w-5 h-5 rounded-full border-2 border-brand-border"></div>}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* BOTÃO FINALIZAÇÃO */}
        <button 
            disabled={!canClose || isSaving}
            onClick={handleFinish}
            className="w-full py-6 bg-brand-primary text-white rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin mx-auto"/> : 'Finalizar & Reportar ao Administrador'}
        </button>
      </div>
    </div>
  );
};

export default ServiceDetail;
