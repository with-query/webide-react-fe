export const generateSql = (nodes, connections, whereClauses) => {
    const nodeMap = new Map(Object.entries(nodes));
    if (nodeMap.size === 0) {
        return "/* 테이블을 캔버스로 드래그하여 쿼리를 시작하세요. */";
    }

    // 1. SELECT 절 생성
    const selectedColumns = Array.from(nodeMap.values())
        .flatMap(node =>
            (node.data.columns || [])
                .filter(c => c.selected)
                // 별칭이 있으면 `별칭.컬럼명`, 없으면 `테이블명.컬럼명`
                .map(c => `${node.data.alias || node.data.tableName}.${c.name}`)
        )
        .join(',\n  ');

    // 2. FROM 및 JOIN 절 생성 (핵심 로직 수정)
    const tableNodes = Array.from(nodeMap.values());
    const mainTableNode = tableNodes[0];
    // FROM 절: "FROM 실제테이블명 AS 별칭" 형태로 수정
    const mainTableIdentifier = mainTableNode.data.alias || mainTableNode.data.tableName;
    let fromClause = `FROM ${mainTableNode.data.tableName}${mainTableNode.data.alias ? ` AS ${mainTableNode.data.alias}` : ''}`;
    
    const joinedTables = new Set([mainTableIdentifier]);
    let joinClauses = '';

    // 모든 연결이 처리될 때까지 반복하여 JOIN 순서 문제를 해결
    const remainingConnections = new Set(connections);
    let lastPassCount = -1;
    while (remainingConnections.size > 0 && remainingConnections.size !== lastPassCount) {
        lastPassCount = remainingConnections.size;
        
        remainingConnections.forEach(conn => {
            const sourceNode = nodes[conn.from.fromNodeId];
            const targetNode = nodes[conn.to.toNodeId];
            if (!sourceNode || !targetNode) return;

            const sourceAlias = sourceNode.data.alias || sourceNode.data.tableName;
            const targetAlias = targetNode.data.alias || targetNode.data.tableName;

            let newTableNode = null;
            let newTableAlias = '';
            let joinCondition = '';

            if (joinedTables.has(sourceAlias) && !joinedTables.has(targetAlias)) {
                newTableNode = targetNode;
                newTableAlias = targetAlias;
                joinCondition = `${sourceAlias}.${conn.from.fromColumnName} = ${targetAlias}.${conn.to.toColumnName}`;
            } else if (joinedTables.has(targetAlias) && !joinedTables.has(sourceAlias)) {
                newTableNode = sourceNode;
                newTableAlias = sourceAlias;
                joinCondition = `${targetAlias}.${conn.to.toColumnName} = ${sourceAlias}.${conn.from.fromColumnName}`;
            }

            if (newTableNode) {
                // JOIN 절: "JOIN 실제테이블명 AS 별칭 ON ..." 형태로 수정
                const joinTableClause = `\nJOIN ${newTableNode.data.tableName}${newTableNode.data.alias ? ` AS ${newTableNode.data.alias}` : ''}`;
                joinClauses += `${joinTableClause} ON ${joinCondition}`;
                joinedTables.add(newTableAlias);
                remainingConnections.delete(conn); // 처리된 연결은 제거
            }
        });
    }

    // 3. WHERE 절 생성
    let whereClauseStr = '';
    if (whereClauses.length > 0) {
        whereClauseStr = '\nWHERE ' + whereClauses.map((clause, index) => {
            const connector = index > 0 ? `${clause.connector} ` : '';
            // 값이 숫자가 아니면 홑따옴표로 감싸기
            const value = isNaN(clause.value) ? `'${clause.value}'` : clause.value;
            return `${connector}${clause.column} ${clause.operator} ${value}`;
        }).join('\n  ');
    }

    return `SELECT\n  ${selectedColumns || '*'}\n${fromClause}${joinClauses}${whereClauseStr};`;
};