import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './index.css'; // Import styles

// زر اللصق
function PasteButton({ onPaste }) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onPaste(text);
    } catch (err) {
      console.error("فشل الوصول إلى الحافظة:", err);
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
  const initialCode = `# Write your Python code here (Hello World!)`;
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  const editorRef = useRef(null);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const undoCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
    }
  };

  const redoCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null);
    }
  };

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        if (!window.loadPyodide) {
          throw new Error("Pyodide script not loaded in index.html. Check the <script> tag.");
        }

        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });

        await pyodideInstance.loadPackage(["numpy", "matplotlib", "pandas"]);

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
    let outputLines = [];
    let errorLines = [];

    pyodide.setStdout({
      batched: (text) => {
        const clean = text.endsWith("\n") ? text : text + "\n";
        outputLines.push(clean);
      }
    });

    pyodide.setStderr({
      batched: (text) => {
        const clean = text.endsWith("\n") ? text : text + "\n";
        errorLines.push(clean);
      }
    });

    try {
      const separator = "\n----------\n";

      await pyodide.runPythonAsync(code);

      if (errorLines.length > 0) {
        setOutput(prev =>
          prev +
          separator +
          "❌ Execution Error:\n" +
          errorLines.join("") +
          "\n--- [ Execution End with Error ] ---\n\n"
        );
      } else {
        setOutput(prev =>
          prev +
          separator +
          (outputLines.join("") || "✅ Executed successfully, but no output.") +
          "\n----------\n\n"
        );
      }

    } catch (err) {
      const errorOutput = errorLines.join("") || err.message;
      setOutput(prev =>
        prev +
        "\n----------\n" +
        "❌ Unexpected Error:\n" +
        errorOutput +
        "\n--- [ Execution End with Error ] ---\n\n"
      );
    } finally {
      setExecuting(false);
      pyodide.setStdout(window.console.log);
      pyodide.setStderr(window.console.error);
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  const restartApp = () => {
    setCode(initialCode);
    setOutput('');
    setExecuting(false);
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#dff6ff',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        AL-code.AI - Python Editor
      </header>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        gap: '20px'
      }}>
        <div style={{
          flex: 1,
          minHeight: '40vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            onMount={handleEditorMount}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              automaticLayout: true,
              fontFamily: 'JetBrains Mono, monospace'
            }}
          />
        </div>

        <div style={{
          flex: 1,
          minHeight: '40vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <button onClick={runCode} disabled={loading || executing}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700',
                background: loading ? '#ccc' : 'linear-gradient(45deg, #007bff, #00ff99)',
                color: loading ? '#666' : '#fff' }}>
              {loading ? 'Loading...' : executing ? 'Running...' : 'Run Code 🚀'}
            </button>

            <button onClick={clearOutput}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700',
                background: '#ff4d4d', color: '#fff' }}>
              Clear Output 🗑️
            </button>

            <button onClick={restartApp}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700',
                background: '#6c757d', color: '#fff' }}>
              Restart 🔄
            </button>

            <button onClick={undoCode}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700',
                background: '#ffc107', color: '#000' }}>
              Undo ↩️
            </button>

            <button onClick={redoCode}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700',
                background: '#17a2b8', color: '#fff' }}>
              Redo ↪️
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(code)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700',
                background: '#20c997', color: '#fff' }}>
              Copy Code 📑
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(output)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '700',
                background: '#6610f2', color: '#fff' }}>
              Copy Output 📋
            </button>

            <PasteButton onPaste={(text) => setCode(text)} />
          </div>

          <h3
            style={{
              fontSize: '1.2rem',
              color: '#333',
              marginBottom: '10px',
              borderBottom: '2px solid #007bff',
              paddingBottom: '5px'
            }}
          >
            Output:
          </h3>

          <pre
            style={{
              flex: 1,
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '15px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              border: '1px solid #ccc'
            }}
          >
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;