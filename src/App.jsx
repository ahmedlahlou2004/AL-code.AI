import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

const correctPassword = 'med2025';

function App() {
  const initialCode = `import math

# Natural logarithms from 1 to 10
for i in range(1, 11):
    print(f"ln({i}) = {math.log(i):.4f}")`;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const editorRef = useRef(null);
  const handleEditorMount = (editor) => (editorRef.current = editor);
  const undoCode = () => editorRef.current?.trigger('keyboard', 'undo', null);
  const redoCode = () => editorRef.current?.trigger('keyboard', 'redo', null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setIsAuthenticated(false);
      setCode('');
    } else {
      const saved = localStorage.getItem('user_code');
      if (saved) setCode(saved);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => localStorage.setItem('user_code', code), 500);
    return () => clearTimeout(timeout);
  }, [code]);

  const loadPyodideWithProgress = async () => {
    if (window._pyodideInstance) {
      setPyodide(window._pyodideInstance);
      return;
    }
    setLoading(true);
    setLoadingProgress(0);
    try {
      setLoadingProgress(10);
      const pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
      });
      setLoadingProgress(50);
      await pyodideInstance.loadPackage(['numpy','matplotlib','pandas']);
      setLoadingProgress(100);
      window._pyodideInstance = pyodideInstance;
      setPyodide(pyodideInstance);
    } catch (err) {
      setOutput('⚠️ Failed to load Pyodide:\n' + err.message);
    } finally {
      setTimeout(() => { setLoading(false); setLoadingProgress(0); }, 500);
    }
  };

  const runCode = async () => {
    if (!pyodide) await loadPyodideWithProgress();
    if (!pyodide) return;

    setExecuting(true);
    let outputLines = [], errorLines = [];
    pyodide.setStdout({ batched: (t) => outputLines.push(t.endsWith('\n') ? t : t + '\n') });
    pyodide.setStderr({ batched: (t) => errorLines.push(t.endsWith('\n') ? t : t + '\n') });

    try {
      const wrappedCode = `${code}`;
      await pyodide.runPythonAsync(wrappedCode);

      setOutput((prev) =>
        prev +
        (errorLines.length
          ? '❌ Execution Error:\n' + errorLines.join('') + `\n--- [ Error ] ---\n\n`
          : (outputLines.join('') || '✅ Executed successfully.') + `\n`)
      );
    } catch (err) {
      setOutput((prev) =>
        prev + '\n❌ Unexpected Error:\n' + err.message + '\n--- [ Execution End ] ---\n\n'
      );
    } finally {
      setExecuting(false);
      pyodide.setStdout(null);
      pyodide.setStderr(null);
    }
  };

  const clearOutput = () => setOutput('');
  const restartApp = () => { setCode(initialCode); setOutput(''); setExecuting(false); };
  const pasteCode = async () => { try { setCode(await navigator.clipboard.readText()); } catch {} };

  const handleLogin = () => {
    if (password === correctPassword) {
      setIsAuthenticated(true);
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code');
      if (codeParam) setCode(decodeURIComponent(codeParam));
    } else {
      alert('❌ Wrong password');
    }
  };

  const handleShare = () => {
    const codeEncoded = encodeURIComponent(code);
    const shareableLink = `${window.location.href}?code=${codeEncoded}`;
    navigator.clipboard.writeText(shareableLink);
    alert('Link copied to clipboard! The recipient will need the password to view the code.');
  };

  if (loading) {
    return (
      <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#0d1117', color:'#00ffcc', flexDirection:'column' }}>
        <div style={{ width:'70px', height:'70px', border:'6px solid rgba(255,255,255,0.2)', borderTopColor:'#00ffcc', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <p style={{marginTop:'20px'}}>🚀 Loading Pyodide {loadingProgress}%</p>
        <style>{`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', background:'#e8f5ff' }}>
        <h2 style={{marginBottom:'10px'}}>🔐 Enter password to access</h2>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} 
          style={{
            padding:'10px', 
            borderRadius:'8px', 
            border:'1px solid #ccc', 
            width:'250px', 
            textAlign:'center', 
            fontSize:'1rem'
          }} 
        />
        <button onClick={handleLogin} 
          style={{
            marginTop:'15px', 
            padding:'8px 20px', 
            borderRadius:'8px', 
            border:'none', 
            background:'#007bff', 
            color:'#fff', 
            cursor:'pointer'
          }}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', fontFamily:'Arial', backgroundColor:'#f0f8ff'}}>

      {/* HEADER */}
      <header
        style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          padding:'10px 20px',
          background: 'linear-gradient(90deg, #007bff, #00ccff)',
          color:'#fff',
          fontWeight:'bold',
          fontSize:'1.3rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        <span>⚡ AL-Code.AI</span>

        <button
          onClick={()=>setShowMenu(!showMenu)}
          style={{
            padding:'8px 15px',
            borderRadius:'6px',
            border:'none',
            cursor:'pointer',
            background:'#333',
            color:'#fff',
            fontWeight:'600'
          }}
        >
          ⚙️ Menu
        </button>
      </header>

      {showMenu && (
        <div style={{position:'absolute', top:'50px', right:'20px', background:'#fff', borderRadius:'8px', boxShadow:'0 4px 15px rgba(0,0,0,0.3)', padding:'10px', zIndex:1000, display:'flex', flexDirection:'column', gap:'8px'}}>
          <button onClick={runCode}>🚀 Run</button>
          <button onClick={clearOutput}>🗑️ Clear</button>
          <button onClick={restartApp}>🔄 Restart</button>
          <button onClick={undoCode}>↩️ Undo</button>
          <button onClick={redoCode}>↪️ Redo</button>
          <button onClick={()=>navigator.clipboard.writeText(code)}>📑 Copy Code</button>
          <button onClick={()=>navigator.clipboard.writeText(output)}>📋 Copy Output</button>
          <button onClick={pasteCode}>📥 Paste</button>
          <button onClick={handleShare}>🔗 Share Code (Password Protected)</button>
        </div>
      )}

      <div style={{flex:1, display:'flex', flexDirection:'column', padding:'20px', gap:'20px'}}>
        <div style={{flex:1, borderRadius:'10px', overflow:'hidden'}}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(v)=>setCode(v||'')}
            theme="vs-dark"
            onMount={handleEditorMount}
            options={{fontSize:16, minimap:{enabled:false}, automaticLayout:true, fontFamily:'JetBrains Mono, monospace'}}
          />
        </div>
        <div style={{flex:1, backgroundColor:'#e6f2ff', borderRadius:'10px', padding:'20px', overflowY:'auto'}}>
          <h3 style={{fontSize:'1.1rem', color:'#007bff', marginBottom:'10px'}}>Output:</h3>
          <div dangerouslySetInnerHTML={{__html: output}}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
