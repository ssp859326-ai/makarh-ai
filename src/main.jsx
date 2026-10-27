import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Makarh AI render error:', error, info);
  }
  render() {
    if (this.state.error) {
      return <main style={{minHeight:'100vh',background:'#0b0b12',color:'#f4f2fb',fontFamily:'system-ui',padding:'24px',boxSizing:'border-box'}}>
        <h1 style={{color:'#b8a1ff'}}>Makarh AI — Debug</h1>
        <p>The dashboard crashed while rendering. Error details:</p>
        <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',background:'#171721',padding:'16px',borderRadius:'12px',color:'#ffb4b4'}}>{String(this.state.error?.message || this.state.error)}</pre>
        <p style={{color:'#b7b4c7'}}>This diagnostic is temporary so we can identify the exact cause.</p>
      </main>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><AppErrorBoundary><App /></AppErrorBoundary></React.StrictMode>
);
