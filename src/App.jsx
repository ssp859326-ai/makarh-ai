import React, { useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Bot, ChevronDown,
  CircleHelp, Clock3, Command, FileText, FolderOpen, LayoutDashboard, Menu,
  MessageSquareText, MoreHorizontal, Plus, Search, Settings, Sparkles,
  Video, X, Image as ImageIcon, Zap
} from 'lucide-react';

const nav = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'AI Studio', icon: Bot },
  { label: 'Poster Maker', icon: ImageIcon },
  { label: 'Video Scripts', icon: Video },
  { label: 'PDF Tools', icon: FileText },
  { label: 'My Projects', icon: FolderOpen },
];
const services = [
  { title: 'AI Chat', desc: 'Think, write, and solve with your AI workspace.', icon: MessageSquareText, tag: 'POPULAR', tone: 'violet', action: 'Open chat' },
  { title: 'Poster Studio', desc: 'Create eye-catching posters for your next idea.', icon: ImageIcon, tag: 'CREATIVE', tone: 'blue', action: 'Create poster' },
  { title: 'Video Scripts', desc: 'Turn an idea into a ready-to-record script.', icon: Video, tag: 'CONTENT', tone: 'pink', action: 'Write a script' },
  { title: 'PDF Tools', desc: 'Organize, summarize, and work with documents.', icon: FileText, tag: 'PRODUCTIVITY', tone: 'orange', action: 'Explore tools' },
];
const projects = [
  { name: 'Diwali Sale Poster', type: 'Poster Studio', date: 'Today, 10:24 AM', status: 'In progress', tone: 'violet', icon: ImageIcon },
  { name: 'Punjabi Service Promo', type: 'Video Scripts', date: 'Yesterday', status: 'Ready to use', tone: 'pink', icon: Video },
  { name: 'Business Notes — Unit 2', type: 'PDF Tools', date: 'Oct 24, 2026', status: 'Completed', tone: 'blue', icon: FileText },
];


function FunctionalWorkspace({active, onBack, onNotice}) {
  const [input,setInput] = useState('');
  const [messages,setMessages] = useState(()=>{try{return JSON.parse(localStorage.getItem('makarh-chat')||'[]')}catch{return []}});
  const [topic,setTopic] = useState('');
  const [platform,setPlatform] = useState('Instagram Reel');
  const [script,setScript] = useState('');
  const [posterTitle,setPosterTitle] = useState('Grand Opening');
  const [posterSub,setPosterSub] = useState('Special offers available now');
  const [posterStyle,setPosterStyle] = useState('violet');
  const [saved,setSaved] = useState(()=>{try{return JSON.parse(localStorage.getItem('makarh-projects')||'[]')}catch{return []}});
  const [pdfText,setPdfText] = useState('');
  const [pdfName,setPdfName] = useState('');
  const saveProject = (title,type,body) => {
    const next=[{id:Date.now(),title,type,body,created:new Date().toLocaleString()} ,...saved];
    setSaved(next); localStorage.setItem('makarh-projects',JSON.stringify(next)); onNotice('Project saved on this device.');
  };
  const send = () => {
    const q=input.trim(); if(!q)return;
    const next=[...messages,{role:'user',text:q},{role:'assistant',text:'I’m Makarh AI. Your request is saved in this chat. Live AI answers are not connected yet, so I can’t honestly generate a real model response until an AI provider is configured. You can still use Video Scripts and Poster Maker right now.'}];
    setMessages(next); localStorage.setItem('makarh-chat',JSON.stringify(next)); setInput('');
  };
  const makeScript = () => {
    if(!topic.trim()){onNotice('Please enter a topic first.');return;}
    const s = platform==='Instagram Reel' ? 'HOOK (0–3 sec): '+topic+' baare ik zaroori gall!\n\nMAIN (3–20 sec): '+topic+' nu asaan tareeke naal samjhiye. Is de 3 main points han: pehla, faida te problem nu samjho; dooja, sahi jaankari verify karo; teeja, apni zaroorat mutabik action lao.\n\nCTA (20–30 sec): Hor ajihe tips layi page follow karo te video share karo.' : 'TITLE: '+topic+'\n\nINTRODUCTION: Ajj assi gall karange '+topic+' baare.\n\nMAIN POINTS:\n1. Topic di basic jaankari.\n2. Is de faide te zaroori gallan.\n3. Aam galtiyan ton kiven bachna.\n\nCONCLUSION: Umeed hai eh jaankari tuhade kam aayi. Apne sawaal comment karo.';
    setScript(s);
  };
  const toolHeader = <div className="tool-head"><div><div className="eyebrow"><span className="status-dot"/> MAKARH AI WORKSPACE</div><h1>{active}</h1><p className="subtitle">Use the tool below. Your saved projects stay in this browser on this device.</p></div><button className="primary-button" onClick={onBack}><ArrowRight size={16}/> Overview</button></div>;
  if(active==='AI Studio') return <section className="tool-page">{toolHeader}<div className="tool-card"><div className="tool-card-title"><MessageSquareText size={20}/><div><h2>AI Chat</h2><p>Chat interface is ready; live model connection is not configured yet.</p></div><span className="tag orange">BACKEND NEEDED</span></div><div className="chat-log">{messages.length?messages.map((m,i)=><div key={i} className={'chat-bubble '+m.role}><b>{m.role==='user'?'You':'Makarh AI'}</b><p>{m.text}</p></div>):<div className="empty-state">Start by typing a question below.</div>}</div><div className="chat-compose"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type your question..."/><button className="primary-button" onClick={send}>Send <ArrowRight size={15}/></button></div><button className="text-link" onClick={()=>{setMessages([]);localStorage.removeItem('makarh-chat')}}>Clear chat</button></div></section>;
  if(active==='Video Scripts') return <section className="tool-page">{toolHeader}<div className="tool-card"><h2>Punjabi Video Script Writer</h2><p className="tool-help">Enter your topic to generate a ready-to-edit script template.</p><label className="tool-label">Video topic<input className="tool-input" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Ayurvedic daily habits, furniture sale"/></label><label className="tool-label">Format<select className="tool-input" value={platform} onChange={e=>setPlatform(e.target.value)}><option>Instagram Reel</option><option>YouTube video</option></select></label><button className="primary-button" onClick={makeScript}><Sparkles size={16}/> Generate script</button>{script&&<div className="generated-output"><pre>{script}</pre><button className="primary-button" onClick={()=>saveProject(topic+' script','Video Scripts',script)}>Save project</button><button className="secondary-button" onClick={()=>navigator.clipboard?.writeText(script).then(()=>onNotice('Script copied.')).catch(()=>onNotice('Copy is not supported in this browser.'))}>Copy script</button></div>}</div></section>;
  if(active==='Poster Maker') return <section className="tool-page">{toolHeader}<div className="tool-grid"><div className="tool-card"><h2>Poster Maker</h2><label className="tool-label">Main heading<input className="tool-input" value={posterTitle} onChange={e=>setPosterTitle(e.target.value)} /></label><label className="tool-label">Subtitle<input className="tool-input" value={posterSub} onChange={e=>setPosterSub(e.target.value)} /></label><label className="tool-label">Theme<select className="tool-input" value={posterStyle} onChange={e=>setPosterStyle(e.target.value)}><option value="violet">Purple glow</option><option value="blue">Ocean blue</option><option value="pink">Pink festival</option></select></label><button className="primary-button" onClick={()=>saveProject(posterTitle+' poster','Poster Maker',posterTitle+'\n'+posterSub+'\nTheme: '+posterStyle)}>Save poster design</button></div><div className={'poster-preview '+posterStyle}><div className="poster-brand">✦ MAKARH CREATIVE</div><h2>{posterTitle||'Your headline'}</h2><p>{posterSub||'Your subtitle goes here'}</p><div className="poster-stamp">MAKE IT<br/>MEMORABLE</div></div></div></section>;
  if(active==='PDF Tools') return <section className="tool-page">{toolHeader}<div className="tool-card"><h2>Text file reader</h2><p className="tool-help">Choose a .txt file to read its contents here. Full PDF extraction needs a PDF parser integration.</p><label className="tool-label">Choose text file<input className="tool-input" type="file" accept=".txt,text/plain" onChange={e=>{const f=e.target.files?.[0];if(f){setPdfName(f.name);const reader=new FileReader();reader.onload=()=>setPdfText(String(reader.result||''));reader.readAsText(f)}}}/></label>{pdfName&&<><p className="tool-help">File: {pdfName}</p><textarea className="tool-textarea" value={pdfText} onChange={e=>setPdfText(e.target.value)}/><button className="primary-button" onClick={()=>saveProject(pdfName,'Text file',pdfText)}>Save extracted text</button></>}</div></section>;
  if(active==='My Projects') return <section className="tool-page">{toolHeader}<div className="tool-card"><h2>Saved projects</h2>{saved.length?saved.map(p=><article className="saved-project" key={p.id}><div><strong>{p.title}</strong><small>{p.type} · {p.created}</small><p>{p.body}</p></div><button className="secondary-button" onClick={()=>{const next=saved.filter(x=>x.id!==p.id);setSaved(next);localStorage.setItem('makarh-projects',JSON.stringify(next))}}>Delete</button></article>):<div className="empty-state">No saved projects yet. Create a script or poster and tap Save.</div>}</div></section>;
  if(active==='Settings') return <section className="tool-page">{toolHeader}<div className="tool-card"><h2>Workspace settings</h2><p className="tool-help">Data is currently saved locally in this browser, not synced between devices.</p><button className="secondary-button" onClick={()=>{if(confirm('Delete all locally saved Makarh projects and chat?')){localStorage.removeItem('makarh-projects');localStorage.removeItem('makarh-chat');setSaved([]);setMessages([]);onNotice('Local workspace data cleared.')}}}>Clear local workspace data</button></div></section>;
  return <section className="placeholder-page">{toolHeader}<button className="primary-button" onClick={onBack}>Back to overview</button></section>;
}

export default function App() {
  const [active, setActive] = useState('Overview');
  const [query, setQuery] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const filteredServices = services.filter(s => (s.title + ' ' + s.desc).toLowerCase().includes(query.toLowerCase()));
  const filteredProjects = projects.filter(p => (p.name + ' ' + p.type).toLowerCase().includes(query.toLowerCase()));
  const selectService = (title) => { setActive(title); setNotice(title + ' is ready for the next integration step.'); setTimeout(() => setNotice(''), 3500); };

  return <div className="app-shell">
    {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside className={'sidebar ' + (mobileNav ? 'sidebar-open' : '')}>
      <div className="brand"><div className="brand-mark"><Sparkles size={20}/></div><div><strong>makarh<span>.ai</span></strong><small>SERVICES HUB</small></div><button className="close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE <ChevronDown size={13}/></div>
      <nav className="nav-list">{nav.map(item => { const Icon=item.icon; return <button key={item.label} className={'nav-item ' + (active===item.label?'active':'')} onClick={() => {setActive(item.label);setMobileNav(false);setNotice('');}}><Icon size={18}/><span>{item.label}</span>{item.label==='AI Studio' && <span className="nav-new">NEW</span>}</button>; })}</nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Zap size={17}/></div><strong>Your creative space</strong><p>All your ideas, in one place.</p><button onClick={() => selectService('Explore tools')}>Explore tools <ArrowRight size={14}/></button></div>
        <button className="nav-item" onClick={() => setActive('Settings')}><Settings size={18}/><span>Settings</span></button>
        <button className="nav-item" onClick={() => setNotice('Help center will be connected in a later update.')}><CircleHelp size={18}/><span>Help & support</span></button>
        <div className="profile"><div className="avatar">P</div><div className="profile-copy"><strong>My Workspace</strong><small>Free workspace</small></div><MoreHorizontal size={18}/></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21}/></button><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{active}</strong></div><div className="top-actions"><button className="search-trigger" onClick={() => setSearchOpen(!searchOpen)}><Search size={16}/><span>Search anything...</span><kbd>⌘ K</kbd></button><button className="icon-button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up — no new notifications.')}><Bell size={18}/><i/></button><div className="top-avatar">P</div></div></header>
      {searchOpen && <div className="search-panel"><Search size={17}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search services and projects..."/><button onClick={()=>{setSearchOpen(false);setQuery('')}}><X size={16}/></button></div>}
      <div className="content">
        {notice && <div className="notice"><Sparkles size={16}/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={15}/></button></div>}
        {active==='Overview' ? <>
          <div className="welcome-row"><div><div className="eyebrow"><span className="status-dot"/> YOUR CREATIVE WORKSPACE</div><h1>Make something <span>amazing.</span></h1><p className="subtitle">Your ideas deserve a great place to happen. What are we creating today?</p></div><button className="primary-button" onClick={()=>selectService('New project')}><Plus size={17}/> New project</button></div>
          <section className="hero-card"><div className="hero-copy"><div className="hero-pill"><Sparkles size={13}/> YOUR AI TOOLKIT</div><h2>One workspace.<br/><span>Endless possibilities.</span></h2><p>From first thought to finished project — bring your creative workflow together in one place.</p><button className="hero-button" onClick={()=>{setActive('AI Studio');setNotice('Choose a tool below to get started.')}}>Explore AI Studio <ArrowRight size={16}/></button></div><div className="hero-art" aria-hidden="true"><div className="orb orb-one"/><div className="orb orb-two"/><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="sparkle-card spark-card-a"><Sparkles size={21}/></div><div className="sparkle-card spark-card-b"><MessageSquareText size={20}/></div><div className="sparkle-card spark-card-c"><ImageIcon size={21}/></div><div className="hero-center"><Sparkles size={42}/></div></div><div className="hero-glow"/></section>
          <section className="section-head"><div><h2>Made for your workflow</h2><p>Pick a tool and bring your next idea to life.</p></div><button className="text-link" onClick={()=>setActive('AI Studio')}>View all tools <ArrowRight size={15}/></button></section>
          <div className="service-grid">{filteredServices.map(s=>{const Icon=s.icon;return <article className="service-card" key={s.title}><div className="service-top"><div className={'service-icon '+s.tone}><Icon size={20}/></div><span className={'tag '+s.tone}>{s.tag}</span><button className="more-button" aria-label={'More about '+s.title} onClick={()=>selectService(s.title)}><MoreHorizontal size={18}/></button></div><h3>{s.title}</h3><p>{s.desc}</p><button className="card-link" onClick={()=>selectService(s.title)}>{s.action}<ArrowUpRight size={15}/></button></article>})}</div>
          <section className="section-head recent-head"><div><h2>Recent projects</h2><p>Pick up where you left off.</p></div><button className="text-link" onClick={()=>{setActive('My Projects');setShowAll(true)}}>View all projects <ArrowRight size={15}/></button></section>
          <div className="projects-table"><div className="table-head"><span>PROJECT</span><span>LAST UPDATED</span><span>STATUS</span><span/></div>{(showAll?filteredProjects:filteredProjects.slice(0,3)).map(p=>{const Icon=p.icon;return <button className="project-row" key={p.name} onClick={()=>selectService(p.name)}><div className="project-name"><div className={'project-icon '+p.tone}><Icon size={17}/></div><div><strong>{p.name}</strong><small>{p.type}</small></div></div><span className="project-date"><Clock3 size={14}/>{p.date}</span><span className={'project-status '+(p.status==='Completed'?'complete':p.status==='Ready to use'?'ready':'progress')}><i/>{p.status}</span><MoreHorizontal className="row-more" size={18}/></button>})}{filteredProjects.length===0&&<div className="empty-state">No projects match “{query}”.</div>}</div>
          <footer className="footer"><span>© 2026 Makarh AI</span><span><i/> All systems ready</span><button onClick={()=>setNotice('Help center will be connected in a later update.')}>Need help?</button></footer>
        </> : <FunctionalWorkspace active={active} onBack={()=>setActive('Overview')} onNotice={setNotice}/>}
      </div>
    </main>
  </div>;
}