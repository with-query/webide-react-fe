import { useState, useEffect, useCallback } from 'react';
import { getProjectFiles, saveProjectFiles } from '../api'; // 수정된 api.js 임포트
import { useToast } from '@chakra-ui/react';

export const useProjectTree = (projectId) => {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const fetchTree = async () => {
            if (!projectId) return;
            setLoading(true);
            try {
                const response = await getProjectFiles(projectId);
                setTree(response.data);
            } catch (error) {
                console.error("파일 트리 로딩 실패:", error);
                toast({
                    title: '파일을 불러올 수 없습니다.',
                    description: '로그인 상태를 확인하거나 권한이 있는지 확인해주세요.',
                    status: 'error',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchTree();
    }, [projectId, toast]);

    const manualSave = useCallback(async () => {
        if (!projectId) return;
        setIsSaving(true);
        try {
            await saveProjectFiles(projectId, tree);
            toast({ title: '파일이 저장되었습니다.', status: 'success' });
        } catch (error) {
            console.error("수동 저장 실패:", error);
            toast({ title: '저장에 실패했습니다.', status: 'error' });
        } finally {
            setIsSaving(false);
        }
    }, [projectId, tree, toast]);

    return { tree, setTree, loading, manualSave, isSaving };
};
