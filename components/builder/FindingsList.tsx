'use client';

import React from 'react';
import { Finding, ReportData } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import FindingCard from './FindingCard';

interface Props {
  data: ReportData;
  onChange: (data: ReportData) => void;
}

function newFinding(): Finding {
  return {
    id: uuidv4(),
    severity: 'critical',
    title: '',
    description: '',
    location: '',
    impact: '',
    solution: '',
    showCompare: false,
  };
}

export default function FindingsList({ data, onChange }: Props) {
  const findings = data.findings;

  const addFinding = () =>
    onChange({ ...data, findings: [...findings, newFinding()] });

  const updateFinding = (id: string, updated: Finding) =>
    onChange({ ...data, findings: findings.map(f => (f.id === id ? updated : f)) });

  const removeFinding = (id: string) =>
    onChange({ ...data, findings: findings.filter(f => f.id !== id) });

  const moveFinding = (index: number, direction: 'up' | 'down') => {
    const newFindings = [...findings];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newFindings[index], newFindings[swapIndex]] = [newFindings[swapIndex], newFindings[index]];
    onChange({ ...data, findings: newFindings });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400">
          Hallazgos Detectados
          {findings.length > 0 && (
            <span className="ml-2 bg-indigo-900/60 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full">
              {findings.length}
            </span>
          )}
        </h2>
        <button onClick={addFinding} className="btn-primary text-sm">
          + Nuevo Hallazgo
        </button>
      </div>

      {findings.length === 0 && (
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-400 font-semibold mb-1">Sin hallazgos aún</p>
          <p className="text-slate-600 text-sm mb-4">
            Agrega bugs, errores, advertencias o mejoras detectadas.
          </p>
          <button onClick={addFinding} className="btn-primary text-sm">
            + Agregar primer hallazgo
          </button>
        </div>
      )}

      <div className="space-y-4">
        {findings.map((finding, index) => (
          <FindingCard
            key={finding.id}
            finding={finding}
            index={index}
            onChange={updated => updateFinding(finding.id, updated)}
            onRemove={() => removeFinding(finding.id)}
            onMoveUp={() => moveFinding(index, 'up')}
            onMoveDown={() => moveFinding(index, 'down')}
            isFirst={index === 0}
            isLast={index === findings.length - 1}
          />
        ))}
      </div>

      {findings.length > 0 && (
        <button onClick={addFinding} className="btn-secondary w-full text-sm">
          + Agregar otro hallazgo
        </button>
      )}
    </div>
  );
}
