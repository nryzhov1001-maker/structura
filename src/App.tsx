import { useMemo, useRef, useState } from 'react'
import {
  ArrowLeftRight,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clipboard,
  Code2,
  Copy,
  Download,
  FileCode2,
  FileJson2,
  FileUp,
  Info,
  Layers3,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Network,
  PanelLeftClose,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TreePine,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'
import { sampleJson, sampleYaml } from './data/sample'
import {
  describeValue,
  getDocumentStats,
  parseDocument,
  queryPath,
  serializeDocument,
  type DataFormat,
  type InputFormat,
} from './lib/document'

type View = 'workbench' | 'tree' | 'query' | 'about'

const REPOSITORY_URL = 'https://github.com/nryzhov1001-maker/structura'

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const navItems = [
  { id: 'workbench' as const, label: 'Workbench', icon: Braces, shortcut: '⌘1' },
  { id: 'tree' as const, label: 'Tree explorer', icon: TreePine, shortcut: '⌘2' },
  { id: 'query' as const, label: 'Path query', icon: TerminalSquare, shortcut: '⌘3' },
]

function FormatTabs({ value, onChange, auto = false }: { value: InputFormat; onChange: (format: InputFormat) => void; auto?: boolean }) {
  const formats: InputFormat[] = auto ? ['auto', 'json', 'yaml'] : ['json', 'yaml']
  return <div className="format-tabs">{formats.map((format) => <button key={format} className={value === format ? 'active' : ''} onClick={() => onChange(format)}>{format}</button>)}</div>
}

function IconButton({ label, children, onClick, disabled = false }: { label: string; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button className="icon-button" aria-label={label} title={label} onClick={onClick} disabled={disabled}>{children}</button>
}

function LineNumbers({ text }: { text: string }) {
  const count = Math.max(1, text.split('\n').length)
  return <div className="line-numbers" aria-hidden="true">{Array.from({ length: count }, (_, index) => <span key={index}>{index + 1}</span>)}</div>
}

function StatusBar({ valid, format, text, time, error }: { valid: boolean; format?: DataFormat; text: string; time: number; error?: string }) {
  const lines = text ? text.split('\n').length : 0
  const bytes = new TextEncoder().encode(text).length
  return <div className={`status-bar ${valid ? 'valid' : 'invalid'}`}><span className="status-main">{valid ? <Check size={12} /> : <X size={12} />}{valid ? 'Valid document' : 'Needs attention'}</span>{error ? <span className="status-error">{error}</span> : <><span>{format?.toUpperCase()}</span><span>UTF-8</span><span>{lines} lines</span><span>{bytes.toLocaleString()} bytes</span><span>{time.toFixed(1)} ms</span></>}</div>
}

function ValuePreview({ value }: { value: unknown }) {
  if (value === null) return <span className="value-null">null</span>
  if (typeof value === 'string') return <span className="value-string">“{value}”</span>
  if (typeof value === 'number') return <span className="value-number">{String(value)}</span>
  if (typeof value === 'boolean') return <span className="value-boolean">{String(value)}</span>
  return <span className="value-meta">{describeValue(value)}</span>
}

function TreeNode({ name, value, depth = 0, defaultOpen = true }: { name: string; value: unknown; depth?: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen && depth < 2)
  const expandable = value !== null && typeof value === 'object'
  const entries = expandable ? Object.entries(value as Record<string, unknown>) : []

  return <div className="tree-node">
    <button className="tree-row" style={{ paddingLeft: `${depth * 18 + 8}px` }} onClick={() => expandable && setOpen((current) => !current)}>
      <span className={`tree-chevron ${expandable ? '' : 'empty'}`}>{open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</span>
      <span className="tree-key">{name}</span>
      <span className="tree-colon">:</span>
      {!expandable && <ValuePreview value={value} />}
      {expandable && <span className="value-meta">{Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}</span>}
    </button>
    {expandable && open && <div>{entries.map(([key, child]) => <TreeNode key={key} name={key} value={child} depth={depth + 1} />)}</div>}
  </div>
}

function EmptyState({ error }: { error?: string }) {
  return <div className="empty-state"><div><FileCode2 size={23} /></div><h3>{error ? 'Unable to build output' : 'Start typing to convert'}</h3><p>{error ?? 'Paste JSON or YAML into the source editor.'}</p></div>
}

export default function App() {
  const [view, setView] = useState<View>('workbench')
  const [source, setSource] = useState(sampleJson)
  const [inputFormat, setInputFormat] = useState<InputFormat>('auto')
  const [outputFormat, setOutputFormat] = useState<DataFormat>('yaml')
  const [compact, setCompact] = useState(false)
  const [query, setQuery] = useState('$.project.runtime.mode')
  const [toast, setToast] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const conversion = useMemo(() => {
    const started = performance.now()
    try {
      const parsed = parseDocument(source, inputFormat)
      return {
        parsed,
        output: serializeDocument(parsed.data, outputFormat, compact),
        error: undefined,
        time: performance.now() - started,
        stats: getDocumentStats(parsed.data, source),
      }
    } catch (error) {
      return {
        parsed: undefined,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        time: performance.now() - started,
        stats: undefined,
      }
    }
  }, [source, inputFormat, outputFormat, compact])

  const queryResult = useMemo(() => {
    if (!conversion.parsed) return { value: undefined, error: 'Fix the document before running a query' }
    try { return { value: queryPath(conversion.parsed.data, query), error: undefined } }
    catch (error) { return { value: undefined, error: error instanceof Error ? error.message : 'Invalid path' } }
  }, [conversion.parsed, query])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  const copyOutput = async () => {
    if (!conversion.output) return
    await navigator.clipboard.writeText(conversion.output)
    notify(`${outputFormat.toUpperCase()} copied to clipboard`)
  }

  const downloadOutput = () => {
    if (!conversion.output) return
    const blob = new Blob([conversion.output], { type: outputFormat === 'json' ? 'application/json' : 'application/yaml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `structura-output.${outputFormat === 'json' ? 'json' : 'yaml'}`
    link.click()
    URL.revokeObjectURL(url)
    notify('File downloaded')
  }

  const formatSource = () => {
    if (!conversion.parsed) return
    setSource(serializeDocument(conversion.parsed.data, conversion.parsed.format))
    notify('Source formatted')
  }

  const swapDocuments = () => {
    if (!conversion.parsed) return
    const previousFormat = conversion.parsed.format
    setSource(conversion.output)
    setInputFormat(outputFormat)
    setOutputFormat(previousFormat)
    setCompact(false)
    notify('Source and output swapped')
  }

  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSource(String(reader.result ?? ''))
      setInputFormat(file.name.endsWith('.json') ? 'json' : file.name.endsWith('.yaml') || file.name.endsWith('.yml') ? 'yaml' : 'auto')
      setOutputFormat(file.name.endsWith('.json') ? 'yaml' : 'json')
      notify(`${file.name} loaded locally`)
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const loadSample = (format: DataFormat) => {
    setSource(format === 'json' ? sampleJson : sampleYaml)
    setInputFormat(format)
    setOutputFormat(format === 'json' ? 'yaml' : 'json')
    setCompact(false)
    notify(`${format.toUpperCase()} sample loaded`)
  }

  const renderWorkbench = () => <>
    <section className="page-heading">
      <div><span className="overline"><Zap size={11} /> LOCAL TRANSFORM</span><h1>Shape structured data<br />without the friction.</h1><p>Convert, inspect and validate JSON or YAML. Your data never leaves this browser.</p></div>
      <div className="heading-actions"><button className="ghost-button" onClick={() => loadSample('json')}><Sparkles size={15} /> Load sample</button><button className="primary-button" onClick={() => fileInput.current?.click()}><FileUp size={15} /> Open file</button></div>
    </section>

    <section className="editor-shell">
      <div className="editor-column source-column">
        <header className="editor-head"><div><span className="editor-index">01</span><div><strong>Source</strong><small>Paste or open a document</small></div></div><div className="editor-tools"><FormatTabs value={inputFormat} onChange={setInputFormat} auto /><IconButton label="Format source" onClick={formatSource} disabled={!conversion.parsed}><WandSparkles size={15} /></IconButton><IconButton label="Clear source" onClick={() => setSource('')}><RotateCcw size={15} /></IconButton><IconButton label="More source actions"><MoreHorizontal size={16} /></IconButton></div></header>
        <div className="code-editor"><LineNumbers text={source} /><textarea aria-label="Source document" spellCheck={false} value={source} onChange={(event) => setSource(event.target.value)} /></div>
        <StatusBar valid={Boolean(conversion.parsed)} format={conversion.parsed?.format} text={source} time={conversion.time} error={conversion.error} />
      </div>

      <div className="convert-rail"><div className="rail-line" /><button aria-label="Swap source and output" title="Swap source and output" onClick={swapDocuments} disabled={!conversion.parsed}><ArrowLeftRight size={17} /></button><span>convert</span><div className="rail-line" /></div>

      <div className="editor-column output-column">
        <header className="editor-head"><div><span className="editor-index accent">02</span><div><strong>Output</strong><small>Live, deterministic result</small></div></div><div className="editor-tools"><FormatTabs value={outputFormat} onChange={(format) => setOutputFormat(format as DataFormat)} /><IconButton label={compact ? 'Expand JSON' : 'Minify JSON'} onClick={() => setCompact((current) => !current)} disabled={outputFormat !== 'json'}>{compact ? <Maximize2 size={15} /> : <Minimize2 size={15} />}</IconButton><IconButton label="Copy output" onClick={copyOutput} disabled={!conversion.output}><Copy size={15} /></IconButton><IconButton label="Download output" onClick={downloadOutput} disabled={!conversion.output}><Download size={15} /></IconButton></div></header>
        <div className="code-editor output-editor">{conversion.output ? <><LineNumbers text={conversion.output} /><pre>{conversion.output}</pre></> : <EmptyState error={conversion.error} />}</div>
        <StatusBar valid={Boolean(conversion.output)} format={outputFormat} text={conversion.output} time={conversion.time} error={conversion.error} />
      </div>
    </section>

    <section className="insight-grid">
      <article className="insight-card"><div className="insight-icon"><Network size={17} /></div><span>STRUCTURE</span><strong>{conversion.stats?.nodes ?? '—'}</strong><small>total nodes</small></article>
      <article className="insight-card"><div className="insight-icon violet"><Layers3 size={17} /></div><span>KEYS</span><strong>{conversion.stats?.keys ?? '—'}</strong><small>object properties</small></article>
      <article className="insight-card"><div className="insight-icon amber"><TreePine size={17} /></div><span>MAX DEPTH</span><strong>{conversion.stats?.depth ?? '—'}</strong><small>nested levels</small></article>
      <article className="insight-card privacy-card"><ShieldCheck size={22} /><div><span>PRIVATE BY DEFAULT</span><strong>100% local processing</strong><small>No upload, telemetry or account required.</small></div></article>
    </section>
  </>

  const renderTree = () => <section className="feature-page"><div className="feature-heading"><div><span className="overline"><TreePine size={11} /> STRUCTURE EXPLORER</span><h1>See the shape,<br />not just the syntax.</h1><p>Expand nested objects and arrays without losing your place.</p></div><div className="feature-stat"><span>{conversion.stats?.nodes ?? 0}</span><small>nodes indexed</small></div></div><div className="feature-panel tree-panel">{conversion.parsed ? <TreeNode name="$" value={conversion.parsed.data} /> : <EmptyState error={conversion.error} />}</div></section>

  const renderQuery = () => <section className="feature-page"><div className="feature-heading"><div><span className="overline"><TerminalSquare size={11} /> PATH QUERY</span><h1>Reach any value<br />in one expression.</h1><p>Query nested JSON or YAML with a focused JSONPath subset.</p></div></div><div className="query-layout"><article className="feature-panel query-builder"><label htmlFor="path">JSONPath expression</label><div className="query-input"><span>$</span><input id="path" value={query.startsWith('$') ? query.slice(1) : query} onChange={(event) => setQuery(`$${event.target.value}`)} spellCheck={false} /><button aria-label="Run path query"><Play size={14} fill="currentColor" /></button></div><div className="query-examples"><span>Try an example</span>{['$.project.name', '$.formats[0].extensions', '$.contributors[1]'].map((example) => <button key={example} onClick={() => setQuery(example)}>{example}</button>)}</div></article><article className="feature-panel query-result"><header><div><span>RESULT</span><small>{queryResult.error ? 'No match' : describeValue(queryResult.value)}</small></div>{!queryResult.error && <IconButton label="Copy query result" onClick={async () => { await navigator.clipboard.writeText(serializeDocument(queryResult.value, 'json')); notify('Query result copied') }}><Copy size={15} /></IconButton>}</header>{queryResult.error ? <EmptyState error={queryResult.error} /> : <pre>{serializeDocument(queryResult.value, 'json')}</pre>}</article></div></section>

  const renderAbout = () => <section className="feature-page about-page"><div className="about-mark"><Braces size={33} /></div><span className="overline">OPEN SOURCE · MIT</span><h1>Structured data deserves<br />a better workbench.</h1><p>Structura is a local-first JSON and YAML utility designed for clarity, speed and trustworthy offline workflows.</p><div className="about-grid"><article><Code2 size={19} /><strong>Built in public</strong><span>Readable TypeScript, documented architecture and contribution-sized issues.</span></article><article><ShieldCheck size={19} /><strong>Private by design</strong><span>Documents stay inside the browser. No analytics and no hidden network calls.</span></article><article><Zap size={19} /><strong>Small and fast</strong><span>A focused core with deterministic transforms and no server dependency.</span></article></div></section>

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Braces size={18} /></div><span>structura</span><em>alpha</em></div>
      <button className="new-document" onClick={() => { setSource(''); setView('workbench') }}><FileJson2 size={15} /> New document <kbd>⌘N</kbd></button>
      <nav><span className="nav-label">TOOLS</span>{navItems.map(({ id, label, icon: Icon, shortcut }) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}><Icon size={16} /><span>{label}</span><kbd>{shortcut}</kbd></button>)}</nav>
      <div className="sidebar-bottom"><article className="privacy-note"><div><ShieldCheck size={15} /><span>LOCAL SESSION</span></div><strong>Your data stays here.</strong><p>Structura processes every document inside this browser tab.</p></article><button className={view === 'about' ? 'bottom-link active' : 'bottom-link'} onClick={() => setView('about')}><Info size={16} /> About Structura</button><button className="bottom-link" onClick={() => openExternal(`${REPOSITORY_URL}#readme`)}><CircleHelp size={16} /> Documentation <span>↗</span></button></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="crumb"><PanelLeftClose size={15} /><span>Structura</span><b>/</b><strong>{view === 'workbench' ? 'Untitled document' : navItems.find((item) => item.id === view)?.label ?? 'About'}</strong></div><div className="top-actions"><button className="command-search"><Search size={14} /><span>Search commands</span><kbd>⌘K</kbd></button><span className="local-badge"><i /> Local only</span><IconButton label="Open source repository" onClick={() => openExternal(REPOSITORY_URL)}><Code2 size={16} /></IconButton></div></header>
      <div className="content">{view === 'workbench' && renderWorkbench()}{view === 'tree' && renderTree()}{view === 'query' && renderQuery()}{view === 'about' && renderAbout()}</div>
      <footer className="app-footer"><span><span className="pulse" /> Engine ready</span><span>Structura v0.1.0</span><span>JSON · YAML</span></footer>
    </main>

    <input ref={fileInput} type="file" accept=".json,.yaml,.yml,application/json,application/yaml,text/yaml" hidden onChange={importFile} />
    {toast && <div className="toast"><Check size={15} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={13} /></button></div>}
  </div>
}
