from typing import Dict, List, Any
import math

"""
File: templates.py
Author: Antigravity AI
Purpose: Service layer generating structured nodes and edges for network templates.
"""

def generate_pc_grid(switch_id: str, dept_name: str, pc_count: int, start_x: float, start_y: float, cols: int = 5, spacing_x: float = 80, spacing_y: float = 80) -> tuple:
    nodes = []
    edges = []
    
    for i in range(pc_count):
        col = i % cols
        row = i // cols
        
        pc_id = f"{dept_name}-PC-{i+1}"
        pc_label = f"{dept_name} PC {i+1}"
        
        # Grid placement
        x = start_x + (col * spacing_x)
        y = start_y + (row * spacing_y)
        
        # Randomize device type slightly for educational variety
        dev_type = "Laptop" if (i % 4 == 0) else "PC"
        
        nodes.append({
            "id": pc_id,
            "label": pc_label,
            "type": dev_type,
            "status": "healthy",
            "position": {"x": x, "y": y}
        })
        
        edges.append({
            "source": switch_id,
            "target": pc_id,
            "weight": 1.0,
            "latency": 5.0 + (i % 3) * 2.0,  # 5-9ms latency
            "bandwidth": 100.0
        })
        
    return nodes, edges

def get_template_graph(template_id: str) -> Dict[str, List[Dict[str, Any]]]:
    nodes = []
    edges = []
    
    if template_id == "college":
        # Hierarchical Network Topology (approx. 29 nodes)
        
        # Level 0: Internet
        nodes.append({
            "id": "NET-1", "label": "Internet", "type": "Internet", "status": "healthy",
            "position": {"x": 1787.5, "y": 50}
        })
        
        # Level 1: Firewall
        nodes.append({
            "id": "FW-1", "label": "Firewall", "type": "Firewall", "status": "healthy",
            "position": {"x": 1787.5, "y": 120}
        })
        edges.append({"source": "NET-1", "target": "FW-1", "weight": 1.0, "latency": 1.0, "bandwidth": 1000.0})
        
        # Level 2: Router
        nodes.append({
            "id": "R-1", "label": "Main Router", "type": "Router", "status": "healthy",
            "position": {"x": 1787.5, "y": 190}
        })
        edges.append({"source": "FW-1", "target": "R-1", "weight": 1.0, "latency": 2.0, "bandwidth": 1000.0})
        
        # Level 3: Core Switch A and Core Switch B
        nodes.append({
            "id": "CSW-A", "label": "Core Switch A", "type": "Core Switch", "status": "healthy",
            "position": {"x": 725, "y": 280}
        })
        nodes.append({
            "id": "CSW-B", "label": "Core Switch B", "type": "Core Switch", "status": "healthy",
            "position": {"x": 2850, "y": 280}
        })
        
        edges.append({"source": "R-1", "target": "CSW-A", "weight": 2.0, "latency": 5.0, "bandwidth": 1000.0})
        edges.append({"source": "R-1", "target": "CSW-B", "weight": 2.0, "latency": 5.0, "bandwidth": 1000.0})
        # Inter-core link
        edges.append({"source": "CSW-A", "target": "CSW-B", "weight": 1.0, "latency": 1.0, "bandwidth": 1000.0})
        
        # Level 4: Department Switches
        # Core A -> Admin Switch & CSE Switch
        nodes.append({
            "id": "SW-ADMIN", "label": "Admin Access Switch", "type": "Access Switch", "status": "healthy",
            "position": {"x": 300, "y": 400}
        })
        nodes.append({
            "id": "SW-CSE", "label": "CSE Dept Switch", "type": "Access Switch", "status": "healthy",
            "position": {"x": 1150, "y": 400}
        })
        edges.append({"source": "CSW-A", "target": "SW-ADMIN", "weight": 2.0, "latency": 10.0, "bandwidth": 100.0})
        edges.append({"source": "CSW-A", "target": "SW-CSE", "weight": 2.0, "latency": 10.0, "bandwidth": 100.0})
        
        # Core B -> ECE Switch, Library Switch & Server Switch
        nodes.append({
            "id": "SW-ECE", "label": "ECE Dept Switch", "type": "Access Switch", "status": "healthy",
            "position": {"x": 2050, "y": 400}
        })
        nodes.append({
            "id": "SW-LIB", "label": "Library Switch", "type": "Access Switch", "status": "healthy",
            "position": {"x": 2900, "y": 400}
        })
        nodes.append({
            "id": "SW-SRV", "label": "Server Room Switch", "type": "Access Switch", "status": "healthy",
            "position": {"x": 3650, "y": 400}
        })
        edges.append({"source": "CSW-B", "target": "SW-ECE", "weight": 2.0, "latency": 10.0, "bandwidth": 100.0})
        edges.append({"source": "CSW-B", "target": "SW-LIB", "weight": 2.0, "latency": 10.0, "bandwidth": 100.0})
        edges.append({"source": "CSW-B", "target": "SW-SRV", "weight": 2.0, "latency": 5.0, "bandwidth": 1000.0})
        
        # Level 5: Department PCs and Servers
        # 1. Admin PCs: 4 nodes
        admin_nodes, admin_edges = generate_pc_grid("SW-ADMIN", "Admin", pc_count=4, start_x=0, start_y=540, cols=4, spacing_x=200)
        nodes.extend(admin_nodes)
        edges.extend(admin_edges)
        
        # 2. CSE PCs: 4 nodes
        cse_nodes, cse_edges = generate_pc_grid("SW-CSE", "CSE", pc_count=4, start_x=850, start_y=540, cols=4, spacing_x=200)
        nodes.extend(cse_nodes)
        edges.extend(cse_edges)
        
        # 3. ECE PCs: 4 nodes
        ece_nodes, ece_edges = generate_pc_grid("SW-ECE", "ECE", pc_count=4, start_x=1750, start_y=540, cols=4, spacing_x=200)
        nodes.extend(ece_nodes)
        edges.extend(ece_edges)
        
        # 4. Library PCs: 4 nodes
        lib_nodes, lib_edges = generate_pc_grid("SW-LIB", "Library", pc_count=4, start_x=2600, start_y=540, cols=4, spacing_x=200)
        nodes.extend(lib_nodes)
        edges.extend(lib_edges)
        
        # 5. Servers (3 nodes under SW-SRV)
        srv_types = [
            ("SRV-APP", "Application Server", "Application Server", 3450),
            ("SRV-DB", "Database Server", "Database Server", 3650),
            ("SRV-BAK", "Backup Server", "Backup Server", 3850)
        ]
        for srv_id, label, dev_type, x_pos in srv_types:
            nodes.append({
                "id": srv_id, "label": label, "type": dev_type, "status": "healthy",
                "position": {"x": x_pos, "y": 540}
            })
            edges.append({
                "source": "SW-SRV", "target": srv_id, "weight": 1.0, "latency": 2.0, "bandwidth": 1000.0
            })
            
    elif template_id == "office":
        # Small Office Network (~10 nodes)
        nodes = [
            {"id": "NET-1", "label": "Internet", "type": "Internet", "status": "healthy", "position": {"x": 600, "y": 50}},
            {"id": "FW-1", "label": "Firewall", "type": "Firewall", "status": "healthy", "position": {"x": 600, "y": 130}},
            {"id": "R-1", "label": "Office Router", "type": "Router", "status": "healthy", "position": {"x": 600, "y": 210}},
            {"id": "SW-1", "label": "Office Switch", "type": "Access Switch", "status": "healthy", "position": {"x": 600, "y": 290}},
            
            {"id": "PC-1", "label": "Workstation 1", "type": "PC", "status": "healthy", "position": {"x": 100, "y": 410}},
            {"id": "PC-2", "label": "Workstation 2", "type": "PC", "status": "healthy", "position": {"x": 300, "y": 410}},
            {"id": "LAP-1", "label": "Staff Laptop", "type": "Laptop", "status": "healthy", "position": {"x": 500, "y": 410}},
            {"id": "PRN-1", "label": "Office Printer", "type": "Printer", "status": "healthy", "position": {"x": 700, "y": 410}},
            {"id": "AP-1", "label": "Wireless AP", "type": "Wireless Access Point", "status": "healthy", "position": {"x": 900, "y": 410}},
            {"id": "SRV-1", "label": "Local NAS Server", "type": "Database Server", "status": "healthy", "position": {"x": 1100, "y": 410}}
        ]
        edges = [
            {"source": "NET-1", "target": "FW-1", "weight": 1.0, "latency": 1.0, "bandwidth": 100.0},
            {"source": "FW-1", "target": "R-1", "weight": 1.0, "latency": 2.0, "bandwidth": 100.0},
            {"source": "R-1", "target": "SW-1", "weight": 1.0, "latency": 5.0, "bandwidth": 1000.0},
            
            {"source": "SW-1", "target": "PC-1", "weight": 1.0, "latency": 10.0, "bandwidth": 100.0},
            {"source": "SW-1", "target": "PC-2", "weight": 1.0, "latency": 10.0, "bandwidth": 100.0},
            {"source": "SW-1", "target": "LAP-1", "weight": 1.0, "latency": 15.0, "bandwidth": 100.0},
            {"source": "SW-1", "target": "PRN-1", "weight": 1.0, "latency": 12.0, "bandwidth": 100.0},
            {"source": "SW-1", "target": "AP-1", "weight": 1.0, "latency": 8.0, "bandwidth": 100.0},
            {"source": "SW-1", "target": "SRV-1", "weight": 1.0, "latency": 3.0, "bandwidth": 1000.0}
        ]
        
    elif template_id == "hospital":
        # Hospital Partitioned Network (~20 nodes)
        nodes = [
            {"id": "NET-1", "label": "Internet", "type": "Internet", "status": "healthy", "position": {"x": 825, "y": 50}},
            {"id": "FW-1", "label": "Hospital Firewall", "type": "Firewall", "status": "healthy", "position": {"x": 825, "y": 130}},
            {"id": "R-1", "label": "Central Router", "type": "Router", "status": "healthy", "position": {"x": 825, "y": 210}},
            
            # Subnets
            {"id": "SW-CLINIC", "label": "Clinical Devices Switch", "type": "Access Switch", "status": "healthy", "position": {"x": 305, "y": 300}},
            {"id": "SW-ADMIN", "label": "Hospital Admin Switch", "type": "Access Switch", "status": "healthy", "position": {"x": 920, "y": 300}},
            {"id": "SW-PATIENT", "label": "Patient Guest Switch", "type": "Access Switch", "status": "healthy", "position": {"x": 1345, "y": 300}},
            
            # Clinical subnet
            {"id": "ICU-MON-1", "label": "ICU Monitor 1", "type": "PC", "status": "healthy", "position": {"x": 50, "y": 420}},
            {"id": "ICU-MON-2", "label": "ICU Monitor 2", "type": "PC", "status": "healthy", "position": {"x": 220, "y": 420}},
            {"id": "PHARM-PC", "label": "Pharmacy Station", "type": "Laptop", "status": "healthy", "position": {"x": 390, "y": 420}},
            {"id": "SRV-EMR", "label": "Health Records Server", "type": "Database Server", "status": "healthy", "position": {"x": 560, "y": 420}},
            
            # Admin Subnet
            {"id": "ADM-PC-1", "label": "Billing PC 1", "type": "PC", "status": "healthy", "position": {"x": 750, "y": 420}},
            {"id": "ADM-PC-2", "label": "Reception PC 2", "type": "PC", "status": "healthy", "position": {"x": 920, "y": 420}},
            {"id": "ADM-PRN", "label": "Reception Printer", "type": "Printer", "status": "healthy", "position": {"x": 1090, "y": 420}},
            
            # Patient Subnet
            {"id": "PAT-AP-1", "label": "Ward Wifi AP 1", "type": "Wireless Access Point", "status": "healthy", "position": {"x": 1260, "y": 420}},
            {"id": "PAT-AP-2", "label": "Lobby Wifi AP 2", "type": "Wireless Access Point", "status": "healthy", "position": {"x": 1430, "y": 420}}
        ]
        
        edges = [
            {"source": "NET-1", "target": "FW-1", "weight": 1.0, "latency": 1.0, "bandwidth": 500.0},
            {"source": "FW-1", "target": "R-1", "weight": 1.0, "latency": 2.0, "bandwidth": 500.0},
            
            {"source": "R-1", "target": "SW-CLINIC", "weight": 1.0, "latency": 5.0, "bandwidth": 1000.0},
            {"source": "R-1", "target": "SW-ADMIN", "weight": 2.0, "latency": 5.0, "bandwidth": 1000.0},
            {"source": "R-1", "target": "SW-PATIENT", "weight": 5.0, "latency": 15.0, "bandwidth": 100.0},
            
            # Clinical
            {"source": "SW-CLINIC", "target": "ICU-MON-1", "weight": 1.0, "latency": 2.0, "bandwidth": 100.0},
            {"source": "SW-CLINIC", "target": "ICU-MON-2", "weight": 1.0, "latency": 2.0, "bandwidth": 100.0},
            {"source": "SW-CLINIC", "target": "PHARM-PC", "weight": 1.0, "latency": 4.0, "bandwidth": 100.0},
            {"source": "SW-CLINIC", "target": "SRV-EMR", "weight": 1.0, "latency": 1.0, "bandwidth": 1000.0},
            
            # Admin
            {"source": "SW-ADMIN", "target": "ADM-PC-1", "weight": 1.0, "latency": 8.0, "bandwidth": 100.0},
            {"source": "SW-ADMIN", "target": "ADM-PC-2", "weight": 1.0, "latency": 8.0, "bandwidth": 100.0},
            {"source": "SW-ADMIN", "target": "ADM-PRN", "weight": 1.0, "latency": 10.0, "bandwidth": 100.0},
            
            # Patient Wifi
            {"source": "SW-PATIENT", "target": "PAT-AP-1", "weight": 1.0, "latency": 20.0, "bandwidth": 50.0},
            {"source": "SW-PATIENT", "target": "PAT-AP-2", "weight": 1.0, "latency": 22.0, "bandwidth": 50.0}
        ]
        
    elif template_id == "enterprise":
        # Enterprise redundant network (~30 nodes with circles/redundancy)
        nodes = [
            {"id": "NET-1", "label": "Primary Link", "type": "Internet", "status": "healthy", "position": {"x": 600, "y": 50}},
            {"id": "NET-2", "label": "Backup Link", "type": "Internet", "status": "healthy", "position": {"x": 1200, "y": 50}},
            
            {"id": "FW-1", "label": "Firewall A", "type": "Firewall", "status": "healthy", "position": {"x": 600, "y": 130}},
            {"id": "FW-2", "label": "Firewall B", "type": "Firewall", "status": "healthy", "position": {"x": 1200, "y": 130}},
            
            {"id": "R-1", "label": "Core Router A", "type": "Router", "status": "healthy", "position": {"x": 600, "y": 210}},
            {"id": "R-2", "label": "Core Router B", "type": "Router", "status": "healthy", "position": {"x": 1200, "y": 210}},
            
            {"id": "CSW-1", "label": "Distribution Switch 1", "type": "Core Switch", "status": "healthy", "position": {"x": 400, "y": 290}},
            {"id": "CSW-2", "label": "Distribution Switch 2", "type": "Core Switch", "status": "healthy", "position": {"x": 1400, "y": 290}},
            
            {"id": "SW-OFFICE-1", "label": "Access SW 1", "type": "Access Switch", "status": "healthy", "position": {"x": 200, "y": 400}},
            {"id": "SW-OFFICE-2", "label": "Access SW 2", "type": "Access Switch", "status": "healthy", "position": {"x": 900, "y": 400}},
            {"id": "SW-DATA", "label": "Server Rack SW", "type": "Access Switch", "status": "healthy", "position": {"x": 1600, "y": 400}},
            
            # Office 1 Nodes
            {"id": "O1-PC-1", "label": "Admin PC", "type": "PC", "status": "healthy", "position": {"x": 50, "y": 520}},
            {"id": "O1-PC-2", "label": "HR PC", "type": "PC", "status": "healthy", "position": {"x": 220, "y": 520}},
            {"id": "O1-LAP", "label": "Executive Laptop", "type": "Laptop", "status": "healthy", "position": {"x": 390, "y": 520}},
            
            # Office 2 Nodes
            {"id": "O2-PC-1", "label": "Finance PC", "type": "PC", "status": "healthy", "position": {"x": 730, "y": 520}},
            {"id": "O2-PC-2", "label": "Sales PC", "type": "PC", "status": "healthy", "position": {"x": 900, "y": 520}},
            {"id": "O2-PRN", "label": "Sales Printer", "type": "Printer", "status": "healthy", "position": {"x": 1070, "y": 520}},
            
            # Server Rooms
            {"id": "SRV-WEB", "label": "Public Web Server", "type": "Application Server", "status": "healthy", "position": {"x": 1430, "y": 520}},
            {"id": "SRV-SQL", "label": "SQL Server", "type": "Database Server", "status": "healthy", "position": {"x": 1600, "y": 520}},
            {"id": "SRV-CRM", "label": "CRM Server", "type": "Application Server", "status": "healthy", "position": {"x": 1770, "y": 520}}
        ]
        
        edges = [
            {"source": "NET-1", "target": "FW-1", "weight": 1.0, "latency": 2.0, "bandwidth": 1000.0},
            {"source": "NET-2", "target": "FW-2", "weight": 1.0, "latency": 12.0, "bandwidth": 100.0},  # backup link
            
            {"source": "FW-1", "target": "R-1", "weight": 1.0, "latency": 1.0, "bandwidth": 1000.0},
            {"source": "FW-2", "target": "R-2", "weight": 1.0, "latency": 2.0, "bandwidth": 1000.0},
            
            # Redundancy cross links
            {"source": "FW-1", "target": "R-2", "weight": 2.0, "latency": 3.0, "bandwidth": 1000.0},
            {"source": "FW-2", "target": "R-1", "weight": 2.0, "latency": 3.0, "bandwidth": 1000.0},
            {"source": "R-1", "target": "R-2", "weight": 1.0, "latency": 1.0, "bandwidth": 1000.0},
            
            # Router to Distribution Switch connections
            {"source": "R-1", "target": "CSW-1", "weight": 2.0, "latency": 5.0, "bandwidth": 1000.0},
            {"source": "R-1", "target": "CSW-2", "weight": 2.0, "latency": 5.0, "bandwidth": 1000.0},
            {"source": "R-2", "target": "CSW-1", "weight": 2.0, "latency": 5.0, "bandwidth": 1000.0},
            {"source": "R-2", "target": "CSW-2", "weight": 2.0, "latency": 5.0, "bandwidth": 1000.0},
            {"source": "CSW-1", "target": "CSW-2", "weight": 1.0, "latency": 1.0, "bandwidth": 1000.0},
            
            # Distribution to Access Switches
            {"source": "CSW-1", "target": "SW-OFFICE-1", "weight": 1.0, "latency": 4.0, "bandwidth": 1000.0},
            {"source": "CSW-1", "target": "SW-OFFICE-2", "weight": 2.0, "latency": 5.0, "bandwidth": 1000.0},
            {"source": "CSW-2", "target": "SW-OFFICE-2", "weight": 1.0, "latency": 4.0, "bandwidth": 1000.0},
            {"source": "CSW-2", "target": "SW-DATA", "weight": 1.0, "latency": 2.0, "bandwidth": 1000.0},
            
            # Office 1
            {"source": "SW-OFFICE-1", "target": "O1-PC-1", "weight": 1.0, "latency": 8.0, "bandwidth": 100.0},
            {"source": "SW-OFFICE-1", "target": "O1-PC-2", "weight": 1.0, "latency": 8.0, "bandwidth": 100.0},
            {"source": "SW-OFFICE-1", "target": "O1-LAP", "weight": 1.0, "latency": 12.0, "bandwidth": 100.0},
            
            # Office 2
            {"source": "SW-OFFICE-2", "target": "O2-PC-1", "weight": 1.0, "latency": 7.0, "bandwidth": 100.0},
            {"source": "SW-OFFICE-2", "target": "O2-PC-2", "weight": 1.0, "latency": 7.0, "bandwidth": 100.0},
            {"source": "SW-OFFICE-2", "target": "O2-PRN", "weight": 1.0, "latency": 9.0, "bandwidth": 100.0},
            
            # Data Center Servers
            {"source": "SW-DATA", "target": "SRV-WEB", "weight": 1.0, "latency": 2.0, "bandwidth": 1000.0},
            {"source": "SW-DATA", "target": "SRV-SQL", "weight": 1.0, "latency": 1.0, "bandwidth": 1000.0},
            {"source": "SW-DATA", "target": "SRV-CRM", "weight": 1.0, "latency": 2.0, "bandwidth": 1000.0}
        ]
        
    elif template_id == "blank":
        # Empty Graph
        nodes = []
        edges = []
        
    return {"nodes": nodes, "edges": edges}
