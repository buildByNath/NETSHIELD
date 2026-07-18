import networkx as nx
from typing import Dict, List, Any

"""
File: validation.py
Author: Antigravity AI
Purpose: Service validating network topology configurations using NetworkX and custom rules.
"""

def validate_topology(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Validate the graph representation of the network topology.
    Returns:
        dict: containing 'valid' (bool), 'errors' (list of str), and 'warnings' (list of str).
    """
    errors = []
    warnings = []
    
    if not nodes:
        errors.append("The network has no devices. Drag and drop devices from the library to begin.")
        return {
            "valid": False,
            "errors": errors,
            "warnings": warnings
        }
        
    node_types = {node["id"]: node.get("type", "") for node in nodes}
    node_labels = {node["id"]: node.get("label", node["id"]) for node in nodes}
    
    clients = {"PC", "Laptop", "Printer"}
    
    # 1. Edge property and basic validation checks
    for idx, edge in enumerate(edges):
        source = edge.get("source")
        target = edge.get("target")
        weight = edge.get("weight", 1.0)
        latency = edge.get("latency", 10.0)
        bandwidth = edge.get("bandwidth", 100.0)
        
        # Verify node existence
        if source not in node_types:
            errors.append(f"Link source '{source}' does not exist in the node library.")
            continue
        if target not in node_types:
            errors.append(f"Link target '{target}' does not exist in the node library.")
            continue
            
        src_type = node_types[source]
        tgt_type = node_types[target]
        
        # Verify weights
        if weight < 0:
            errors.append(f"Link '{node_labels.get(source)}' ↔ '{node_labels.get(target)}' has a negative weight ({weight}). Cost weights must be non-negative.")
        if latency < 0:
            errors.append(f"Link '{node_labels.get(source)}' ↔ '{node_labels.get(target)}' has a negative latency ({latency}ms). Latency must be non-negative.")
        if bandwidth <= 0:
            errors.append(f"Link '{node_labels.get(source)}' ↔ '{node_labels.get(target)}' has zero or negative bandwidth ({bandwidth}Mbps). Bandwidth must be positive.")
            
        # Security Rules
        # Rule A: PCs/Laptops/Printers connected directly to Internet
        if (src_type in clients and tgt_type == "Internet") or (tgt_type in clients and src_type == "Internet"):
            errors.append(f"Security Violation: '{node_labels.get(source)}' is connected directly to the Internet. User devices must connect through a switch/router.")
            
        # Rule B: PCs/Laptops/Printers connected directly to Firewall
        if (src_type in clients and tgt_type == "Firewall") or (tgt_type in clients and src_type == "Firewall"):
            warnings.append(f"Security Concern: '{node_labels.get(source)}' is connected directly to the Firewall. Recommend routing through an internal switch.")
            
        # Rule C: Direct Client-to-Client connections
        if src_type in clients and tgt_type in clients:
            warnings.append(f"Direct PC-to-PC connection found between '{node_labels.get(source)}' and '{node_labels.get(target)}'. Standard topologies recommend routing through a Switch.")

    # 2. Graph topology checks using NetworkX
    G = nx.Graph()
    for node in nodes:
        G.add_node(node["id"])
    for edge in edges:
        # Add edge if both nodes are valid
        if edge["source"] in G and edge["target"] in G:
            G.add_edge(edge["source"], edge["target"])
            
    # Check for isolated nodes
    isolated = list(nx.isolates(G))
    if isolated:
        for node_id in isolated:
            warnings.append(f"Isolated device: '{node_labels.get(node_id)}' is not connected to any other device on the network.")
            
    # Check for network partition
    try:
        if len(nodes) > 1 and len(edges) > 0:
            components = list(nx.connected_components(G))
            if len(components) > 1:
                warnings.append(f"The network is partitioned into {len(components)} disconnected subgraphs. Some devices cannot communicate.")
                
            # Check for bridges (single points of failure)
            bridges = list(nx.bridges(G))
            for u, v in bridges:
                u_label = node_labels.get(u, u)
                v_label = node_labels.get(v, v)
                warnings.append(f"Single Point of Failure: Removing the link between '{u_label}' and '{v_label}' will partition the network.")
    except Exception:
        # Suppress any unexpected Graph errors to avoid crashing validation API
        pass
        
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }
