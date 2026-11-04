'use client';

import React from 'react';
import type { AnyDocData } from '@/lib/types';

import ReportMeta from '@/components/builder/ReportMeta';
import ExecutiveSummary from '@/components/builder/ExecutiveSummary';
import FindingsList from '@/components/builder/FindingsList';
import BusinessImpact from '@/components/builder/BusinessImpact';
import DLMeta from '@/components/builder/datalayer/DLMeta';
import DLEventsList from '@/components/builder/datalayer/DLEventsList';
import DLVariablesList from '@/components/builder/datalayer/DLVariablesList';
import TPMeta from '@/components/builder/tagging-plan/TPMeta';
import TPItemsList from '@/components/builder/tagging-plan/TPItemsList';
import GTMMeta from '@/components/builder/gtm-audit/GTMMeta';
import GTMTagsList from '@/components/builder/gtm-audit/GTMTagsList';
import GTMTriggersList from '@/components/builder/gtm-audit/GTMTriggersList';
import GTMVariablesList from '@/components/builder/gtm-audit/GTMVariablesList';
import CM360Meta from '@/components/builder/cm360-audit/CM360Meta';
import CM360FloodlightsList from '@/components/builder/cm360-audit/CM360FloodlightsList';
import CM360VariablesList from '@/components/builder/cm360-audit/CM360VariablesList';
import CM360TriggersList from '@/components/builder/cm360-audit/CM360TriggersList';
import CM360TagsList from '@/components/builder/cm360-audit/CM360TagsList';
import CM360TaggingProposalsList from '@/components/builder/cm360-audit/CM360TaggingProposalsList';

type Editor<T> = React.ComponentType<{ data: T; onChange: (d: T) => void }>;
type SectionMap<T> = Record<string, Editor<T>>;

const sections: { [K in AnyDocData['docType']]: SectionMap<Extract<AnyDocData, { docType: K }>> } = {
  'qa-audit': { meta: ReportMeta, summary: ExecutiveSummary, findings: FindingsList, business: BusinessImpact },
  'datalayer-doc': { meta: DLMeta, events: DLEventsList, variables: DLVariablesList },
  'tagging-plan': { meta: TPMeta, items: TPItemsList },
  'gtm-audit': { meta: GTMMeta, tags: GTMTagsList, triggers: GTMTriggersList, variables: GTMVariablesList },
  'cm360-audit': {
    meta: CM360Meta,
    floodlights: CM360FloodlightsList,
    variables: CM360VariablesList,
    triggers: CM360TriggersList,
    tags: CM360TagsList,
    proposals: CM360TaggingProposalsList,
  },
};

/** Renderiza el formulario de la sección activa para el tipo de documento abierto. */
export default function SectionContent({
  data,
  section,
  onChange,
}: {
  data: AnyDocData;
  section: string;
  onChange: (d: AnyDocData) => void;
}) {
  const map = sections[data.docType] as SectionMap<AnyDocData>;
  const Component = map[section] ?? map.meta;
  return <Component data={data} onChange={onChange} />;
}
