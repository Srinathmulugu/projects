import MonacoEditor, { Monaco } from '@monaco-editor/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  onLanguageChange: (lang: string) => void;
}

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

export default function CodeEditor({ language, value, onChange, onLanguageChange }: CodeEditorProps) {
  const monacoLang = language === 'cpp' ? 'cpp' : language;
  const [editorReady, setEditorReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    setEditorReady(true);
    setIsLoading(false);
    
    // Configure editor
    editor.focus();
  };

  const handleEditorChange = (val: string | undefined) => {
    if (val !== undefined) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-3 border-b bg-card hover:bg-card/80 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Code Editor</span>
          {editorReady && <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>}
        </div>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30 relative">
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-red-200">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-sm text-red-700 font-medium">Editor failed to load</p>
              <button 
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                }}
                className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 z-40">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground font-medium">Loading code editor...</p>
            </div>
          </div>
        )}

        <MonacoEditor
          height="100%"
          language={monacoLang}
          value={value}
          onChange={handleEditorChange}
          theme="light"
          onMount={handleEditorMount}
          loading={null}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
            parameterHints: { enabled: true },
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            minimap: { enabled: false },
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: true,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorStyle: 'block',
            smoothScrolling: true,
            useTabStops: true,
            contextmenu: true,
            copyWithSyntaxHighlighting: true,
            dragAndDrop: true,
            folding: true,
            showFoldingControls: 'always',
            selectionHighlight: true,
            occurrencesHighlight: 'multiFile',
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on',
          }}
          defaultLanguage={monacoLang}
        />
      </div>
    </div>
  );
}
