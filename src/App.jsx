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
        setOutput("⚠️ Failed to load Pyodide:\n" + err.message + "\n");
      }
    };
    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) {
      setOutput(prev => prev + "⏳ Loading Pyodide...\n");
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
      setOutput(prev =>
        prev +
        (outputText.trim() || "✅ Code executed successfully, but no output.") +
        "\n"
      );
    } catch (err) {
      setOutput(prev => prev + "❌ Execution error:\n" + err.message + "\n");
    } finally {
      setExecuting(false);
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#dff6ff',
      fontFamily: 'JetBrains Mono, monospace',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        padding: '10px 20px',
        backgroundColor: '#222',
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        AL-code.AI
      </header>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        padding: '20px',
        gap: '20px'
      }}>
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

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button
              onClick={runCode}
              disabled={loading || executing}
              style={{
                flex: 1,
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
              onClick={clearOutput}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#ff4d4d',
                color: '#fff',
                transition: 'all 0.3s ease'
              }}
            >
              Clear Output 🗑️
            </button>
          </div>

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
