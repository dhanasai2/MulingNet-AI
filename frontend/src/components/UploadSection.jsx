import { useRef, useState, useEffect } from 'react'

const AI_MESSAGES = [
  'Ingesting transaction stream…',
  'Building directed graph topology…',
  'Running Graph Detective Agent…',
  'Computing cycle signatures…',
  'Scanning smurfing patterns…',
  'Profiling account behavior with ML…',
  'Executing QAOA quantum circuits…',
  'Measuring qubit entanglement states…',
  'Aggregating multi-agent consensus…',
  'Resolving score conflicts…',
  'Mapping disruption vectors…',
  'Generating investigation narrative…',
  'Finalizing forensic report…',
]

export default function UploadSection({ onUpload, loading }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setMsgIdx(i => (i + 1) % AI_MESSAGES.length), 2200)
    return () => clearInterval(t)
  }, [loading])

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) onUpload(f)
  }

  return (
    <div
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
        ${loading ? 'cursor-wait' : ''} ${dragOver ? 'scale-[1.005]' : ''}`}
    >
      {/* Gradient border */}
      <div className="absolute inset-0 rounded-2xl glow-border" />

      <div className={`relative glass rounded-2xl p-8 sm:p-12 text-center transition-all duration-300
        ${dragOver ? 'bg-indigo-500/[0.04]' : 'hover:bg-white/[0.015]'}`}>

        {loading ? (
          <div className="space-y-5">
            {/* Scanner */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-1 rounded-full border border-blue-500/30 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-shield-halved text-xl text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-gray-100">Analyzing Transaction Network</p>
              <div className="flex items-center justify-center gap-2 text-sm text-indigo-300/80 font-mono">
                <i className="fas fa-terminal text-[9px] opacity-40" />
                <span key={msgIdx} className="animate-fade">{AI_MESSAGES[msgIdx]}</span>
                <span className="animate-pulse text-indigo-400">|</span>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: i <= msgIdx % 7 ? 'rgb(129,140,248)' : 'rgba(129,140,248,0.15)',
                    boxShadow: i <= msgIdx % 7 ? '0 0 6px rgba(99,102,241,0.5)' : 'none',
                  }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Icon */}
            <div className="relative w-16 h-16 mx-auto" style={{ animation: 'float 4s ease-in-out infinite' }}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-cloud-arrow-up text-2xl text-indigo-400" />
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1.5">
                Upload Transaction <span className="text-indigo-400">CSV</span>
              </h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                Drag & drop or click to upload — requires&nbsp;
                <code className="text-indigo-300/70 text-xs">sender_id, receiver_id, amount, timestamp</code>
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5"><i className="fas fa-database text-indigo-500/40" />10K+ transactions</span>
              <span className="w-px h-3 bg-gray-700" />
              <span className="flex items-center gap-1.5"><i className="fas fa-bolt text-blue-500/40" />Sub-30s analysis</span>
              <span className="w-px h-3 bg-gray-700 hidden sm:block" />
              <span className="hidden sm:flex items-center gap-1.5"><i className="fas fa-atom text-cyan-500/40" />Quantum-enhanced</span>
            </div>
          </div>
        )}

        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} />
      </div>
    </div>
  )
}
