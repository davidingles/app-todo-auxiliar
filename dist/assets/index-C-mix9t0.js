(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const t of a)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function e(a){const t={};return a.integrity&&(t.integrity=a.integrity),a.referrerPolicy&&(t.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?t.credentials="include":a.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(a){if(a.ep)return;a.ep=!0;const t=e(a);fetch(a.href,t)}})();const M=`:root {\r
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
.topbar-row {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 16px;\r
}\r
\r
@media (min-width: 640px) {\r
  .topbar-row {\r
    flex-direction: row;\r
    justify-content: space-between;\r
    align-items: center;\r
  }\r
}\r
\r
.search-container {\r
  width: 100%;\r
}\r
\r
#search-input {\r
  width: 100%;\r
  max-width: 280px;\r
  border: 1px solid var(--border);\r
  background: #0f1115;\r
  color: var(--text);\r
  border-radius: 8px;\r
  padding: 8px 12px;\r
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\r
}\r
\r
#search-input:focus {\r
  outline: 2px solid #60a5fa;\r
  outline-offset: 2px;\r
  border-color: #60a5fa;\r
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
`,D=document.createElement("style");D.textContent=M;document.head.appendChild(D);const v="http://127.0.0.1:3001/api/tasks",A=document.getElementById("task-form"),P=document.getElementById("task-title"),$=document.getElementById("task-description"),L=document.getElementById("search-input"),b={pendiente:document.querySelector('[data-status="pendiente"] .task-list'),en_proceso:document.querySelector('[data-status="en_proceso"] .task-list'),completado:document.querySelector('[data-status="completado"] .task-list'),archivado:document.querySelector('[data-status="archivado"] .task-list')};let u=[],x=[],h=null,m=null,y=null,g=null;function p(n,r=u){return r.filter(e=>e.status===n).sort((e,o)=>e.position-o.position)}function j(n){return Array.from(n.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(r=>{const e=r.getAttribute("aria-hidden")==="true"||r.hidden,o=r.disabled;return!e&&!o&&r.tabIndex!==-1})}function F(n){if(n.key!=="Tab")return;const r=document.querySelector(".modal:not(.hidden)");if(!r)return;const e=j(r);if(e.length===0)return;const o=e[0],a=e[e.length-1],t=n.shiftKey;t&&document.activeElement===o?(n.preventDefault(),a.focus()):!t&&document.activeElement===a&&(n.preventDefault(),o.focus())}function C(n){h=n;const r=document.getElementById("confirm-modal");r&&(g=document.activeElement,r.classList.remove("hidden"),r.setAttribute("aria-hidden","false"),requestAnimationFrame(()=>{const e=document.getElementById("cancel-delete");e&&e.focus()}))}function k(){h=null;const n=document.getElementById("confirm-modal");n&&(n.classList.add("hidden"),n.setAttribute("aria-hidden","true"),g&&typeof g.focus=="function"&&g.focus(),g=null)}function N(n){const r=u.find(o=>o.id===n);if(!r)return;y=n,document.getElementById("edit-task-title").value=r.title,document.getElementById("edit-task-description").value=r.description||"";const e=document.getElementById("edit-modal");e&&(e.classList.remove("hidden"),e.setAttribute("aria-hidden","false"),document.getElementById("edit-task-title").focus())}function E(){y=null;const n=document.getElementById("edit-modal");n&&(n.classList.add("hidden"),n.setAttribute("aria-hidden","true"))}function s(n){m=n,document.querySelectorAll(".task-card").forEach(r=>{const e=r.dataset.id===n;r.classList.toggle("is-selected",e),r.setAttribute("aria-selected",String(e))})}function I(){return["pendiente","en_proceso","completado","archivado"]}function K(n,r){const e=I(),o=e.indexOf(n);if(o===-1)return n;const a=o+r;return e[Math.max(0,Math.min(e.length-1,a))]||n}function U(n){const r=document.createElement("article");return r.className="task-card",r.draggable=!0,r.tabIndex=0,r.setAttribute("role","button"),r.dataset.id=n.id,r.dataset.status=n.status,r.dataset.position=n.position,r.innerHTML=`
    <div class="card-header">
      <h3>${n.title}</h3>
      <button class="delete-btn" type="button" aria-label="Eliminar tarea" tabindex="-1">✕</button>
    </div>
  `,r.addEventListener("click",()=>{s(n.id)}),r.addEventListener("focus",()=>{s(n.id)}),r.addEventListener("keydown",async e=>{if(e.key==="Tab"&&!e.shiftKey){const o=Array.from(document.querySelectorAll(".task-card")),a=o.findIndex(i=>i.dataset.id===n.id),t=o[a+1];t&&(e.preventDefault(),t.focus(),s(t.dataset.id));return}if(e.key==="Tab"&&e.shiftKey){const o=Array.from(document.querySelectorAll(".task-card")),a=o.findIndex(i=>i.dataset.id===n.id),t=o[a-1];t&&(e.preventDefault(),t.focus(),s(t.dataset.id));return}if(e.key==="Enter"){e.preventDefault(),s(n.id),N(n.id);return}if(e.key==="Delete"){e.preventDefault(),s(n.id),C(n.id);return}if(e.ctrlKey&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){e.preventDefault();const o=e.key==="ArrowRight"?1:-1,a=K(n.status,o);if(a!==n.status){await l(n.id,{status:a,position:Date.now()}),await f(),s(n.id);const t=document.querySelector(`[data-id="${n.id}"]`);t&&t.focus()}return}if(e.ctrlKey&&(e.key==="ArrowUp"||e.key==="ArrowDown")){e.preventDefault();const o=p(n.status),a=o.findIndex(t=>t.id===n.id);if(e.key==="ArrowUp"&&a>0){const t=o[a-1],i=n.position;await l(n.id,{position:t.position}),await l(t.id,{position:i}),await f();const d=document.querySelector(`[data-id="${n.id}"]`);d&&d.focus()}else if(e.key==="ArrowDown"&&a<o.length-1){const t=o[a+1],i=n.position;await l(n.id,{position:t.position}),await l(t.id,{position:i}),await f();const d=document.querySelector(`[data-id="${n.id}"]`);d&&d.focus()}return}if(e.key==="ArrowUp"){e.preventDefault();const o=p(n.status),a=o.findIndex(t=>t.id===n.id);if(a>0){const t=o[a-1],i=document.querySelector(`[data-id="${t.id}"]`);i&&(i.focus(),s(t.id))}return}if(e.key==="ArrowDown"){e.preventDefault();const o=p(n.status),a=o.findIndex(t=>t.id===n.id);if(a<o.length-1){const t=o[a+1],i=document.querySelector(`[data-id="${t.id}"]`);i&&(i.focus(),s(t.id))}return}if(e.key==="ArrowLeft"){e.preventDefault();const o=I(),a=o.indexOf(n.status);if(a>0){const t=o[a-1],i=p(t);if(i.length>0){const d=i[0],c=document.querySelector(`[data-id="${d.id}"]`);c&&(c.focus(),s(d.id))}}return}if(e.key==="ArrowRight"){e.preventDefault();const o=I(),a=o.indexOf(n.status);if(a<o.length-1){const t=o[a+1],i=p(t);if(i.length>0){const d=i[0],c=document.querySelector(`[data-id="${d.id}"]`);c&&(c.focus(),s(d.id))}}return}}),r.addEventListener("dragstart",e=>{r.classList.add("dragging"),e.dataTransfer.setData("text/plain",n.id)}),r.addEventListener("dragend",()=>{r.classList.remove("dragging")}),r.addEventListener("dragover",e=>{e.preventDefault(),r.classList.add("drag-over")}),r.addEventListener("dragleave",()=>{r.classList.remove("drag-over")}),r.addEventListener("drop",async e=>{e.preventDefault(),e.stopPropagation(),r.classList.remove("drag-over");const o=e.dataTransfer.getData("text/plain");if(!o||o===n.id)return;const a=u.find(w=>w.id===o);if(!a)return;const t=n.status,i=p(t),d=i.findIndex(w=>w.id===n.id),c=e.clientY<r.getBoundingClientRect().top+r.offsetHeight/2,T=[...i],S=c?d:d+1,B=T[S-1]||null,O=T[S]||null,z=_(B,O);await l(a.id,{status:t,position:z})}),r}function R(n){u=n,q()}function q(){const n=L.value.trim().toLowerCase();if(Object.values(b).forEach(r=>{r.innerHTML=""}),x=n?u.filter(r=>r.title.toLowerCase().includes(n)||r.description&&r.description.toLowerCase().includes(n)):[...u],Object.keys(b).forEach(r=>{x.filter(e=>e.status===r).sort((e,o)=>e.position-o.position).forEach(e=>b[r].appendChild(U(e)))}),document.querySelectorAll("[data-count]").forEach(r=>{const e=r.closest(".column").dataset.status,o=x.filter(a=>a.status===e).length;r.textContent=o}),m){const r=u.find(e=>e.id===m);if(r&&x.some(e=>e.id===m)){s(r.id);const e=document.querySelector(`[data-id="${m}"]`);e&&e.focus()}else m=null}}function _(n,r){return!n&&!r?Date.now():n?r?Math.floor((n.position+r.position)/2):n.position+1:r.position-1}async function f(){try{const r=await(await fetch(v)).json();R(r)}catch(n){console.error("No se pudieron cargar las tareas",n)}}async function H(n){n.preventDefault();const r={title:P.value.trim(),description:$.value.trim(),status:"pendiente"};r.title&&(await fetch(v,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),A.reset(),await f())}async function l(n,r){await fetch(`${v}/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),await f()}async function Y(n){await fetch(`${v}/${n}`,{method:"DELETE"}),await f()}function J(){document.addEventListener("keydown",F),L.addEventListener("input",()=>{q()}),document.addEventListener("keydown",n=>{n.ctrlKey&&(n.key==="f"||n.key==="F")&&(n.preventDefault(),L.focus())}),document.addEventListener("click",async n=>{if(!n.target.classList.contains("delete-btn"))return;const r=n.target.closest(".task-card");r&&C(r.dataset.id)}),document.getElementById("cancel-delete").addEventListener("click",k),document.getElementById("confirm-delete").addEventListener("click",async()=>{h&&(await Y(h),k())}),document.querySelector("[data-modal-close]").addEventListener("click",k),document.getElementById("cancel-edit").addEventListener("click",E),document.getElementById("save-edit").addEventListener("click",async()=>{if(!y)return;const n=document.getElementById("edit-task-title").value.trim(),r=document.getElementById("edit-task-description").value.trim();n&&(await l(y,{title:n,description:r}),E())}),document.querySelector("[data-edit-close]").addEventListener("click",E),Object.entries(b).forEach(([n,r])=>{r.addEventListener("dragover",e=>{e.preventDefault()}),r.addEventListener("dragenter",()=>{r.classList.add("drag-over")}),r.addEventListener("dragleave",()=>{r.classList.remove("drag-over")}),r.addEventListener("drop",async e=>{e.preventDefault(),r.classList.remove("drag-over");const o=e.dataTransfer.getData("text/plain");if(!o)return;const a=u.find(c=>c.id===o);if(!a)return;const t=n,i=p(t),d=i.length?i[i.length-1].position+1:Date.now();await l(a.id,{status:t,position:d})})})}A.addEventListener("submit",H);window.addEventListener("DOMContentLoaded",()=>{J(),f()});
