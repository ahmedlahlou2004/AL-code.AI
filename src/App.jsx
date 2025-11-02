import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

function App() {
  const [code, setCode] = useState(`# Write Python code here\nprint("Hello, Med!")`);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
        setPyodide(pyodideInstance);
        setLoading(false);
      } catch (err) {
        setOutput("Failed to load Pyodide: " + err);
      }
    };
    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) {
      setOutput("Loading Pyodide...");
      return;
    }

    let outputText = '';
    pyodide.setStdout({
      batched: (text) => {
        outputText += text;
      },
    });

    try {
      await pyodide.runPythonAsync(code);
      setOutput(outputText || "✅ Code executed successfully, but no output.");
    } catch (err) {
      setOutput("⚠️ " + err.toString());
    }
  };

  return (
    <div className="container">
      <div className="editor">
        <h1>🔷 Live Python Editor</h1>
        <Editor
          height="400px"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            lineNumbers: "on",
            automaticLayout: true,
          }}
        />
        <button onClick={runCode} disabled={loading}>
          {loading ? "Loading Pyodide..." : "Run Code ▶️"}
        </button>
      </div>
      <div className="output">
        <h2>📤 Output:</h2>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default App;export default App;