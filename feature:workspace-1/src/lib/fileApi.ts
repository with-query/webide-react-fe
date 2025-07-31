export async function listDirectory(path: string): Promise<string[]> {
  const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('디렉터리 목록을 불러오는데 실패했습니다');
  return res.json();
}

export async function readFile(path: string): Promise<string> {
  const res = await fetch(`/api/files/content?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('파일 내용을 불러오는데 실패했습니다');
  return res.text();
}

export async function writeFile(path: string, content: string) {
  const res = await fetch(`/api/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) throw new Error('파일 쓰기 실패');
}