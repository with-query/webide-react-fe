import { useState, useEffect } from "react";
import { listDirectory, readFile } from "@/lib/fileApi";

export default function FileNode({ path, name }: { path: string; name: string }) {
  const [isDir, setIsDir] = useState(false);
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<string[]>([]);
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    // 디렉터리 여부 판별 (간단히 / 로 구분)
    setIsDir(name.endsWith("/"));
  }, [name]);

  const toggle = () => {
    if (isDir) {
      if (!open) {
        listDirectory(path).then(setChildren).catch(console.error);
      }
      setOpen(!open);
    } else {
      readFile(path).then(setContent).catch(console.error);
    }
  };

  return (
    <div className="ml-4">
      <div onClick={toggle} className="cursor-pointer">
        {isDir ? (open ? "📂" : "📁") : "📄"} {name}
      </div>
      {open && isDir && (
        <div className="ml-4">
          {children.map(c => (
            <FileNode key={c} path={path + c} name={c} />
          ))}
        </div>
      )}
      {!isDir && content && (
        <pre className="bg-gray-100 p-2 rounded my-2 text-sm">
          {content}
        </pre>
      )}
    </div>
  );
}