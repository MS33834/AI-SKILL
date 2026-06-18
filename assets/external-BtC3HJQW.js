import{a as e,d as t,i as n,l as r,o as i,p as a,r as o}from"./style-Ba7vPcRV.js";var s=null;async function c(){if(s)return s;let e=await fetch(`./external-repos.json`);if(!e.ok)throw Error(`fetch external-repos.json: ${e.status}`);return s=await e.json(),s}function l(){let e=window.location.hash,t=e.indexOf(`?`);return t>-1?new URLSearchParams(e.slice(t+1)):new URLSearchParams}function u(e){let t=`#/external`,n=e.toString(),r=new URL(window.location.href);r.hash=n?`${t}?${n}`:t,history.replaceState(null,``,r.toString())}async function d(r){document.title=`${a(`external.title`)} — AI-SKILL`;let o=t()===`zh`,s=l(),d=s.get(`q`)??``,p=s.get(`vendor`)??``,m=s.get(`view`)??`domain`;r.innerHTML=`
    <div class="container-wide">
      <h1 class="external__title">${i(a(`external.title`))}</h1>
      <p class="external__subtitle">${i(a(`external.subtitle`,{n:`928`}))}</p>

      <div class="ext-toolbar">
        <input type="search" id="ext-search" value="${e(d)}" placeholder="${e(a(`external.search.ph`))}" aria-label="${e(a(`external.search.ph`))}" />
        <div class="ext-views" role="tablist">
          <button class="ext-view-btn" data-view="domain" role="tab" aria-selected="true">${i(a(`external.view.domain`))}</button>
          <button class="ext-view-btn" data-view="vendor" role="tab">${i(a(`external.view.vendor`))}</button>
          <button class="ext-view-btn" data-view="category" role="tab">${i(a(`external.view.category`))}</button>
          <button class="ext-view-btn" data-view="stars" role="tab">${i(a(`external.view.stars`))}</button>
        </div>
        <select id="ext-vendor-filter" aria-label="${e(a(`external.filter.vendor`))}">
          <option value="">${i(a(`external.filter.all`))}</option>
        </select>
      </div>

      <div id="ext-stats" class="ext-stats"></div>
      <div id="ext-list" class="external-list" aria-busy="true">
        <div class="ext-loading" role="status" aria-live="polite">${i(a(`loading`))}</div>
      </div>
      <p class="external__hint">${i(a(`external.hint`))}</p>
    </div>
  `;let h=r.querySelector(`#ext-list`),g=r.querySelector(`#ext-stats`),_=r.querySelector(`#ext-search`),v=r.querySelector(`#ext-vendor-filter`),y=r.querySelectorAll(`.ext-view-btn`),b=m;y.forEach(e=>{let t=e.dataset.view===b;e.setAttribute(`aria-selected`,t?`true`:`false`)});try{let e=await c();h.removeAttribute(`aria-busy`);let t=e.vendor_types;for(let[e,n]of Object.entries(t)){let t=document.createElement(`option`);t.value=e,t.textContent=o?n.zh:n.en,e===p&&(t.selected=!0),v.appendChild(t)}function r(t=!0){let n=_.value.trim().toLowerCase(),r=v.value,s=e.repos;if(r&&(s=s.filter(e=>e.vendor_type===r)),n&&(s=s.filter(e=>[e.slug,e.title,e.title_zh,e.category,...e.tags??[],e.summary_en,e.summary_zh,...e.skills??[],e.vendor,e.repo,e.url].join(` `).toLowerCase().includes(n))),t){let e=new URLSearchParams,t=_.value.trim();t&&e.set(`q`,t),r&&e.set(`vendor`,r),b!==`domain`&&e.set(`view`,b),u(e)}if(g.innerHTML=`<span>${i(a(`external.results`,{n:s.length}))}</span>`,s.length===0){h.innerHTML=`<div class="empty">${i(a(`external.empty`))}</div>`;return}h.innerHTML=f(s,b,e,o)}_.addEventListener(`input`,n(()=>r(),120)),v.addEventListener(`change`,()=>r()),y.forEach(e=>{e.addEventListener(`click`,()=>{y.forEach(e=>{e.setAttribute(`aria-selected`,`false`)}),e.setAttribute(`aria-selected`,`true`),b=e.dataset.view,r()})}),r(!1)}catch(e){h.removeAttribute(`aria-busy`),h.innerHTML=`<div class="empty" role="alert">${i(a(`external.errorLoad`))} <code>${i(String(e))}</code></div>`}}function f(e,t,n,r){let s=new Map;for(let n of e){let e;e=t===`domain`?n.domain:t===`vendor`?n.vendor_type:t===`category`?n.category:n.star_tier;let r=s.get(e)??[];r.push(n),s.set(e,r)}let c;return c=t===`stars`?[`100k+`,`50k+`,`10k+`,`1k+`,`<1k`,`none`].filter(e=>s.has(e)):Array.from(s.keys()).sort(),c.map(e=>{let c=s.get(e),l;if(t===`domain`){let t=n.domains[e];l=t?r?t.zh:t.en:e}else if(t===`vendor`){let t=n.vendor_types[e];l=t?r?t.zh:t.en:e}else l=t===`stars`?`★ ${e}`:t===`category`?o(e):e.replace(/-/g,` `).replace(/\b\w/g,e=>e.toUpperCase());return`
      <section class="ext-group">
        <header class="ext-group__head">
          <h2 class="ext-group__title">${i(l)}</h2>
          <span class="ext-group__count">${i(a(`external.results`,{n:c.length}))}</span>
        </header>
        <div class="ext-cards">
          ${c.map(e=>p(e,r)).join(``)}
        </div>
      </section>
    `}).join(``)}function p(t,n){let s=n&&t.summary_zh||t.summary_en,c=n&&t.title_zh||t.title,l=r(t.vendor),u=t.tags.slice(0,5).map(e=>`<span class="external-card__tag">#${i(e)}</span>`).join(``),d=t.stars>=1e3?`${(t.stars/1e3).toFixed(1)}k`:String(t.stars),f=(t.skills??[]).slice(0,8).map(e=>`<li class="external-card__skill">${i(e)}</li>`).join(``),p=f?`<ul class="external-card__skills" aria-label="${e(a(`external.skills`))}">${f}</ul>`:``;return`
    <article class="external-card" style="--vendor-hue: ${l};">
      <header class="external-card__head">
        <div class="external-card__vendor-row">
          <span class="external-card__vendor">${i(t.vendor)}</span>
          <span class="external-card__repo">${i(t.repo)}</span>
        </div>
        <a class="external-card__link" href="${e(t.url)}" rel="noopener noreferrer" target="_blank">
          ${i(a(`external.visit`))} ↗
        </a>
      </header>
      <h3 class="external-card__title">${i(c)}</h3>
      <p class="external-card__desc">${i(s)}</p>
      ${p}
      <dl class="external-card__meta">
        <div><dt>${i(a(`external.stars.label`))}</dt><dd>★ ${i(d)}</dd></div>
        <div><dt>${i(a(`external.license`))}</dt><dd>${i(t.license||`—`)}</dd></div>
        <div><dt>${i(a(`external.category`))}</dt><dd>${i(o(t.category))}</dd></div>
        ${t.archived?`<div><dt></dt><dd><span class="ext-archived">${i(a(`external.archived`))}</span></dd></div>`:``}
      </dl>
      <div class="external-card__tags">${u}</div>
    </article>
  `}export{d as renderExternal};