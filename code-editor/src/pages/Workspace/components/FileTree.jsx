import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Box, Text } from '@chakra-ui/react';
// import { getSchemas } from '../../../api';

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
      whiteSpace="nowrap" 
    >
      <Text>📄 {table.name}</Text>
    </Box>
  );
};

const dbSchema = {
  tables: [
    { 
      id: 'customers', 
      name: 'customers', 
      columns: [
        { name: 'customer_id', type: 'INT', pk: true },
        { name: 'customer_name', type: 'VARCHAR' },
        { name: 'email', type: 'VARCHAR' },
      ]
    },
    { 
      id: 'orders', 
      name: 'orders', 
      columns: [
        { name: 'order_id', type: 'INT', pk: true },
        { name: 'customer_id', type: 'INT', fk: true },
        { name: 'order_date', type: 'DATE' },
      ]
    },
    { 
      id: 'products', 
      name: 'products', 
      columns: [
        { name: 'product_id', type: 'INT', pk: true },
        { name: 'product_name', type: 'VARCHAR' },
        { name: 'price', type: 'DECIMAL' },
      ]
    },
    { 
      id: 'order_items', 
      name: 'order_items', 
      columns: [
        { name: 'order_item_id', type: 'INT', pk: true },
        { name: 'order_id', type: 'INT', fk: true },
        { name: 'product_id', type: 'INT', fk: true },
        { name: 'quantity', type: 'INT' },
      ]
    },
  ]
};

const FileTree = () => {
  // DB Connection 후 스키마 정보를 받아왔다고 가정
  const [tables] = useState(dbSchema.tables); 

  /*
  // API 연동 부분 주석 처리
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const connectionId = 15; 
    getSchemas(connectionId).then(data => {
      setTables(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Spinner />;
  }
  */

  return (
    <Box height="100%">
      <Text fontWeight="bold" mb={2}>DB Connection (테이블 목록)</Text>
      {tables.map(table => (
        <DraggableTable key={table.id} table={table} />
      ))}
    </Box>
  );
};

export default FileTree;