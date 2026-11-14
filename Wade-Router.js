/* WADE Hub - Vanilla Hash Router (GitHub Pages safe)
   Drop-in: <script src="router.js"></script> just before </body>
   No dependencies. No Supabase changes. No redesign.
   Routes:
     #/refund
     #/refund/calculator  #/refund/formula  #/refund/history
     #/compensation
     #/compensation/driver  #/compensation/customer
     #/compensation/driver/<case>  #/compensation/customer/<case>
     #/chat
     #/chat/assistant  #/chat/scripts  #/chat/favorites  #/chat/history
   Unknown -> #/404
*/
(function(){
  "use strict";
  var ROUTES = [
    {re:/^#\/?$/, to:"#\/refund"},
    {re:/^#\/refund\/?$/, tab:"refund"},
    {re:/^#\/refund\/(calculator|formula|history)\/?$/, tab:"refund", sub:1},
    {re:/^#\/compensation\/?$/, tab:"compensation"},
    {re:/^#\/compensation\/(driver|customer)\/?$/, tab:"compensation", sub:1},
    {re:/^#\/compensation\/(driver|customer)\/(.+)$/, tab:"compensation", sub:1, param:2},
    {re:/^#\/chat\/?$/, tab:"chat"},
    {re:/^#\/chat\/(assistant|scripts|favorites|history)\/?$/, tab:"chat", sub:1},
    {re:/^#\/404\/?$/, tab:"404"}
  ];
  function norm(h){ if(!h) return "#/refund"; if(h.charAt(0)!=="#") h="#"+h; return h; }
  function match(h){
    for(var i=0;i<ROUTES.length;i++){
      var m=h.match(ROUTES[i].re);
      if(m) return {route:ROUTES[i], m:m};
    }
    return null;
  }
  // --- Find your existing controls by visible text (no markup changes needed) ---
  function buttons(){ return Array.prototype.slice.call(document.querySelectorAll("button, a, [role='tab'], [data-tab]")); }
  function findBtn(text){
    var t=text.toLowerCase().trim();
    return buttons().find(function(b){
      var txt=(b.textContent||"").toLowerCase().replace(/\s+/g," ").trim();
      return txt.indexOf(t)!==-1 || (b.getAttribute("data-tab")||"").toLowerCase()===t || (b.getAttribute("aria-label")||"").toLowerCase()===t;
    });
  }
  function clickEl(el){ if(!el) return; el.click(); }
  function setActive(){
    var h=norm(location.hash);
    document.querySelectorAll("[data-route]").forEach(function(el){
      var r=el.getAttribute("data-route");
      el.classList.toggle("active", r && h.indexOf(r)===0);
      if(el.classList.contains("active")) el.setAttribute("aria-current","page"); else el.removeAttribute("aria-current");
    });
  }
  function apply(){
    var h=norm(location.hash);
    // Redirect root -> default
    if(h==="#/" || h==="#"){ history.replaceState(null,"", "#/refund"); h="#/refund"; }
    var found=match(h);
    if(!found){ if(h!=="#/404"){ history.replaceState(null,"", "#/404"); } show404(); setActive(); return; }
    var r=found.route, m=found.m;
    hide404();
    try{
      if(r.tab==="refund"){ clickEl(findBtn("Refund Calculator")); if(r.sub) clickEl(findBtn(m[1])); }
      else if(r.tab==="compensation"){ clickEl(findBtn("Compensation")); if(r.sub) clickEl(findBtn(m[1]==="driver"?"Driver Compensation":"Customer Compensation")); }
      else if(r.tab==="chat"){ clickEl(findBtn("Chat Assistance")); if(r.sub) clickEl(findBtn(m[1])); }
    }catch(e){ console.warn("[router]", e); }
    setActive();
    // Keep scroll: do not jump on tab change
  }
  function show404(){
    var el=document.getElementById("route-404");
    if(!el){ el=document.createElement("div"); el.id="route-404"; el.style.cssText="max-width:640px;margin:80px auto;padding:32px;text-align:center;font-family:inherit"; el.innerHTML="<h1>404 — Page not found</h1><p>The link you followed does not exist.</p><p><a href='#/refund'>Go to Refund Calculator</a> · <a href='#/compensation'>Go to Compensation</a> · <a href='#/chat'>Go to Chat Assistance</a></p>"; document.body.appendChild(el); }
    el.style.display="block";
  }
  function hide404(){ var el=document.getElementById("route-404"); if(el) el.style.display="none"; }
  function navigate(hash){
    hash=norm(hash);
    if(location.hash!==hash) location.hash=hash; else apply();
  }
  // Intercept clicks on your existing tabs / sidebar / internal links
  document.addEventListener("click", function(e){
    var a=e.target.closest && e.target.closest("a[href^='#']");
    if(a){ var href=a.getAttribute("href"); if(href && href.length>1){ e.preventDefault(); navigate(href); } return; }
    // Map known button labels -> routes (works even without data-route attributes)
    var btn=e.target.closest && e.target.closest("button, [role='tab']");
    if(!btn) return;
    var txt=(btn.textContent||"").toLowerCase();
    var target=null;
    if(/refund calculator/.test(txt)) target="#/refund";
    else if(/compensation/.test(txt) && !/driver/.test(txt) && !/customer/.test(txt)) target="#/compensation";
    else if(/chat assistance/.test(txt)) target="#/chat";
    else if(/driver compensation/.test(txt)) target="#/compensation/driver";
    else if(/customer compensation/.test(txt)) target="#/compensation/customer";
    else if(txt.trim()==="calculator") target="#/refund/calculator";
    else if(txt.trim()==="formula") target="#/refund/formula";
    else if(txt.trim()==="history") target = location.hash.indexOf("#/chat")===0 ? "#/chat/history" : "#/refund/history";
    else if(txt.trim()==="scripts") target="#/chat/scripts";
    else if(/favorites/.test(txt)) target="#/chat/favorites";
    else if(txt.trim()==="assistant") target="#/chat/assistant";
    if(target && location.hash!==target){ history.pushState(null,"",target); }
  }, true);
  window.addEventListener("hashchange", apply);
  window.addEventListener("popstate", apply);
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", apply);
  else setTimeout(apply, 0);
  // Expose for your own code / console testing: WADE_ROUTER.navigate("#/chat/scripts")
  window.WADE_ROUTER={navigate:navigate, routes:["#/refund","#/refund/calculator","#/refund/formula","#/refund/history","#/compensation","#/compensation/driver","#/compensation/customer","#/chat","#/chat/assistant","#/chat/scripts","#/chat/favorites","#/chat/history","#/404"]};
})();
