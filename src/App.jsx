import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './index.css'; // تأكد من استيراد ملف CSS

function App() {
  const [code, setCode] = useState(`# Write Python code here\nprint("Hello, Med!")`);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);

  useEffect(() => {
    const loadPyodide = async () => {
      const pyodideInstance = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
      });
      setPyodide(pyodideInstance);
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
      setOutput(outputText || "Code executed, no output.");
    } catch (err) {
      setOutput(err.toString());
    }
  };

  return (
    <div className="container">
      <div className="editor">
        <h1>🔷 Live Python Editor</h1>
        <Editor
          height="300px"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
        />
        <button onClick={runCode} style={{ marginTop: '10px' }}>
          Run Code ▶️
        </button>
      </div>
      <div className="output">
        <h2>📤 Output:</h2>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default App;