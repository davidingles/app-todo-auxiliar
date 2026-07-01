(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const t of o)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function e(o){const t={};return o.integrity&&(t.integrity=o.integrity),o.referrerPolicy&&(t.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?t.credentials="include":o.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function a(o){if(o.ep)return;o.ep=!0;const t=e(o);fetch(o.href,t)}})();const B=`:root {\r
  color-scheme: dark;\r
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\r
  line-height: 1.5;\r
  font-weight: 400;\r
  --bg: #0f1115;\r
  --panel: #161920;\r
  --border: #242936;\r
  --text: #e2e8f0;\r
  --muted: #94a3b8;\r
  --pending: #64748b;\r
  --progress: #3b82f6;\r
  --done: #10b981;\r
  --cyan: #22d3ee;\r
  --orange: #f97316;\r
  --red: #ef4444;\r
  --black: #0f1115;\r
  --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);\r
}\r
\r
* {\r
  box-sizing: border-box;\r
}\r
\r
body {\r
  margin: 0;\r
  min-height: 100vh;\r
  background: linear-gradient(135deg, var(--bg), #11141c);\r
  color: var(--text);\r
}\r
\r
button,\r
input,\r
textarea,\r
select {\r
  font: inherit;\r
}\r
\r
button {\r
  cursor: pointer;\r
}\r
\r
.app-shell {\r
  min-height: 100vh;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 24px;\r
  max-width: 1400px;\r
  margin: 0 auto;\r
  padding: 24px;\r
}\r
\r
.topbar {\r
  display: flex;\r
  flex-direction: column;\r
  align-items: stretch;\r
  gap: 16px;\r
}\r
\r
.topbar > div {\r
  width: 100%;\r
}\r
\r
.topbar h1 {\r
  margin: 0;\r
  font-size: 1.35rem;\r
  font-weight: 600;\r
  color: var(--muted);\r
}\r
\r
.eyebrow {\r
  margin: 0 0 6px;\r
  color: var(--muted);\r
  text-transform: uppercase;\r
  letter-spacing: 0.16em;\r
  font-size: 0.7rem;\r
}\r
\r
h1,\r
h2,\r
p {\r
  margin: 0;\r
}\r
\r
.task-form {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  width: 100%;\r
  max-width: 100%;\r
  padding: 16px;\r
  background: var(--panel);\r
  border: 1px solid var(--border);\r
  border-radius: 12px;\r
  box-shadow: var(--shadow);\r
}\r
\r
.task-form input,\r
.task-form textarea,\r
.task-form button,\r
.task-status-select {\r
  border: 1px solid var(--border);\r
  background: #0f1115;\r
  color: var(--text);\r
  border-radius: 8px;\r
  padding: 10px 12px;\r
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\r
}\r
\r
.task-form button {\r
  background: linear-gradient(135deg, var(--progress), var(--done));\r
  border: none;\r
  font-weight: 600;\r
}\r
\r
.kanban {\r
  display: grid;\r
  grid-template-columns: repeat(4, minmax(0, 1fr));\r
  gap: 16px;\r
  flex: 1;\r
}\r
\r
.column {\r
  min-height: 0;\r
  background: var(--panel);\r
  border: 2px solid var(--border);\r
  border-radius: 12px;\r
  padding: 16px;\r
  box-shadow: var(--shadow);\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
}\r
\r
.column[data-status='pendiente'] {\r
  border-color: var(--cyan);\r
}\r
\r
.column[data-status='en_proceso'] {\r
  border-color: var(--orange);\r
}\r
\r
.column[data-status='completado'] {\r
  border-color: var(--red);\r
}\r
\r
.column[data-status='archivado'] {\r
  border-color: var(--black);\r
}\r
\r
.column-header {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
}\r
\r
.badge {\r
  font-size: 0.8rem;\r
  padding: 4px 8px;\r
  border-radius: 999px;\r
  background: rgba(255, 255, 255, 0.07);\r
  color: var(--muted);\r
}\r
\r
.task-list {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  flex: 1;\r
  min-height: 120px;\r
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\r
}\r
\r
.task-list.drag-over {\r
  background: rgba(34, 211, 238, 0.08);\r
  border-radius: 10px;\r
}\r
\r
.task-card {\r
  padding: 12px 12px 10px;\r
  border: 1px solid var(--border);\r
  background: #12151c;\r
  border-radius: 8px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\r
  border-left: 4px solid #94a3b8;\r
  position: relative;\r
  min-height: 64px;\r
}\r
\r
.task-card:hover {\r
  transform: translateY(-2px);\r
  border-color: #2f3645;\r
}\r
\r
.card-header {\r
  display: flex;\r
  align-items: flex-start;\r
  justify-content: space-between;\r
  gap: 10px;\r
}\r
\r
.task-card h3 {\r
  font-size: 0.92rem;\r
  font-weight: 600;\r
  line-height: 1.2;\r
  margin: 0;\r
}\r
\r
.task-card.dragging {\r
  transform: scale(1.02);\r
  box-shadow: var(--shadow);\r
  opacity: 0.92;\r
}\r
\r
.task-card.drag-over {\r
  background: rgba(255, 255, 255, 0.05);\r
  border-color: rgba(148, 163, 184, 0.9);\r
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.45);\r
}\r
\r
.card-actions {\r
  display: none;\r
}\r
\r
.task-status-select {\r
  width: 100%;\r
}\r
\r
.delete-btn {\r
  border: none;\r
  background: transparent;\r
  color: var(--muted);\r
  padding: 0;\r
  font-size: 1rem;\r
  position: absolute;\r
  top: 10px;\r
  right: 10px;\r
}\r
\r
.delete-btn:hover {\r
  color: #f87171;\r
}\r
\r
.hidden {\r
  display: none !important;\r
}\r
\r
.modal {\r
  position: fixed;\r
  inset: 0;\r
  display: grid;\r
  place-items: center;\r
  z-index: 50;\r
}\r
\r
.modal-backdrop {\r
  position: absolute;\r
  inset: 0;\r
  background: rgba(0, 0, 0, 0.65);\r
  backdrop-filter: blur(4px);\r
}\r
\r
.modal-content {\r
  position: relative;\r
  width: min(94vw, 420px);\r
  padding: 24px;\r
  border-radius: 16px;\r
  background: rgba(15, 17, 21, 0.96);\r
  border: 1px solid rgba(255, 255, 255, 0.08);\r
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);\r
  display: flex;\r
  flex-direction: column;\r
  gap: 18px;\r
}\r
\r
.modal-content h2 {\r
  margin: 0;\r
  font-size: 1.15rem;\r
}\r
\r
.modal-content p {\r
  color: var(--muted);\r
  line-height: 1.6;\r
}\r
\r
.field {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  color: var(--text);\r
}\r
\r
.field span {\r
  font-size: 0.92rem;\r
  color: var(--muted);\r
}\r
\r
.field input,\r
.field textarea {\r
  width: 100%;\r
  border: 1px solid var(--border);\r
  background: #0f1115;\r
  color: var(--text);\r
  border-radius: 10px;\r
  padding: 10px 12px;\r
}\r
\r
.modal-actions {\r
  display: flex;\r
  justify-content: flex-end;\r
  gap: 12px;\r
}\r
\r
.modal-actions button {\r
  min-width: 110px;\r
  padding: 10px 16px;\r
  border-radius: 10px;\r
  border: 1px solid var(--border);\r
  background: #11151a;\r
  color: var(--text);\r
  transition: all 0.2s ease;\r
}\r
\r
.modal-actions button:hover {\r
  transform: translateY(-1px);\r
  border-color: var(--progress);\r
}\r
\r
.modal-actions .danger {\r
  background: linear-gradient(135deg, #ef4444, #f97316);\r
  border-color: transparent;\r
}\r
\r
.modal-actions .danger:hover {\r
  filter: brightness(1.05);\r
}\r
\r
@media (max-width: 980px) {\r
  .topbar {\r
    flex-direction: column;\r
  }\r
\r
  .task-form {\r
    width: 100%;\r
  }\r
\r
  .kanban {\r
    grid-template-columns: 1fr;\r
    min-height: 0;\r
  }\r
}\r
`,T=document.createElement("style");T.textContent=B;document.head.appendChild(T);const y="http://127.0.0.1:3001/api/tasks",S=document.getElementById("task-form"),O=document.getElementById("task-title"),M=document.getElementById("task-description"),g={pendiente:document.querySelector('[data-status="pendiente"] .task-list'),en_proceso:document.querySelector('[data-status="en_proceso"] .task-list'),completado:document.querySelector('[data-status="completado"] .task-list'),archivado:document.querySelector('[data-status="archivado"] .task-list')};let p=[],b=null,x=null,h=null,m=null;function l(r){return p.filter(n=>n.status===r).sort((n,e)=>n.position-e.position)}function P(r){return Array.from(r.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(n=>{const e=n.getAttribute("aria-hidden")==="true"||n.hidden,a=n.disabled;return!e&&!a&&n.tabIndex!==-1})}function z(r){if(r.key!=="Tab")return;const n=document.querySelector(".modal:not(.hidden)");if(!n)return;const e=P(n);if(e.length===0)return;const a=e[0],o=e[e.length-1],t=r.shiftKey;t&&document.activeElement===a?(r.preventDefault(),o.focus()):!t&&document.activeElement===o&&(r.preventDefault(),a.focus())}function D(r){b=r;const n=document.getElementById("confirm-modal");n&&(m=document.activeElement,n.classList.remove("hidden"),n.setAttribute("aria-hidden","false"),requestAnimationFrame(()=>{const e=document.getElementById("cancel-delete");e&&e.focus()}))}function w(){b=null;const r=document.getElementById("confirm-modal");r&&(r.classList.add("hidden"),r.setAttribute("aria-hidden","true"),m&&typeof m.focus=="function"&&m.focus(),m=null)}function $(r){const n=p.find(a=>a.id===r);if(!n)return;h=r,document.getElementById("edit-task-title").value=n.title,document.getElementById("edit-task-description").value=n.description||"";const e=document.getElementById("edit-modal");e&&(e.classList.remove("hidden"),e.setAttribute("aria-hidden","false"),document.getElementById("edit-task-title").focus())}function k(){h=null;const r=document.getElementById("edit-modal");r&&(r.classList.add("hidden"),r.setAttribute("aria-hidden","true"))}function s(r){x=r,document.querySelectorAll(".task-card").forEach(n=>{const e=n.dataset.id===r;n.classList.toggle("is-selected",e),n.setAttribute("aria-selected",String(e))})}function E(){return["pendiente","en_proceso","completado","archivado"]}function j(r,n){const e=E(),a=e.indexOf(r);if(a===-1)return r;const o=a+n;return e[Math.max(0,Math.min(e.length-1,o))]||r}function N(r){const n=document.createElement("article");return n.className="task-card",n.draggable=!0,n.tabIndex=0,n.setAttribute("role","button"),n.dataset.id=r.id,n.dataset.status=r.status,n.dataset.position=r.position,n.innerHTML=`
    <div class="card-header">
      <h3>${r.title}</h3>
      <button class="delete-btn" type="button" aria-label="Eliminar tarea" tabindex="-1">✕</button>
    </div>
  `,n.addEventListener("click",()=>{s(r.id)}),n.addEventListener("focus",()=>{s(r.id)}),n.addEventListener("keydown",async e=>{if(e.key==="Tab"&&!e.shiftKey){const a=Array.from(document.querySelectorAll(".task-card")),o=a.findIndex(i=>i.dataset.id===r.id),t=a[o+1];t&&(e.preventDefault(),t.focus(),s(t.dataset.id));return}if(e.key==="Tab"&&e.shiftKey){const a=Array.from(document.querySelectorAll(".task-card")),o=a.findIndex(i=>i.dataset.id===r.id),t=a[o-1];t&&(e.preventDefault(),t.focus(),s(t.dataset.id));return}if(e.key==="Enter"){e.preventDefault(),s(r.id),$(r.id);return}if(e.key==="Delete"){e.preventDefault(),s(r.id),D(r.id);return}if(e.ctrlKey&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){e.preventDefault();const a=e.key==="ArrowRight"?1:-1,o=j(r.status,a);if(o!==r.status){await u(r.id,{status:o,position:Date.now()}),await f(),s(r.id);const t=document.querySelector(`[data-id="${r.id}"]`);t&&t.focus()}return}if(e.ctrlKey&&(e.key==="ArrowUp"||e.key==="ArrowDown")){e.preventDefault();const a=l(r.status),o=a.findIndex(t=>t.id===r.id);if(e.key==="ArrowUp"&&o>0){const t=a[o-1],i=r.position;await u(r.id,{position:t.position}),await u(t.id,{position:i}),await f();const d=document.querySelector(`[data-id="${r.id}"]`);d&&d.focus()}else if(e.key==="ArrowDown"&&o<a.length-1){const t=a[o+1],i=r.position;await u(r.id,{position:t.position}),await u(t.id,{position:i}),await f();const d=document.querySelector(`[data-id="${r.id}"]`);d&&d.focus()}return}if(e.key==="ArrowUp"){e.preventDefault();const a=l(r.status),o=a.findIndex(t=>t.id===r.id);if(o>0){const t=a[o-1],i=document.querySelector(`[data-id="${t.id}"]`);i&&(i.focus(),s(t.id))}return}if(e.key==="ArrowDown"){e.preventDefault();const a=l(r.status),o=a.findIndex(t=>t.id===r.id);if(o<a.length-1){const t=a[o+1],i=document.querySelector(`[data-id="${t.id}"]`);i&&(i.focus(),s(t.id))}return}if(e.key==="ArrowLeft"){e.preventDefault();const a=E(),o=a.indexOf(r.status);if(o>0){const t=a[o-1],i=l(t);if(i.length>0){const d=i[0],c=document.querySelector(`[data-id="${d.id}"]`);c&&(c.focus(),s(d.id))}}return}if(e.key==="ArrowRight"){e.preventDefault();const a=E(),o=a.indexOf(r.status);if(o<a.length-1){const t=a[o+1],i=l(t);if(i.length>0){const d=i[0],c=document.querySelector(`[data-id="${d.id}"]`);c&&(c.focus(),s(d.id))}}return}}),n.addEventListener("dragstart",e=>{n.classList.add("dragging"),e.dataTransfer.setData("text/plain",r.id)}),n.addEventListener("dragend",()=>{n.classList.remove("dragging")}),n.addEventListener("dragover",e=>{e.preventDefault(),n.classList.add("drag-over")}),n.addEventListener("dragleave",()=>{n.classList.remove("drag-over")}),n.addEventListener("drop",async e=>{e.preventDefault(),e.stopPropagation(),n.classList.remove("drag-over");const a=e.dataTransfer.getData("text/plain");if(!a||a===r.id)return;const o=p.find(v=>v.id===a);if(!o)return;const t=r.status,i=l(t),d=i.findIndex(v=>v.id===r.id),c=e.clientY<n.getBoundingClientRect().top+n.offsetHeight/2,L=[...i],I=c?d:d+1,A=L[I-1]||null,C=L[I]||null,q=K(A,C);await u(o.id,{status:t,position:q})}),n}function F(r){if(p=r,Object.values(g).forEach(n=>{n.innerHTML=""}),Object.keys(g).forEach(n=>{l(n).forEach(e=>{g[n].appendChild(N(e))})}),document.querySelectorAll("[data-count]").forEach(n=>{const e=n.closest(".column").dataset.status,a=l(e).length;n.textContent=a}),x){const n=p.find(e=>e.id===x);n?s(n.id):x=null}}function K(r,n){return!r&&!n?Date.now():r?n?Math.floor((r.position+n.position)/2):r.position+1:n.position-1}async function f(){try{const n=await(await fetch(y)).json();F(n)}catch(r){console.error("No se pudieron cargar las tareas",r)}}async function U(r){r.preventDefault();const n={title:O.value.trim(),description:M.value.trim(),status:"pendiente"};n.title&&(await fetch(y,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),S.reset(),await f())}async function u(r,n){await fetch(`${y}/${r}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),await f()}async function R(r){await fetch(`${y}/${r}`,{method:"DELETE"}),await f()}function _(){document.addEventListener("keydown",z),document.addEventListener("click",async r=>{if(!r.target.classList.contains("delete-btn"))return;const n=r.target.closest(".task-card");n&&D(n.dataset.id)}),document.getElementById("cancel-delete").addEventListener("click",w),document.getElementById("confirm-delete").addEventListener("click",async()=>{b&&(await R(b),w())}),document.querySelector("[data-modal-close]").addEventListener("click",w),document.getElementById("cancel-edit").addEventListener("click",k),document.getElementById("save-edit").addEventListener("click",async()=>{if(!h)return;const r=document.getElementById("edit-task-title").value.trim(),n=document.getElementById("edit-task-description").value.trim();r&&(await u(h,{title:r,description:n}),k())}),document.querySelector("[data-edit-close]").addEventListener("click",k),Object.entries(g).forEach(([r,n])=>{n.addEventListener("dragover",e=>{e.preventDefault()}),n.addEventListener("dragenter",()=>{n.classList.add("drag-over")}),n.addEventListener("dragleave",()=>{n.classList.remove("drag-over")}),n.addEventListener("drop",async e=>{e.preventDefault(),n.classList.remove("drag-over");const a=e.dataTransfer.getData("text/plain");if(!a)return;const o=p.find(c=>c.id===a);if(!o)return;const t=r,i=l(t),d=i.length?i[i.length-1].position+1:Date.now();await u(o.id,{status:t,position:d})})})}S.addEventListener("submit",U);window.addEventListener("DOMContentLoaded",()=>{_(),f()});
