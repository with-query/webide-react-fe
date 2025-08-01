// src/components/utils/sqlGenerator.js

export const generateSql = (nodes, connections, whereClauses) => {
  if (Object.keys(nodes).length === 0) {
    return "/* 테이블을 캔버스로 드래그하세요. */";
  }

  const tableAliases = {};
  Object.values(nodes).forEach((node, i) => {
    tableAliases[node.id] = node.alias || node.name.charAt(0).toLowerCase() + (i + 1);
  });

  const allColumns = Object.values(nodes).flatMap(node =>
    (node.columns || []).map(col => `  ${tableAliases[node.id]}.${col.name}`)
  );
  
  const selectClause = `SELECT\n${allColumns.join(',\n')}`;

  let fromClause = '';
  const joinClauses = [];
  const processedNodes = new Set();

  if (Object.keys(nodes).length > 0) {
    const firstNode = Object.values(nodes)[0];
    fromClause = `FROM ${firstNode.name} AS ${tableAliases[firstNode.id]}`;
    processedNodes.add(firstNode.id);
  }

  connections.forEach(conn => {
    const fromNodeId = conn.from.fromNodeId;
    const fromColumnName = conn.from.fromColumnName;
    const toNodeId = conn.to.toNodeId;
    const toColumnName = conn.to.toColumnName;

    if (processedNodes.has(fromNodeId) && !processedNodes.has(toNodeId)) {
      const toNode = nodes[toNodeId];
      joinClauses.push(`JOIN ${toNode.name} AS ${tableAliases[toNodeId]} ON ${tableAliases[fromNodeId]}.${fromColumnName} = ${tableAliases[toNodeId]}.${toColumnName}`);
      processedNodes.add(toNodeId);
    } else if (processedNodes.has(toNodeId) && !processedNodes.has(fromNodeId)) {
      const fromNode = nodes[fromNodeId];
      joinClauses.push(`JOIN ${fromNode.name} AS ${tableAliases[fromNodeId]} ON ${tableAliases[toNodeId]}.${toColumnName} = ${tableAliases[fromNodeId]}.${fromColumnName}`);
      processedNodes.add(fromNodeId);
    }
  });
  
  const remainingNodes = Object.values(nodes).filter(node => !processedNodes.has(node.id));
  const crossJoins = remainingNodes.map(node => `${node.name} AS ${tableAliases[node.id]}`);

  const fromAndCrossJoinClause = crossJoins.length > 0 
    ? `${fromClause}, ${crossJoins.join(', ')}`
    : fromClause;

  let whereString = '';
  
  if (whereClauses && whereClauses.length > 0) {
    // 따옴표 처리를 위한 간단한 헬퍼
    const quoteValue = (value) => {
      if (!isNaN(value) || value.toUpperCase() === 'NULL') {
        return value;
      }
      return `'${value}'`;
    };

    whereString = '\nWHERE ' + whereClauses.map((clause, index) => {
      const condition = `${clause.column} ${clause.operator} ${quoteValue(clause.value)}`;
      if (index === 0) {
        return condition;
      }
      return `${clause.connector} ${condition}`;
    }).join('\n  ');
  }

  // 최종 SQL 조합
  return `${selectClause}\n${fromAndCrossJoinClause}\n${joinClauses.join('\n')}${whereString};`;
};