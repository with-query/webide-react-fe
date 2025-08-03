/*import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { CODE_SNIPPETS } from '../constants'; // CODE_SNIPPETS 임포트

const BASE_URL = "http://20.196.89.99:8080";

// Utility function to build a nested tree from a flat list of nodes
const buildTree = (nodes) => {
    const nodeMap = new Map();
    const rootNodes = [];

    // Initialize map with nodes, ensuring each has a children array
    nodes.forEach(node => {
        nodeMap.set(node.id, { ...node, children: [] });
    });

    // Populate children arrays and identify root nodes
    nodes.forEach(node => {
        if (node.parentId) {
            const parent = nodeMap.get(node.parentId);
            if (parent) {
                parent.children.push(nodeMap.get(node.id));
            }
        } else {
            rootNodes.push(nodeMap.get(node.id));
        }
    });

    // Recursively sort children for consistent tree structure
    const sortChildren = (node) => {
        if (node.children && node.children.length > 0) {
            node.children.sort((a, b) => {
                // Directories first, then files
                if (a.type === 'DIRECTORY' && b.type === 'FILE') return -1;
                if (a.type === 'FILE' && b.type === 'DIRECTORY') return 1;
                // Then by name
                return a.name.localeCompare(b.name);
            });
            node.children.forEach(sortChildren); // Sort nested children
        }
    };

    rootNodes.forEach(sortChildren); // Sort all branches of the tree

    // Sort root nodes themselves
    rootNodes.sort((a, b) => {
        if (a.type === 'DIRECTORY' && b.type === 'FILE') return -1;
        if (a.type === 'FILE' && b.type === 'DIRECTORY') return 1;
        return a.name.localeCompare(b.name);
    });

    return rootNodes;
};


export const useProjectTree = (projectId) => {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    console.log("[useProjectTree] Hook initialized for projectId:", projectId);

    // fetch API를 사용하여 프로젝트 파일 목록을 가져오는 함수
    const fetchProjectFiles = useCallback(async (currentProjectId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("로그인 토큰이 없습니다.");
        }
        const response = await fetch(`${BASE_URL}/api/projects/${currentProjectId}/files`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
            throw new Error(errorData.message || `파일 트리 로딩 실패: ${response.status}`);
        }
        
        let flatData = await response.json();
        // API 응답이 단일 객체일 경우 배열로 감싸줍니다.
        if (!Array.isArray(flatData)) {
            flatData = [flatData];
            console.warn("[useProjectTree] API returned a single object, wrapped it in an array for buildTree.");
        }

        console.log("[useProjectTree] Raw flat data from API (before buildTree):", flatData); // 진단용 로그
        const nestedTree = buildTree(flatData); // Build the nested tree
        console.log("[useProjectTree] Nested tree after buildTree:", nestedTree); // 진단용 로그
        return nestedTree;
    }, []);

    // fetch API를 사용하여 특정 파일 내용을 가져오는 함수 (Editor에서 사용)
    const fetchFileContent = useCallback(async (currentProjectId, fileId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("로그인 토큰이 없습니다.");
        }
        const response = await fetch(`${BASE_URL}/api/projects/${currentProjectId}/${fileId}/content`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
            throw new Error(errorData.message || `파일 내용 로딩 실패: ${response.status}`);
        }
        return response.json();
    }, []);

    const createDefaultProjectStructure = useCallback(async (currentProjectId) => {
        console.log("[useProjectTree] Attempting to create default project structure for projectId:", currentProjectId);
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            console.error("[useProjectTree] No token found, cannot create default structure.");
            return null;
        }

        try {
            // 1. 루트 디렉토리 (src) 생성 요청
            console.log("[useProjectTree] Creating root directory 'src'...");
            const rootDirResponse = await fetch(
                `${BASE_URL}/api/projects/${currentProjectId}/root-directory?name=src`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!rootDirResponse.ok) {
                if (rootDirResponse.status === 409) {
                    console.warn("[useProjectTree] 'src' directory already exists. Proceeding to fetch tree.");
                } else {
                    const errorData = await rootDirResponse.json().catch(() => ({ message: '알 수 없는 오류' }));
                    throw new Error(errorData.message || `루트 디렉토리 생성 실패: ${rootDirResponse.status}`);
                }
            } else {
                console.log("[useProjectTree] 'src' directory creation request sent successfully.");
            }

            // 'hello.js' 파일 생성 로직 제거
            // 사용자가 직접 파일을 생성하도록 유도

            const finalTree = await fetchProjectFiles(currentProjectId); // Fetch the final, fully updated tree
            console.log("[useProjectTree] Generated default tree structure (only src):", finalTree);
            return finalTree;

        } catch (error) {
            console.error("[useProjectTree] Failed to create default project structure:", error.message);
            toast({
                title: '프로젝트 초기화 실패',
                description: error.message || '기본 폴더 및 파일을 생성하는 데 문제가 발생했습니다.',
                status: 'error',
            });
            return null;
        }
    }, [toast, fetchProjectFiles]);

    useEffect(() => {
        const fetchTreeAndInitialize = async () => {
            console.log("[useProjectTree] fetchTreeAndInitialize called. Current projectId:", projectId);
            if (!projectId) {
                console.log("[useProjectTree] No projectId, skipping fetchTreeAndInitialize.");
                setLoading(false);
                return;
            }
            setLoading(true);
            console.log("[useProjectTree] Loading set to true.");

            try {
                let fetchedData = await fetchProjectFiles(projectId);
                console.log("[useProjectTree] Fetched data (already nested tree):", fetchedData);

                let processedTree = fetchedData;

                if (processedTree.length === 0) {
                    console.warn("[useProjectTree] Fetched data is empty. Attempting to create default structure...");
                    const defaultStructure = await createDefaultProjectStructure(projectId);
                    if (defaultStructure) {
                        processedTree = defaultStructure;
                        console.log("[useProjectTree] Default structure successfully created and set.");
                    } else {
                        console.error("[useProjectTree] Failed to create default structure, tree remains empty.");
                    }
                }

                setTree(prevTree => {
                    if (JSON.stringify(prevTree) !== JSON.stringify(processedTree)) {
                        console.log("[useProjectTree] Tree state updated:", processedTree);
                        return processedTree;
                    } else {
                        console.log("[useProjectTree] Tree state is identical, skipping update to prevent re-render.");
                        return prevTree;
                    }
                });

            } catch (error) {
                console.error("[useProjectTree] File tree loading or initialization failed:", error.message);
                toast({
                    title: '파일을 불러올 수 없습니다.',
                    description: error.message || '로그인 상태를 확인하거나 권한이 있는지 확인해주세요.',
                    status: 'error',
                });
                setTree([]); // 오류 발생 시 tree를 비웁니다.
                console.log("[useProjectTree] Tree state reset to empty due to error.");
            } finally {
                setLoading(false);
                console.log("[useProjectTree] Loading set to false.");
            }
        };
        fetchTreeAndInitialize();
    }, [projectId, toast, createDefaultProjectStructure, fetchProjectFiles]);

    const manualSave = useCallback(async (fileId, content) => {
        console.log(`[useProjectTree] manualSave called for fileId: ${fileId}, projectId: ${projectId}`);
        if (!projectId || !fileId) {
            console.warn("[useProjectTree] Cannot save: projectId or fileId is missing.");
            toast({ title: "저장할 프로젝트 또는 파일을 찾을 수 없습니다.", status: "error" });
            return;
        }
        setIsSaving(true);
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("[useProjectTree] No token found, cannot save file.");
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            setIsSaving(false);
            return;
        }

        try {
            console.log(`[useProjectTree] Saving content for ${fileId}...`);
            const response = await fetch(
                `${BASE_URL}/api/projects/${projectId}/${fileId}/content`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        
                    },
                    body: JSON.stringify({ content: content })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
                throw new Error(errorData.message || `파일 저장 실패: ${response.status}`);
            }
            toast({ title: '파일이 저장되었습니다.', status: 'success' });
            console.log(`[useProjectTree] File ${fileId} saved successfully.`);
        } catch (error) {
            console.error("[useProjectTree] Manual save failed:", error.message);
            toast({ title: '저장에 실패했습니다.', description: error.message || "파일 저장 중 오류가 발생했습니다.", status: 'error' });
        } finally {
            setIsSaving(false);
            console.log("[useProjectTree] isSaving set to false.");
        }
    }, [projectId, toast]);

    return { tree, setTree, loading, manualSave, isSaving, fetchFileContent };
};
*/
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { CODE_SNIPPETS } from '../constants'; // CODE_SNIPPETS 임포트

const BASE_URL = "http://20.196.89.99:8080";

// Utility function to build a nested tree from a flat list of nodes
const buildTree = (nodes) => {
    const nodeMap = new Map();
    const rootNodes = [];

    // Initialize map with nodes, ensuring each has a children array
    nodes.forEach(node => {
        nodeMap.set(node.id, { ...node, children: [] });
    });

    // Populate children arrays and identify root nodes
    nodes.forEach(node => {
        if (node.parentId) {
            const parent = nodeMap.get(node.parentId);
            if (parent) {
                parent.children.push(nodeMap.get(node.id));
            }
        } else {
            rootNodes.push(nodeMap.get(node.id));
        }
    });

    // Recursively sort children for consistent tree structure
    const sortChildren = (node) => {
        if (node.children && node.children.length > 0) {
            node.children.sort((a, b) => {
                // Directories first, then files
                if (a.type === 'DIRECTORY' && b.type === 'FILE') return -1;
                if (a.type === 'FILE' && b.type === 'DIRECTORY') return 1;
                // Then by name
                return a.name.localeCompare(b.name);
            });
            node.children.forEach(sortChildren); // Sort nested children
        }
    };

    rootNodes.forEach(sortChildren); // Sort all branches of the tree

    // Sort root nodes themselves
    rootNodes.sort((a, b) => {
        if (a.type === 'DIRECTORY' && b.type === 'FILE') return -1;
        if (a.type === 'FILE' && b.type === 'DIRECTORY') return 1;
        return a.name.localeCompare(b.name);
    });

    return rootNodes;
};


export const useProjectTree = (projectId) => {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    console.log("[useProjectTree] Hook initialized for projectId:", projectId);

    // fetch API를 사용하여 프로젝트 파일 목록을 가져오는 함수
    const fetchProjectFiles = useCallback(async (currentProjectId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("로그인 토큰이 없습니다.");
        }
        const response = await fetch(`${BASE_URL}/api/projects/${currentProjectId}/files`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
            throw new Error(errorData.message || `파일 트리 로딩 실패: ${response.status}`);
        }
        
        let flatData = await response.json();
        // API 응답이 단일 객체일 경우 배열로 감싸줍니다.
        if (!Array.isArray(flatData)) {
            flatData = [flatData];
            console.warn("[useProjectTree] API returned a single object, wrapped it in an array for buildTree.");
        }

        console.log("[useProjectTree] Raw flat data from API (before buildTree):", flatData); // 진단용 로그
        const nestedTree = buildTree(flatData); // Build the nested tree
        console.log("[useProjectTree] Nested tree after buildTree:", nestedTree); // 진단용 로그
        return nestedTree;
    }, []);

    // fetch API를 사용하여 특정 파일 내용을 가져오는 함수 (Editor에서 사용)
    const fetchFileContent = useCallback(async (currentProjectId, fileId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("로그인 토큰이 없습니다.");
        }
        const response = await fetch(`${BASE_URL}/api/projects/${currentProjectId}/${fileId}/content`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
            throw new Error(errorData.message || `파일 내용 로딩 실패: ${response.status}`);
        }
        return response.json();
    }, []);

    const createDefaultProjectStructure = useCallback(async (currentProjectId) => {
        console.log("[useProjectTree] Attempting to create default project structure for projectId:", currentProjectId);
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            console.error("[useProjectTree] No token found, cannot create default structure.");
            return null;
        }

        try {
            // 1. 루트 디렉토리 (src) 생성 요청
            console.log("[useProjectTree] Creating root directory 'src'...");
            const rootDirResponse = await fetch(
                `${BASE_URL}/api/projects/${currentProjectId}/root-directory?name=src`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!rootDirResponse.ok) {
                if (rootDirResponse.status === 409) {
                    console.warn("[useProjectTree] 'src' directory already exists. Proceeding to fetch tree.");
                } else {
                    const errorData = await rootDirResponse.json().catch(() => ({ message: '알 수 없는 오류' }));
                    throw new Error(errorData.message || `루트 디렉토리 생성 실패: ${rootDirResponse.status}`);
                }
            } else {
                console.log("[useProjectTree] 'src' directory creation request sent successfully.");
            }

            // 'hello.js' 파일 생성 로직 제거
            // 사용자가 직접 파일을 생성하도록 유도

            const finalTree = await fetchProjectFiles(currentProjectId); // Fetch the final, fully updated tree
            console.log("[useProjectTree] Generated default tree structure (only src):", finalTree);
            return finalTree;

        } catch (error) {
            console.error("[useProjectTree] Failed to create default project structure:", error.message);
            toast({
                title: '프로젝트 초기화 실패',
                description: error.message || '기본 폴더 및 파일을 생성하는 데 문제가 발생했습니다.',
                status: 'error',
            });
            return null;
        }
    }, [toast, fetchProjectFiles]);

    useEffect(() => {
        const fetchTreeAndInitialize = async () => {
            console.log("[useProjectTree] fetchTreeAndInitialize called. Current projectId:", projectId);
            if (!projectId) {
                console.log("[useProjectTree] No projectId, skipping fetchTreeAndInitialize.");
                setLoading(false);
                return;
            }
            setLoading(true);
            console.log("[useProjectTree] Loading set to true.");

            try {
                let fetchedData = await fetchProjectFiles(projectId);
                console.log("[useProjectTree] Fetched data (already nested tree):", fetchedData);

                let processedTree = fetchedData;

                if (processedTree.length === 0) {
                    console.warn("[useProjectTree] Fetched data is empty. Attempting to create default structure...");
                    const defaultStructure = await createDefaultProjectStructure(projectId);
                    if (defaultStructure) {
                        processedTree = defaultStructure;
                        console.log("[useProjectTree] Default structure successfully created and set.");
                    } else {
                        console.error("[useProjectTree] Failed to create default structure, tree remains empty.");
                    }
                }

                setTree(prevTree => {
                    if (JSON.stringify(prevTree) !== JSON.stringify(processedTree)) {
                        console.log("[useProjectTree] Tree state updated:", processedTree);
                        return processedTree;
                    } else {
                        console.log("[useProjectTree] Tree state is identical, skipping update to prevent re-render.");
                        return prevTree;
                    }
                });

            } catch (error) {
                console.error("[useProjectTree] File tree loading or initialization failed:", error.message);
                toast({
                    title: '파일을 불러올 수 없습니다.',
                    description: error.message || '로그인 상태를 확인하거나 권한이 있는지 확인해주세요.',
                    status: 'error',
                });
                setTree([]); // 오류 발생 시 tree를 비웁니다.
                console.log("[useProjectTree] Tree state reset to empty due to error.");
            } finally {
                setLoading(false);
                console.log("[useProjectTree] Loading set to false.");
            }
        };
        fetchTreeAndInitialize();
    }, [projectId, toast, createDefaultProjectStructure, fetchProjectFiles]);

    const manualSave = useCallback(async (fileId, content) => {
        console.log(`[useProjectTree] manualSave called for fileId: ${fileId}, projectId: ${projectId}`);
        if (!projectId || !fileId) {
            console.warn("[useProjectTree] Cannot save: projectId or fileId is missing.");
            toast({ title: "저장할 프로젝트 또는 파일을 찾을 수 없습니다.", status: "error" });
            return;
        }
        setIsSaving(true);
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("[useProjectTree] No token found, cannot save file.");
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            setIsSaving(false);
            return;
        }

        try {
            console.log(`[useProjectTree] Saving content for ${fileId}...`);
            const response = await fetch(
                `${BASE_URL}/api/projects/${projectId}/${fileId}/content`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*'
                    },
                    body: JSON.stringify({ content: content })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
                throw new Error(errorData.message || `파일 저장 실패: ${response.status}`);
            }
            toast({ title: '파일이 저장되었습니다.', status: 'success' });
            console.log(`[useProjectTree] File ${fileId} saved successfully.`);
        } catch (error) {
            console.error("[useProjectTree] Manual save failed:", error.message);
            toast({ title: '저장에 실패했습니다.', description: error.message || "파일 저장 중 오류가 발생했습니다.", status: 'error' });
        } finally {
            setIsSaving(false);
            console.log("[useProjectTree] isSaving set to false.");
        }
    }, [projectId, toast]);

    // --- 새로운 API 통합 함수들 ---

    /**
     * 새로운 파일 또는 디렉토리를 생성합니다.
     * @param {object} options
     * @param {string} options.name - 파일 또는 디렉토리 이름
     * @param {'FILE' | 'DIRECTORY'} options.type - 타입 (FILE 또는 DIRECTORY)
     * @param {number} options.parentId - 상위 디렉토리 ID
     * @param {string} [options.language] - 파일 타입일 경우 언어 (예: 'javascript')
     * @param {string} [options.content] - 파일 타입일 경우 내용
     * @returns {Promise<object | null>} 생성된 파일/디렉토리 정보 또는 null
     */
    const createFileOrDirectory = useCallback(async (options) => {
        const { name, type, parentId, language, content } = options;
        console.log(`[useProjectTree] createFileOrDirectory called: ${name} (${type}) under parentId: ${parentId}`);
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            return null;
        }

        try {
            const payload = { name, type, parentId };
            if (type === 'FILE') {
                payload.language = language || 'plaintext'; // 기본 언어 설정
                payload.content = content || CODE_SNIPPETS[language] || ''; // 언어에 맞는 기본 스니펫 또는 빈 문자열
            }

            const response = await fetch(`${BASE_URL}/api/projects/${projectId}/files`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
                throw new Error(errorData.message || `생성 실패: ${response.status}`);
            }

            const newEntry = await response.json();
            toast({ title: `${type === 'FILE' ? '파일' : '폴더'}가 생성되었습니다.`, status: 'success' });
            console.log(`[useProjectTree] ${type} created successfully:`, newEntry);

            // 트리 업데이트를 위해 파일 목록을 다시 가져옵니다.
            const updatedTree = await fetchProjectFiles(projectId);
            setTree(updatedTree);
            return newEntry;
        } catch (error) {
            console.error(`[useProjectTree] Failed to create ${type}:`, error.message);
            toast({
                title: `${type === 'FILE' ? '파일' : '폴더'} 생성 실패`,
                description: error.message || "생성 중 오류가 발생했습니다.",
                status: 'error',
            });
            return null;
        }
    }, [projectId, toast, fetchProjectFiles]);

    /**
     * 특정 파일 또는 디렉토리를 삭제합니다.
     * @param {number} fileId - 삭제할 파일/디렉토리의 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    const deleteFileOrDirectory = useCallback(async (fileId) => {
        console.log(`[useProjectTree] deleteFileOrDirectory called for fileId: ${fileId}`);
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            return false;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/projects/${projectId}/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
                throw new Error(errorData.message || `삭제 실패: ${response.status}`);
            }

            toast({ title: '삭제되었습니다.', status: 'success' });
            console.log(`[useProjectTree] File/Directory ${fileId} deleted successfully.`);

            // 트리 업데이트를 위해 파일 목록을 다시 가져옵니다.
            const updatedTree = await fetchProjectFiles(projectId);
            setTree(updatedTree);
            return true;
        } catch (error) {
            console.error("[useProjectTree] Failed to delete file/directory:", error.message);
            toast({
                title: '삭제 실패',
                description: error.message || "삭제 중 오류가 발생했습니다.",
                status: 'error',
            });
            return false;
        }
    }, [projectId, toast, fetchProjectFiles]);

    /**
     * 특정 파일 또는 디렉토리의 이름이나 상위 디렉토리를 수정합니다.
     * @param {number} fileId - 수정할 파일/디렉토리의 ID
     * @param {object} options
     * @param {string} [options.newName] - 새로운 이름
     * @param {number} [options.newParentId] - 새로운 상위 디렉토리 ID
     * @returns {Promise<object | null>} 수정된 파일/디렉토리 정보 또는 null
     */
    const updateFileOrDirectory = useCallback(async (fileId, options) => {
        const { newName, newParentId } = options;
        console.log(`[useProjectTree] updateFileOrDirectory called for fileId: ${fileId}, newName: ${newName}, newParentId: ${newParentId}`);
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            return null;
        }

        try {
            const payload = {};
            if (newName !== undefined) payload.newName = newName;
            if (newParentId !== undefined) payload.newParentId = newParentId;

            const response = await fetch(`${BASE_URL}/api/projects/${projectId}/${fileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
                throw new Error(errorData.message || `수정 실패: ${response.status}`);
            }

            const updatedEntry = await response.json();
            toast({ title: '수정되었습니다.', status: 'success' });
            console.log(`[useProjectTree] File/Directory ${fileId} updated successfully:`, updatedEntry);

            // 트리 업데이트를 위해 파일 목록을 다시 가져옵니다.
            const updatedTree = await fetchProjectFiles(projectId);
            setTree(updatedTree);
            return updatedEntry;
        } catch (error) {
            console.error("[useProjectTree] Failed to update file/directory:", error.message);
            toast({
                title: '수정 실패',
                description: error.message || "수정 중 오류가 발생했습니다.",
                status: 'error',
            });
            return null;
        }
    }, [projectId, toast, fetchProjectFiles]);


    return {
        tree,
        setTree,
        loading,
        manualSave,
        isSaving,
        fetchFileContent,
        createFileOrDirectory, // 새로운 함수 노출
        deleteFileOrDirectory, // 새로운 함수 노출
        updateFileOrDirectory, // 새로운 함수 노출
    };
};
