import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

// زر اللصق
function PasteButton({ onPaste }) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onPaste(text);
    } catch (err) {
      console.error("Clipboard access failed:", err);
    }
  };

  return (
    <button
      onClick={handlePaste}
      style={{
        flex: 1,
        padding: '10px',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '700',
        cursor: 'pointer',
        background: '#28a745',
        color: '#fff',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 10px rgba(40, 167, 69, 0.4)'
      }}
    >
      Paste 📋
    </button>
  );
}

function App() {
  const initialCode = `# Write your Python code here
print("Hello, AL-Code.AI!")`;

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [theme, setTheme] = useState('vs-dark');

  const editorRef = useRef(null);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const undoCode = () => editorRef.current?.trigger('keyboard', 'undo', null);
  const redoCode = () => editorRef.current?.trigger('keyboard', 'redo', null);

  // ✅ تحميل Pyodide (محسَّن للتخزين المؤقت)
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

  // 💾 الحفظ التلقائي للكود
  useEffect(() => {
    const saved = localStorage.getItem('user_code');
    if (saved) setCode(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('user_code', code);
  }, [code]);

  // 🚀 تنفيذ الكود مع حساب الوقت
  const runCode = async () => {
    if (!pyodide) {
      setOutput(prev => prev + "⏳ Pyodide is still loading...\n");
      return;
    }

    setExecuting(true);
    let outputLines = [];
    let errorLines = [];

    pyodide.setStdout({
      batched: (text) => outputLines.push(text.endsWith("\n") ? text : text + "\n")
    });
    pyodide.setStderr({
      batched: (text) => errorLines.push(text.endsWith("\n") ? text : text + "\n")
    });

    try {
      const start = performance.now();
      await pyodide.runPythonAsync(code);
      const end = performance.now();

      const time = (end - start).toFixed(2);

      const separator = "\n----------\n";
      if (errorLines.length > 0) {
        setOutput(prev =>
          prev +
          separator +
          "❌ Execution Error:\n" +
          errorLines.join("") +
          `\n--- [ Execution End with Error in ${time} ms ] ---\n\n`
        );
      } else {
        setOutput(prev =>
          prev +
          separator +
          (outputLines.join("") || "✅ Executed successfully, but no output.") +
          `\n⏱ Execution time: ${time} ms\n----------\n\n`
        );
      }
    } catch (err) {
      setOutput(prev =>
        prev +
        "\n----------\n" +
        "❌ Unexpected Error:\n" +
        err.message +
        "\n--- [ Execution End with Error ] ---\n\n"
      );
    } finally {
      setExecuting(false);
      pyodide.setStdout(window.console.log);
      pyodide.setStderr(window.console.error);
    }
  };

  const clearOutput = () => setOutput('');
  const restartApp = () => {
    setCode(initialCode);
    setOutput('');
    setExecuting(false);
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: theme === 'vs-dark' ? '#0d1117' : '#e8f5ff',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 🔹 رأس الصفحة */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        background: theme === 'vs-dark' 
          ? 'linear-gradient(90deg, #007bff, #00ff99)' 
          : 'linear-gradient(90deg, #0066cc, #00cc88)',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.3rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <span>⚡ AL-Code.AI</span>
        <span style={{ fontSize: '1rem', opacity: 0.9 }}>Python Web IDE</span>
      </header>

      {/* 🔹 محتوى الصفحة */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        gap: '20px'
      }}>
        {/* المحرر */}
        <div style={{
          flex: 1,
          minHeight: '40vh',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme={theme}
            onMount={handleEditorMount}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              automaticLayout: true,
              fontFamily: 'JetBrains Mono, monospace'
            }}
          />
        </div>

        {/* الأزرار + الإخراج */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme === 'vs-dark' ? '#161b22' : '#fff',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <button onClick={runCode} disabled={loading || executing}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                fontWeight: '700',
                background: loading ? '#ccc' : 'linear-gradient(45deg, #007bff, #00ff99)',
                color: loading ? '#666' : '#fff'
              }}>
              {loading ? 'Loading...' : executing ? 'Running...' : 'Run Code 🚀'}
            </button>

            <button onClick={clearOutput}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700', background: '#ff4d4d', color: '#fff' }}>
              Clear Output 🗑️
            </button>

            <button onClick={restartApp}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700', background: '#6c757d', color: '#fff' }}>
              Restart 🔄
            </button>

            <button onClick={undoCode}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700', background: '#ffc107', color: '#000' }}>
              Undo ↩️
            </button>

            <button onClick={redoCode}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700', background: '#17a2b8', color: '#fff' }}>
              Redo ↪️
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(code)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700', background: '#20c997', color: '#fff' }}>
              Copy Code 📑
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(output)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700', background: '#6610f2', color: '#fff' }}>
              Copy Output 📋
            </button>

            <button
              onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700', background: '#343a40', color: '#fff' }}>
              {theme === 'vs-dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            <PasteButton onPaste={(text) => setCode(text)} />
          </div>

          <h3 style={{
            fontSize: '1.2rem',
            color: theme === 'vs-dark' ? '#00ff99' : '#007bff',
            marginBottom: '10px',
            borderBottom: `2px solid ${theme === 'vs-dark' ? '#00ff99' : '#007bff'}`,
            paddingBottom: '5px'
          }}>
            Output:
          </h3>

          <pre style={{
            flex: 1,
            backgroundColor: theme === 'vs-dark' ? '#0d1117' : '#f8f9fa',
            color: output.includes('❌') ? '#ff4d4d' : '#00ff88',
            borderRadius: '8px',
            padding: '15px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            border: '1px solid #222',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;