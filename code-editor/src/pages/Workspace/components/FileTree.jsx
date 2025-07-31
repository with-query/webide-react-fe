// src/pages/Workspace/components/FileTree.jsx

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Box, Text } from '@chakra-ui/react';

// API를 통해 받아온 DB 스키마 정보라고 가정하는 Mock 데이터
const dbSchema = {
  tables: [
    { id: 'tbl-customers', name: 'customers', columns: [
      { name: 'customer_id', type: 'INT', pk: true },
      { name: 'customer_name', type: 'VARCHAR' },
      { name: 'email', type: 'VARCHAR' },
    ]},
    { id: 'tbl-orders', name: 'orders', columns: [
      { name: 'order_id', type: 'INT', pk: true },
      { name: 'customer_id', type: 'INT', fk: true },
      { name: 'order_date', type: 'DATE' },
    ]},
    { id: 'tbl-products', name: 'products', columns: [
      { name: 'product_id', type: 'INT', pk: true },
      { name: 'product_name', type: 'VARCHAR' },
      { name: 'price', type: 'DECIMAL' },
    ]},
  ]
};

// 드래그 가능한 테이블 아이템 컴포넌트
const DraggableTable = ({ table }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TABLE',
    // 드래그 시 전달할 데이터 (테이블 ID, 이름, 스키마 정보 포함)
    item: { id: table.id, name: table.name, columns: table.columns },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Box
      ref={drag}
      p={2}
      bg={isDragging ? 'orange.100' : 'transparent'}
      cursor="grab"
      opacity={isDragging ? 0.5 : 1}
      fontWeight="medium"
      borderRadius="md"
    >
      <Text>📄 {table.name}</Text>
    </Box>
  );
};


const FileTree = () => {
  // DB Connection 후 스키마 정보를 받아왔다고 가정
  const [schema] = useState(dbSchema); 

  return (
    <Box>
      <Text fontWeight="bold" mb={2}>DB Connection (테이블 목록)</Text>
      {schema.tables.map(table => (
        <DraggableTable key={table.id} table={table} />
      ))}
    </Box>
  );
};

export default FileTree;