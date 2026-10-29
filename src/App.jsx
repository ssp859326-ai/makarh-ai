import React, { useState, useRef } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Bot, ChevronDown,
  CircleHelp, Clock3, Command, FileText, FolderOpen, LayoutDashboard, Menu,
  MessageSquareText, MoreHorizontal, Plus, Search, Settings, Sparkles,
  Video, X, Image as ImageIcon, Zap
} from 'lucide-react';

const nav = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'AI Studio', icon: Bot },
  { label: 'Image Generator', icon: ImageIcon },
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


function FunctionalWorkspace({active, onBack, onNotice, username}) {
  const [input,setInput] = useState('');
  const [attachedImage,setAttachedImage] = useState(null);
  const imageFileRef = useRef(null);
  const [busy,setBusy] = useState(false);
  const [imagePrompt,setImagePrompt] = useState('A cinematic golden-hour view of a beautiful Punjabi village, lush green fields, warm sunlight, realistic photography, highly detailed');
  const [generatedImage,setGeneratedImage] = useState('');
  const [imageBusy,setImageBusy] = useState(false);
  const [imageHistory,setImageHistory] = useState([]);
  const chatStorageKey = 'makarh-chat-' + String(username || 'guest').toLowerCase();
  const projectStorageKey = 'makarh-projects-' + String(username || 'guest').toLowerCase();
  const [messages,setMessages] = useState(()=>{try{return JSON.parse(localStorage.getItem(chatStorageKey)||'[]')}catch{return []}});
  const [topic,setTopic] = useState('');
  const [platform,setPlatform] = useState('Instagram Reel');
  const [script,setScript] = useState('');
  const [posterTitle,setPosterTitle] = useState('Grand Opening');
  const [posterSub,setPosterSub] = useState('Special offers available now');
  const [posterStyle,setPosterStyle] = useState('violet');
  const [imageQuery,setImageQuery] = useState('');
  const [imageResults,setImageResults] = useState([]);
  const [posterImage,setPosterImage] = useState('');
  const [saved,setSaved] = useState(()=>{try{return JSON.parse(localStorage.getItem(projectStorageKey)||'[]')}catch{return []}});
  const [pdfText,setPdfText] = useState('');
  const [pdfName,setPdfName] = useState('');
  const [pdfSummary,setPdfSummary] = useState('');
  const [pdfBusy,setPdfBusy] = useState(false);
  const saveProject = (title,type,body) => {
    const next=[{id:Date.now(),title,type,body,created:new Date().toLocaleString()} ,...saved];
    setSaved(next); localStorage.setItem(projectStorageKey,JSON.stringify(next)); onNotice('Project saved on this device.');
  };
  const generateActualImage = async () => {
    const prompt=imagePrompt.trim();
    if(!prompt){onNotice('Pehla image da idea likho.');return;}
    if(prompt.length>1800){onNotice('Prompt nu 1800 characters ton ghatt rakho.');return;}
    setImageBusy(true);
    try {
      const response=await fetch('/api/image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
      if(!response.ok){let message='Image generation failed.';try{message=(await response.json()).error||message}catch{}throw new Error(message);}
      const blob=await response.blob();
      if(!blob.type.startsWith('image/')) throw new Error('Model did not return an image. Please try again.');
      const url=URL.createObjectURL(blob);
      setGeneratedImage(url);setImageHistory(prev=>[{id:Date.now(),prompt,url},...prev].slice(0,8));
    } catch(e){onNotice('Image generate nahi hoi: '+e.message);}
    finally{setImageBusy(false);}
  };
  const askAI = async (prompt, history=[], imageData=null) => {
    const response = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,history,...(imageData?{imageData}:{})})});
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||'AI service is temporarily unavailable.');
    return data.text||'I could not create a response. Please try again.';
  };
  const send = async () => {
    const q=input.trim(); if((!q&&!attachedImage)||busy)return;
    const userText=q||'Please analyze this image and tell me what you see.';
    const next=[...messages,{role:'user',text:userText,attachedImage:attachedImage?.dataUrl||undefined}];
    const imageToSend=attachedImage;
    setMessages(next); setInput(''); setAttachedImage(null); if(imageFileRef.current) imageFileRef.current.value=''; setBusy(true);
    try {
      if (imageToSend) {
        const answer=await askAI(userText,next.slice(-11,-1).map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.text})),imageToSend.dataUrl);
        const final=[...next,{role:'assistant',text:answer}]; setMessages(final);
        try { localStorage.setItem(chatStorageKey,JSON.stringify(final.map(({attachedImage,...m})=>m))); } catch {}
      } else {
      const wantsImage = /\b(generate|create|make|draw|render|paint|illustrate|design)\b.{0,180}\b(image|picture|photo|photograph|artwork|illustration|wallpaper|portrait|logo|poster|thumbnail|cover|background|scene)\b|\b(image|picture|photo|photograph|artwork|illustration|wallpaper|portrait|logo|poster|thumbnail|cover|background|scene)\b.{0,180}\b(generate|create|make|draw|render|paint|illustrate|design)\b|\b(photorealistic|photo realistic|realistic photo|cinematic photo|genuine[- ]looking|wildlife photograph|wildlife photo|unedited photograph|realistic photograph|professional wildlife|actual photograph|documentary photography|image generator|generate an image|make a poster image|make it look real|realistic image|create an image|generate image|generate a picture|create a picture|make a picture|draw me|show me an image|visualize this)\b|^\s*(please\s+)?(a|an)\s+(real|realistic|photorealistic|cinematic|cartoon|anime|3d|white lion|black lion|golden-hour|beautiful village|highly detailed)\b|\bfrom\s+[A-Z].{0,80}\b(white hair|black hair|blindfold|cursed energy|anime illustration|dynamic pose|spiky hair)\b|\b(anime|manga|dragon ball|son goku|goku|gojo satoru|ultra instinct|anime style|cel[- ]shading|hand-drawn 2d)\b/i.test(q);
      if (wantsImage) {
        const response = await fetch('/api/image', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:q})});
        if (!response.ok) {
          let message='Image generation failed.';
          try { message=(await response.json()).error||message; } catch {}
          throw new Error(message);
        }
        const blob=await response.blob();
        if (!blob.type.startsWith('image/')) throw new Error('Image model did not return an image.');
        const url=URL.createObjectURL(blob);
        const final=[...next,{role:'assistant',text:'I generated this image from your request.',image:url}];
        setMessages(final);
        // Blob URLs only live in this browser session; persist text history without broken image URLs.
        try { localStorage.setItem(chatStorageKey,JSON.stringify(final.map(({image,...m})=>m))); } catch {}
      } else {
        const answer=await askAI(q,next.slice(-11,-1).map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.text})));
        const final=[...next,{role:'assistant',text:answer}]; setMessages(final); localStorage.setItem(chatStorageKey,JSON.stringify(final));
      }
      }
    } catch(e) {
      const final=[...next,{role:'assistant',text:'I could not complete that request: '+e.message+' Please try again or open Image Generator.'}];
      setMessages(final); localStorage.setItem(chatStorageKey,JSON.stringify(final));
    } finally {setBusy(false);}
  };
  const makeScript = async () => {
    if(!topic.trim()){onNotice('Pehla video da topic likho.');return;}
    setBusy(true);
    try {
      const prompt='You are a professional Punjabi/Hinglish short-video scriptwriter. Create a ready-to-record '+platform+' script about: '+topic+'. Use natural spoken Punjabi in Gurmukhi only if user requested it, otherwise Punjabi written in Roman script. Include a strong curiosity hook, specific helpful points, scene/visual suggestions, voiceover, timing and a non-pushy CTA. For Instagram Reel target 30 seconds with 0-3 sec hook, 3-22 sec main, 22-30 sec CTA. Avoid generic filler. Never invent medical or financial guarantees; qualify claims. Return polished script only.';
      setScript(await askAI(prompt));
    } catch(e){setScript('Could not reach AI right now: '+e.message);}
    finally{setBusy(false);}
  };
  const searchImages = async () => {
    if(!imageQuery.trim()){onNotice('Image search layi topic likho.');return;}
    setBusy(true);
    try {
      const url='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent('filetype:bitmap '+imageQuery)+'&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=640&format=json&origin=*';
      const r=await fetch(url); const data=await r.json();
      const items=Object.values(data.query?.pages||{}).map(p=>({title:p.title.replace(/^File:/,''),url:p.imageinfo?.[0]?.thumburl||p.imageinfo?.[0]?.url,source:p.imageinfo?.[0]?.descriptionurl,license:p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value||'Check license'})).filter(x=>x.url);
      setImageResults(items); if(!items.length)onNotice('Koi result nahi milya. Search terms badal ke try karo.');
    } catch(e){onNotice('Image search filhaal available nahi. Internet connection check karo.');}
    finally{setBusy(false);}
  };
  const downloadPoster = async () => {
    const canvas=document.createElement('canvas'); canvas.width=1080; canvas.height=1350;
    const ctx=canvas.getContext('2d');
    const palettes={violet:['#160d2c','#673de6','#d8c9ff'],blue:['#061d37','#0879b8','#c5edff'],pink:['#3a0b2c','#d83c88','#ffe0ef']};
    const c=palettes[posterStyle]||palettes.violet;
    const grad=ctx.createLinearGradient(0,0,1080,1350);grad.addColorStop(0,c[0]);grad.addColorStop(1,c[1]);ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1350);
    if(posterImage){try{const im=new Image();im.crossOrigin='anonymous';im.src=posterImage;await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject});ctx.globalAlpha=.24;ctx.drawImage(im,0,0,1080,1350);ctx.globalAlpha=1;}catch{}}
    ctx.fillStyle='#ffffff18';ctx.beginPath();ctx.arc(900,160,270,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=c[2];ctx.font='bold 28px Arial';ctx.fillText('✦ MAKARH CREATIVE',72,100);
    ctx.fillStyle='#ffffff';ctx.font='bold 84px Arial';
    const words=(posterTitle||'Your headline').split(' ');let lines=[],line='';
    words.forEach(w=>{const test=line?line+' '+w:w;if(ctx.measureText(test).width>900&&line){lines.push(line);line=w}else line=test});if(line)lines.push(line);
    let y=470-(lines.length-1)*52;lines.slice(0,4).forEach(t=>{ctx.fillText(t,72,y);y+=100});
    ctx.fillStyle='#ffffff';ctx.globalAlpha=.92;ctx.font='38px Arial';
    const sub=(posterSub||'Your message').split(' ');let sl=[],st='';sub.forEach(w=>{const test=st?st+' '+w:w;if(ctx.measureText(test).width>850&&st){sl.push(st);st=w}else st=test});if(st)sl.push(st);
    sl.slice(0,4).forEach(t=>{ctx.fillText(t,76,y+40);y+=55});ctx.globalAlpha=1;
    ctx.fillStyle='#ffffff';ctx.font='bold 24px Arial';ctx.fillText('MAKARH AI  •  CREATE SOMETHING GREAT',72,1270);
    const a=document.createElement('a');a.download='makarh-poster.png';a.href=canvas.toDataURL('image/png');a.click();
  };
  const readFile = async file => {
    setPdfName(file.name);setPdfText('');setPdfSummary('');
    try {
      if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){
        const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
        const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
        let text=''; for(let n=1;n<=pdf.numPages;n++){const page=await pdf.getPage(n);const c=await page.getTextContent();text+='\\n\\n--- Page '+n+' ---\\n'+c.items.map(i=>i.str).join(' ');}
        setPdfText(text.trim()||'No selectable text found. This PDF may be scanned images.');
      } else {setPdfText(await file.text());}
    } catch(e){setPdfText('Could not read this file. It may be password-protected or scanned. Details: '+e.message);}
  };
  const summarizePDF = async () => {
    if(!pdfText.trim()){onNotice('Pehla file upload karo.');return;}
    setPdfBusy(true);
    try{setPdfSummary(await askAI('Summarize this document in clear Punjabi/Hinglish. Give key points, important dates/numbers and action items. Do not make up missing information. Document text:\\n'+pdfText.slice(0,24000)));}
    catch(e){setPdfSummary('AI summary unavailable: '+e.message);}
    finally{setPdfBusy(false);}
  };
  const toolHeader = <div className="tool-head"><div><div className="eyebrow"><span className="status-dot"/> MAKARH AI WORKSPACE</div><h1>{active}</h1><p className="subtitle">Create, edit, and save useful work. Projects are stored locally on this device.</p></div><button className="primary-button" onClick={onBack}><ArrowRight size={16}/> Overview</button></div>;
  if(active==='Image Generator') return <section className="tool-page">{toolHeader}<div className="tool-grid"><div className="tool-card"><h2>Real AI Image Generator</h2><p className="tool-help">Apna idea likho te Makarh AI actual image generate karega. Eh prompt-only tool nahi hai.</p><label className="tool-label">Describe the image you want<textarea className="tool-textarea image-prompt-input" value={imagePrompt} onChange={e=>setImagePrompt(e.target.value)} placeholder="Describe subject, setting, lighting, camera style, mood and details..." maxLength={1800}/></label><div className="tool-help">Tip: subject + location + lighting + style + details likho for better results.</div><button className="primary-button" disabled={imageBusy} onClick={generateActualImage}><Sparkles size={16}/>{imageBusy?'Generating real image…':'Generate actual image'}</button>{imageBusy&&<p className="tool-help">Image model is working. This can take a little time.</p>}<p className="tool-help">Powered by Cloudflare Workers AI FLUX.2 dev. Usage has a daily free allocation; heavy use may hit limits.</p></div><div className="tool-card image-output-card"><h2>Generated image</h2>{generatedImage?<><img className="generated-image" src={generatedImage} alt="AI-generated result"/><a className="primary-button download-image-button" href={generatedImage} download="makarh-ai-image.jpg">Download image</a><button className="secondary-button" onClick={()=>saveProject('AI Image','Image Generator',imagePrompt)}>Save prompt to projects</button></>:<div className="image-empty"><ImageIcon size={46}/><strong>Your actual image will appear here</strong><span>Write a prompt and tap Generate actual image.</span></div>}</div></div>{imageHistory.length>1&&<div className="tool-card image-history-card"><h2>Recent generations</h2><div className="image-history-grid">{imageHistory.map(item=><button key={item.id} className="history-image" onClick={()=>{setGeneratedImage(item.url);setImagePrompt(item.prompt)}}><img src={item.url} alt="Generated image preview"/><span>{item.prompt}</span></button>)}</div></div>}</section>;
  if(active==='AI Studio') return <section className="tool-page">{toolHeader}<div className="tool-card"><div className="tool-card-title"><MessageSquareText size={20}/><div><h2>Makarh AI Chat</h2><p>AI assistant for writing, ideas, explanations and practical tasks.</p></div><button className="secondary-button" onClick={()=>{setActive('Image Generator')}}><ImageIcon size={16}/> Open Image Generator</button><span className="tag violet">AI CONNECTED</span></div><div className="chat-log">{messages.length?messages.map((m,i)=><div key={i} className={'chat-bubble '+m.role}><b>{m.role==='user'?'You':'Makarh AI'}</b><p>{m.text}</p>{m.attachedImage&&<img className="chat-generated-image" src={m.attachedImage} alt="Attached by user"/>}{m.image&&<><img className="chat-generated-image" src={m.image} alt="AI generated image"/><a className="primary-button download-image-button" href={m.image} download="makarh-ai-image.jpg">Download image</a></>}</div>):<div className="empty-state">Sat sri akaal! Ask a question, request a script, or get help with a task.</div>}{busy&&<div className="chat-bubble assistant"><b>Makarh AI</b><p>Thinking…</p></div>}</div><div className="chat-compose">{attachedImage&&<div className="attached-image-preview"><img src={attachedImage.dataUrl} alt="Image ready to send"/><button type="button" onClick={()=>{setAttachedImage(null);if(imageFileRef.current)imageFileRef.current.value='';}}>Remove</button></div>}<input ref={imageFileRef} type="file" accept="image/*" hidden onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){onNotice('Image must be 5 MB or smaller.');e.target.value='';return;}const reader=new FileReader();reader.onload=()=>setAttachedImage({name:file.name,dataUrl:String(reader.result)});reader.readAsDataURL(file);}}/><button type="button" className="secondary-button" aria-label="Attach photo" title="Attach a photo" onClick={()=>imageFileRef.current?.click()}><Plus size={19}/></button><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()} placeholder="Ask Makarh AI anything…"/><button className="primary-button" disabled={busy||(!input.trim()&&!attachedImage)} onClick={send}>{busy?'Thinking…':'Send'} <ArrowRight size={15}/></button></div><div className="button-row"><button className="primary-button" onClick={()=>{setMessages([]);localStorage.removeItem(chatStorageKey);setInput('');onNotice('New chat started.');}}>＋ New Chat</button><button className="text-link" onClick={()=>{setMessages([]);localStorage.removeItem(chatStorageKey);}}>Clear chat</button></div></div></section>;
  if(active==='Video Scripts') return <section className="tool-page">{toolHeader}<div className="tool-card"><h2>Professional Video Script Studio</h2><p className="tool-help">AI creates a tailored script with hook, voiceover, scenes, timing and CTA—not a generic template.</p><label className="tool-label">Video topic<input className="tool-input" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Ayurveda daily habits, furniture sale"/></label><label className="tool-label">Format<select className="tool-input" value={platform} onChange={e=>setPlatform(e.target.value)}><option>Instagram Reel</option><option>YouTube video</option><option>Facebook video ad</option></select></label><button className="primary-button" disabled={busy} onClick={makeScript}><Sparkles size={16}/>{busy?'Writing…':'Generate professional script'}</button>{script&&<div className="generated-output"><pre>{script}</pre><button className="primary-button" onClick={()=>saveProject(topic+' script','Video Scripts',script)}>Save project</button><button className="secondary-button" onClick={()=>navigator.clipboard?.writeText(script).then(()=>onNotice('Script copied.')).catch(()=>onNotice('Copy is not supported.'))}>Copy script</button></div>}</div></section>;
  if(active==='Poster Maker') return <section className="tool-page">{toolHeader}<div className="tool-grid"><div className="tool-card"><h2>Poster Maker</h2><p className="tool-help">Design a poster, add a real reference image, then download a PNG.</p><label className="tool-label">Main heading<input className="tool-input" value={posterTitle} onChange={e=>setPosterTitle(e.target.value)}/></label><label className="tool-label">Subtitle<input className="tool-input" value={posterSub} onChange={e=>setPosterSub(e.target.value)}/></label><label className="tool-label">Theme<select className="tool-input" value={posterStyle} onChange={e=>setPosterStyle(e.target.value)}><option value="violet">Purple glow</option><option value="blue">Ocean blue</option><option value="pink">Pink festival</option></select></label><button className="primary-button" onClick={downloadPoster}>Download poster PNG</button><button className="secondary-button" onClick={()=>saveProject(posterTitle+' poster','Poster Maker',posterTitle+'\\n'+posterSub+'\\nTheme: '+posterStyle+'\\nImage: '+posterImage)}>Save poster project</button><hr/><h3>Find real images</h3><div className="chat-compose"><input value={imageQuery} onChange={e=>setImageQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchImages()} placeholder="Search e.g. herbal plants, shop interior"/><button className="primary-button" disabled={busy} onClick={searchImages}>Search</button></div><p className="tool-help">Images from Wikimedia Commons. Check each image's license before commercial use.</p><div className="image-results">{imageResults.map((im,i)=><button className={'image-result '+(posterImage===im.url?'selected':'')} key={im.url+i} onClick={()=>setPosterImage(im.url)}><img src={im.url} alt={im.title} loading="lazy"/><span>{im.title}</span><small>{im.license}</small></button>)}</div></div><div className={'poster-preview '+posterStyle} style={posterImage?{backgroundImage:'linear-gradient(135deg,rgba(12,8,26,.82),rgba(20,12,42,.62)),url('+posterImage+')',backgroundSize:'cover',backgroundPosition:'center'}:{}}><div className="poster-brand">✦ MAKARH CREATIVE</div><h2>{posterTitle||'Your headline'}</h2><p>{posterSub||'Your subtitle goes here'}</p><div className="poster-stamp">MAKE IT<br/>MEMORABLE</div></div></div></section>;
  if(active==='PDF Tools') return <section className="tool-page">{toolHeader}<div className="tool-card"><h2>PDF & Document Tools</h2><p className="tool-help">Upload a text file or selectable-text PDF to extract, edit, copy and summarize its contents with AI.</p><label className="tool-label">Choose PDF or text file<input className="tool-input" type="file" accept=".pdf,.txt,text/plain,application/pdf" onChange={e=>{const file=e.target.files?.[0];if(file)readFile(file)}}/></label>{pdfName&&<><p className="tool-help">File: {pdfName}</p><textarea className="tool-textarea" value={pdfText} onChange={e=>setPdfText(e.target.value)}/><div className="button-row"><button className="primary-button" onClick={summarizePDF} disabled={pdfBusy||busy}>{pdfBusy||busy?'Summarizing…':'Summarize with AI'}</button><button className="secondary-button" onClick={()=>navigator.clipboard?.writeText(pdfText).then(()=>onNotice('Document text copied.'))}>Copy text</button><button className="secondary-button" onClick={()=>saveProject(pdfName,'PDF/Text Document',pdfText)}>Save text</button></div>{pdfSummary&&<div className="generated-output"><h3>AI Summary</h3><pre>{pdfSummary}</pre><button className="secondary-button" onClick={()=>navigator.clipboard?.writeText(pdfSummary)}>Copy summary</button></div>}</>}</div><p className="tool-help">Note: scanned/image-only PDFs may need OCR, which is not enabled in this version.</p></section>;
  if(active==='My Projects') return <section className="tool-page">{toolHeader}<div className="tool-card"><h2>Saved projects</h2>{saved.length?saved.map(p=><article className="saved-project" key={p.id}><div><strong>{p.title}</strong><small>{p.type} · {p.created}</small><p>{p.body}</p></div><button className="secondary-button" onClick={()=>{const next=saved.filter(x=>x.id!==p.id);setSaved(next);localStorage.setItem(projectStorageKey,JSON.stringify(next))}}>Delete</button></article>):<div className="empty-state">No saved projects yet. Create a script or poster and tap Save.</div>}</div></section>;
  if(active==='Settings') return <section className="tool-page">{toolHeader}<div className="tool-card"><h2>Workspace settings</h2><p className="tool-help">Projects and chat history are stored locally in this browser, not synced between devices.</p><button className="secondary-button" onClick={()=>{if(confirm('Delete all locally saved Makarh projects and chat?')){localStorage.removeItem(projectStorageKey);localStorage.removeItem(chatStorageKey);setSaved([]);setMessages([]);onNotice('Local workspace data cleared.')}}}>Clear local workspace data</button></div></section>;
  return <section className="placeholder-page">{toolHeader}<button className="primary-button" onClick={onBack}>Back to overview</button></section>;
}
function WorkspaceApp({username}) {
  const [active, setActive] = useState('Overview');
  const [query, setQuery] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const filteredServices = services.filter(s => (s.title + ' ' + s.desc).toLowerCase().includes(query.toLowerCase()));
  const filteredProjects = projects.filter(p => (p.name + ' ' + p.type).toLowerCase().includes(query.toLowerCase()));
  const selectService = (title) => { const route = title === 'AI Chat' || title === 'Explore tools' || title === 'New project' ? 'AI Studio' : title === 'Poster Studio' ? 'Poster Maker' : title; setActive(route); setNotice(''); };

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
        </> : <FunctionalWorkspace key={username} username={username} active={active} onBack={()=>setActive('Overview')} onNotice={setNotice}/>}
      </div>
    </main>
  </div>;
}
function AuthScreen(){
 const [mode,setMode]=React.useState('signup'),[username,setUsername]=React.useState(''),[password,setPassword]=React.useState(''),[busy,setBusy]=React.useState(false),[error,setError]=React.useState('');
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/auth/'+(mode==='signup'?'signup':'login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});const d=await r.json();if(!r.ok)throw new Error((d.error||'Could not continue.')+(d.detail?' ('+d.detail+')':''));window.location.reload()}catch(e){setError(e.message)}finally{setBusy(false)}};
 return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:20,background:'radial-gradient(ellipse at top,#2b1b50,#0b0b14 65%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}><form onSubmit={submit} style={{width:'min(100%,420px)',padding:28,border:'1px solid #ffffff20',borderRadius:24,background:'#151321',boxShadow:'0 24px 90px #0008'}}><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}><div style={{width:44,height:44,display:'grid',placeItems:'center',borderRadius:14,background:'linear-gradient(135deg,#8b5cf6,#ec4899)',fontSize:24}}>✦</div><div><div style={{fontSize:24,fontWeight:800}}>makarh<span style={{color:'#b69cff'}}>.ai</span></div><div style={{fontSize:11,letterSpacing:2,color:'#aaa'}}>SERVICES HUB</div></div></div><h1 style={{fontSize:28,margin:'0 0 8px'}}>{mode==='signup'?'Create your account':'Welcome back'}</h1><p style={{color:'#b7b4c7',margin:'0 0 24px'}}>Use a Makarh username and password. No Gmail needed.</p><label style={{display:'block',fontSize:13,marginBottom:7}}>Username</label><input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" placeholder="e.g. Rahul123" style={{width:'100%',boxSizing:'border-box',padding:14,borderRadius:12,border:'1px solid #383447',background:'#0f0e18',color:'white',marginBottom:16}}/><label style={{display:'block',fontSize:13,marginBottom:7}}>Password</label><input autoComplete={mode==='signup'?'new-password':'current-password'} type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode==='signup'?8:1} maxLength={128} placeholder={mode==='signup'?'At least 8 characters':'Your password'} style={{width:'100%',boxSizing:'border-box',padding:14,borderRadius:12,border:'1px solid #383447',background:'#0f0e18',color:'white',marginBottom:14}}/>{error&&<p role="alert" style={{color:'#ff9b9b',fontSize:13}}>{error}</p>}<button disabled={busy} style={{width:'100%',padding:14,border:0,borderRadius:12,background:'linear-gradient(90deg,#7955e8,#b34de0)',color:'#fff',fontWeight:700,fontSize:15,opacity:busy?.7:1}}>{busy?'Please wait…':mode==='signup'?'Create account':'Log in'}</button><p style={{textAlign:'center',color:'#b7b4c7',fontSize:14,marginTop:20}}>{mode==='signup'?'Already have an account?':'New to Makarh AI?'} <button type="button" onClick={()=>{setMode(mode==='signup'?'login':'signup');setError('')}} style={{background:'none',border:0,color:'#c4b5fd',fontWeight:700,cursor:'pointer'}}>{mode==='signup'?'Log in':'Create account'}</button></p><p style={{fontSize:11,color:'#777387',lineHeight:1.5}}>Create a Makarh AI account only. Never use your Gmail password here. Passwords are stored as a salted hash.</p></form></div>;
}
function AdminPanel({onBack}){
 const [users,setUsers]=React.useState([]),[error,setError]=React.useState(''),[loading,setLoading]=React.useState(true);
 React.useEffect(()=>{fetch('/api/admin/users').then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to load admin panel');setUsers(d.users||[])}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 return <div style={{padding:24,color:'#fff',background:'#11101a',minHeight:'100vh',fontFamily:'Inter,system-ui,sans-serif'}}><button onClick={onBack} style={{padding:'10px 14px',borderRadius:10,marginBottom:18}}>← Back</button><h1>Makarh AI — Admin</h1><p style={{color:'#b7b4c7'}}>Registered usernames and image-generation usage.</p>{loading?<p>Loading…</p>:error?<p style={{color:'#ff9b9b'}}>{error}</p>:<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',background:'#1b1928'}}><thead><tr>{['Username','Registered','Last login','Images generated'].map(x=><th key={x} style={{padding:12,textAlign:'left',borderBottom:'1px solid #393548'}}>{x}</th>)}</tr></thead><tbody>{users.map(u=><tr key={u.username}>{[u.username,u.created_at,u.last_login_at,u.image_count].map((x,i)=><td key={i} style={{padding:12,borderBottom:'1px solid #302d3e'}}>{x}</td>)}</tr>)}</tbody></table></div>}</div>;
}
export default function App(){
 const [user,setUser]=React.useState(undefined),[admin,setAdmin]=React.useState(false);
 React.useEffect(()=>{fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.user||null)).catch(()=>setUser(null))},[]);
 const logout=async()=>{await fetch('/api/auth/logout',{method:'POST'});window.location.reload()};
 if(user===undefined)return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#11101a',color:'#fff'}}>Loading Makarh AI…</div>;
 if(!user)return <AuthScreen/>;
 if(admin)return <AdminPanel onBack={()=>setAdmin(false)}/>;
 return <><div style={{position:'fixed',zIndex:1000,right:12,top:12,display:'flex',gap:8,alignItems:'center',background:'#171525',border:'1px solid #ffffff25',borderRadius:12,padding:'8px 10px',color:'#fff',fontSize:12}}><span>Signed in as <b>{user.username}</b></span>{user.isAdmin&&<button onClick={()=>setAdmin(true)} style={{border:0,borderRadius:8,padding:'7px 10px',cursor:'pointer'}}>Admin panel</button>}<button onClick={logout} style={{border:0,borderRadius:8,padding:'7px 10px',cursor:'pointer'}}>Log out</button></div><WorkspaceApp username={user.username}/></>;
}
