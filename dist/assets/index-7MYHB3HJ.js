(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function e(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(t){if(t.ep)return;t.ep=!0;const a=e(t);fetch(t.href,a)}})();const D=`:root {\r
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
`,L=document.createElement("style");L.textContent=D;document.head.appendChild(L);const b="http://127.0.0.1:3001/api/tasks",I=document.getElementById("task-form"),A=document.getElementById("task-title"),C=document.getElementById("task-description"),l={pendiente:document.querySelector('[data-status="pendiente"] .task-list'),en_proceso:document.querySelector('[data-status="en_proceso"] .task-list'),completado:document.querySelector('[data-status="completado"] .task-list'),archivado:document.querySelector('[data-status="archivado"] .task-list')};let s=[],p=null,u=null,f=null;function m(n){return s.filter(r=>r.status===n).sort((r,e)=>r.position-e.position)}function O(n){p=n;const r=document.getElementById("confirm-modal");r&&(r.classList.remove("hidden"),r.setAttribute("aria-hidden","false"))}function v(){p=null;const n=document.getElementById("confirm-modal");n&&(n.classList.add("hidden"),n.setAttribute("aria-hidden","true"))}function z(n){const r=s.find(o=>o.id===n);if(!r)return;f=n,document.getElementById("edit-task-title").value=r.title,document.getElementById("edit-task-description").value=r.description||"";const e=document.getElementById("edit-modal");e&&(e.classList.remove("hidden"),e.setAttribute("aria-hidden","false"),document.getElementById("edit-task-title").focus())}function k(){f=null;const n=document.getElementById("edit-modal");n&&(n.classList.add("hidden"),n.setAttribute("aria-hidden","true"))}function i(n){u=n,document.querySelectorAll(".task-card").forEach(r=>{const e=r.dataset.id===n;r.classList.toggle("is-selected",e),r.setAttribute("aria-selected",String(e))})}function M(){return["pendiente","en_proceso","completado","archivado"]}function q(n,r){const e=M(),o=e.indexOf(n);if(o===-1)return n;const t=o+r;return e[Math.max(0,Math.min(e.length-1,t))]||n}function P(n){const r=document.createElement("article");return r.className="task-card",r.draggable=!0,r.tabIndex=0,r.setAttribute("role","button"),r.dataset.id=n.id,r.dataset.status=n.status,r.dataset.position=n.position,r.innerHTML=`
    <div class="card-header">
      <h3>${n.title}</h3>
      <button class="delete-btn" type="button" aria-label="Eliminar tarea" tabindex="-1">✕</button>
    </div>
  `,r.addEventListener("click",()=>{i(n.id)}),r.addEventListener("focus",()=>{i(n.id)}),r.addEventListener("keydown",async e=>{if(e.key==="Tab"&&!e.shiftKey){const o=Array.from(document.querySelectorAll(".task-card")),t=o.findIndex(d=>d.dataset.id===n.id),a=o[t+1];a&&(e.preventDefault(),a.focus(),i(a.dataset.id));return}if(e.key==="Tab"&&e.shiftKey){const o=Array.from(document.querySelectorAll(".task-card")),t=o.findIndex(d=>d.dataset.id===n.id),a=o[t-1];a&&(e.preventDefault(),a.focus(),i(a.dataset.id));return}if(e.key==="Enter"){e.preventDefault(),i(n.id),z(n.id);return}if(e.ctrlKey&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){e.preventDefault();const o=e.key==="ArrowRight"?1:-1,t=q(n.status,o);t!==n.status&&await g(n.id,{status:t,position:Date.now()})}}),r.addEventListener("dragstart",e=>{r.classList.add("dragging"),e.dataTransfer.setData("text/plain",n.id)}),r.addEventListener("dragend",()=>{r.classList.remove("dragging")}),r.addEventListener("dragover",e=>{e.preventDefault(),r.classList.add("drag-over")}),r.addEventListener("dragleave",()=>{r.classList.remove("drag-over")}),r.addEventListener("drop",async e=>{e.preventDefault(),e.stopPropagation(),r.classList.remove("drag-over");const o=e.dataTransfer.getData("text/plain");if(!o||o===n.id)return;const t=s.find(y=>y.id===o);if(!t)return;const a=n.status,d=m(a),c=d.findIndex(y=>y.id===n.id),h=e.clientY<r.getBoundingClientRect().top+r.offsetHeight/2,w=[...d],E=h?c:c+1,T=w[E-1]||null,S=w[E]||null,B=N(T,S);await g(t.id,{status:a,position:B})}),r}function j(n){if(s=n,Object.values(l).forEach(r=>{r.innerHTML=""}),Object.keys(l).forEach(r=>{m(r).forEach(e=>{l[r].appendChild(P(e))})}),document.querySelectorAll("[data-count]").forEach(r=>{const e=r.closest(".column").dataset.status,o=m(e).length;r.textContent=o}),u){const r=s.find(e=>e.id===u);r?i(r.id):u=null}}function N(n,r){return!n&&!r?Date.now():n?r?Math.floor((n.position+r.position)/2):n.position+1:r.position-1}async function x(){try{const r=await(await fetch(b)).json();j(r)}catch(n){console.error("No se pudieron cargar las tareas",n)}}async function _(n){n.preventDefault();const r={title:A.value.trim(),description:C.value.trim(),status:"pendiente"};r.title&&(await fetch(b,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),I.reset(),await x())}async function g(n,r){await fetch(`${b}/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),await x()}async function $(n){await fetch(`${b}/${n}`,{method:"DELETE"}),await x()}function F(){document.addEventListener("click",async n=>{if(!n.target.classList.contains("delete-btn"))return;const r=n.target.closest(".task-card");r&&O(r.dataset.id)}),document.getElementById("cancel-delete").addEventListener("click",v),document.getElementById("confirm-delete").addEventListener("click",async()=>{p&&(await $(p),v())}),document.querySelector("[data-modal-close]").addEventListener("click",v),document.getElementById("cancel-edit").addEventListener("click",k),document.getElementById("save-edit").addEventListener("click",async()=>{if(!f)return;const n=document.getElementById("edit-task-title").value.trim(),r=document.getElementById("edit-task-description").value.trim();n&&(await g(f,{title:n,description:r}),k())}),document.querySelector("[data-edit-close]").addEventListener("click",k),Object.entries(l).forEach(([n,r])=>{r.addEventListener("dragover",e=>{e.preventDefault()}),r.addEventListener("dragenter",()=>{r.classList.add("drag-over")}),r.addEventListener("dragleave",()=>{r.classList.remove("drag-over")}),r.addEventListener("drop",async e=>{e.preventDefault(),r.classList.remove("drag-over");const o=e.dataTransfer.getData("text/plain");if(!o)return;const t=s.find(h=>h.id===o);if(!t)return;const a=n,d=m(a),c=d.length?d[d.length-1].position+1:Date.now();await g(t.id,{status:a,position:c})})})}I.addEventListener("submit",_);window.addEventListener("DOMContentLoaded",()=>{F(),x()});
