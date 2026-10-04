export const decodeHtml = value => value.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');

export function webSession(base) {
  const jar = new Map();
  const cookieHeaders = [];
  async function request(path, options = {}) {
    const cookie = [...jar].map(([key,value])=>`${key}=${value}`).join('; ');
    const response = await fetch(new URL(path,base), {redirect:'manual',signal:AbortSignal.timeout(30000),...options,headers:{...(cookie ? {Cookie:cookie} : {}),...options.headers}});
    for (const header of response.headers.getSetCookie()) {
      const first=header.split(';')[0], split=first.indexOf('='), key=first.slice(0,split), value=first.slice(split+1);
      if (/max-age=0(?:;|$)/i.test(header)||!value) jar.delete(key); else jar.set(key,value);
      cookieHeaders.push({name:key,persistent:/max-age=|expires=/i.test(header),secure:/;\s*secure(?:;|$)/i.test(header),httpOnly:/;\s*httponly(?:;|$)/i.test(header)});
    }
    return {status:response.status,location:response.headers.get('location')||response.headers.get('x-action-redirect')?.split(';')[0],text:await response.text(),headers:response.headers};
  }
  async function getForm(path, signature) {
    const page=await request(path);
    if (page.status!==200) throw new Error('Form page is not available to the current session');
    const forms=[...page.text.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map(match=>match[0]);
    const html=forms.find(signature);
    if (!html) throw new Error('Expected form not found');
    const hidden=[];
    for (const input of html.matchAll(/<input\b[^>]*>/g)) {
      if (!/type="hidden"/.test(input[0])) continue;
      const name=input[0].match(/name="([^"]*)"/)?.[1];
      const value=input[0].match(/value="([^"]*)"/)?.[1]||'';
      if (name) hidden.push([decodeHtml(name),decodeHtml(value)]);
    }
    if (!hidden.some(([name])=>name.startsWith('$ACTION_'))) throw new Error('Server Action form metadata missing');
    return {hidden,html,path};
  }
  async function postForm(source,values,options={}) {
    const data=new FormData();
    for (const [key,value] of source.hidden) data.append(key,value);
    for (const [key,value] of Object.entries(values)) {
      data.delete(key);
      if (value!==null&&value!==undefined) for (const item of Array.isArray(value)?value:[value]) data.append(key,String(item));
    }
    return request(options.path||source.path,{method:'POST',body:data,headers:{Origin:options.origin||new URL(base).origin}});
  }
  async function postAction(source,values,options={}) {
    const direct=source.hidden.find(([name])=>name.startsWith('$ACTION_ID_'));
    const metadata=source.hidden.find(([name,value])=>name.endsWith(':0')&&value.startsWith('{'));
    const id=direct?.[0].slice('$ACTION_ID_'.length)||JSON.parse(metadata[1]).id;
    const data=new FormData();
    data.append('0',JSON.stringify(direct?['$K1']:[{status:'idle',message:''},'$K1']));
    for(const [key,value] of source.hidden.filter(([name])=>!name.startsWith('$ACTION_')))data.append(`1_${key}`,value);
    for(const [key,value] of Object.entries(values)){data.delete(`1_${key}`);if(value!==null&&value!==undefined)for(const item of Array.isArray(value)?value:[value])data.append(`1_${key}`,String(item));}
    return request(options.path||'/',{method:'POST',body:data,headers:{Origin:options.origin||new URL(base).origin,'Next-Action':id,Accept:'text/x-component'}});
  }
  return {request,getForm,postForm,postAction,cookieHeaders,clearCookieEvidence:()=>{cookieHeaders.length=0;}};
}
