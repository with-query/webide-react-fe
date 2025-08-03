/*
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

const BASE_URL = "http://20.196.89.99:8080";

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
        return response.json();
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
                // 'name=src' 쿼리 파라미터를 URL에 직접 포함
                `${BASE_URL}/api/projects/${currentProjectId}/root-directory?name=src`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    // 백엔드가 요청 본문을 기대하지 않으므로 body는 제거
                }
            );

            if (!rootDirResponse.ok) {
                // 'src' 디렉토리가 이미 존재하여 409 Conflict 응답을 받은 경우, 경고만 표시하고 계속 진행
                if (rootDirResponse.status === 409) {
                    console.warn("[useProjectTree] 'src' directory already exists. Proceeding to fetch tree.");
                } else {
                    // 그 외의 오류는 치명적인 것으로 간주하고 에러 발생
                    const errorData = await rootDirResponse.json().catch(() => ({ message: '알 수 없는 오류' }));
                    throw new Error(errorData.message || `루트 디렉토리 생성 실패: ${rootDirResponse.status}`);
                }
            } else {
                console.log("[useProjectTree] 'src' directory creation request sent successfully.");
            }

            // 2. 루트 디렉토리 생성 후, 파일 트리를 다시 가져와서 'src' 폴더의 실제 ID를 찾습니다.
            console.log("[useProjectTree] Fetching updated file tree to find 'src' folder ID...");
            // 백엔드 getFileTree API는 단일 FileTreeNode 객체를 반환할 것으로 예상
            const fetchedTreeData = await fetchProjectFiles(currentProjectId); 

            let srcFolder = null;
            if (Array.isArray(fetchedTreeData)) {
                // 만약 fetchProjectFiles가 배열을 반환한다면, 배열에서 'src' 폴더를 찾습니다.
                // 폴더 타입 체크를 'DIRECTORY'로 변경
                srcFolder = fetchedTreeData.find(node => node.name === 'src' && node.type === 'DIRECTORY');
            } else if (fetchedTreeData && typeof fetchedTreeData === 'object') {
                // fetchProjectFiles가 단일 객체를 반환한다면, 해당 객체가 'src' 폴더인지 확인하거나
                // 그 자식 중에서 'src' 폴더를 찾습니다.
                // 폴더 타입 체크를 'DIRECTORY'로 변경
                if (fetchedTreeData.name === 'src' && fetchedTreeData.type === 'DIRECTORY') {
                    srcFolder = fetchedTreeData;
                } else if (fetchedTreeData.children) {
                    // 폴더 타입 체크를 'DIRECTORY'로 변경
                    srcFolder = fetchedTreeData.children.find(node => node.name === 'src' && node.type === 'DIRECTORY');
                }
            }

            if (!srcFolder) {
                throw new Error("루트 디렉토리 'src'를 찾을 수 없습니다. 파일 트리 구조를 확인해주세요.");
            }
            console.log("[useProjectTree] Found 'src' folder:", srcFolder);

            // 3. 'hello.js' 파일 생성 (찾아낸 'src' 폴더의 ID를 parentId로 사용)
            console.log("[useProjectTree] Creating 'hello.js' file inside 'src' folder...");
            const helloJsResponse = await fetch(
                `${BASE_URL}/api/projects/${currentProjectId}/files`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // JSON 본문을 보내므로 필수
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: "hello.js",
                        type: "FILE", // 파일 타입은 'FILE'
                        parentId: srcFolder.id, // 백엔드에서 조회한 실제 srcFolder의 ID를 사용
                        language: "javascript",
                        content: `console.log("Hello, World!");`
                    })
                }
            );

            if (!helloJsResponse.ok) {
                const errorData = await helloJsResponse.json().catch(() => ({ message: '알 수 없는 오류' }));
                throw new Error(errorData.message || `hello.js 파일 생성 실패: ${helloJsResponse.status}`);
            }
            const helloJsFile = await helloJsResponse.json();
            console.log("[useProjectTree] 'hello.js' file created:", helloJsFile);

            // 최종적으로 업데이트된 파일 트리를 다시 가져와서 UI에 반영
            const finalTree = await fetchProjectFiles(currentProjectId);
            console.log("[useProjectTree] Generated default tree structure:", finalTree);
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
    }, [toast, fetchProjectFiles]); // fetchProjectFiles를 의존성 배열에 추가

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
                let fetchedData;
                try {
                    fetchedData = await fetchProjectFiles(projectId); // fetchProjectFiles 사용
                } catch (fetchError) {
                    console.warn("[useProjectTree] Initial fetchProjectFiles failed, assuming empty tree:", fetchError.message);
                    fetchedData = null; // 에러 발생 시 빈 데이터로 간주
                }
                
                console.log("[useProjectTree] Raw fetched data:", fetchedData);

                let processedTree = [];

                // fetchedData가 유효한 배열이면 그대로 사용
                if (Array.isArray(fetchedData)) {
                    processedTree = fetchedData;
                } 
                // fetchedData가 단일 유효 객체이면 배열로 래핑
                else if (fetchedData && typeof fetchedData === 'object' && (fetchedData.id !== null || fetchedData.name !== null)) {
                    processedTree = [fetchedData];
                }
                // 그 외의 경우 (null, undefined, 빈 객체 등) processedTree는 빈 배열로 유지

                // processedTree가 비어있다면 (즉, 프로젝트에 파일이 없다면) 기본 구조 생성 시도
                if (processedTree.length === 0) {
                    console.warn("[useProjectTree] Fetched data is empty or invalid. Attempting to create default structure...");
                    const defaultStructure = await createDefaultProjectStructure(projectId);
                    if (defaultStructure) {
                        processedTree = defaultStructure;
                        console.log("[useProjectTree] Default structure successfully created and set.");
                    } else {
                        console.error("[useProjectTree] Failed to create default structure, tree remains empty.");
                    }
                }

                setTree(processedTree);
                console.log("[useProjectTree] Tree state updated:", processedTree);
            } catch (error) {
                console.error("[useProjectTree] File tree loading or initialization failed:", error.message);
                toast({
                    title: '파일을 불러올 수 없습니다.',
                    description: error.message || '로그인 상태를 확인하거나 권한이 있는지 확인해주세요.',
                    status: 'error',
                });
                setTree([]);
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

    return { tree, setTree, loading, manualSave, isSaving, fetchFileContent }; // fetchFileContent 추가 반환
};
*/import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

const BASE_URL = "http://20.196.89.99:8080";

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
        return response.json();
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
                // 'name=src' 쿼리 파라미터를 URL에 직접 포함
                `${BASE_URL}/api/projects/${currentProjectId}/root-directory?name=src`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    // 백엔드가 요청 본문을 기대하지 않으므로 body는 제거
                }
            );

            if (!rootDirResponse.ok) {
                // 'src' 디렉토리가 이미 존재하여 409 Conflict 응답을 받은 경우, 경고만 표시하고 계속 진행
                if (rootDirResponse.status === 409) {
                    console.warn("[useProjectTree] 'src' directory already exists. Proceeding to fetch tree.");
                } else {
                    // 그 외의 오류는 치명적인 것으로 간주하고 에러 발생
                    const errorData = await rootDirResponse.json().catch(() => ({ message: '알 수 없는 오류' }));
                    throw new Error(errorData.message || `루트 디렉토리 생성 실패: ${rootDirResponse.status}`);
                }
            } else {
                console.log("[useProjectTree] 'src' directory creation request sent successfully.");
            }

            // 2. 루트 디렉토리 생성 후, 파일 트리를 다시 가져와서 'src' 폴더의 실제 ID를 찾습니다.
            console.log("[useProjectTree] Fetching updated file tree to find 'src' folder ID...");
            // 백엔드 getFileTree API는 단일 FileTreeNode 객체를 반환할 것으로 예상
            const fetchedTreeData = await fetchProjectFiles(currentProjectId); 

            let srcFolder = null;
            if (Array.isArray(fetchedTreeData)) {
                // 만약 fetchProjectFiles가 배열을 반환한다면, 배열에서 'src' 폴더를 찾습니다.
                // 폴더 타입 체크를 'DIRECTORY'로 변경
                srcFolder = fetchedTreeData.find(node => node.name === 'src' && node.type === 'DIRECTORY');
            } else if (fetchedTreeData && typeof fetchedTreeData === 'object') {
                // fetchProjectFiles가 단일 객체를 반환한다면, 해당 객체가 'src' 폴더인지 확인하거나
                // 그 자식 중에서 'src' 폴더를 찾습니다.
                // 폴더 타입 체크를 'DIRECTORY'로 변경
                if (fetchedTreeData.name === 'src' && fetchedTreeData.type === 'DIRECTORY') {
                    srcFolder = fetchedTreeData;
                } else if (fetchedTreeData.children) {
                    // 폴더 타입 체크를 'DIRECTORY'로 변경
                    srcFolder = fetchedTreeData.children.find(node => node.name === 'src' && node.type === 'DIRECTORY');
                }
            }

            if (!srcFolder) {
                throw new Error("루트 디렉토리 'src'를 찾을 수 없습니다. 파일 트리 구조를 확인해주세요.");
            }
            console.log("[useProjectTree] Found 'src' folder:", srcFolder);

            // 3. 'hello.js' 파일 생성 (찾아낸 'src' 폴더의 ID를 parentId로 사용)
            console.log("[useProjectTree] Creating 'hello.js' file inside 'src' folder...");
            const helloJsResponse = await fetch(
                `${BASE_URL}/api/projects/${currentProjectId}/files`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // JSON 본문을 보내므로 필수
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: "hello.js",
                        type: "FILE", // 파일 타입은 'FILE'
                        parentId: srcFolder.id, // 백엔드에서 조회한 실제 srcFolder의 ID를 사용
                        language: "javascript",
                        content: `console.log("Hello, World!");`
                    })
                }
            );

            if (!helloJsResponse.ok) {
                // 'hello.js'가 이미 존재하여 409 Conflict 응답을 받은 경우, 경고만 표시하고 계속 진행
                if (helloJsResponse.status === 409) {
                    console.warn("[useProjectTree] 'hello.js' already exists. Proceeding to fetch tree.");
                } else {
                    const errorData = await helloJsResponse.json().catch(() => ({ message: '알 수 없는 오류' }));
                    throw new Error(errorData.message || `hello.js 파일 생성 실패: ${helloJsResponse.status}`);
                }
            } else {
                console.log("[useProjectTree] 'hello.js' file creation request sent successfully.");
            }

            // 최종적으로 업데이트된 파일 트리를 다시 가져와서 UI에 반영
            const finalTree = await fetchProjectFiles(currentProjectId);
            console.log("[useProjectTree] Generated default tree structure:", finalTree);
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
    }, [toast, fetchProjectFiles]); // fetchProjectFiles를 의존성 배열에 추가

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
                let fetchedData;
                try {
                    fetchedData = await fetchProjectFiles(projectId); // fetchProjectFiles 사용
                } catch (fetchError) {
                    console.warn("[useProjectTree] Initial fetchProjectFiles failed, assuming empty tree:", fetchError.message);
                    fetchedData = null; // 에러 발생 시 빈 데이터로 간주
                }
                
                console.log("[useProjectTree] Raw fetched data:", fetchedData);

                let processedTree = [];

                // fetchedData가 유효한 배열이면 그대로 사용
                if (Array.isArray(fetchedData)) {
                    processedTree = fetchedData;
                } 
                // fetchedData가 단일 유효 객체이면 배열로 래핑
                else if (fetchedData && typeof fetchedData === 'object' && (fetchedData.id !== null || fetchedData.name !== null)) {
                    processedTree = [fetchedData];
                }
                // 그 외의 경우 (null, undefined, 빈 객체 등) processedTree는 빈 배열로 유지

                // processedTree가 비어있다면 (즉, 프로젝트에 파일이 없다면) 기본 구조 생성 시도
                if (processedTree.length === 0) {
                    console.warn("[useProjectTree] Fetched data is empty or invalid. Attempting to create default structure...");
                    const defaultStructure = await createDefaultProjectStructure(projectId);
                    if (defaultStructure) {
                        processedTree = defaultStructure;
                        console.log("[useProjectTree] Default structure successfully created and set.");
                    } else {
                        console.error("[useProjectTree] Failed to create default structure, tree remains empty.");
                    }
                }

                setTree(processedTree);
                console.log("[useProjectTree] Tree state updated:", processedTree);
            } catch (error) {
                console.error("[useProjectTree] File tree loading or initialization failed:", error.message);
                toast({
                    title: '파일을 불러올 수 없습니다.',
                    description: error.message || '로그인 상태를 확인하거나 권한이 있는지 확인해주세요.',
                    status: 'error',
                });
                setTree([]);
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

    return { tree, setTree, loading, manualSave, isSaving, fetchFileContent }; // fetchFileContent 추가 반환
};
