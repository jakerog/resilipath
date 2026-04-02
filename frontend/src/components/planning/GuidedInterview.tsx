'use client';

import React, { useState, useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { ChevronLeft, ChevronRight, Save, Tag, CheckCircle2, Circle } from 'lucide-react';
import { clsx } from 'clsx';

interface GuidedInterviewProps {
  template: any;
  initialData?: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
  isSaving?: boolean;
}

export const GuidedInterview: React.FC<GuidedInterviewProps> = ({
  template,
  initialData = {},
  onSave,
  isSaving = false
}) => {
  const { tenantId } = useAuth();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  const sections = template.sections || [];
  const currentSection = sections[currentSectionIndex];

  // 1. Asset Fetching (for asset-link type)
  const assetConstraints = useMemo(() => {
    if (!tenantId) return [];
    return [where('tenantId', '==', tenantId), orderBy('name', 'asc')];
  }, [tenantId]);

  const { data: assets } = useFirestoreQuery('assets', assetConstraints);

  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleToggleAsset = (questionId: string, assetId: string) => {
    const currentSelection = formData[questionId] || [];
    const newSelection = currentSelection.includes(assetId)
      ? currentSelection.filter((id: string) => id !== assetId)
      : [...currentSelection, assetId];
    handleInputChange(questionId, newSelection);
  };

  const nextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const isLastSection = currentSectionIndex === sections.length - 1;

  if (!currentSection) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Progress Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-primary">{currentSection.title}</h2>
          <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
            Section {currentSectionIndex + 1} of {sections.length} • {template.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex gap-1">
            {sections.map((_: any, idx: number) => (
              <div
                key={idx}
                className={clsx(
                  "h-1 w-8 rounded-full transition-all duration-300",
                  idx === currentSectionIndex ? "bg-brand-accent w-12" :
                  idx < currentSectionIndex ? "bg-brand-success" : "bg-brand-secondary/20"
                )}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Question Canvas */}
      <SkeuomorphicContainer className="min-h-[400px] flex flex-col">
        <div className="flex-1 space-y-8">
           <p className="text-sm text-brand-secondary italic border-l-4 border-brand-accent/30 pl-4 py-1">
            {currentSection.description}
          </p>

          <div className="space-y-10">
            {currentSection.questions.map((question: any) => (
              <div key={question.id} className="space-y-4">
                <label className="block text-sm font-bold text-brand-primary">
                  {question.text}
                </label>

                {/* Text Input */}
                {question.type === 'text' && (
                  <textarea
                    value={formData[question.id] || ''}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none min-h-[120px]"
                    placeholder="Enter details..."
                  />
                )}

                {/* Choice / Single Select */}
                {question.type === 'choice' && (
                  <div className="grid md:grid-cols-2 gap-3">
                    {question.options?.map((option: string) => (
                      <button
                        key={option}
                        onClick={() => handleInputChange(question.id, option)}
                        className={clsx(
                          "p-4 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between group",
                          formData[question.id] === option
                            ? "neumorphic-inset text-brand-accent bg-brand-accent/5 border-brand-accent/20"
                            : "neumorphic-button text-brand-secondary border-transparent hover:text-brand-primary"
                        )}
                      >
                        {option}
                        {formData[question.id] === option ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4 opacity-20" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Asset Link (Phase 2.1 Integration) */}
                {question.type === 'asset-link' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest opacity-60">
                      Linking from your isolated asset registry
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {assets.map((asset: any) => {
                        const isSelected = (formData[question.id] || []).includes(asset.assetId);
                        return (
                          <button
                            key={asset.assetId}
                            onClick={() => handleToggleAsset(question.id, asset.assetId)}
                            className={clsx(
                              "p-4 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between",
                              isSelected
                                ? "neumorphic-inset text-brand-accent bg-brand-accent/5"
                                : "neumorphic-button text-brand-secondary"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Tag className="w-4 h-4 opacity-60" />
                              <span>{asset.name}</span>
                            </div>
                            {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-20" />}
                          </button>
                        );
                      })}
                      {assets.length === 0 && (
                        <p className="text-xs italic text-brand-secondary opacity-50">No assets found in registry.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-brand-secondary/10 flex items-center justify-between">
          <button
            onClick={prevSection}
            disabled={currentSectionIndex === 0}
            className="neumorphic-button p-3 disabled:opacity-20 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-brand-primary" />
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => onSave(formData)}
              disabled={isSaving}
              className="neumorphic-button px-6 py-2 text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-brand-accent" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            {!isLastSection ? (
              <button
                onClick={nextSection}
                className="neumorphic-button px-6 py-2 text-xs font-bold text-white bg-brand-accent uppercase tracking-widest flex items-center gap-2"
              >
                Next Section <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                 onClick={() => onSave(formData)}
                 disabled={isSaving}
                 className="neumorphic-button px-6 py-2 text-xs font-bold text-white bg-brand-success uppercase tracking-widest flex items-center gap-2"
              >
                Complete Plan <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </SkeuomorphicContainer>
    </div>
  );
};
