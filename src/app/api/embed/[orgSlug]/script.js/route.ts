import { type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await params
  const apiKey = request.nextUrl.searchParams.get('apiKey') ?? ''
  const domain = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')

  const iframeSrc =
    `${domain}/widget/${encodeURIComponent(orgSlug)}` +
    `?apiKey=${encodeURIComponent(apiKey)}`

  // IIFE: creates a floating iframe + toggle button, injected into the host page
  const script = `(function(){
  var src=${JSON.stringify(iframeSrc)};
  var open=false;

  var btn=document.createElement('button');
  btn.setAttribute('id','__ai-chat-btn');
  btn.setAttribute('aria-label','Apri chat');
  btn.textContent='\u{1F4AC}';
  btn.style.cssText='position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:#3b82f6;color:#fff;border:none;cursor:pointer;font-size:22px;z-index:2147483646;box-shadow:0 4px 14px rgba(0,0,0,.2);transition:transform .15s;';

  var frame=document.createElement('iframe');
  frame.setAttribute('id','__ai-chat-frame');
  frame.setAttribute('src',src);
  frame.setAttribute('allow','clipboard-write');
  frame.style.cssText='display:none;position:fixed;bottom:84px;right:20px;width:380px;height:580px;max-height:calc(100vh - 110px);border:none;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);z-index:2147483645;background:#fff;';

  btn.addEventListener('click',function(){
    open=!open;
    frame.style.display=open?'block':'none';
    btn.textContent=open?'×':'\u{1F4AC}';
    btn.setAttribute('aria-label',open?'Chiudi chat':'Apri chat');
  });

  document.body.appendChild(frame);
  document.body.appendChild(btn);
})();`

  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
