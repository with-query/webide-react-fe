export const generateSql = (nodes, connections, whereClauses) => {
  const nodeValues = Object.values(nodes);
  if (nodeValues.length === 0) {
    return "/* 테이블을 캔버스로 드래그하세요. */";
  }

  const tableAliases = {};
  nodeValues.forEach((node, i) => {
    tableAliases[node.id] = node.alias || `${node.name.charAt(0).toLowerCase()}${i + 1}`;
  });

  const allColumns = nodeValues.flatMap(node =>
    (node.columns || []).map(col => `  ${tableAliases[node.id]}.${col.name}`)
  );
  
  const selectClause = `SELECT\n${allColumns.join(',\n')}`;

  let fromAndJoinClauses = [];
  const processedNodes = new Set();
  
  // 1. 첫 번째 테이블을 FROM 절의 기준으로 삼는다.
  const firstNode = nodeValues[0];
  fromAndJoinClauses.push(`FROM ${firstNode.name} AS ${tableAliases[firstNode.id]}`);
  processedNodes.add(firstNode.id);

  // 2. 연결 정보를 기반으로 모든 테이블을 순차적으로 JOIN 한다.
  let remainingConnections = [...connections];
  while (processedNodes.size < nodeValues.length) {
    let foundNewJoin = false;
    for (let i = remainingConnections.length - 1; i >= 0; i--) {
      const conn = remainingConnections[i];
      const fromNodeId = conn.from.fromNodeId;
      const toNodeId = conn.to.toNodeId;
      
      const fromNodeProcessed = processedNodes.has(fromNodeId);
      const toNodeProcessed = processedNodes.has(toNodeId);

      if (fromNodeProcessed && !toNodeProcessed) {
        const toNode = nodes[toNodeId];
        fromAndJoinClauses.push(`JOIN ${toNode.name} AS ${tableAliases[toNodeId]} ON ${tableAliases[fromNodeId]}.${conn.from.fromColumnName} = ${tableAliases[toNodeId]}.${conn.to.toColumnName}`);
        processedNodes.add(toNodeId);
        remainingConnections.splice(i, 1);
        foundNewJoin = true;
      } else if (!fromNodeProcessed && toNodeProcessed) {
        const fromNode = nodes[fromNodeId];
        fromAndJoinClauses.push(`JOIN ${fromNode.name} AS ${tableAliases[fromNodeId]} ON ${tableAliases[toNodeId]}.${conn.to.toColumnName} = ${tableAliases[fromNodeId]}.${conn.from.fromColumnName}`);
        processedNodes.add(fromNodeId);
        remainingConnections.splice(i, 1);
        foundNewJoin = true;
      }
    }
    // 3. 만약 연결고리가 더 이상 없으면, 남은 테이블은 CROSS JOIN으로 붙인다.
    if (!foundNewJoin) {
      const unprocessedNodes = nodeValues.filter(n => !processedNodes.has(n.id));
      if (unprocessedNodes.length > 0) {
        unprocessedNodes.forEach(node => {
          fromAndJoinClauses.push(`CROSS JOIN ${node.name} AS ${tableAliases[node.id]}`);
          processedNodes.add(node.id);
        });
      } else {
        break; 
      }
    }
  }

  let whereString = '';
  if (whereClauses && whereClauses.length > 0) {
    const quoteValue = (value) => {
      if (!isNaN(value) && value.trim() !== '') return value;
      if (value.toUpperCase() === 'NULL') return value;
      return `'${value.replace(/'/g, "''")}'`;
    };

    whereString = '\nWHERE ' + whereClauses.map((clause, index) => {
      if (!clause.column || !clause.operator) return null;
      const condition = `${clause.column} ${clause.operator} ${quoteValue(clause.value)}`;
      return index === 0 ? condition : `${clause.connector} ${condition}`;
    }).filter(Boolean).join('\n  ');
  }

  return `${selectClause}\n${fromAndJoinClauses.join('\n')}${whereString};`;
};