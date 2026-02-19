import { useState } from 'react'

export default function QuantumPanel({ data }) {
  if (!data?.available) {
    return (
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-8 text-center">
        <i className="fas fa-atom text-5xl text-gray-600 mb-4 block animate-pulse" />
        <p className="text-gray-400 text-lg font-semibold mb-1">Quantum Analysis Unavailable</p>
        <p className="text-gray-500 text-sm">{data?.message || 'Install qiskit + qiskit-aer for quantum features'}</p>
      </div>
    )
  }

  const results = data.results || []

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="bg-gradient-to-r from-accent-purple/10 to-accent-cyan/10 border border-accent-purple/30 rounded-xl p-5">
        <div className="flex flex-wrap gap-8 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <i className="fas fa-atom text-accent-purple text-lg" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Backend</span>
              <p className="text-sm font-bold text-accent-purple">Qiskit Aer Simulator</p>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Algorithm</span>
            <p className="text-sm font-bold text-accent-cyan">QAOA Max-Cut</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Circuits Executed</span>
            <p className="text-2xl font-extrabold text-white">{data.circuits_executed}</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Configuration</span>
            <p className="text-sm font-bold">2 layers &middot; 1024 shots</p>
          </div>
        </div>
      </div>

      {/* Circuit cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map((r, i) => (
          <CircuitCard key={i} result={r} index={i} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-atom text-3xl mb-3 block" />
          No quantum circuits were generated for this dataset.
        </div>
      )}
    </div>
  )
}

function CircuitCard({ result, index }) {
  const [expanded, setExpanded] = useState(false)
  const hasError = !!result.error
  const measurements = result.top_measurements || []
  const suspiciousSet = result.suspicious_set || []

  return (
    <div className={`bg-dark-800 border rounded-xl overflow-hidden transition-all hover:shadow-lg ${
      hasError ? 'border-red-500/40' : 'border-dark-500 hover:border-accent-purple/40'
    }`}>
      {/* Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-accent-purple/10 to-transparent border-b border-dark-500 flex items-center justify-between">
        <span className="text-xs font-bold text-accent-purple flex items-center gap-1.5">
          <i className="fas fa-atom" />Circuit #{index + 1}
        </span>
        <span className="text-[10px] text-gray-400 font-mono bg-dark-600 px-2 py-0.5 rounded">{result.ring_id}</span>
      </div>

      {hasError ? (
        <div className="p-4 text-center">
          <i className="fas fa-exclamation-triangle text-red-400 text-xl mb-2 block" />
          <p className="text-red-400 text-xs">{result.error}</p>
        </div>
      ) : (
        <>
          {/* Circuit image */}
          {result.circuit_image ? (
            <div className="p-3 bg-white/95 border-b border-dark-500 cursor-pointer rounded-sm mx-1 mt-1 shadow-inner" onClick={() => setExpanded(!expanded)}>
              <img
                src={`data:image/png;base64,${result.circuit_image}`}
                alt={`QAOA circuit — ${result.ring_id}`}
                className={`w-full h-auto rounded transition-all ${expanded ? '' : 'max-h-44 object-cover object-left-top'}`}
                loading="lazy"
              />
              {!expanded && (
                <div className="text-center mt-1">
                  <span className="text-[9px] text-gray-500 hover:text-accent-blue cursor-pointer">
                    <i className="fas fa-expand-alt mr-1" />Click to expand
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-dark-900 border-b border-dark-500 text-center text-gray-600 text-xs">
              <i className="fas fa-image mr-1" />Circuit image not available
            </div>
          )}

          {/* Stats grid */}
          <div className="p-3 grid grid-cols-2 gap-2">
            <StatItem label="Qubits" value={result.n_qubits} icon="fa-microchip" />
            <StatItem label="Gate Count" value={result.gate_count} icon="fa-layer-group" />
            <StatItem label="Depth" value={result.circuit_depth} icon="fa-arrows-left-right" />
            <StatItem label="Partition" value={result.partition_score?.toFixed(3)} icon="fa-cut" color="text-accent-cyan" />
          </div>

          {/* Optimal bitstring */}
          {result.optimal_bitstring && (
            <div className="px-3 pb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Optimal Bitstring</span>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {result.optimal_bitstring.split('').map((bit, i) => (
                  <span key={i} className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${
                    bit === '1' ? 'bg-accent-purple/30 text-accent-purple border border-accent-purple/40' : 'bg-dark-600 text-gray-500 border border-dark-500'
                  }`}>
                    {bit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious set */}
          {suspiciousSet.length > 0 && (
            <div className="px-3 pb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                Suspicious Partition ({suspiciousSet.length} accounts)
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {suspiciousSet.map(acc => (
                  <span key={acc} className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/25 px-1.5 py-0.5 rounded font-mono">
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Measurement histogram */}
          {measurements.length > 0 && (
            <div className="px-3 pb-3 border-t border-dark-500 pt-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Measurement Distribution</span>
              <div className="mt-1.5 space-y-1">
                {measurements.slice(0, 5).map((m, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-accent-cyan w-16 shrink-0 text-right">|{m.bitstring}&#x27E9;</span>
                    <div className="flex-1 h-3 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-purple to-accent-blue rounded-full transition-all"
                        style={{ width: `${Math.max(m.probability * 100, 2)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 w-12 text-right font-mono">{(m.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatItem({ label, value, icon, color = 'text-white' }) {
  return (
    <div className="flex items-center gap-2 bg-dark-700/50 rounded-lg px-2.5 py-1.5">
      <i className={`fas ${icon} text-[10px] text-gray-500`} />
      <div>
        <span className="text-[9px] text-gray-500 block leading-tight">{label}</span>
        <span className={`text-xs font-bold ${color}`}>{value ?? '—'}</span>
      </div>
    </div>
  )
}
