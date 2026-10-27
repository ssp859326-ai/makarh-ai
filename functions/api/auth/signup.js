const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
const enc=new TextEncoder();
async function hashPassword(password,saltHex){
 const salt=saltHex?Uint8Array.from(saltHex.match(/../g).map(x=>parseInt(x,16))):crypto.getRandomValues(new Uint8Array(16));
 const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);
 const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:100000,hash:"SHA-256"},key,256);
 return {salt:[...salt].map(x=>x.toString(16).padStart(2,"0")).join(""),hash:[...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,"0")).join("")};
}
function randomToken(){return [...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function digest(s){const b=await crypto.subtle.digest("SHA-256",enc.encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
export async function onRequestPost({request,env}){
 try{
  if(!env.DB)return json({error:"Account database is not configured."},503);
  const b=await request.json(),username=String(b.username||"").trim(),password=String(b.password||"");
  if(!/^[a-zA-Z0-9_]{3,20}$/.test(username))return json({error:"Username must be 3–20 characters and use only letters, numbers, or underscore."},400);
  if(password.length<8||password.length>128)return json({error:"Password must be 8–128 characters."},400);
  const lower=username.toLowerCase();
  const existing=await env.DB.prepare("SELECT username FROM auth_users WHERE username_lower=?").bind(lower).first();
  if(existing)return json({error:"That username is already taken. Choose another."},409);
  const {salt,hash}=await hashPassword(password);
  const isAdmin=false;
  await env.DB.prepare("INSERT INTO auth_users (username,username_lower,password_salt,password_hash,is_admin,created_at,last_login_at) VALUES (?,?,?,?,?,datetime('now'),datetime('now'))").bind(username,lower,salt,hash,isAdmin?1:0).run();
  const token=randomToken(),tokenHash=await digest(token);
  await env.DB.prepare("INSERT INTO auth_sessions (token_hash,user_id,expires_at,created_at) VALUES (?,(SELECT id FROM auth_users WHERE username_lower=?),datetime('now','+7 days'),datetime('now'))").bind(tokenHash,lower).run();
  return new Response(JSON.stringify({ok:true,user:{username,isAdmin}}),{status:201,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Set-Cookie":"makarh_session="+token+"; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800"}});
 }catch(e){return json({error:"Could not create account. Please try again.",detail:String(e?.message||e).slice(0,120)},500)}
}