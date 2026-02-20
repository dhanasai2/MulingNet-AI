import { useState, useCallback } from 'react'
import API_BASE from './config'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import Pipeline from './components/Pipeline'
import StatsGrid from './components/StatsGrid'
import TabNav from './components/TabNav'
import GraphView from './components/GraphView'
import RingsTable from './components/RingsTable'
import AccountsTable from './components/AccountsTable'
import QuantumPanel from './components/QuantumPanel'
import AgentsChart from './components/AgentsChart'
import N8nPanel from './components/N8nPanel'
import DisruptionPanel from './components/DisruptionPanel'
import CrimeTeamPanel from './components/CrimeTeamPanel'
import WhatIfSimulator from './components/WhatIfSimulator'
import JsonOutputPanel from './components/JsonOutputPanel'
import Footer from './components/Footer'

const TABS = [
  { id: 'graph', label: 'Network Graph', icon: 'fa-diagram-project' },
  { id: 'rings', label: 'Fraud Rings', icon: 'fa-ring' },
  { id: 'accounts', label: 'Suspects', icon: 'fa-user-shield' },
  { id: 'quantum', label: 'Quantum', icon: 'fa-atom' },
  { id: 'disruption', label: 'Disruption', icon: 'fa-crosshairs' },
  { id: 'crimeteam', label: 'Crime Team', icon: 'fa-user-secret' },
  { id: 'whatif', label: 'What-If', icon: 'fa-flask-vial' },
  { id: 'agents', label: 'Scores', icon: 'fa-robot' },
  { id: 'n8n', label: 'n8n', icon: 'fa-link' },
]

export default function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pipelineStep, setPipelineStep] = useState(-1)
  const [activeTab, setActiveTab] = useState('graph')
  const [error, setError] = useState(null)

  const handleUpload = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    setResults(null)

    const steps = [0, 1, 2, 3, 4, 5, 6]
    for (const s of steps) {
      setPipelineStep(s)
      await new Promise(r => setTimeout(r, 600))
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const resp = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: formData })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.detail || 'Analysis failed')
      }
      const data = await resp.json()
      setResults(data)
      setPipelineStep(7)
    } catch (e) {
      setError(e.message)
      setPipelineStep(-1)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = () => {
    setResults(null)
    setPipelineStep(-1)
    setActiveTab('graph')
    setError(null)
  }

  const downloadJSON = () => window.open(`${API_BASE}/api/download`, '_blank')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="relative z-10 flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <UploadSection onUpload={handleUpload} loading={loading} />
        <Pipeline step={pipelineStep} />

        {error && (
          <div className="glass rounded-2xl p-5 border-l-4 border-red-500/60 flex items-start gap-3 animate-slideUp">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-red-500/10 flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-400 text-sm" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-400 mb-0.5">Analysis Failed</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-6 animate-slideUp">
            <StatsGrid summary={results.summary} />

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={reset}
                className="glass text-gray-300 px-5 py-2.5 rounded-xl font-semibold text-sm
                  hover:border-indigo-500/30 hover:text-white transition-all duration-200 group">
                <i className="fas fa-rotate mr-2 group-hover:rotate-180 transition-transform duration-500" />New Analysis
              </button>
            </div>

            <JsonOutputPanel results={results} onDownload={downloadJSON} />
            <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

            <div key={activeTab} className="min-h-[400px] animate-fade">
              {activeTab === 'graph' && <GraphView data={results.graph_data} />}
              {activeTab === 'rings' && <RingsTable rings={results.fraud_rings} graphData={results.graph_data} accounts={results.suspicious_accounts} />}
              {activeTab === 'accounts' && <AccountsTable accounts={results.suspicious_accounts} />}
              {activeTab === 'quantum' && <QuantumPanel data={results.quantum_analysis} />}
              {activeTab === 'disruption' && <DisruptionPanel data={results.disruption} />}
              {activeTab === 'crimeteam' && <CrimeTeamPanel data={results.crime_team} />}
              {activeTab === 'whatif' && <WhatIfSimulator graphData={results.graph_data} accounts={results.suspicious_accounts} rings={results.fraud_rings} />}
              {activeTab === 'agents' && <AgentsChart accounts={results.suspicious_accounts} />}
              {activeTab === 'n8n' && <N8nPanel summary={results.summary} />}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
