export const generateSql = (nodes, connections, whereClauses) => {
    const nodeValues = Object.values(nodes);
    if (nodeValues.length === 0) {
        return "/* 테이블을 캔버스로 드래그하여 쿼리를 시작하세요. */";
    }

    // ✅ 1. 각 노드의 data 객체 안에서 컬럼 정보를 올바르게 가져옵니다.
    const selectedColumns = nodeValues
        .flatMap(node => 
            (node.data.columns || [])
                .filter(c => c.selected)
                // ✅ 2. 별칭(alias)이 있으면 사용하고, 없으면 테이블 이름을 사용합니다.
                .map(c => `${node.data.alias || node.data.tableName}.${c.name}`)
        )
        .join(',\n  ');

    const mainTable = nodeValues[0].data.alias || nodeValues[0].data.tableName;
    let fromClause = `FROM ${mainTable}`;
    
    const joinedTables = new Set([mainTable]);
    let joinClauses = '';

    connections.forEach(conn => {
        const sourceNode = nodes[conn.from.fromNodeId];
        const targetNode = nodes[conn.to.toNodeId];
        if (!sourceNode || !targetNode) return;

        // ✅ 3. 모든 테이블 이름/별칭 참조를 node.data 객체에서 가져오도록 수정합니다.
        const sourceAlias = sourceNode.data.alias || sourceNode.data.tableName;
        const targetAlias = targetNode.data.alias || targetNode.data.tableName;

        let tableToJoin = null;
        let joinCondition = '';

        if (joinedTables.has(sourceAlias) && !joinedTables.has(targetAlias)) {
            tableToJoin = targetAlias;
            joinCondition = `${sourceAlias}.${conn.from.fromColumnName} = ${targetAlias}.${conn.to.toColumnName}`;
        } else if (joinedTables.has(targetAlias) && !joinedTables.has(sourceAlias)) {
            tableToJoin = sourceAlias;
            joinCondition = `${targetAlias}.${conn.to.toColumnName} = ${sourceAlias}.${conn.from.fromColumnName}`;
        }
        
        if (tableToJoin) {
            joinClauses += `\nJOIN ${tableToJoin} ON ${joinCondition}`;
            joinedTables.add(tableToJoin);
        }
    });

    let whereClauseStr = '';
    if (whereClauses.length > 0) {
        whereClauseStr = '\nWHERE ' + whereClauses.map((clause, index) => {
            const connector = index > 0 ? `${clause.connector} ` : '';
            // 값이 숫자가 아니면 홑따옴표로 감싸줍니다.
            const value = isNaN(clause.value) ? `'${clause.value}'` : clause.value;
            return `${connector}${clause.column} ${clause.operator} ${value}`;
        }).join('\n  ');
    }

    return `SELECT\n  ${selectedColumns || '*'}\n${fromClause}${joinClauses}${whereClauseStr};`;
};
