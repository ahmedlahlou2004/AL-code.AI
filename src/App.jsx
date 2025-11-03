import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './index.css'; // Import styles

function App() {
  // Default Python code
  const initialCode = `# Write your Python code here (Hello World!)`;
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  // Load Pyodide
  useEffect(() => {
    const loadPyodide = async () => {
      try {
        if (!window.loadPyodide) {
          throw new Error("Pyodide script not loaded in index.html. Check the <script> tag.");
        }

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
      setOutput(prev => prev + "⏳ Pyodide is still loading...\n");
      return;
    }

    setExecuting(true);
    let outputText = '';
    let errorText = '';

    // Redirect stdout and stderr
    pyodide.setStdout({ batched: (text) => { outputText += text; } });
    pyodide.setStderr({ batched: (text) => { errorText += text; } });

    try {
      const separator = "\n----------\n";

      await pyodide.runPythonAsync(code);

      if (errorText.trim()) {
        setOutput(prev =>
          prev +
          separator +
          "❌ Execution Error:\n" +
          errorText.trim() +
          "\n--- [ Execution End with Error ] ---\n\n"
        );
      } else {
        setOutput(prev =>
          prev +
          separator +
          (outputText.trim() || "✅ Executed successfully, but no output.") +
          "\n----------\n\n"
        );
      }

    } catch (err) {
      const errorOutput = errorText.trim() || err.message;
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
        {/* Editor Area */}
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
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              automaticLayout: true,
              fontFamily: 'JetBrains Mono, monospace'
            }}
          />
        </div>

        {/* Output Area */}
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
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button
              onClick={runCode}
              disabled={loading || executing}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#ccc' : 'linear-gradient(45deg, #007bff, #00ff99)',
                color: loading ? '#666' : '#fff',
                transition: 'all 0.3s ease',
                transform: executing ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              {loading ? 'Loading...' : executing ? 'Running...' : 'Run Code 🚀'}
            </button>

            <button
              onClick={clearOutput}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                background: '#ff4d4d',
                color: '#fff',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(255, 77, 77, 0.4)'
              }}
            >
              Clear Output 🗑️
            </button>
          </div>
          
          <h3 style={{
            fontSize: '1.2rem',
            color: '#333',
            marginBottom: '10px',
            borderBottom: '2px solid #eee',
            paddingBottom: '5px'
          }}>
            Output Console
          </h3>

          {/* Output Display */}
          <pre className="output-pre">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;