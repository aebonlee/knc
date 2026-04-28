import{s,T as c}from"./index-B_1dRd1c.js";async function h({userId:r,type:e,title:t,message:n,link:i}){if(s)try{await s.from(c.notifications).insert({user_id:r,type:e,title:t,message:n,link:i||null})}catch(a){console.error("알림 생성 실패:",a)}}async function g(r,e){if(!(!s||r.length===0))try{const t=r.map(n=>({user_id:n,type:e.type,title:e.title,message:e.message,link:e.link||null}));await s.from(c.notifications).insert(t)}catch(t){console.error("일괄 알림 생성 실패:",t)}}async function f(r){if(!s)return{success:!1,error:"Supabase 초기화 실패"};try{const{data:e,error:t}=await s.functions.invoke("send-email",{body:r});if(t)throw t;if(e?.error)throw new Error(e.error);return{success:!0}}catch(e){const t=e instanceof Error?e.message:String(e);return console.error("[notifications] sendEmail 오류:",t),{success:!1,error:t}}}async function m(r){if(!s)return{success:!1,error:"Supabase 초기화 실패"};try{const{data:e,error:t}=await s.functions.invoke("send-sms",{body:r});if(t)throw t;if(e?.error)throw new Error(e.error);if(!e?.success)throw new Error(e?.message||"SMS 발송 실패");return{success:!0}}catch(e){const t=e instanceof Error?e.message:String(e);return console.error("[notifications] sendSMS 오류:",t),{success:!1,error:t}}}function u(r){const{title:e,body:t}=r,n="산업안전 RBF",i="https://knc.dreamitbiz.com",a="#0F2B5B";return`<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr><td style="background:${a};padding:24px 32px;">
          <a href="${i}" style="color:#fff;font-size:20px;font-weight:700;text-decoration:none;">2026 ${n}</a>
        </td></tr>
        <tr><td style="padding:32px;color:#333;font-size:15px;line-height:1.7;">
          <h2 style="margin:0 0 20px;font-size:18px;color:#111;">${e}</h2>
          ${t}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#f9f9f9;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">
          본 메일은 발신 전용입니다. 문의: <a href="mailto:admin@dreamitbiz.com" style="color:${a};">admin@dreamitbiz.com</a><br>
          &copy; ${new Date().getFullYear()} DreamIT. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`}async function y(r){if(s)try{const{data:e}=await s.from(c.user_roles).select("user_id").in("role",["superadmin","manager"]);if(!e||e.length===0)return;const t=e.map(o=>o.user_id),{data:n}=await s.from("user_profiles").select("id, email, phone").in("id",t);if(!n)return;const i=n.map(o=>({email:o.email,phone:o.phone})),a=u({title:r.subject,body:r.htmlBody}),l=i.filter(o=>o.email).map(o=>f({to:o.email,subject:r.subject,html:a})),d=i.filter(o=>o.phone).map(o=>m({receiver:o.phone,message:r.smsMessage}));await Promise.allSettled([...l,...d])}catch(e){console.error("관리자 이메일/SMS 발송 실패:",e)}}export{y as a,u as b,h as c,g as n,f as s};
