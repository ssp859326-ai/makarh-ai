const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
const enc=new TextEncoder();
async function digest(s){const b=await crypto.subtle.digest("SHA-256",enc.encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function verify(password,saltHex){const salt=Uint8Array.from(saltHex.match(/../g).map(x=>parseInt(x,16)));const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:100000,hash:"SHA-256"},key,256);return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,"0")).join("")}
export async function onRequestPost({request,env}){
 try{const b=await request.json(),username=String(b.username||"").trim().toLowerCase(),password=String(b.password||"");if(!username||!password)return json({error:"Enter username and password."},400);
 const u=await env.DB.prepare("SELECT id,username,password_salt,password_hash,is_admin FROM auth_users WHERE username_lower=?").bind(username).first();
 if(!u||await verify(password,u.password_salt)!==u.password_hash)return json({error:"Username or password is incorrect."},401);
 const token=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,"0")).join(""),tokenHash=await digest(token);
 await env.DB.prepare("INSERT INTO auth_sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,datetime('now','+7 days'),datetime('now'))").bind(tokenHash,u.id).run();
 await env.DB.prepare("UPDATE auth_users SET last_login_at=datetime('now') WHERE id=?").bind(u.id).run();
 return new Response(JSON.stringify({ok:true,user:{username:u.username,isAdmin:!!u.is_admin}}),{headers:{"Content-Type":"application/json","Cache-Control":"no-store","Set-Cookie":"makarh_session="+token+"; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800"}});
 }catch(e){return json({error:"Login failed. Please try again.",detail:String(e?.message||e).slice(0,120)},500)}
}