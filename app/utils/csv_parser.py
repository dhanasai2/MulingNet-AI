"""
CSV Parser Utility — FAST edition
Parses uploaded CSV files into structured transaction data and builds NetworkX graph.
Uses vectorised pandas ops instead of iterrows for 10K+ row performance.
"""

import pandas as pd
import numpy as np
import networkx as nx
from io import StringIO
from typing import Tuple, Dict


REQUIRED_COLUMNS = ["transaction_id", "sender_id", "receiver_id", "amount", "timestamp"]


def parse_csv(file_content: str) -> Tuple[pd.DataFrame, nx.DiGraph, Dict]:
    """
    Parse CSV content into a DataFrame and build a directed transaction graph.
    Optimised: vectorised groupby instead of iterrows / per-node filtering.
    """
    df = pd.read_csv(StringIO(file_content))

    if df.empty:
        raise ValueError("CSV file is empty (no data rows found)")

    # Normalise column names
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Clean amount: always convert to string first, strip currency symbols/commas
    df["amount"] = df["amount"].astype(str).str.replace(r"[$,€£₹]", "", regex=True).str.strip()
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce", format="mixed")

    # Ensure sender/receiver IDs are strings
    df["sender_id"] = df["sender_id"].astype(str).str.strip()
    df["receiver_id"] = df["receiver_id"].astype(str).str.strip()
    df["transaction_id"] = df["transaction_id"].astype(str).str.strip()

    df = df.dropna(subset=["sender_id", "receiver_id", "amount", "timestamp"])
    # Remove self-loops and invalid rows
    df = df[df["sender_id"] != df["receiver_id"]]
    df = df[df["amount"] > 0]

    if df.empty:
        raise ValueError("No valid transactions remaining after data cleaning")

    # ── Build directed graph using vectorised groupby ──
    G = nx.DiGraph()

    all_accounts = set(df["sender_id"].unique()) | set(df["receiver_id"].unique())
    G.add_nodes_from(all_accounts)

    # Group transactions by (sender, receiver) pair — one pass over df
    edge_groups = df.groupby(["sender_id", "receiver_id"])
    for (sender, receiver), grp in edge_groups:
        txs = [
            {"transaction_id": str(r.transaction_id), "amount": float(r.amount),
             "timestamp": str(r.timestamp)}
            for r in grp.itertuples(index=False)
        ]
        G.add_edge(sender, receiver,
                   total_amount=float(grp["amount"].sum()),
                   tx_count=int(len(grp)),
                   transactions=txs)

    # ── Vectorised node-level statistics ──
    sent_agg = df.groupby("sender_id")["amount"].agg(["sum", "count"]).rename(
        columns={"sum": "total_sent", "count": "tx_count_sent"})
    recv_agg = df.groupby("receiver_id")["amount"].agg(["sum", "count"]).rename(
        columns={"sum": "total_received", "count": "tx_count_recv"})

    # Temporal stats: pre-collect per-node timestamps via concat + groupby
    ts_sent = df[["sender_id", "timestamp"]].rename(columns={"sender_id": "account"})
    ts_recv = df[["receiver_id", "timestamp"]].rename(columns={"receiver_id": "account"})
    ts_all = pd.concat([ts_sent, ts_recv], ignore_index=True)
    ts_all = ts_all.sort_values(["account", "timestamp"])

    # Compute time diffs within each account group
    ts_all["prev"] = ts_all.groupby("account")["timestamp"].shift(1)
    ts_all["diff_s"] = (ts_all["timestamp"] - ts_all["prev"]).dt.total_seconds()
    time_stats = ts_all.dropna(subset=["diff_s"]).groupby("account")["diff_s"].agg(["mean", "min"])
    time_stats.columns = ["avg_time_gap", "min_time_gap"]

    for node in G.nodes():
        nd = G.nodes[node]
        nd["total_sent"] = float(sent_agg.at[node, "total_sent"]) if node in sent_agg.index else 0.0
        nd["total_received"] = float(recv_agg.at[node, "total_received"]) if node in recv_agg.index else 0.0
        nd["tx_count_sent"] = int(sent_agg.at[node, "tx_count_sent"]) if node in sent_agg.index else 0
        nd["tx_count_recv"] = int(recv_agg.at[node, "tx_count_recv"]) if node in recv_agg.index else 0
        nd["tx_count_total"] = nd["tx_count_sent"] + nd["tx_count_recv"]
        nd["in_degree"] = G.in_degree(node)
        nd["out_degree"] = G.out_degree(node)
        if node in time_stats.index:
            nd["avg_time_gap"] = float(time_stats.at[node, "avg_time_gap"])
            nd["min_time_gap"] = float(time_stats.at[node, "min_time_gap"])
        else:
            nd["avg_time_gap"] = 0.0
            nd["min_time_gap"] = 0.0

    metadata = {
        "total_transactions": int(len(df)),
        "total_accounts": int(len(all_accounts)),
        "total_edges": int(G.number_of_edges()),
        "date_range": {
            "start": str(df["timestamp"].min()),
            "end": str(df["timestamp"].max())
        }
    }

    return df, G, metadata
