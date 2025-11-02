import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const AppleEcosystemGraph = () => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  const ecosystemMembers = [
    { id: 1, name: 'App Developers', category: 'Development', color: '#007AFF', isCircular: true, isProminent: true },
    { id: 2, name: 'Advertisers', category: 'Marketing', color: '#FF9500' },
    { id: 3, name: 'Ad Networks', category: 'Marketing', color: '#FF9500' },
    { id: 4, name: 'Payment Providers', category: 'Payment', color: '#34C759' },
    { id: 5, name: 'Content Networks', category: 'Content', color: '#AF52DE' },
    { id: 6, name: 'Content Providers', category: 'Content', color: '#AF52DE' },
    { id: 7, name: 'Phone Manufacturers', category: 'Hardware', color: '#FF3B30' },
    { id: 8, name: 'Retailers', category: 'Distribution', color: '#FF2D55' },
    { id: 9, name: 'Phone Networks', category: 'Infrastructure', color: '#5AC8FA' },
    { id: 11, name: 'Regulators', category: 'Governance', color: '#8E8E93' },
    { id: 12, name: 'Finance Providers', category: 'Credit', color: '#34C759' },
    { id: 13, name: 'Data Brokers', category: 'Data', color: '#FFCC00' },
    { id: 14, name: 'iPhone Users', category: 'Users', color: '#EC4899', isCircular: true },
    { id: 0, name: 'Apple', category: 'Platform', color: '#6B7280', isCenter: true, isCircular: true, isProminent: true }
  ];

  const categories = [
    { name: 'Development', color: '#007AFF' },
    { name: 'Content', color: '#AF52DE' },
    { name: 'Payment', color: '#34C759' },
    { name: 'Hardware', color: '#FF3B30' },
    { name: 'Infrastructure', color: '#5AC8FA' },
    { name: 'Credit', color: '#34C759' },
    { name: 'Distribution', color: '#FF2D55' },
    { name: 'Governance', color: '#8E8E93' },
    { name: 'Data', color: '#FFCC00' },
    { name: 'Marketing', color: '#FF9500' },
    { name: 'Users', color: '#EC4899' }
  ];

  // Relationships between ecosystem members
  // weight parameter: multiplies the default line width (defaults to 1.0 if not specified)
  const relationships = [
    // Apple connections to all members
    { from: 0, to: 1, label: 'App Store', weight: 2.0 },
    { from: 0, to: 3, label: 'Ad Platform' },
    { from: 0, to: 4, label: 'Apple Pay', weight: 1.0 },
    { from: 0, to: 5, label: 'Content', type: 'content' },
    { from: 0, to: 6, label: 'Content', type: 'content' },
    { from: 0, to: 7, label: 'Manufacturing' },
    { from: 0, to: 8, label: 'Retail' },
    { from: 0, to: 9, label: 'Carriers' },
    { from: 0, to: 11, label: 'Compliance' },
    { from: 0, to: 12, label: 'Financing' },
    { from: 0, to: 13, label: 'Data' },
    { from: 0, to: 14, label: 'Platform', type: 'user' },

    // App Developers relationships
    { from: 1, to: 0, label: 'Apps', weight: 2.0 },
    { from: 1, to: 2, label: 'Monetization' },
    { from: 1, to: 3, label: 'Ad Integration' },
    { from: 1, to: 4, label: 'Payments', weight: 1.3 },
    { from: 1, to: 5, label: 'Content Distribution' },
    { from: 1, to: 6, label: 'Content Licensing' },
    { from: 1, to: 13, label: 'Data' },
    { from: 1, to: 7, label: 'App Bundling', type: 'bundling' },
    { from: 1, to: 9, label: 'App Bundling', type: 'bundling' },
    { from: 1, to: 14, label: 'Apps', type: 'user', weight: 2.5 },

    // Marketing ecosystem
    { from: 2, to: 3, label: 'Campaigns' },
    { from: 2, to: 13, label: 'Targeting Data' },
    { from: 2, to: 14, label: 'Ads', type: 'user' },
    { from: 3, to: 13, label: 'User Data' },

    // Financial connections
    { from: 8, to: 12, label: 'Financing' },
    { from: 8, to: 14, label: 'Devices', type: 'user' },

    // Content flow
    { from: 5, to: 6, label: 'Content Supply' },
    { from: 6, to: 1, label: 'Content', type: 'content' },
    { from: 6, to: 14, label: 'Content', type: 'user' },
    
    // Hardware & Distribution
    { from: 7, to: 8, label: 'Retail Distribution' },
    { from: 7, to: 9, label: 'Device Activation' },
    { from: 9, to: 8, label: 'Device Sales' },
    { from: 9, to: 13, label: 'Data' },
    
    // Regulatory oversight
    { from: 11, to: 13, label: 'Privacy Laws' },
    { from: 11, to: 2, label: 'Ad Regulations' },
    
    // Data flows
    { from: 13, to: 3, label: 'Analytics' },
    { from: 13, to: 1, label: 'User Insights' },
    
    // iPhone Users data flows
    { from: 14, to: 3, label: 'Data' },
    { from: 14, to: 1, label: 'Data' }
  ];

  useEffect(() => {
    const width = 1200;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;

    // Define central triangle positions for Apple, App Developers, and iPhone Users
    // Equilateral triangle with iPhone Users at top, Apple and App Developers horizontal at bottom
    const triangleRadius = 120; // Increased from 80 to 120 for more space between Apple and App Developers
    const centralPositions = {
      14: { // iPhone Users at top
        x: centerX+ triangleRadius * Math.cos(Math.PI / 6),
        y: centerY - triangleRadius
      },
      0: { // Apple at bottom-left
        x: centerX - triangleRadius * Math.cos(Math.PI / 6),
        y: centerY + triangleRadius * Math.sin(Math.PI / 6)
      },
      1: { // App Developers at bottom-right
        x: centerX + triangleRadius * Math.cos(Math.PI / 6),
        y: centerY + triangleRadius * Math.sin(Math.PI / 6)
      }
    };

    // Create invisible anchor nodes for each category to cluster similar nodes
    const categoryAnchors = categories.map((cat, index) => {
      const angle = (index * 2 * Math.PI) / categories.length;
      const anchorRadius = 300; // Increased from 250 to push category anchors further out
      return {
        id: `anchor-${cat.name}`,
        category: cat.name,
        x: centerX + anchorRadius * Math.cos(angle),
        y: centerY + anchorRadius * Math.sin(angle),
        radius: 0,
        isAnchor: true
      };
    });

    // Initialize nodes with positions
    const initialNodes = [
      ...ecosystemMembers.map(member => {
        // Use central triangle positions for the three key nodes
        const centralPos = centralPositions[member.id];
        return {
          ...member,
          x: centralPos ? centralPos.x : Math.random() * width,
          y: centralPos ? centralPos.y : Math.random() * height,
          radius: member.isProminent ? 45 : (member.isCircular ? 40 : 30)
        };
      }),
      ...categoryAnchors
    ];

    // Create links for D3 - main relationships
    const links = relationships.map(rel => ({
      source: rel.from,
      target: rel.to,
      label: rel.label,
      isVisible: true
    }));

    // Add invisible links from each node to its category anchor
    // Exclude the three central nodes (Apple, App Developers, iPhone Users) from category anchors
    const centralNodeIds = [0, 1, 14];
    ecosystemMembers.forEach(member => {
      if (!centralNodeIds.includes(member.id)) {
        const anchorId = `anchor-${member.category}`;
        links.push({
          source: member.id,
          target: anchorId,
          isVisible: false
        });
      }
    });

    // Create force simulation
    const simulation = d3.forceSimulation(initialNodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => d.isVisible ? 250 : 50) // Category anchor links: reduced from 80 to 50
        .strength(d => d.isVisible ? 0.3 : 1.2)) // Category anchor links: increased from 0.8 to 1.2
      .force('charge', d3.forceManyBody()
        .strength(d => d.isAnchor ? 0 : -1500) // Increased repulsion from -1200 to -1500
        .distanceMax(600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => {
          if (d.isAnchor) return 0;
          if (d.isCircular) {
            return d.isProminent ? 55 : 50; // Adjusted collision radius for smaller prominent nodes
          }
          // Calculate collision radius based on rectangular bounds
          const words = d.name ? d.name.split(' ') : [];
          const maxWordLength = Math.max(...words.map(w => w.length), 0);
          const rectWidth = Math.max(maxWordLength * 7 + 8, 60);
          const rectHeight = words.length * 15 + 8;
          // Use diagonal as collision radius for rectangular nodes
          return Math.sqrt(rectWidth * rectWidth + rectHeight * rectHeight) / 2 + 10;
        })
        .strength(0.8))
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.03));

    // Pin the three central nodes (Apple, App Developers, iPhone Users) in their triangle positions
    initialNodes.forEach(node => {
      if (centralNodeIds.includes(node.id) && centralPositions[node.id]) {
        node.fx = centralPositions[node.id].x;
        node.fy = centralPositions[node.id].y;
      }
    });

    // Pin category anchors
    categoryAnchors.forEach(anchor => {
      anchor.fx = anchor.x;
      anchor.fy = anchor.y;
    });

    simulation.on('tick', () => {
      setNodes([...initialNodes]);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, []);

  // Set up zoom behavior after nodes are available
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const g = svg.select('g.zoom-group');
    
    if (g.empty()) return;
    
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3]) // Min and max zoom levels
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Cleanup function to remove zoom behavior
    return () => {
      svg.on('.zoom', null);
    };
  }, [nodes.length]);

  if (nodes.length === 0) {
    return <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
      <div className="text-gray-600">Initializing force-directed layout...</div>
    </div>;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Apple Developer Ecosystem</h1>
        <p className="text-sm lg:text-base text-gray-600">Key Stakeholders and Their Interconnections</p>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">Force-directed layout with category clustering - Hover over any node to see its relationships</p>
        <p className="text-xs text-gray-400 mt-1">Scroll to zoom • Click and drag to pan</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Graph Container */}
        <div className="flex-1">
          <svg ref={svgRef} viewBox="0 0 1200 800" className="w-full h-auto bg-white rounded-lg shadow-lg" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Define arrow markers */}
        <defs>
          <marker
            id="arrowhead-normal"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#94A3B8" />
          </marker>
          <marker
            id="arrowhead-highlighted"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#007AFF" />
          </marker>
          <marker
            id="arrowhead-bundling"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#3B82F6" />
          </marker>
          <marker
            id="arrowhead-bundling-highlighted"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#2563EB" />
          </marker>
          <marker
            id="arrowhead-user"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#EC4899" />
          </marker>
          <marker
            id="arrowhead-user-highlighted"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#DB2777" />
          </marker>
          <marker
            id="arrowhead-data"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#10B981" />
          </marker>
          <marker
            id="arrowhead-data-highlighted"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#059669" />
          </marker>
          <marker
            id="arrowhead-content"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#AF52DE" />
          </marker>
          <marker
            id="arrowhead-content-highlighted"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#9333EA" />
          </marker>
          <marker
            id="arrowhead-app"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#2a2a2a" />
          </marker>
          <marker
            id="arrowhead-app-highlighted"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#0a0a0a" />
          </marker>
        </defs>

        <g className="zoom-group">
        {/* Relationships between members */}
        {relationships.filter(rel => {
          // Only show visible relationships and make sure both nodes exist
          const fromNode = nodes.find(n => n.id === rel.from);
          const toNode = nodes.find(n => n.id === rel.to);
          return fromNode && toNode && !fromNode.isAnchor && !toNode.isAnchor;
        }).map((rel, index) => {
          const fromNode = nodes.find(n => n.id === rel.from);
          const toNode = nodes.find(n => n.id === rel.to);
          
          const isHighlighted = hoveredNode === rel.from || hoveredNode === rel.to;
          const isBundling = rel.type === 'bundling';
          const isUserConnection = rel.type === 'user';
          const isContentConnection = rel.type === 'content';
          
          // Check if this is a bidirectional connection
          const isBidirectional = relationships.some(r => 
            r.from === rel.to && r.to === rel.from
          );
          
          // Calculate vector from source to target
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const angle = Math.atan2(dy, dx);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate start position (edge of source node if circular)
          let startX = fromNode.x;
          let startY = fromNode.y;
          
          if (fromNode.isCircular) {
            const fromCircleRadius = fromNode.isProminent ? 45 : 40;
            startX = fromNode.x + (fromCircleRadius * Math.cos(angle));
            startY = fromNode.y + (fromCircleRadius * Math.sin(angle));
          }
          
          let endX, endY;
          
          if (toNode.isCircular) {
            // For circular nodes, stop at the edge of the circle
            const circleRadius = toNode.isProminent ? 45 : 40;
            endX = toNode.x - (circleRadius * Math.cos(angle));
            endY = toNode.y - (circleRadius * Math.sin(angle));
          } else {
            // For rectangular nodes, calculate edge intersection
            const toWords = toNode.name.split(' ');
            const toMaxWordLength = Math.max(...toWords.map(w => w.length));
            const toRectWidth = Math.max(toMaxWordLength * 7 + 8, 60);
            const toRectHeight = toWords.length * 15 + 8;
            
            // Calculate edge of target rectangle
            const targetEdgeDistance = Math.min(
              Math.abs((toRectWidth / 2) / Math.cos(angle)),
              Math.abs((toRectHeight / 2) / Math.sin(angle))
            );
            
            // End line at edge of target rectangle
            endX = toNode.x - (targetEdgeDistance * Math.cos(angle));
            endY = toNode.y - (targetEdgeDistance * Math.sin(angle));
          }
          
          // Shorten the line to stop before the arrow starts
          // Arrow is 9 units long, so we move the end point back by that amount
          const arrowLength = 9;
          const lineEndX = endX - (arrowLength * Math.cos(angle));
          const lineEndY = endY - (arrowLength * Math.sin(angle));

          // Calculate parallel offset for bidirectional connections
          let lineStartX = startX;
          let lineStartY = startY;
          let offsetLineEndX = lineEndX;
          let offsetLineEndY = lineEndY;
          let labelOffsetX = 0;
          let labelOffsetY = 0;

          if (isBidirectional) {
            // For bidirectional connections, we need to use a consistent perpendicular direction
            // Calculate perpendicular based on the original node positions (not the directed dx/dy)
            // This ensures both lines use the same perpendicular direction
            const fromId = Math.min(rel.from, rel.to);
            const toId = Math.max(rel.from, rel.to);
            const fromNodeRef = nodes.find(n => n.id === fromId);
            const toNodeRef = nodes.find(n => n.id === toId);
            const consistentDx = toNodeRef.x - fromNodeRef.x;
            const consistentDy = toNodeRef.y - fromNodeRef.y;
            const consistentDistance = Math.sqrt(consistentDx * consistentDx + consistentDy * consistentDy);

            // Calculate perpendicular vector for offset (consistent for both directions)
            const perpX = -consistentDy / consistentDistance;
            const perpY = consistentDx / consistentDistance;

            // Offset each line by half the gap in opposite directions
            // This creates parallel lines with the gap between them
            const gapAmount = 6; // Total gap between the two lines
            const offsetDirection = rel.from < rel.to ? 1 : -1;
            const lineOffsetAmount = (gapAmount / 2) * offsetDirection; // +3 or -3
            const labelOffsetAmount = (gapAmount / 2 + 6) * offsetDirection; // Label further out

            // Apply offset to line endpoints
            lineStartX += perpX * lineOffsetAmount;
            lineStartY += perpY * lineOffsetAmount;
            offsetLineEndX += perpX * lineOffsetAmount;
            offsetLineEndY += perpY * lineOffsetAmount;

            // Apply offset to label (same direction, but more)
            labelOffsetX = perpX * labelOffsetAmount;
            labelOffsetY = perpY * labelOffsetAmount;
          }

          // Calculate midpoint for label
          const midX = (lineStartX + offsetLineEndX) / 2 + labelOffsetX;
          const midY = (lineStartY + offsetLineEndY) / 2 + labelOffsetY;
          
          // Choose colors and styles based on type
          let lineColor, arrowMarker, labelColor, baseLineWidth, showLabel = true;
          const isDataConnection = rel.label === 'Data';
          const isAppConnection = (rel.label === 'Apps' || rel.label === 'App Store') && !rel.type; // Only if no type is set
          const weight = rel.weight || 1.0; // Default weight is 1.0

          // Check type-based connections first, then label-based
          if (isUserConnection) {
            lineColor = isHighlighted ? '#DB2777' : '#EC4899';
            arrowMarker = isHighlighted ? 'url(#arrowhead-user-highlighted)' : 'url(#arrowhead-user)';
            labelColor = isHighlighted ? '#BE185D' : '#EC4899';
            baseLineWidth = isHighlighted ? 3 : 2;
          } else if (isContentConnection) {
            lineColor = isHighlighted ? '#9333EA' : '#AF52DE';
            arrowMarker = isHighlighted ? 'url(#arrowhead-content-highlighted)' : 'url(#arrowhead-content)';
            labelColor = isHighlighted ? '#7E22CE' : '#AF52DE';
            baseLineWidth = isHighlighted ? 3 : 2;
            showLabel = false; // Suppress label for content connections
          } else if (isBundling) {
            lineColor = isHighlighted ? '#2563EB' : '#3B82F6';
            arrowMarker = isHighlighted ? 'url(#arrowhead-bundling-highlighted)' : 'url(#arrowhead-bundling)';
            labelColor = isHighlighted ? '#1E40AF' : '#3B82F6';
            baseLineWidth = isHighlighted ? 3 : 2;
            showLabel = false; // Suppress label for bundling connections
          } else if (isAppConnection) {
            lineColor = isHighlighted ? '#0a0a0a' : '#2a2a2a';
            arrowMarker = isHighlighted ? 'url(#arrowhead-app-highlighted)' : 'url(#arrowhead-app)';
            labelColor = isHighlighted ? '#0a0a0a' : '#2a2a2a';
            baseLineWidth = isHighlighted ? 3 : 2;
            showLabel = true; // Show labels for app connections
          } else if (isDataConnection) {
            lineColor = isHighlighted ? '#059669' : '#10B981';
            arrowMarker = isHighlighted ? 'url(#arrowhead-data-highlighted)' : 'url(#arrowhead-data)';
            labelColor = isHighlighted ? '#047857' : '#10B981';
            baseLineWidth = 2;
            showLabel = false; // Suppress label for data connections
          } else {
            lineColor = isHighlighted ? '#007AFF' : '#94A3B8';
            arrowMarker = isHighlighted ? 'url(#arrowhead-highlighted)' : 'url(#arrowhead-normal)';
            labelColor = isHighlighted ? '#1E40AF' : '#475569';
            baseLineWidth = isHighlighted ? 3 : 2;
          }

          // Apply weight to line width
          const lineWidth = baseLineWidth * weight;
          
          return (
            <g key={`rel-${index}`}>
              <line
                x1={lineStartX}
                y1={lineStartY}
                x2={offsetLineEndX}
                y2={offsetLineEndY}
                stroke={lineColor}
                strokeWidth={lineWidth}
                strokeOpacity={isHighlighted ? '0.9' : '0.7'}
                strokeDasharray={isBundling || isUserConnection || isDataConnection || isContentConnection || isAppConnection ? 'none' : '5,3'}
                markerEnd={arrowMarker}
              />
              {/* Text label - only show if not suppressed */}
              {showLabel && (
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={labelColor}
                  fontSize={isHighlighted ? '11' : '10'}
                  fontWeight={isHighlighted ? '700' : '600'}
                  style={{ pointerEvents: 'none' }}
                  stroke="white"
                  strokeWidth="3"
                  paintOrder="stroke"
                >
                  {rel.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Ecosystem member nodes */}
        {nodes.filter(node => !node.isAnchor).map((node) => {
          const isHovered = hoveredNode === node.id;
          const isApple = node.id === 0;
          const isCircular = node.isCircular;
          
          if (isCircular) {
            // Render circular node
            const circleRadius = node.isProminent ? 45 : 40;
            const fontSize = node.isProminent ? 15 : 12;
            const words = node.name.split(' ');
            const lineSpacing = 16;
            // Center multi-line text: first line Y position adjusted so text midpoint aligns with circle center
            const textStartY = node.y - (words.length - 1) * (lineSpacing / 2);
            
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node.id)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? circleRadius + 5 : circleRadius}
                  fill={node.color}
                  opacity={node.isProminent ? '0.95' : (isHovered ? '1' : '0.85')}
                  stroke={isHovered ? '#333' : (node.isProminent ? '#666' : 'none')}
                  strokeWidth={isHovered ? '3' : (node.isProminent ? '2' : '0')}
                />
                <text
                  x={node.x}
                  y={textStartY}
                  textAnchor="middle"
                  fill="white"
                  fontSize={isHovered ? fontSize + 1 : fontSize}
                  fontWeight="700"
                  style={{ pointerEvents: 'none' }}
                  dominantBaseline="middle"
                >
                  {words.map((word, i) => (
                    <tspan
                      key={i}
                      x={node.x}
                      dy={i === 0 ? 0 : lineSpacing}
                    >
                      {word}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          }
          
          // Render rectangular node
          const words = node.name.split(' ');
          const maxWordLength = Math.max(...words.map(w => w.length));
          const rectWidth = Math.max(maxWordLength * 7 + 8, 60);
          const rectHeight = words.length * 15 + 8;
          
          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(node.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={node.x - rectWidth / 2}
                y={node.y - rectHeight / 2}
                width={rectWidth}
                height={rectHeight}
                fill={node.color}
                opacity={isApple ? '0.9' : (isHovered ? '1' : '0.85')}
                rx="6"
                stroke={isHovered ? '#333' : 'none'}
                strokeWidth={isHovered ? '2' : '0'}
              />
              <text
                x={node.x}
                y={node.y - (words.length - 1) * 7.5 + 5}
                textAnchor="middle"
                fill={isApple ? "white" : "#1a1a1a"}
                fontSize={isApple ? '14' : (isHovered ? '12' : '11')}
                fontWeight="700"
                style={{ pointerEvents: 'none' }}
              >
                {words.map((word, i) => (
                  <tspan
                    key={i}
                    x={node.x}
                    dy={i === 0 ? 0 : 15}
                  >
                    {word}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
        </g>
      </svg>

      {/* Hover info - overlays on the graph */}
      {hoveredNode !== null && (
        <div className="absolute mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-md">
          <p className="text-sm text-blue-900 mb-2">
            <strong className="text-base">{nodes.find(m => m.id === hoveredNode)?.name}</strong>
            <br />
            <span className="text-gray-600">Category: {nodes.find(m => m.id === hoveredNode)?.category}</span>
          </p>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Relationships:</p>
            <div className="grid grid-cols-1 gap-2">
              {relationships
                .filter(r => r.from === hoveredNode || r.to === hoveredNode)
                .map((rel, idx) => {
                  const isOutgoing = rel.from === hoveredNode;
                  const partnerId = isOutgoing ? rel.to : rel.from;
                  const partner = nodes.find(m => m.id === partnerId);
                  return (
                    <div key={idx} className="text-xs bg-white rounded px-2 py-1">
                      <span className="text-gray-500">{isOutgoing ? '→' : '←'}</span>{' '}
                      <span className="font-medium">{partner?.name}</span>
                      {' - '}
                      <span className="text-gray-500 text-xs">{rel.label}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
        </div>

        {/* Legend - Right sidebar on desktop, below on mobile */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 space-y-6">
            {/* Node Categories */}
            <div>
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-gray-800">Node Categories</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3">
                {categories.map((category) => (
                  <div key={category.name} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs lg:text-sm text-gray-700">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Edge Types */}
            <div>
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-gray-800">Connection Types</h3>
              <div className="space-y-2 lg:space-y-3">
                <div className="flex items-center gap-2 lg:gap-3">
                  <svg width="40" height="4" className="flex-shrink-0">
                    <line x1="0" y1="2" x2="40" y2="2" stroke="#10B981" strokeWidth="2" />
                  </svg>
                  <span className="text-xs lg:text-sm text-gray-700">Data Flow</span>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <svg width="40" height="4" className="flex-shrink-0">
                    <line x1="0" y1="2" x2="40" y2="2" stroke="#3B82F6" strokeWidth="2" />
                  </svg>
                  <span className="text-xs lg:text-sm text-gray-700">App Bundling</span>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <svg width="40" height="4" className="flex-shrink-0">
                    <line x1="0" y1="2" x2="40" y2="2" stroke="#AF52DE" strokeWidth="2" />
                  </svg>
                  <span className="text-xs lg:text-sm text-gray-700">Content</span>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <svg width="40" height="4" className="flex-shrink-0">
                    <line x1="0" y1="2" x2="40" y2="2" stroke="#EC4899" strokeWidth="3" />
                  </svg>
                  <span className="text-xs lg:text-sm text-gray-700">User Connections</span>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <svg width="40" height="4" className="flex-shrink-0">
                    <line x1="0" y1="2" x2="40" y2="2" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5,3" />
                  </svg>
                  <span className="text-xs lg:text-sm text-gray-700">Other Relationships</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Node Details */}
          {selectedNode !== null && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg shadow-lg p-4 lg:p-6 mt-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base lg:text-lg font-bold text-gray-900">
                  {nodes.find(n => n.id === selectedNode)?.name}
                </h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">
                  Category: <span className="font-medium">{nodes.find(n => n.id === selectedNode)?.category}</span>
                </p>
              </div>

              <div className="border-t border-blue-200 pt-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Connections:</h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {relationships
                    .filter(r => r.from === selectedNode || r.to === selectedNode)
                    .map((rel, idx) => {
                      const isOutgoing = rel.from === selectedNode;
                      const partnerId = isOutgoing ? rel.to : rel.from;
                      const partner = nodes.find(n => n.id === partnerId);

                      // Determine connection type styling
                      const isDataConnection = rel.label === 'Data';
                      const isUserConnection = rel.type === 'user';
                      const isContentConnection = rel.type === 'content';
                      const isBundling = rel.type === 'bundling';
                      const isAppConnection = (rel.label === 'Apps' || rel.label === 'App Store') && !rel.type;

                      let connectionColor = '#94A3B8'; // default
                      if (isUserConnection) connectionColor = '#EC4899';
                      else if (isContentConnection) connectionColor = '#AF52DE';
                      else if (isBundling) connectionColor = '#3B82F6';
                      else if (isAppConnection) connectionColor = '#2a2a2a';
                      else if (isDataConnection) connectionColor = '#10B981';

                      return (
                        <div key={idx} className="flex items-start gap-2 bg-white rounded-md px-3 py-2 text-xs lg:text-sm">
                          <span
                            className="font-bold text-lg leading-none mt-0.5"
                            style={{ color: connectionColor }}
                          >
                            {isOutgoing ? '→' : '←'}
                          </span>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-800">{partner?.name}</span>
                            <span className="text-gray-400 mx-1.5">•</span>
                            <span className="text-gray-600 italic">{rel.label}</span>
                            {rel.weight && rel.weight !== 1.0 && (
                              <span className="text-gray-400 text-xs ml-1.5">(weight: {rel.weight})</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {relationships.filter(r => r.from === selectedNode || r.to === selectedNode).length === 0 && (
                    <p className="text-xs text-gray-500 italic">No connections</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppleEcosystemGraph;
