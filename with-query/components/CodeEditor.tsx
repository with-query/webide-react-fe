import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Play, Code } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { FileSystemItem } from '@/hooks/useFileSystem';

interface CodeEditorProps {
  selectedFile: FileSystemItem | null;
}

export default function CodeEditor({ selectedFile }: CodeEditorProps) {
  const { t } = useLanguage();

  const handleCopy = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
    }
  };

  const handleRun = () => {
    // Mock run functionality
    console.log('Running file:', selectedFile?.name);
  };

  if (!selectedFile) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-dark-text mb-2">No File Selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a file from the explorer to view its contents
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedFile.type === 'folder') {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-dark-text mb-2">Folder Selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a file to view its contents
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Code className="w-5 h-5 text-soft-orange mr-2" />
            {selectedFile.name}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              {t('ide.copy')}
            </Button>
            <Button size="sm" onClick={handleRun} className="bg-soft-orange hover:bg-soft-orange/80">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {selectedFile.path}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            <pre className="text-sm font-mono bg-gray-50 p-4 rounded-md overflow-x-auto">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}