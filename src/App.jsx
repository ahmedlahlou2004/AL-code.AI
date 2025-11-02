import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function App() {
  const [code, setCode] = useState(`# اكتب كود بايثون هنا\nprint("مرحبًا يا مد!")`);
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
        setOutput("⚠️ فشل تحميل Pyodide:\n" + err.message);
      }
    };
    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) {
      setOutput("⏳ جارٍ تحميل Pyodide...");
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
      setOutput(outputText.trim() || "✅ تم تنفيذ الكود بنجاح، لكن لا يوجد مخرجات.");
    } catch (err) {
      setOutput("❌ خطأ أثناء التنفيذ:\n" + err.message);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#fff700',
      fontFamily: 'JetBrains Mono, monospace',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* الشريط العلوي */}
      <header style={{
        padding: '10px 20px',
        backgroundColor: '#222',
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        AI-code
      </header>

      {/* المحتوى الرئيسي */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        padding: '20px',
        gap: '20px'
      }}>
        {/* محرر الأكواد */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ color: '#007acc' }}>📝 اكتب كود بايثون</h2>
          <Editor
            height="80%"
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

        {/* زر التشغيل والمخرجات */}
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
              marginBottom: '20px',
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
            {loading ? 'جارٍ التحميل...' : executing ? 'يتم التنفيذ...' : 'تشغيل الكود ▶️'}
          </button>

          <h3 style={{ color: '#007acc' }}>📤 الناتج:</h3>
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
