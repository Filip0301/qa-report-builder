'use client';

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';

interface Props {
  value: string;          // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

// ─── Color palettes ────────────────────────────────────────────────────────
const TEXT_COLORS = [
  { label: 'Rojo',      value: '#ef4444' },
  { label: 'Naranja',   value: '#f97316' },
  { label: 'Amarillo',  value: '#eab308' },
  { label: 'Verde',     value: '#22c55e' },
  { label: 'Azul',      value: '#3b82f6' },
  { label: 'Violeta',   value: '#8b5cf6' },
  { label: 'Rosa',      value: '#ec4899' },
  { label: 'Blanco',    value: '#f8fafc' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Amarillo',  value: '#fef08a', text: '#713f12' },
  { label: 'Verde',     value: '#bbf7d0', text: '#14532d' },
  { label: 'Celeste',   value: '#bae6fd', text: '#0c4a6e' },
  { label: 'Rosa',      value: '#fecdd3', text: '#881337' },
  { label: 'Naranja',   value: '#fed7aa', text: '#7c2d12' },
  { label: 'Violeta',   value: '#e9d5ff', text: '#4c1d95' },
];

// ─── Toolbar button ────────────────────────────────────────────────────────
function TBtn({
  onClick,
  title,
  active,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick(e);
      }}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors
        ${active
          ? 'bg-indigo-500 text-white'
          : 'text-slate-300 hover:bg-white/20 hover:text-white'
        }`}
    >
      {children}
    </button>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────
function TDivider() {
  return <span className="w-px h-5 bg-slate-600 mx-1 flex-shrink-0" />;
}

// ─── Main component ────────────────────────────────────────────────────────
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  rows = 4,
  className = '',
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showTextColors, setShowTextColors] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(false);

  // Sync external value → editor (only when not focused)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement !== el && el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (el) onChange(el.innerHTML);
  }, [onChange]);

  const exec = useCallback(
    (command: string, val?: string) => {
      document.execCommand(command, false, val);
      editorRef.current?.focus();
      emitChange();
    },
    [emitChange]
  );

  // ── Handle Enter key: produce <p> paragraphs instead of <div> ────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Let the browser default handle Enter inside lists (it inserts <li>)
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const node = sel.getRangeAt(0).startContainer;
      // Walk up to find if we're inside a list item
      let n: Node | null = node;
      while (n && n !== editorRef.current) {
        if (n.nodeName === 'LI') return; // inside list → let browser handle
        n = n.parentNode;
      }
      // Outside a list → insert a proper paragraph break
      e.preventDefault();
      document.execCommand('insertParagraph', false);
      emitChange();
    }
    // Shift+Enter → line break <br>
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak', false);
      emitChange();
    }
  }, [emitChange]);

  const applyColor = (color: string) => {
    exec('foreColor', color);
    setShowTextColors(false);
  };

  const applyHighlight = (bg: string) => {
    exec('hiliteColor', bg);
    setShowHighlights(false);
  };

  const clearFormat = () => {
    exec('removeFormat');
  };

  const handleFocus = () => setToolbarVisible(true);
  const handleBlur = () => {
    setTimeout(() => {
      if (document.activeElement !== editorRef.current) {
        setToolbarVisible(false);
        setShowTextColors(false);
        setShowHighlights(false);
      }
    }, 150);
  };

  const minH = `${rows * 1.75}rem`;

  return (
    <div className={`relative group ${className}`}>
      {/* ── Toolbar ─────────────────────────────────── */}
      <div
        className={`flex items-center gap-0.5 px-1.5 py-1 bg-slate-800 border border-slate-600 rounded-t-lg transition-all duration-150 flex-wrap
          ${toolbarVisible ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}
      >
        {/* ── Text format ─ */}
        <TBtn onClick={() => exec('bold')} title="Negrita (Ctrl+B)">
          <strong>B</strong>
        </TBtn>
        <TBtn onClick={() => exec('italic')} title="Cursiva (Ctrl+I)">
          <em>I</em>
        </TBtn>
        <TBtn onClick={() => exec('underline')} title="Subrayado (Ctrl+U)">
          <span className="underline">U</span>
        </TBtn>
        <TBtn onClick={() => exec('strikeThrough')} title="Tachado">
          <span className="line-through">S</span>
        </TBtn>

        <TDivider />

        {/* ── Lists ─ */}
        <TBtn onClick={() => exec('insertUnorderedList')} title="Lista con viñetas">
          {/* Bullet list icon */}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="2" cy="4" r="1.5"/>
            <rect x="5" y="3" width="10" height="2" rx="1"/>
            <circle cx="2" cy="8" r="1.5"/>
            <rect x="5" y="7" width="10" height="2" rx="1"/>
            <circle cx="2" cy="12" r="1.5"/>
            <rect x="5" y="11" width="10" height="2" rx="1"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => exec('insertOrderedList')} title="Lista numerada">
          {/* Ordered list icon */}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <text x="0" y="5" fontSize="5" fontWeight="bold">1.</text>
            <rect x="5" y="3" width="10" height="2" rx="1"/>
            <text x="0" y="9.5" fontSize="5" fontWeight="bold">2.</text>
            <rect x="5" y="7" width="10" height="2" rx="1"/>
            <text x="0" y="14" fontSize="5" fontWeight="bold">3.</text>
            <rect x="5" y="11" width="10" height="2" rx="1"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => exec('outdent')} title="Disminuir sangría">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <rect x="0" y="2" width="16" height="2" rx="1"/>
            <rect x="4" y="7" width="12" height="2" rx="1"/>
            <rect x="0" y="12" width="16" height="2" rx="1"/>
            <path d="M2 9L0 7.5 2 6v3z"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => exec('indent')} title="Aumentar sangría">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <rect x="0" y="2" width="16" height="2" rx="1"/>
            <rect x="4" y="7" width="12" height="2" rx="1"/>
            <rect x="0" y="12" width="16" height="2" rx="1"/>
            <path d="M2 6l2 1.5L2 9V6z"/>
          </svg>
        </TBtn>

        <TDivider />

        {/* ── Text color ─ */}
        <div className="relative">
          <TBtn
            onClick={(e) => {
              e.stopPropagation();
              setShowTextColors(!showTextColors);
              setShowHighlights(false);
            }}
            title="Color de texto"
          >
            <span className="flex flex-col items-center gap-0">
              <span>A</span>
              <span className="w-4 h-0.5 rounded" style={{ background: '#ef4444' }} />
            </span>
          </TBtn>
          {showTextColors && (
            <div
              className="absolute top-8 left-0 z-50 flex gap-1 p-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl"
              onMouseDown={(e) => e.preventDefault()}
            >
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onMouseDown={(e) => { e.preventDefault(); applyColor(c.value); }}
                  className="w-6 h-6 rounded-full border-2 border-transparent hover:border-white transition-all hover:scale-110"
                  style={{ background: c.value }}
                />
              ))}
              <button
                type="button"
                title="Sin color"
                onMouseDown={(e) => { e.preventDefault(); exec('foreColor', '#cbd5e1'); setShowTextColors(false); }}
                className="w-6 h-6 rounded-full border-2 border-slate-500 bg-slate-700 text-slate-400 text-[9px] font-bold hover:border-white transition-all flex items-center justify-center"
              >✕</button>
            </div>
          )}
        </div>

        {/* ── Highlight ─ */}
        <div className="relative">
          <TBtn
            onClick={(e) => {
              e.stopPropagation();
              setShowHighlights(!showHighlights);
              setShowTextColors(false);
            }}
            title="Destacador / Highlighter"
          >
            🖍️
          </TBtn>
          {showHighlights && (
            <div
              className="absolute top-8 left-0 z-50 flex gap-1 p-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl"
              onMouseDown={(e) => e.preventDefault()}
            >
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onMouseDown={(e) => { e.preventDefault(); applyHighlight(c.value); }}
                  className="w-6 h-6 rounded border-2 border-transparent hover:border-white transition-all hover:scale-110 text-[9px] font-bold"
                  style={{ background: c.value, color: c.text }}
                >
                  A
                </button>
              ))}
              <button
                type="button"
                title="Sin destacado"
                onMouseDown={(e) => { e.preventDefault(); applyHighlight('transparent'); setShowHighlights(false); }}
                className="w-6 h-6 rounded border-2 border-slate-500 bg-slate-700 text-slate-400 text-[9px] font-bold hover:border-white transition-all flex items-center justify-center"
              >✕</button>
            </div>
          )}
        </div>

        <TDivider />

        {/* ── Clear format ─ */}
        <TBtn onClick={clearFormat} title="Limpiar formato">
          <span className="text-[10px]">Tx</span>
        </TBtn>

        {/* ── Hint ─ */}
        <span className="ml-auto text-[10px] text-slate-600 pr-1 hidden sm:block">
          Enter = párrafo · Shift+Enter = salto
        </span>
      </div>

      {/* ── Editable area ────────────────────────────── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-placeholder={placeholder}
        style={{ minHeight: minH }}
        className={`
          rte-body
          w-full px-3 py-2.5 text-sm text-slate-200 bg-slate-800 border border-slate-600 border-t-0
          rounded-b-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30
          transition-all leading-relaxed
          empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 empty:before:pointer-events-none
        `}
      />
    </div>
  );
}
