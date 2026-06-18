import{a as e,f as t,i as n,n as r,o as i,p as a,r as o,s,t as c}from"./style-Ba7vPcRV.js";async function l(t,r){let s=new URL(window.location.href),c=s.searchParams.get(`q`)??``,l=s.searchParams.get(`category`)??``,f=s.searchParams.get(`platform`)??``,p=s.searchParams.get(`group`)??`1`,m=r.skills.length,h=new Set(r.skills.map(e=>e.category)).size;t.innerHTML=`
    <section class="hero">
      <div class="hero__eyebrow">
        <span>${i(a(`eyebrow.tag`))}</span>
        <span aria-hidden="true">·</span>
        <span>${i(a(`eyebrow.version`))}</span>
      </div>
      <h1 class="hero__title">
        ${m} <em>SKILL.md</em><br/>
        ${i(a(`hero.title1`))}
      </h1>
      <p class="hero__sub">${i(a(`hero.sub`,{skills:String(m),repos:`928`}))}</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="#/external" data-link>${i(a(`hero.cta.index`))}</a>
        <a class="btn" href="#/bundle" data-link>${i(a(`nav.bundle`))}</a>
        <a class="btn" href="https://github.com/badhope/AI-SKILL" rel="noopener noreferrer" target="_blank">${i(a(`hero.cta.gh`))}</a>
      </div>
      <div class="hero__mark-glyph" aria-hidden="true">▮ AI-SKILL</div>
    </section>

    <div class="stats" aria-label="${e(a(`aria.siteStats`))}">
      <div class="stat" aria-label="${e(a(`stat.total.label`))}">
        <span class="stat__num">${m}<em>${i(a(`stat.total.suffix`))}</em></span>
        <span class="stat__label">${i(a(`stat.total.label`))}</span>
      </div>
      <div class="stat" aria-label="${e(a(`stat.categories.label`))}">
        <span class="stat__num">${h}<em>${i(a(`stat.cat.suffix`))}</em></span>
        <span class="stat__label">${i(a(`stat.categories.label`))}</span>
      </div>
      <div class="stat" aria-label="${e(a(`stat.neutral.label`))}">
        <span class="stat__num">928<em>${i(a(`stat.neutral.suffix`))}</em></span>
        <span class="stat__label">${i(a(`stat.neutral.label`))}</span>
      </div>
      <div class="stat" aria-label="${e(a(`stat.domains.label`))}">
        <span class="stat__num">9<em>${i(a(`stat.domains.suffix`))}</em></span>
        <span class="stat__label">${i(a(`stat.domains.label`))}</span>
      </div>
    </div>

    <div class="container-wide">
      <div class="filter-bar">
        <input type="search" id="filter-q" placeholder="${e(a(`filter.search.ph`))}" value="${e(c)}" aria-label="${e(a(`filter.search.ph`))}" />
        <select id="filter-cat" aria-label="${e(a(`filter.cat.label`))}">
          <option value="">${i(a(`filter.cat.all`))}</option>
        </select>
        <select id="filter-plat" aria-label="${e(a(`filter.plat.label`))}">
          <option value="">${i(a(`filter.plat.all`))}</option>
          <option value="all">${i(a(`filter.plat.any`))}</option>
          <option value="claude">${i(a(`filter.plat.claude`))}</option>
          <option value="codex">${i(a(`filter.plat.codex`))}</option>
          <option value="cursor">${i(a(`filter.plat.cursor`))}</option>
          <option value="continue">${i(a(`filter.plat.continue`))}</option>
        </select>
        <label class="group-toggle" title="${e(a(`filter.group`))}">
          <input type="checkbox" id="filter-group" ${p===`1`?`checked`:``} />
          <span>${i(a(`filter.group`))}</span>
        </label>
      </div>
      <div id="cards"></div>
    </div>
  `;let g=t.querySelector(`#filter-cat`),_=Array.from(new Set(r.skills.map(e=>e.category))).sort();for(let e of _){let t=document.createElement(`option`);t.value=e,t.textContent=o(e),e===l&&(t.selected=!0),g.appendChild(t)}let v=t.querySelector(`#filter-plat`);v.value=f;let y=t.querySelector(`#filter-group`),b=t.querySelector(`#filter-q`),x=t.querySelector(`#cards`);function S(){let e=b.value.trim().toLowerCase(),t=g.value,n=v.value,s=y.checked,c=r.skills.filter(r=>u(r,e,t,n)),l=new URL(window.location.href);if(l.searchParams.set(`q`,e),l.searchParams.set(`category`,t),l.searchParams.set(`platform`,n),l.searchParams.set(`group`,s?`1`:`0`),history.replaceState(null,``,l.toString()),c.length===0){x.innerHTML=`<div class="empty">${i(a(`empty.noMatch`))}</div>`;return}if(s&&!t){let e=new Map;for(let t of c){let n=e.get(t.category)??[];n.push(t),e.set(t.category,n)}let t=Array.from(e.entries()).sort((e,t)=>t[1].length-e[1].length),n=0;x.innerHTML=t.map(([e,t])=>`
        <section class="cat-group">
          <header class="cat-group__head">
            <h2 class="cat-group__title">${i(o(e))}</h2>
            <span class="cat-group__count">${i(a(t.length===1?`categoryCount.one`:`categoryCount.other`,{n:t.length}))}</span>
          </header>
          <div class="cards">
            ${t.map(e=>d(e,n++)).join(``)}
          </div>
        </section>
      `).join(``)}else{let e=0;x.innerHTML=`<div class="cards">${c.map(t=>d(t,e++)).join(``)}</div>`}}b.addEventListener(`input`,n(S,80)),g.addEventListener(`change`,S),v.addEventListener(`change`,S),y.addEventListener(`change`,S),S(),b.focus()}function u(e,t,n,r){if(n&&e.category!==n)return!1;if(r){if(r===`all`){if((e.platforms?.length??0)>0)return!1}else if(!(e.platforms??[]).includes(r))return!1}return!(t&&!c(e).includes(t))}function d(n,c){let l=s(n.platforms),u=t(n,`name`),d=t(n,`description`);return`
    <a class="skill-card" style="--cat-color: ${e(r(n.category))}; --i: ${c%16};" href="#/skill/${e(n.slug)}" data-link>
      <div class="skill-card__head">
        <span class="skill-card__slug">${i(n.slug)}${n.needs_review?` <span class="skill-card__review-dot" title="${e(a(`reviewDot.title`))}" aria-label="${e(a(`reviewDot.title`))}"></span>`:``}</span>
        <span class="skill-card__name">${i(u)}</span>
      </div>
      <p class="skill-card__desc">${i(d)}</p>
      <div class="skill-card__meta">
        <span>${i(o(n.category))}</span>
        ${l}
        <span>${(n.tags??[]).slice(0,4).map(i).join(` · `)}</span>
      </div>
    </a>
  `}export{l as renderList};