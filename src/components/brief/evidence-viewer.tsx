'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase, ChevronDown, ChevronRight, ExternalLink, FolderGit, Globe,
  Image as ImageIcon, Link as LinkIcon, X,
} from 'lucide-react';
import type {
  ClaimVerdict, Evidence, EvidencePacket, EvidenceSnippet, ProvenanceLog,
} from '@/types';
import { VerdictBadge } from '@/components/ui/verdict-badge';
import { cn, truncateText } from '@/lib/utils';

interface EvidenceViewerProps {
  evidencePackets: EvidencePacket[];
  candidateName: string;
}

type SectionKey = 'timeline' | 'evidence' | 'visited';
type SectionState = Record<SectionKey, boolean>;
type ModalState = { key: string; url: string; step?: number } | null;
type ScreenshotPayload = { key: string; url: string; step?: number };

const VERDICT_DOT: Record<ClaimVerdict, string> = {
  SUPPORTED: 'bg-green-500',
  WEAKLY_SUPPORTED: 'bg-yellow-500',
  UNVERIFIED: 'bg-gray-500',
  CONTRADICTED: 'bg-red-500',
};

const VERDICT_LABEL: Record<ClaimVerdict, string> = {
  SUPPORTED: 'Supported',
  WEAKLY_SUPPORTED: 'Weakly supported',
  UNVERIFIED: 'Unverified',
  CONTRADICTED: 'Contradicted',
};

function packetKey(p: EvidencePacket, i: number): string {
  return p.id ?? p.claimId ?? String(i);
}

function screenshotUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '';
  return base ? `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}` : key;
}

function safeHostname(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function formatTimestamp(value: Date | string | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

function confidenceTextColor(v: number): string {
  if (v >= 0.7) return 'text-green-400';
  if (v >= 0.4) return 'text-yellow-400';
  return 'text-red-400';
}

function relevanceBarColor(v: number): string {
  if (v >= 0.7) return 'bg-green-500';
  if (v >= 0.4) return 'bg-yellow-500';
  return 'bg-red-500';
}

function clampPercent(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.min(100, Math.max(0, v * 100));
}

function elapsedSeconds(provenance: ProvenanceLog[]): number | null {
  const stamps = provenance
    .map((p) => (p.timestamp instanceof Date ? p.timestamp.getTime() : new Date(p.timestamp).getTime()))
    .filter((n) => !Number.isNaN(n));
  if (stamps.length < 2) return null;
  return Math.max(0, Math.round((Math.max(...stamps) - Math.min(...stamps)) / 1000));
}

function getSourceMeta(sourceType: string): { Icon: LucideIcon; label: string; chip: string } {
  const lower = (sourceType ?? '').toLowerCase();
  const neutral = 'bg-[#27272a] text-[#a1a1aa] border-[#3a3a3c]';
  if (lower === 'github_api') return { Icon: FolderGit, label: 'GitHub API', chip: neutral };
  if (lower === 'github_browser') return { Icon: FolderGit, label: 'GitHub Browser', chip: neutral };
  if (lower.includes('portfolio')) return { Icon: Globe, label: 'Portfolio', chip: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
  if (lower === 'linkedin') return { Icon: Briefcase, label: 'LinkedIn', chip: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
  return { Icon: LinkIcon, label: sourceType || 'Source', chip: neutral };
}

function supportBadge(s: EvidenceSnippet['supportsClaim']): { label: string; className: string } {
  if (s === true) return { label: 'Supports', className: 'bg-green-500/10 text-green-400 border-green-500/20' };
  if (s === false) return { label: 'Contradicts', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
  return { label: 'Uncertain', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
}

export function EvidenceViewer({ evidencePackets, candidateName }: EvidenceViewerProps) {
  const idPrefix = useId();
  const [selectedKey, setSelectedKey] = useState<string>(() =>
    evidencePackets[0] ? packetKey(evidencePackets[0], 0) : ''
  );
  const [expandAll, setExpandAll] = useState(true);
  const [openSections, setOpenSections] = useState<SectionState>({
    timeline: true, evidence: true, visited: true,
  });
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    setSelectedKey(evidencePackets[0] ? packetKey(evidencePackets[0], 0) : '');
  }, [evidencePackets]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const selectedPacket = useMemo<EvidencePacket | null>(() => {
    if (evidencePackets.length === 0) return null;
    const found = evidencePackets.find((p, i) => packetKey(p, i) === selectedKey);
    return found ?? evidencePackets[0];
  }, [evidencePackets, selectedKey]);

  function toggleAll() {
    const next = !expandAll;
    setExpandAll(next);
    setOpenSections({ timeline: next, evidence: next, visited: next });
  }

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex h-full bg-[#0A0A0B] text-[#f5f5f5]">
      <aside className="w-[250px] shrink-0 border-r border-[#27272a] overflow-y-auto">
        <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-[#71717a]">Claims</div>
        {evidencePackets.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-[#71717a]">No claims yet</div>
        ) : (
          <ul className="pb-4">
            {evidencePackets.map((packet, index) => {
              const key = packetKey(packet, index);
              const selected = key === selectedKey;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    aria-current={selected ? 'true' : undefined}
                    className={cn(
                      'w-full text-left flex items-center gap-2 px-3 py-2.5 transition-colors border-l-2',
                      selected
                        ? 'border-[#2563EB] bg-[#1a1a1b]'
                        : 'border-transparent hover:bg-[#1a1a1b]/60'
                    )}
                  >
                    <span
                      role="img"
                      aria-label={`Verdict: ${VERDICT_LABEL[packet.verdict]}`}
                      className={cn('inline-block h-2 w-2 rounded-full shrink-0', VERDICT_DOT[packet.verdict])}
                    />
                    <span className="flex-1 text-xs text-[#f5f5f5] truncate">
                      {truncateText(packet.claimText, 40)}
                    </span>
                    <span className={cn('text-xs font-mono tabular-nums', confidenceTextColor(packet.confidence))}>
                      {Math.round(packet.confidence * 100)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between gap-4 border-b border-[#27272a] px-6 py-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-[#71717a]">Evidence Audit Trail</div>
            <div className="text-sm font-medium text-[#f5f5f5] truncate">{candidateName}</div>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className="rounded-md border border-[#27272a] bg-[#1a1a1b] px-3 py-1.5 text-xs text-[#a1a1aa] hover:border-[#3a3a3c] hover:text-[#f5f5f5] transition-colors"
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedPacket ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-[#a1a1aa]">No evidence packets for {candidateName}</div>
                <div className="mt-1 text-xs text-[#71717a]">
                  When agents finish verifying claims, results will appear here.
                </div>
              </div>
            </div>
          ) : (
            <PacketDetail
              packet={selectedPacket}
              openSections={openSections}
              toggleSection={toggleSection}
              onOpenScreenshot={setModal}
              idPrefix={idPrefix}
            />
          )}
        </div>
      </main>

      {modal ? <ScreenshotModal modal={modal} onClose={() => setModal(null)} /> : null}
    </div>
  );
}

function PacketDetail({
  packet, openSections, toggleSection, onOpenScreenshot, idPrefix,
}: {
  packet: EvidencePacket;
  openSections: SectionState;
  toggleSection: (key: SectionKey) => void;
  onOpenScreenshot: (payload: ScreenshotPayload) => void;
  idPrefix: string;
}) {
  const allSnippets: EvidenceSnippet[] = packet.evidence.flatMap((e) => e.snippets);
  const supporting = allSnippets.filter((s) => s.supportsClaim === true).slice(0, 5);
  const weakness = allSnippets.filter((s) => s.supportsClaim === false).slice(0, 5);
  const reasoning = packet.evidence[0]?.agentReasoning ?? '';
  const elapsed = elapsedSeconds(packet.provenance);

  return (
    <>
      <section className="rounded-lg border border-[#27272a] bg-[#1a1a1b] p-6">
        <div className="flex items-center justify-between gap-4">
          <VerdictBadge verdict={packet.verdict} />
          <div className={cn('text-4xl font-mono tabular-nums', confidenceTextColor(packet.confidence))}>
            {Math.round(packet.confidence * 100)}%
          </div>
        </div>
        <p className="mt-4 text-sm text-[#a1a1aa]">{packet.claimText}</p>
        {reasoning ? <p className="mt-2 text-xs text-[#71717a] italic line-clamp-2">{reasoning}</p> : null}

        <div className="mt-6 grid grid-cols-2 gap-6">
          <SignalList title="Supporting Signals" items={supporting} bulletClassName="text-green-400" />
          <SignalList title="Weakness Signals" items={weakness} bulletClassName="text-red-400" />
        </div>
      </section>

      <CollapsibleSection
        title="Agent Activity Timeline" sectionKey="timeline"
        open={openSections.timeline} onToggle={toggleSection}
        idPrefix={idPrefix} count={packet.provenance.length}
      >
        {packet.provenance.length === 0
          ? <EmptyHint label="No agent activity recorded." />
          : (
            <ol className="space-y-3">
              {packet.provenance.map((step, idx) => (
                <TimelineRow key={`${step.step}-${idx}`} step={step} onOpenScreenshot={onOpenScreenshot} />
              ))}
            </ol>
          )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Evidence Items" sectionKey="evidence"
        open={openSections.evidence} onToggle={toggleSection}
        idPrefix={idPrefix} count={packet.evidence.length}
      >
        {packet.evidence.length === 0
          ? <EmptyHint label="No evidence collected." />
          : (
            <div className="space-y-4">
              {packet.evidence.map((item, idx) => (
                <EvidenceCard key={`${item.sourceUrl}-${idx}`} evidence={item} onOpenScreenshot={onOpenScreenshot} />
              ))}
            </div>
          )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Visited Pages" sectionKey="visited"
        open={openSections.visited} onToggle={toggleSection}
        idPrefix={idPrefix} count={packet.visitedUrls.length}
      >
        {packet.visitedUrls.length === 0
          ? <EmptyHint label="No pages visited." />
          : (
            <div className="flex flex-wrap gap-2">
              {packet.visitedUrls.map((url, idx) => (
                <a
                  key={`${url}-${idx}`} href={url} target="_blank" rel="noopener noreferrer" title={url}
                  className="inline-flex items-center gap-1 rounded-full border border-[#27272a] bg-[#1a1a1b] px-2.5 py-1 text-xs text-[#a1a1aa] hover:border-[#3a3a3c] hover:text-[#f5f5f5]"
                >
                  <Globe className="h-3 w-3" aria-hidden="true" />
                  <span>{safeHostname(url)}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
      </CollapsibleSection>

      <div className="text-xs text-[#71717a]">
        Steps: {packet.totalSteps} · Vision Calls: {packet.visionCallCount} ·
        {' '}Cost: ${packet.costUSD.toFixed(2)} · Time: {elapsed === null ? '—' : `${elapsed}s`}
      </div>
    </>
  );
}

function TimelineRow({
  step, onOpenScreenshot,
}: { step: ProvenanceLog; onOpenScreenshot: (p: ScreenshotPayload) => void }) {
  return (
    <li className="rounded-md border border-[#27272a] bg-[#1a1a1b] p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="rounded bg-[#27272a] px-2 py-0.5 text-xs font-mono">{step.step}</span>
        <span className="text-sm text-[#f5f5f5]">Step {step.step} — {step.action}</span>
        {step.screenshotS3Key ? (
          <button
            type="button"
            onClick={() => onOpenScreenshot({ key: step.screenshotS3Key as string, url: step.url, step: step.step })}
            className="ml-auto inline-flex items-center gap-1 rounded border border-[#27272a] px-1.5 py-0.5 text-xs text-[#a1a1aa] hover:border-[#3a3a3c] hover:text-[#f5f5f5]"
          >
            <ImageIcon className="h-3 w-3" aria-hidden="true" />
            Screenshot
          </button>
        ) : null}
      </div>
      <div
        className="mt-1 truncate max-w-md text-xs text-[#a1a1aa]"
        title={`${step.url}\n${formatTimestamp(step.timestamp)}`}
      >
        {step.url}
      </div>
      {step.reasoning ? <div className="mt-1 text-xs text-[#71717a] italic">{step.reasoning}</div> : null}
    </li>
  );
}

function SignalList({
  title, items, bulletClassName,
}: { title: string; items: EvidenceSnippet[]; bulletClassName: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[#71717a] mb-2">{title}</div>
      {items.length === 0 ? (
        <div className="text-sm text-[#71717a]">—</div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((snippet, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-[#f5f5f5]">
              <span className={cn('shrink-0 leading-5', bulletClassName)} aria-hidden="true">•</span>
              <span className="text-[#a1a1aa] line-clamp-2">{snippet.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CollapsibleSection({
  title, sectionKey, open, onToggle, idPrefix, count, children,
}: {
  title: string;
  sectionKey: SectionKey;
  open: boolean;
  onToggle: (key: SectionKey) => void;
  idPrefix: string;
  count?: number;
  children: React.ReactNode;
}) {
  const panelId = `${idPrefix}-${sectionKey}`;
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <section className="rounded-lg border border-[#27272a] bg-[#1a1a1b]">
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[#0A0A0B]/40 rounded-t-lg"
      >
        <Chevron className="h-4 w-4 text-[#71717a]" aria-hidden="true" />
        <span className="text-sm font-medium text-[#f5f5f5]">{title}</span>
        {typeof count === 'number' ? (
          <span className="text-xs font-mono tabular-nums text-[#71717a]">({count})</span>
        ) : null}
      </button>
      {open ? <div id={panelId} className="px-4 pb-4 pt-1">{children}</div> : null}
    </section>
  );
}

function EvidenceCard({
  evidence, onOpenScreenshot,
}: { evidence: Evidence; onOpenScreenshot: (p: ScreenshotPayload) => void }) {
  const meta = getSourceMeta(evidence.sourceType);
  const SourceIcon = meta.Icon;
  return (
    <div className="rounded-md border border-[#27272a] bg-[#0A0A0B] p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs', meta.chip)}>
            <SourceIcon className="h-3 w-3" aria-hidden="true" />
            {meta.label}
          </span>
          <a
            href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer"
            title={evidence.sourceUrl}
            className="ml-2 inline-flex items-center gap-1 text-xs text-[#a1a1aa] hover:text-[#f5f5f5] hover:underline align-middle"
          >
            <span className="truncate max-w-xs inline-block align-middle">{evidence.sourceUrl}</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          {evidence.pageTitle ? (
            <div className="mt-1 text-sm text-[#a1a1aa]">{evidence.pageTitle}</div>
          ) : null}
        </div>
        {evidence.screenshotS3Key ? (
          <button
            type="button"
            onClick={() => onOpenScreenshot({ key: evidence.screenshotS3Key as string, url: evidence.sourceUrl })}
            className="cursor-zoom-in shrink-0 overflow-hidden rounded border border-[#27272a] hover:border-[#3a3a3c]"
            aria-label="Open screenshot"
          >
            <img
              src={screenshotUrl(evidence.screenshotS3Key)}
              alt="Evidence screenshot"
              className="h-[80px] w-[120px] object-cover"
              loading="lazy"
            />
          </button>
        ) : null}
      </div>

      {evidence.snippets.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {evidence.snippets.map((snippet, idx) => (
            <SnippetRow key={idx} snippet={snippet} />
          ))}
        </ul>
      ) : (
        <EmptyHint label="No snippets extracted." className="mt-3" />
      )}

      {evidence.agentReasoning ? (
        <p className="mt-3 text-xs text-[#71717a] italic">{evidence.agentReasoning}</p>
      ) : null}
    </div>
  );
}

function SnippetRow({ snippet }: { snippet: EvidenceSnippet }) {
  const support = supportBadge(snippet.supportsClaim);
  const pct = Math.round(clampPercent(snippet.relevance));
  return (
    <li className="rounded border border-[#27272a] bg-[#1a1a1b] p-3">
      <div className="text-sm text-[#f5f5f5]">{snippet.text}</div>
      {snippet.context ? (
        <div className="mt-1 text-xs text-[#71717a] italic">{snippet.context}</div>
      ) : null}
      <div className="mt-2 flex items-center gap-3">
        <div
          className="flex-1 h-1 rounded-full bg-[#27272a] overflow-hidden"
          role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Relevance"
        >
          <div className={cn('h-full rounded-full', relevanceBarColor(snippet.relevance))} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-mono tabular-nums text-[#71717a] w-10 text-right">{pct}%</span>
        <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wide', support.className)}>
          {support.label}
        </span>
      </div>
    </li>
  );
}

function EmptyHint({ label, className }: { label: string; className?: string }) {
  return <div className={cn('text-xs text-[#71717a]', className)}>{label}</div>;
}

function ScreenshotModal({
  modal, onClose,
}: { modal: NonNullable<ModalState>; onClose: () => void }) {
  return (
    <div
      role="dialog" aria-modal="true" aria-label="Screenshot viewer"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
    >
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {typeof modal.step === 'number' ? (
            <span className="rounded bg-[#0A0A0B]/80 px-2 py-1 text-xs font-mono text-[#f5f5f5] border border-[#27272a]">
              Step {modal.step}
            </span>
          ) : null}
          <span className="rounded bg-[#0A0A0B]/80 px-2 py-1 text-xs font-mono text-[#a1a1aa] max-w-[60vw] truncate">
            {modal.url}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close screenshot viewer"
          className="pointer-events-auto rounded-md bg-[#0A0A0B]/80 border border-[#27272a] p-1.5 text-[#f5f5f5] hover:border-[#3a3a3c]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <img
          src={screenshotUrl(modal.key)}
          alt="Screenshot"
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-md shadow-2xl"
        />
      </div>
    </div>
  );
}
