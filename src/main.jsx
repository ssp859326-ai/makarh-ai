import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error('Makarh AI render error:', error);
  }
  render() {
    if (this.state.hasError) {
      return <main style={{minHeight:'100vh',background:'#0b0b12',color:'#f4f2fb',fontFamily:'system-ui',padding:'32px',boxSizing:'border-box'}}>
        <h1 style={{color:'#b8a1ff'}}>Makarh AI</h1>
        <p>The workspace hit a display error. Please refresh once; the issue has been logged for debugging.</p>
      </main>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><AppErrorBoundary><App /></AppErrorBoundary></React.StrictMode>
);
