export const generateSql = (nodes, connections) => {
  if (Object.keys(nodes).length === 0) {
    return "/* 테이블을 캔버스로 드래그하세요. */";
  }

  const tableAliases = {};
  Object.values(nodes).forEach((node, i) => {
    tableAliases[node.id] = node.alias || `t${i + 1}`;
  });

  const selectedColumns = Object.values(nodes).flatMap(node => 
    node.columns.map(col => `  ${tableAliases[node.id]}.${col.name}`)
  ).join(',\n');

  let fromClause = '';
  const joinClauses = [];
  const allNodeIds = new Set(Object.keys(nodes));

  if (connections.length > 0) {
    const rootNodeId = connections[0].from.fromNodeId;
    fromClause = `FROM ${nodes[rootNodeId].name} AS ${tableAliases[rootNodeId]}`;
    allNodeIds.delete(rootNodeId);
    
    const processedConnections = new Set();

    const buildJoins = (currentNodeId) => {
        connections.forEach((conn, index) => {
            if(processedConnections.has(index)) return;

            let fromNode, toNode, fromCol, toCol;
            if (conn.from.fromNodeId === currentNodeId) {
                fromNode = conn.from;
                toNode = conn.to;
            } else if (conn.to.toNodeId === currentNodeId) {
                fromNode = conn.to;
                toNode = conn.from;
            } else {
                return;
            }

            joinClauses.push(
                `JOIN ${nodes[toNode.toNodeId || toNode.fromNodeId].name} AS ${tableAliases[toNode.toNodeId || toNode.fromNodeId]} ON ${tableAliases[fromNode.fromNodeId || fromNode.toNodeId]}.${fromNode.fromColumnName || fromNode.toColumnName} = ${tableAliases[toNode.toNodeId || toNode.fromNodeId]}.${toNode.toColumnName || toNode.fromColumnName}`
            );
            processedConnections.add(index);
            allNodeIds.delete(toNode.toNodeId || toNode.fromNodeId);
            buildJoins(toNode.toNodeId || toNode.fromNodeId);
        });
    }
    buildJoins(rootNodeId);


  } else if (Object.keys(nodes).length > 0) {
      const rootNode = Object.values(nodes)[0];
      fromClause = `FROM ${rootNode.name} AS ${tableAliases[rootNode.id]}`;
      allNodeIds.delete(rootNode.id);
  }

  // 연결되지 않은 테이블은 CROSS JOIN (또는 콤마) 형태로 추가
  allNodeIds.forEach(nodeId => {
      fromClause += `, ${nodes[nodeId].name} AS ${tableAliases[nodeId]}`;
  });

  return `SELECT\n${selectedColumns}\n${fromClause}\n${joinClauses.join('\n')};`;
};