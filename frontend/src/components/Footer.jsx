export default function Footer() {
  const tech = [
    { icon: 'fa-diagram-project', label: 'NetworkX' },
    { icon: 'fa-robot',           label: 'scikit-learn' },
    { icon: 'fa-atom',            label: 'Qiskit Aer' },
    { icon: 'fa-bolt',            label: 'FastAPI' },
    { icon: 'fa-code',            label: 'React + Vite' },
  ]

  return (
    <footer className="relative mt-10">
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-md bg-indigo-500/10 flex items-center justify-center">
              <i className="fas fa-shield-halved text-[9px] text-indigo-400" />
            </div>
            <span className="text-gray-400 font-medium">
              MulingNet<span className="text-indigo-400 font-bold">AI</span>
            </span>
            <span className="text-gray-700 mx-1">·</span>
            <span className="text-gray-600 text-xs">RIFT 2026 · Graph Theory Track</span>
          </div>

          {/* Tech pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {tech.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[10px] text-gray-500
                bg-white/[0.02] border border-white/[0.04] px-2 py-1 rounded-md font-medium
                hover:text-gray-400 hover:border-white/[0.08] transition-colors">
                <i className={`fas ${t.icon} text-[8px] opacity-50`} />{t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
