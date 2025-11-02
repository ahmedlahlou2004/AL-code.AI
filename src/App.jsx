import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function App() {
  const [code, setCode] = useState(`# Write your Python code here\nprint("Hello!")`);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
        setPyodide(pyodideInstance);
        setLoading(false);
      } catch (err) {
        setOutput("⚠️ Failed to load Pyodide:\n" + err.message);
      }
    };
    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) {
      setOutput("⏳ Loading Pyodide...");
      return;
    }

    setExecuting(true);
    let outputText = '';

    pyodide.setStdout({
      batched: (text) => {
        outputText += text;
      },
    });

    try {
      await pyodide.runPythonAsync(code);
      setOutput(outputText.trim() || "✅ Code executed successfully, but no output.");
    } catch (err) {
      setOutput("❌ Execution error:\n" + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#dff6ff',
      fontFamily: 'JetBrains Mono, monospace',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top bar */}
      <header style={{
        padding: '10px 20px',
        backgroundColor: '#222',
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        AL-code.AI
      </header>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        padding: '20px',
        gap: '20px'
      }}>
        {/* Editor panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '2px solid #ddd',
          paddingRight: '10px'
        }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              automaticLayout: true
            }}
          />
        </div>

        {/* Output panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={runCode}
            disabled={loading || executing}
            style={{
              marginBottom: '10px',
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#ccc' : 'linear-gradient(90deg, #00e5ff, #00ff99)',
              color: loading ? '#666' : '#000',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 0 10px rgba(0,255,204,0.5)'
            }}
          >
            {loading ? 'Loading...' : executing ? 'Running...' : 'Run Code ▶️'}
          </button>

          <button
            onClick={copyOutput}
            disabled={!output}
            style={{
              alignSelf: 'flex-end',
              marginBottom: '10px',
              padding: '6px 12px',
              fontSize: '0.9em',
              backgroundColor: '#eee',
              border: '1px solid #ccc',
              borderRadius: '6px',
              cursor: output ? 'pointer' : 'not-allowed'
            }}
          >
            📋 Copy Output
          </button>

          <h3 style={{ color: '#007acc' }}>📤 Output:</h3>
          <pre style={{
            whiteSpace: 'pre-wrap',
            flex: 1,
            backgroundColor: '#f9f9f9',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            overflowY: 'auto'
          }}>
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
