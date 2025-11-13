import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

function App() {
  const initialCode = `import math

# Example: ln(x)
x = 10
ln_x = math.log(x)   # natural logarithm
print(f"ln({x}) = {ln_x}")
`;

  // Password protection
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const correctPassword = "med2025"; // ⚠️ ضعها في متغير بيئي عند النشر

  // App states
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  const editorRef = useRef(null);
  const handleEditorMount = (editor) => (editorRef.current = editor);

  const undoCode = () => editorRef.current?.trigger('keyboard', 'undo', null);
  const redoCode = () => editorRef.current?.trigger('keyboard', 'redo', null);

  // Load Pyodide
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

  // Load code from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user_code');
    if (saved) setCode(saved);
  }, []);

  // Auto-save code
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('user_code', code);
    }, 500);
    return () => clearTimeout(timeout);
  }, [code]);

  // Run Python code
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

img_base64 = None
if plt.get_fignums():
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
`;

      await pyodide.runPythonAsync(wrappedCode);
      const end = performance.now();
      const time = (end - start).toFixed(2);

      const img = pyodide.globals.get('img_base64');
      const imageHTML = img
        ? `<img src="data:image/png;base64,${img}" style="max-width:100%; border-radius:10px; margin-top:10px;" />`
        : "";

      setOutput(prev =>
        prev +
        "\n----------\n" +
        (errorLines.length
          ? "❌ Execution Error:\n" + errorLines.join("") + `\n--- [ Error in ${time} ms ] ---\n`
          : (outputLines.join("") || "✅ Executed successfully.") +
            `\n⏱ Execution time: ${time} ms\n` +
            imageHTML) +
        "\n----------\n"
      );
    } catch (err) {
      setOutput(prev =>
        prev + "\n----------\n❌ Unexpected Error:\n" + err.message + "\n----------\n"
      );
    } finally {
      setExecuting(false);
      pyodide.setStdout(null);
      pyodide.setStderr(null);
    }
  };

  const clearOutput = () => setOutput('');
  const restartApp = () => { setCode(initialCode); setOutput(''); setExecuting(false); };

  // Loading screen
  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0d1117",
        color: "#00ffcc",
        fontFamily: "JetBrains Mono, monospace"
      }}>
        <div style={{
          width: "70px",
          height: "70px",
          border: "6px solid rgba(255,255,255,0.2)",
          borderTopColor: "#00ffcc",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <h2 style={{ marginTop: "20px", fontWeight: "500", letterSpacing: "1px" }}>
          🚀 Loading Pyodide...
        </h2>
        <style>
          {`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`}
        </style>
      </div>
    );
  }

  // Password screen
  if (!isAuthenticated) {
    return (
      <div style={{
        height: "100vh", display: "flex", justifyContent: "center",
        alignItems: "center", flexDirection: "column", background: "#0d1117", color: "#fff"
      }}>
        <h2>🔐 Enter Password to Access</h2>
        <input
          type="password"
          placeholder="Enter your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", marginTop: "10px", width: "200px" }}
        />
        <button
          onClick={() => {
            if (password === correctPassword) setIsAuthenticated(true);
            else alert("❌ Wrong password");
          }}
          style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
        >
          Login
        </button>
      </div>
    );
  }

  // Main App UI
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0d1117', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>
      <header style={{ padding: '10px 20px', fontSize: '1.3rem', fontWeight: 'bold', background: '#161b22', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        ⚡ AL-Code.AI
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' }}>
        <div style={{ flex: 1, borderRadius: '10px', overflow: 'hidden' }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(v) => setCode(v || '')}
            theme="vs-dark"
            onMount={handleEditorMount}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              automaticLayout: true,
              fontFamily: 'JetBrains Mono, monospace',
              placeholder: 'Write your Python code here...'
            }}
          />
        </div>

        <div style={{ flex: 1, backgroundColor: '#161b22', borderRadius: '10px', padding: '20px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#00ff99', marginBottom: '10px' }}>Output:</h3>
          <div dangerouslySetInnerHTML={{ __html: output }}></div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={runCode}>🚀 Run</button>
          <button onClick={clearOutput}>🗑️ Clear</button>
          <button onClick={restartApp}>🔄 Restart</button>
          <button onClick={undoCode}>↩️ Undo</button>
          <button onClick={redoCode}>↪️ Redo</button>
        </div>
      </div>
    </div>
  );
}

export default App;
