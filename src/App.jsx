import React from 'react';
import Editor from './components/Editor';
import Output from './components/Output';

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Python Web Editor</h1>
      </header>
      <main>
        <Editor />
        <Output />
      </main>
      <footer>
        <p>© {new Date().getFullYear()} AL-code.AI — All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
