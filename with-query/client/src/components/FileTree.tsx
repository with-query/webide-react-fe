import { useEffect, useState } from "react";
import { listDirectory } from "@/lib/fileApi";
import FileNode from "./FileNode";

export default function FileTree({ root = "/" }: { root?: string }) {
  const [files, setFiles] = useState<string[]>([]);
  
  useEffect(() => {
    listDirectory(root).then(setFiles).catch(console.error);
  }, [root]);

  return (
    <div className="p-4 border rounded">
      {files.map(f => (
        <FileNode key={f} path={root + f} name={f} />
      ))}
    </div>
  );
}