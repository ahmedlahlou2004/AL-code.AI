import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

function App() {
  const initialCode = `import matplotlib.pyplot as plt
plt.plot([1, 2, 3], [4, 5, 6])
plt.title("رسم بياني تجريبي")
plt.show()`;

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [showMenu, setShowMenu] = useState(false);

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

  useEffect(() => {
    const saved = localStorage.getItem('user_code');
    if (saved) setCode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('user_code', code);
  }, [code]);

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
      const start = performance.now();

      const wrappedCode = `
import matplotlib.pyplot as plt
import io, base64, sys

plt.switch_backend('agg')

${code}

buf = io.BytesIO()
plt.savefig(buf, format='png')
buf.seek(0)
img_base64 = base64.b64encode(buf.read()).decode('utf-8')
`;

      await pyodide.runPythonAsync(wrappedCode);
      const end = performance.now();
      const time = (end - start).toFixed(2);
      const sep = "\n----------\n";

      const img = pyodide.globals.get('img_base64');
      const imageHTML = img
        ? `<img src="data:image/png;base64,${img}" style="max-width:100%; border-radius:10px; margin-top:10px;" />`
        : "";

      setOutput(prev =>
        prev +
        sep +
        (errorLines.length
          ? "❌ Execution Error:\n" + errorLines.join("") + `\n--- [ Error in ${time} ms ] ---\n\n`
          : (outputLines.join("") || "✅ Executed successfully.") +
            `\n⏱ Execution time: ${time} ms\n` +
            imageHTML +
            `\n----------\n\n`)
      );
    } catch (err) {
      setOutput(prev =>
        prev + "\n----------\n❌ Unexpected Error:\n" + err.message + "\n--- [ Execution End with Error ] ---\n\n"
      );
    } finally {
      setExecuting(false);
      pyodide.setStdout(window.console.log);
      pyodide.setStderr(window.console.error);
    }
  };

  const clearOutput = () => setOutput('');
  const restartApp = () => { setCode(initialCode); setOutput(''); setExecuting(false); };
  const pasteCode = async () => {
    try { const text = await navigator.clipboard.readText(); setCode(text); }
    catch (err) { console.error("Clipboard access failed:", err); }
  };

  return (
    <div style={{ height: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', backgroundColor: theme === 'vs-dark' ? '#0d1117' : '#e8f5ff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: theme === 'vs-dark' ? 'linear-gradient(90deg, #007bff, #00ff99)' : 'linear-gradient(90deg, #0066cc, #00cc88)', color: '#fff', fontWeight: 'bold', fontSize: '1.3rem', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <span>⚡ AL-Code.AI</span>
        <button onClick={() => setShowMenu(!showMenu)} style={{ padding: '8px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#333', color: '#fff', fontWeight: '600' }}>
          ⚙️ Menu
        </button>
      </header>

      {showMenu && (
        <div style={{
          position: 'absolute', top: '50px', right: '20px',
          background: theme === 'vs-dark' ? '#1e1e1e' : '#fff',
          borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          padding: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <button onClick={runCode}>🚀 Run</button>
          <button onClick={clearOutput}>🗑️ Clear</button>
          <button onClick={restartApp}>🔄 Restart</button>
          <button onClick={undoCode}>↩️ Undo</button>
          <button onClick={redoCode}>↪️ Redo</button>
          <button onClick={() => navigator.clipboard.writeText(code)}>📑 Copy Code</button>
          <button onClick={() => navigator.clipboard.writeText(output)}>📋 Copy Output</button>
          <button onClick={pasteCode}>📥 Paste</button>
          <button onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}>
            {theme === 'vs-dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' }}>
        <div style={{ flex: 1, borderRadius: '10px', overflow: 'hidden' }}>
          <Editor height="100%" defaultLanguage="python" value={code} onChange={(v) => setCode(v || '')} theme={theme} onMount={handleEditorMount} options={{ fontSize: 16, minimap: { enabled: false }, automaticLayout: true, fontFamily: 'JetBrains Mono, monospace' }} />
        </div>
        <div style={{ flex: 1, backgroundColor: theme === 'vs-dark' ? '#161b22' : '#fff', borderRadius: '10px', padding: '20px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', color: theme === 'vs-dark' ? '#00ff99' : '#007bff', marginBottom: '10px' }}>Output:</h3>
          <div dangerouslySetInnerHTML={{ __html: output }}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
