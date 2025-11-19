import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

const correctPassword = 'med2025';

function App() {
  const initialCode = `import math

# Example: ln(x)
x = 10
ln_x = math.log(x)
print(f"ln({x}) = {ln_x}")`;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [showMenu, setShowMenu] = useState(false);

  const editorRef = useRef(null);
  const handleEditorMount = (editor) => (editorRef.current = editor);
  const undoCode = () => editorRef.current?.trigger('keyboard', 'undo', null);
  const redoCode = () => editorRef.current?.trigger('keyboard', 'redo', null);

  // Load saved code or code from share link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setIsAuthenticated(false); // Require password first
      setCode(''); // Empty editor until password entered
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
      const sep = '\n----------\n';

      const img = pyodide.globals.get('img_base64');
      const imageHTML = img
        ? `<img src="data:image/png;base64,${img}" style="max-width:100%; border-radius:10px; margin-top:10px;" />`
        : '';

      setOutput((prev) =>
        prev +
        sep +
        (errorLines.length
          ? '❌ Execution Error:\n' + errorLines.join('') + `\n--- [ Error in ${time} ms ] ---\n\n`
          : (outputLines.join('') || '✅ Executed successfully.') +
            `\n⏱ Execution time: ${time} ms\n` +
            imageHTML +
            `\n----------\n\n`)
      );
    } catch (err) {
      setOutput((prev) =>
        prev + '\n----------\n❌ Unexpected Error:\n' + err.message + '\n--- [ Execution End ] ---\n\n'
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
      <div style={{ height: '100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#0d1117', color:'#00ffcc', flexDirection:'column' }}>
        <div style={{ width:'70px', height:'70px', border:'6px solid rgba(255,255,255,0.2)', borderTopColor:'#00ffcc', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <p style={{marginTop:'20px'}}>🚀 Loading Pyodide {loadingProgress}%</p>
        <style>{`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', background:'#0d1117', color:'#fff' }}>
        <h2>🔐 Enter password to access</h2>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{padding:'10px', borderRadius:'5px', marginTop:'10px'}} />
        <button onClick={handleLogin} style={{marginTop:'10px', padding:'8px 15px'}}>Login</button>
      </div>
    );
  }

  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', fontFamily:'Arial', backgroundColor: theme==='vs-dark'?'#0d1117':'#e8f5ff'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 20px', background: theme==='vs-dark'?'linear-gradient(90deg, #007bff, #00ff99)':'linear-gradient(90deg, #0066cc, #00cc88)', color:'#fff', fontWeight:'bold', fontSize:'1.3rem', boxShadow:'0 2px 10px rgba(0,0,0,0.2)'}}>
        <span>⚡ AL-Code.AI</span>
        <button onClick={()=>setShowMenu(!showMenu)} style={{padding:'8px 15px', borderRadius:'6px', border:'none', cursor:'pointer', background:'#333', color:'#fff', fontWeight:'600'}}>⚙️ Menu</button>
      </header>

      {showMenu && (
        <div style={{position:'absolute', top:'50px', right:'20px', background: theme==='vs-dark'?'#1e1e1e':'#fff', borderRadius:'8px', boxShadow:'0 4px 15px rgba(0,0,0,0.3)', padding:'10px', zIndex:1000, display:'flex', flexDirection:'column', gap:'8px'}}>
          <button onClick={runCode}>🚀 Run</button>
          <button onClick={clearOutput}>🗑️ Clear</button>
          <button onClick={restartApp}>🔄 Restart</button>
          <button onClick={undoCode}>↩️ Undo</button>
          <button onClick={redoCode}>↪️ Redo</button>
          <button onClick={()=>navigator.clipboard.writeText(code)}>📑 Copy Code</button>
          <button onClick={()=>navigator.clipboard.writeText(output)}>📋 Copy Output</button>
          <button onClick={pasteCode}>📥 Paste</button>
          <button onClick={()=>setTheme(theme==='vs-dark'?'light':'vs-dark')}>{theme==='vs-dark'?'☀️ Light Mode':'🌙 Dark Mode'}</button>
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
            theme={theme}
            onMount={handleEditorMount}
            options={{fontSize:16, minimap:{enabled:false}, automaticLayout:true, fontFamily:'JetBrains Mono, monospace'}}
          />
        </div>
        <div style={{flex:1, backgroundColor: theme==='vs-dark'?'#161b22':'#fff', borderRadius:'10px', padding:'20px', overflowY:'auto'}}>
          <h3 style={{fontSize:'1.1rem', color: theme==='vs-dark'