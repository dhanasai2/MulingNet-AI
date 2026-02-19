"""
Money Muling Detection Engine — FastAPI Application
RIFT 2026 Hackathon | Graph Theory Track

Multi-Agent Hybrid Classical-Quantum Financial Forensics Engine.
"""

import os
import time
import json
import math
import logging
import numpy as np
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Load .env before any agent imports (so GROQ_API_KEY is available)
load_dotenv(Path(__file__).parent.parent / ".env")

from app.utils.csv_parser import parse_csv
from app.agents.graph_agent import GraphAgent
from app.agents.ml_agent import MLAgent
from app.agents.quantum_agent import QuantumAgent
from app.agents.aggregator import AggregatorAgent
from app.agents.disruption_engine import DisruptionEngine
from app.agents.crime_team import CrimeTeam
from app.agents.whatif_simulator import WhatIfSimulator

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("muling_engine")


class SafeJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles numpy types, inf, and NaN safely."""
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            v = float(obj)
            if math.isnan(v) or math.isinf(v):
                return None
            return v
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.bool_):
            return bool(obj)
        return super().default(obj)

    def encode(self, o):
        """Override encode to replace NaN/Infinity in regular Python floats."""
        return super().encode(self._sanitize(o))

    def _sanitize(self, obj):
        """Recursively sanitize data to be JSON-safe."""
        if isinstance(obj, dict):
            return {k: self._sanitize(v) for k, v in obj.items()}
        if isinstance(obj, (list, tuple)):
            return [self._sanitize(v) for v in obj]
        if isinstance(obj, float):
            if math.isnan(obj) or math.isinf(obj):
                return None
            return obj
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            v = float(obj)
            if math.isnan(v) or math.isinf(v):
                return None
            return v
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, np.ndarray):
            return self._sanitize(obj.tolist())
        return obj


def safe_json_response(content, **kwargs):
    """Return JSONResponse with numpy-safe serialization."""
    body = json.dumps(content, cls=SafeJSONEncoder)
    return JSONResponse(content=json.loads(body), **kwargs)

# App
app = FastAPI(
    title="Money Muling Detection Engine",
    description="Hybrid Classical-ML-Quantum Financial Forensics System",
    version="1.0.0"
)

# Static files — prefer React build, fallback to legacy
REACT_DIST = Path(__file__).parent.parent / "frontend" / "dist"
STATIC_DIR = Path(__file__).parent / "static"

if REACT_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(REACT_DIST / "assets")), name="assets")
else:
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Store latest results in memory (for demo purposes)
latest_results = {}
latest_graph = None
latest_df = None
latest_intermediate = {}  # Store intermediate agent results


@app.get("/", response_class=HTMLResponse)
async def homepage():
    """Serve the main application page (React build or legacy)."""
    if REACT_DIST.exists():
        index_path = REACT_DIST / "index.html"
    else:
        index_path = STATIC_DIR / "index.html"
    return HTMLResponse(content=index_path.read_text(encoding="utf-8"))


@app.post("/api/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    """
    Main analysis endpoint.
    Accepts CSV upload, runs all 4 agents, returns unified results.
    """
    global latest_results, latest_graph, latest_df, latest_intermediate
    start_time = time.time()
    
    try:
        # ── Step 1: Read & parse CSV ──
        logger.info(f"Received file: {file.filename}")
        content = await file.read()
        # Try UTF-8 first, fall back to latin-1
        try:
            csv_text = content.decode("utf-8")
        except UnicodeDecodeError:
            csv_text = content.decode("latin-1")
        
        df, G, metadata = parse_csv(csv_text)
        logger.info(f"Parsed {metadata['total_transactions']} transactions, "
                     f"{metadata['total_accounts']} accounts")
        
        # Store for What-If simulator
        latest_graph = G
        latest_df = df
        
        # ── Step 2: Run Agent 1 — Graph Detective ──
        logger.info("Running Graph Agent...")
        graph_agent = GraphAgent(G, df)
        graph_results = graph_agent.run()
        logger.info(f"Graph Agent found {len(graph_results['rings'])} rings, "
                     f"{len(graph_results['suspicious_accounts'])} suspicious accounts")
        
        # ── Step 3: Run Agent 2 — ML Scorer ──
        logger.info("Running ML Agent...")
        ml_agent = MLAgent(G, df)
        ml_results = ml_agent.run()
        logger.info(f"ML Agent scored {len(ml_results.get('ml_scores', {}))} accounts")
        
        # ── Step 4: Run Agent 3 — Quantum Optimizer ──
        logger.info("Running Quantum Agent...")
        quantum_agent = QuantumAgent(G, graph_results.get("rings", []))
        quantum_results = quantum_agent.run()
        q_avail = quantum_results.get("quantum_available", False)
        logger.info(f"Quantum Agent: available={q_avail}, "
                     f"circuits_executed={quantum_results.get('circuits_executed', 0)}, "
                     f"circuits_skipped={quantum_results.get('circuits_skipped', 0)}")
        
        # ── Step 5: Run Agent 4 — Aggregator ──
        logger.info("Running Aggregator Agent...")
        aggregator = AggregatorAgent(
            graph_results=graph_results,
            ml_results=ml_results,
            quantum_results=quantum_results,
            total_accounts=metadata["total_accounts"],
            processing_start_time=start_time
        )
        final_output = aggregator.run()
        
        # ── Step 6: Run Disruption Engine ──
        logger.info("Running Disruption Engine...")
        disruption = DisruptionEngine(
            G=G,
            fraud_rings=final_output["fraud_rings"],
            suspicious_accounts=final_output["suspicious_accounts"],
            quantum_results=quantum_results,
        )
        disruption_results = disruption.run()
        final_output["disruption"] = disruption_results
        logger.info(f"Disruption Engine: {len(disruption_results['strategies'])} strategies, "
                     f"{disruption_results['global_summary']['unique_critical_nodes']} critical nodes")
        
        # ── Step 7: Run Crime Team ──
        logger.info("Running Crime Team...")
        crime_team = CrimeTeam(
            graph_results=graph_results,
            ml_results=ml_results,
            quantum_results=quantum_results,
            aggregated=final_output,
            disruption=disruption_results,
        )
        crime_team_results = crime_team.run()
        final_output["crime_team"] = crime_team_results
        logger.info("Crime Team report generated")
        
        # ── Step 8: Build graph data for visualization ──
        graph_viz_data = _build_graph_viz_data(G, final_output)
        final_output["graph_data"] = graph_viz_data
        final_output["metadata"] = metadata
        
        # Store for download
        latest_results = final_output
        
        elapsed = round(time.time() - start_time, 2)
        logger.info(f"Analysis complete in {elapsed}s — "
                     f"{final_output['summary']['suspicious_accounts_flagged']} suspicious, "
                     f"{final_output['summary']['fraud_rings_detected']} rings")
        
        return safe_json_response(content=final_output)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.get("/api/download")
async def download_json():
    """Download the latest analysis results as JSON file."""
    if not latest_results:
        raise HTTPException(status_code=404, detail="No analysis results available. Upload a CSV first.")
    
    # Build clean output matching exact required format
    clean_output = {
        "suspicious_accounts": [
            {
                "account_id": sa["account_id"],
                "suspicion_score": sa["suspicion_score"],
                "detected_patterns": sa["detected_patterns"],
                "ring_id": sa["ring_id"]
            }
            for sa in latest_results.get("suspicious_accounts", [])
        ],
        "fraud_rings": [
            {
                "ring_id": ring["ring_id"],
                "member_accounts": ring["member_accounts"],
                "pattern_type": ring["pattern_type"],
                "risk_score": ring["risk_score"]
            }
            for ring in latest_results.get("fraud_rings", [])
        ],
        "summary": {
            "total_accounts_analyzed": latest_results["summary"]["total_accounts_analyzed"],
            "suspicious_accounts_flagged": latest_results["summary"]["suspicious_accounts_flagged"],
            "fraud_rings_detected": latest_results["summary"]["fraud_rings_detected"],
            "processing_time_seconds": latest_results["summary"]["processing_time_seconds"]
        }
    }
    
    return safe_json_response(
        content=clean_output,
        headers={
            "Content-Disposition": "attachment; filename=fraud_analysis_results.json"
        }
    )


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "engine": "Money Muling Detection Engine v1.0"}


@app.post("/api/webhook/n8n")
async def n8n_webhook(request: Request):
    """
    Webhook endpoint for n8n integration.
    n8n can trigger analysis and receive results.
    """
    body = await request.json()
    action = body.get("action", "check_status")
    
    if action == "get_results" and latest_results:
        return JSONResponse(content={
            "status": "success",
            "summary": latest_results.get("summary", {}),
            "suspicious_accounts": latest_results.get("suspicious_accounts", []),
            "fraud_rings": latest_results.get("fraud_rings", []),
        })
    
    return JSONResponse(content={
        "status": "received",
        "message": "n8n webhook processed",
        "action": action,
        "latest_results_available": bool(latest_results),
        "summary": latest_results.get("summary") if latest_results else None
    })


@app.get("/n8n_workflow.json")
async def get_n8n_workflow():
    """Serve the n8n importable workflow JSON."""
    workflow_path = Path(__file__).parent.parent / "n8n_workflow.json"
    if not workflow_path.exists():
        raise HTTPException(status_code=404, detail="Workflow file not found")
    content = json.loads(workflow_path.read_text(encoding="utf-8"))
    return JSONResponse(content=content, headers={
        "Content-Disposition": "attachment; filename=mulingnet_n8n_workflow.json"
    })


@app.post("/api/whatif")
async def whatif_simulate(request: Request):
    """
    What-If Simulator endpoint.
    Accepts a list of nodes to remove and returns impact analysis.
    """
    if not latest_graph or not latest_results:
        raise HTTPException(status_code=400, detail="No analysis results. Upload a CSV first.")
    
    body = await request.json()
    nodes_to_remove = body.get("nodes", [])
    
    if not nodes_to_remove:
        raise HTTPException(status_code=400, detail="No nodes specified. Provide 'nodes' array.")
    
    simulator = WhatIfSimulator(
        G=latest_graph,
        df=latest_df,
        fraud_rings=latest_results.get("fraud_rings", []),
        suspicious_accounts=latest_results.get("suspicious_accounts", []),
    )
    
    result = simulator.simulate(nodes_to_remove)
    return safe_json_response(content=result)


def _build_graph_viz_data(G, results: Dict) -> Dict:
    """Build graph data in vis.js compatible format."""
    suspicious_ids = {sa["account_id"] for sa in results.get("suspicious_accounts", [])}
    suspicious_map = {
        sa["account_id"]: sa for sa in results.get("suspicious_accounts", [])
    }
    
    # Ring membership lookup
    ring_colors = {}
    color_palette = [
        "#ff4444", "#ff8800", "#ffcc00", "#44ff44", 
        "#4488ff", "#aa44ff", "#ff44aa", "#44ffcc",
        "#ff6644", "#66ccff", "#cc44ff", "#ffaa44"
    ]
    for idx, ring in enumerate(results.get("fraud_rings", [])):
        color = color_palette[idx % len(color_palette)]
        for member in ring["member_accounts"]:
            ring_colors[member] = color
    
    nodes = []
    for node in G.nodes():
        is_suspicious = node in suspicious_ids
        node_data = G.nodes[node]
        
        sa = suspicious_map.get(node, {})
        score = sa.get("suspicion_score", 0)
        patterns = sa.get("detected_patterns", [])
        ring_id = sa.get("ring_id", "STANDALONE")
        
        # Node styling based on suspicion
        if is_suspicious and score >= 70:
            color = ring_colors.get(node, "#ff2222")
            size = 25 + score * 0.3
            border_width = 4
            shape = "dot"
        elif is_suspicious and score >= 40:
            color = ring_colors.get(node, "#ff8800")
            size = 20 + score * 0.2
            border_width = 3
            shape = "dot"
        elif is_suspicious:
            color = ring_colors.get(node, "#ffcc00")
            size = 18
            border_width = 2
            shape = "dot"
        else:
            color = "#336699"
            size = 12
            border_width = 1
            shape = "dot"
        
        nodes.append({
            "id": node,
            "label": node,
            "color": {
                "background": color,
                "border": "#ffffff" if is_suspicious else "#224466",
                "highlight": {"background": "#ffffff", "border": color}
            },
            "size": size,
            "borderWidth": border_width,
            "shape": shape,
            "title": (
                f"<b>{node}</b><br>"
                f"Score: {score}<br>"
                f"Patterns: {', '.join(patterns) if patterns else 'None'}<br>"
                f"Ring: {ring_id or 'N/A'}<br>"
                f"Sent: {node_data.get('total_sent', 0):.2f}<br>"
                f"Received: {node_data.get('total_received', 0):.2f}<br>"
                f"Transactions: {node_data.get('tx_count_total', 0)}"
            ),
            "suspicious": is_suspicious,
            "score": score,
            "patterns": patterns,
            "ring_id": ring_id
        })
    
    edges = []
    for u, v, data in G.edges(data=True):
        is_suspicious_edge = u in suspicious_ids and v in suspicious_ids
        amount = data.get("total_amount", 0)
        tx_count = data.get("tx_count", 0)
        raw_txs = data.get("transactions", [])
        
        edges.append({
            "from": u,
            "to": v,
            "arrows": "to",
            "label": f"${amount:,.0f}" if amount > 0 else "",
            "title": f"{u} → {v}<br>Amount: ${amount:,.2f}<br>Transactions: {tx_count}",
            "color": {
                "color": "#ff4444" if is_suspicious_edge else "#556677",
                "opacity": 0.8 if is_suspicious_edge else 0.4
            },
            "width": max(1, min(5, amount / 5000)) if is_suspicious_edge else 1,
            "smooth": {"type": "curvedCW", "roundness": 0.2},
            "total_amount": float(round(amount, 2)),
            "tx_count": int(tx_count),
            "transactions": raw_txs[:50]  # cap for payload size
        })
    
    return {"nodes": nodes, "edges": edges}


# Import Dict for type hints used in _build_graph_viz_data
from typing import Dict
