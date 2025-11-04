import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

function App() {
  const initialCode = `print("Hello, AL-Code.AI!")`;

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const editorRef = useRef(null);
  const handleEditorMount = (editor) => (editorRef.current = editor);

  const undoCode = () => editorRef.current?.trigger('keyboard', 'undo', null);
  const redoCode = () => editorRef.current?.trigger('keyboard', 'redo', null);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        if (window._pyodideInstance) {
          setPyodide(window._pyodideInstance);
          setLoading(false);
          return;
        }
        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
        await pyodideInstance.loadPackage(["numpy", "matplotlib", "pandas"]);
        window._pyodideInstance = pyodideInstance;
        setPyodide(pyodideInstance);
        setLoading(false);
      } catch (err) {
        setOutput("⚠️ Failed to load Pyodide:\n" + err.message + "\n");
      }
    };
    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) {
      setOutput(prev => prev + "⏳ Pyodide is still loading...\n");
      return;
    }

    setExecuting(true);
    let outputLines = [], errorLines = [];
    pyodide.setStdout({ batched: (t) => outputLines.push(t.endsWith("\n") ? t : t + "\n") });
    pyodide.setStderr({ batched: (t) => errorLines.push(t.endsWith("\n") ? t : t + "\n") });

    try {
      await pyodide.runPythonAsync(code);
      const sep = "\n----------\n";
      setOutput(prev =>
        prev +
        sep +
        (errorLines.length
          ? "❌ Execution Error:\n" + errorLines.join("") + "\n--- [ Error ] ---\n\n"
          : (outputLines.join("") || "✅ Executed successfully.") +
            "\n----------\n\n")
      );
    } catch (err) {
      setOutput(prev =>
        prev + "\n----------\n❌ Unexpected Error:\n" + err.message + "\n--- [ Execution End ] ---\n\n"
      );
    } finally {
      setExecuting(false);
      pyodide.setStdout(window.console.log);
      pyodide.setStderr(window.console.error);
    }
  };

  const clearOutput = () => setOutput('');
  const restartApp = () => { setCode(initialCode); setOutput(''); setExecuting(false); };
  const pasteCode = async () => { try { const text = await navigator.clipboard.readText(); setCode(text); } catch (err) { console.error(err); } };

  return (
    <div style={{ height: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', background: '#0d1117', color: '#fff' }}>
      {/* رأس الصفحة */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#007bff', fontWeight: 'bold', fontSize: '1.3rem' }}>
        ⚡ AL-Code.AI
        {/* زر الإعدادات الموحد */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowSettings(!showSettings)} style={{ padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#333', color: '#fff' }}>
            ⚙️
          </button>
          {showSettings && (
            <div style={{
              position: 'absolute', top: '40px', right: 0,
              background: '#1e1e1e', borderRadius: '8px', padding: '10px',
              display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 1000
            }}>
              <button onClick={runCode}>🚀 Run</button>
              <button onClick={clearOutput}>🗑️ Clear Output</button>
              <button onClick={restartApp}>🔄 Restart</button>
              <button onClick={undoCode}>↩️ Undo</button>
              <button onClick={redoCode}>↪️ Redo</button>
              <button onClick={() => navigator.clipboard.writeText(code)}>📑 Copy Code</button>
              <button onClick={() => navigator.clipboard.writeText(output)}>📋 Copy Output</button>
              <button onClick={pasteCode}>📥 Paste</button>
            </div>
          )}
        </div>
      </header>

      {/* المحرر */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' }}>
        <div style={{ flex: 1, borderRadius: '10px', overflow: 'hidden' }}>
          <Editor height="100%" defaultLanguage="python" value={code} onChange={(v) => setCode(v || '')} theme="vs-dark" onMount={handleEditorMount} options={{ fontSize: 16, minimap: { enabled: false }, automaticLayout: true, fontFamily: 'JetBrains Mono, monospace' }} />
        </div>

        <div style={{ flex: 1, background: '#161b22', borderRadius: '10px', padding: '20px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#00ff99', marginBottom: '10px' }}>Output:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: '#0d1117', color: output.includes('❌') ? '#ff4d4d' : '#00ff88', borderRadius: '8px', padding: '15px', fontFamily: 'JetBrains Mono, monospace' }}>
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;