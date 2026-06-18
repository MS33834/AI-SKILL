import{a as e,c as t,d as n,f as r,o as i,p as a,r as o,s,u as c}from"./style-Ba7vPcRV.js";async function l(e,t,n){let c=t.body.split(`
`),l=g(c),d=T(t,n,3),v=r(t,`name`),y=r(t,`description`);e.innerHTML=`
    <div class="container-read detail">
      <a class="back-link" href="#/" data-link>${i(a(`detail.back`))}</a>
      <h1>${i(v)}</h1>
      <p class="meta-row">
        <strong>${i(t.slug)}</strong>
        <span>·</span>
        <span>v${i(t.version)}</span>
        <span>·</span>
        <span>${i(t.license)}</span>
        <span>·</span>
        <span>${i(o(t.category))}</span>
        ${s(t.platforms)}
      </p>
      <p class="detail__lead">${i(y)}</p>
      ${S(t)}
      ${f(t)}
      ${u(t,c,l)}
      <h2 id="when-to-use">${i(a(`detail.wtu`))}</h2>
      <div id="wtu-body"></div>
      ${p(t)}
      ${m(t)}
      <h2 id="prompt">${i(a(`detail.prompt`))}</h2>
      ${h(l)}
      <div class="actions">
        <button class="btn btn--primary" id="copy-prompt" type="button"${l?``:` disabled`}>${i(a(`detail.copy`))}</button>
        <button class="btn" id="dl-md" type="button">${i(a(`detail.download`))}</button>
      </div>
      <h2 id="when-not-to-use">${i(a(`detail.wnot`))}</h2>
      <div id="wnot-body"></div>
      <h2 id="example">${i(a(`detail.example`))}</h2>
      <div id="example-body"></div>
      ${E(d)}
    </div>
  `,l&&e.querySelector(`#copy-prompt`).addEventListener(`click`,e=>{b(e.currentTarget,l,a(`detail.copied`))}),e.querySelector(`#dl-md`).addEventListener(`click`,()=>x(t)),e.querySelector(`#wtu-body`).innerHTML=_(c,`When to use`),e.querySelector(`#wnot-body`).innerHTML=_(c,`When NOT to use`),e.querySelector(`#example-body`).innerHTML=_(c,`Example`);let C=a(`detail.copyCode`);e.querySelectorAll(`.codeblock__copy`).forEach(e=>{e.addEventListener(`click`,()=>{b(e,e.parentElement?.querySelector(`code`)?.textContent??``,C)})})}function u(t,n,r){let o={wtu:!0,inputs:(t.inputs?.length??0)>0,output:!0,prompt:r.length>0,wnot:d(n,`When NOT to use`),example:d(n,`Example`)},s=[];return o.wtu&&s.push({id:`when-to-use`,label:a(`detail.wtu`)}),o.inputs&&s.push({id:`inputs`,label:a(`detail.inputs`)}),o.output&&s.push({id:`output`,label:a(`detail.output`)}),o.prompt&&s.push({id:`prompt`,label:a(`detail.prompt`)}),o.wnot&&s.push({id:`when-not-to-use`,label:a(`detail.wnot`)}),o.example&&s.push({id:`example`,label:a(`detail.example`)}),s.length<=3?``:`
    <nav class="toc" aria-label="${e(a(`detail.toc`))}">
      <strong>${i(a(`detail.toc`))}</strong>
      <ol>${s.map(e=>`<li><a href="#${e.id}" data-link>${i(e.label)}</a></li>`).join(``)}</ol>
    </nav>
  `}function d(e,t){return e.some(e=>e.trim()===`# ${t}`)}function f(e){return!e.name_zh&&!e.description_zh?``:`
    <details class="detail__zh"${n()===`zh`?` open`:``}>
      <summary>${i(a(`detail.bilingual`))}</summary>
      ${e.name_zh?`<p><strong>${i(e.name_zh)}</strong></p>`:``}
      ${e.description_zh?`<p>${i(e.description_zh)}</p>`:``}
    </details>
  `}function p(e){if((e.inputs?.length??0)===0)return``;let t=(e.inputs??[]).map(e=>{let t=e.required?a(`input.required`):e.default===void 0?a(`input.optional`):a(`input.default`,{v:String(e.default)});return`
    <tr>
      <td><code>${i(e.name)}</code></td>
      <td><code>${i(e.type)}</code></td>
      <td>${i(t)}</td>
      <td>${i(e.description??``)}${e.values?`<br/><small>${i(a(`input.values`,{v:e.values.join(`, `)}))}</small>`:``}${e.constraints&&(e.constraints.min!==void 0||e.constraints.max!==void 0)?`<br/><small>${i(a(`input.range`,{min:e.constraints.min??`−∞`,max:e.constraints.max??`+∞`}))}</small>`:``}</td>
    </tr>
  `}).join(``);return`
    <h2 id="inputs">${i(a(`detail.inputs`))}</h2>
    <table>
      <thead><tr><th scope="col">${i(a(`table.name`))}</th><th scope="col">${i(a(`table.type`))}</th><th scope="col">${i(a(`table.required`))}</th><th scope="col">${i(a(`table.description`))}</th></tr></thead>
      <tbody>${t}</tbody>
    </table>
  `}function m(e){return`
    <h2 id="output">${i(a(`detail.output`))}</h2>
    <p><code>${i(a(`output.format`,{f:e.output.format}))}</code>${e.output.description?` — ${i(e.output.description)}`:``}</p>
  `}function h(e){return`
    <pre><code>${i(e)}</code></pre>
  `}function g(e){let t=e.findIndex(e=>/^#\s+Prompt\s*$/.test(e));if(t===-1)return``;let n=e.length;for(let r=t+1;r<e.length;r++)if(/^#\s+/.test(e[r])){n=r;break}return e.slice(t+1,n).join(`
`).replace(/^\n+|\n+$/g,``)}function _(e,t){let n=e.findIndex(e=>e.trim()===`# ${t}`);if(n===-1)return``;let r=e.length;for(let t=n+1;t<e.length;t++)if(/^#\s+/.test(e[t])){r=t;break}return v(e.slice(n+1,r).join(`
`))}function v(t){let n=t.split(`
`),r=``,o=0;for(;o<n.length;){let t=n[o];if(t.startsWith("```")){let s=t.slice(3).trim(),c=[];for(o++;o<n.length&&!n[o].startsWith("```");)c.push(n[o]),o++;o++,r+=`<div class="codeblock"><pre><code data-lang="${e(s)}">${i(c.join(`
`))}</code></pre><button class="codeblock__copy" type="button" aria-label="${e(a(`aria.copyCode`))}">${i(a(`detail.copyCode`))}</button></div>`;continue}if(/^#{1,6}\s+/.test(t)){let e=t.match(/^#+/)?.[0].length??1,n=Math.min(e,6),i=t.replace(/^#+\s+/,``);r+=`<h${n+2}>${y(i)}</h${n+2}>`,o++;continue}if(/^\s*\|/.test(t)&&o+1<n.length&&/^\s*\|[\s\-:|]+\|\s*$/.test(n[o+1])){let e=n[o].split(`|`).slice(1,-1).map(e=>e.trim());o+=2;let t=[];for(;o<n.length&&/^\s*\|/.test(n[o]);)t.push(n[o].split(`|`).slice(1,-1).map(e=>e.trim())),o++;r+=`<table><thead><tr>${e.map(e=>`<th>${y(e)}</th>`).join(``)}</tr></thead><tbody>${t.map(e=>`<tr>${e.map(e=>`<td>${y(e)}</td>`).join(``)}</tr>`).join(``)}</tbody></table>`;continue}if(/^[-*]\s+/.test(t)){let e=[];for(;o<n.length&&/^[-*]\s+/.test(n[o]);)e.push(n[o].replace(/^[-*]\s+/,``)),o++;r+=`<ul>${e.map(e=>`<li>${y(e)}</li>`).join(``)}</ul>`;continue}if(/^\d+\.\s+/.test(t)){let e=[];for(;o<n.length&&/^\d+\.\s+/.test(n[o]);)e.push(n[o].replace(/^\d+\.\s+/,``)),o++;r+=`<ol>${e.map(e=>`<li>${y(e)}</li>`).join(``)}</ol>`;continue}if(t.trim()===``){o++;continue}let s=[t];for(o++;o<n.length&&n[o].trim()!==``&&!/^([-*]\s|\d+\.\s|```|#|\|)/.test(n[o]);)s.push(n[o]),o++;r+=`<p>${y(s.join(` `))}</p>`}return r}function y(e){let t=i(e);return t=t.replace(/&#96;([^&#]+)&#96;/g,(e,t)=>`<code>${t}</code>`).replace(/\*\*([^*]+)\*\*/g,(e,t)=>`<strong>${t}</strong>`).replace(/\*([^*]+)\*/g,(e,t)=>`<em>${t}</em>`).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(e,t,n)=>{let r=n.trim();return/^(https?:\/\/|\/|#|mailto:)/.test(r)?`<a href="${r}" rel="noopener noreferrer" target="_blank">${t}</a>`:`[${t}](${r})`}),t}async function b(e,t,n){try{await navigator.clipboard.writeText(t)}catch{let e=document.createElement(`textarea`);e.value=t,e.style.position=`fixed`,e.style.opacity=`0`,document.body.appendChild(e),e.select();try{document.execCommand(`copy`)}finally{document.body.removeChild(e)}}let r=e.textContent;e.textContent=n,e.classList.add(`btn--pulse`),setTimeout(()=>{e.textContent=r,e.classList.remove(`btn--pulse`)},1500)}function x(e){let n=t(e);c(new Blob([n],{type:`text/markdown`}),`${e.slug}.md`)}function S(t){let n=t.source;if(!n)return`
      <div class="source-block">
        <span class="source-block__label">${i(a(`detail.origin`))}</span>
        <span class="source-block__author">${i(t.author||`local`)}</span>
        <span class="source-block__commit">${i(a(`detail.local`))}</span>
      </div>
    `;let r=C(n.url),o=n.commit&&n.commit!==`n/a`?n.commit:null,s=o?o.slice(0,7):null,c=o&&s?`<a class="source-block__commit" href="${e(w(n))}" rel="noopener noreferrer" target="_blank" title="${e(o)}">${i(s)}</a>`:`<span class="source-block__commit">${i(a(`detail.noCommit`))}</span>`;return`
    <div class="source-block">
      <span class="source-block__label">${i(a(`detail.source`))}</span>
      <a class="source-block__author" href="${e(n.url)}" rel="noopener noreferrer" target="_blank">${i(r)}</a>
      ${c}
      ${n.license?`<span class="source-block__commit">${i(n.license)}</span>`:``}
      ${n.fetched_at?`<span class="source-block__commit">${i(a(`detail.fetched`,{d:n.fetched_at}))}</span>`:``}
    </div>
  `}function C(e){try{let t=new URL(e),n=t.pathname.split(`/`).filter(Boolean);return n.length>=2?`${t.hostname}/${n[0]}/${n[1]}`:t.hostname}catch{return e}}function w(e){let t=e.url;if(!e.commit||e.commit===`n/a`)return t;if(t.includes(`github.com`)){let n=t.match(/^(https?:\/\/github\.com\/[^/]+\/[^/]+)(\/.*)?$/);if(n)return`${n[1]}/tree/${e.commit}${n[2]??``}`}return t}function T(e,t,n){let r=[];for(let n of t.skills)n.slug!==e.slug&&n.category===e.category&&r.push(n);return r.slice(0,n)}function E(t){if(t.length===0)return``;let n=t.map(t=>{let n=r(t,`name`);return`
    <a class="skill-card skill-card--inline" href="#/skill/${e(t.slug)}" data-link>
      <div class="skill-card__head">
        <span class="skill-card__slug">${i(t.slug)}</span>
        <span class="skill-card__name">${i(n)}</span>
      </div>
    </a>
  `}).join(``);return`
    <section class="related" aria-label="${e(a(`aria.related`))}">
      <h2 class="related__title">${i(a(`detail.related`,{cat:t[0].category.replace(/-/g,` `)}))}</h2>
      <div class="related__grid">${n}</div>
    </section>
  `}function D(t,n,r){let o=O(n,r.skills,5),s=o.length===0?``:`
      <div class="notfound__suggest">
        <span class="notfound__suggest-label">${i(a(`nf.suggest`))}</span>
        ${o.map(t=>`<a class="notfound__chip" href="#/skill/${e(t.slug)}" data-link>${i(t.slug)}</a>`).join(` `)}
      </div>
    `;t.innerHTML=`
    <div class="notfound">
      <div class="notfound__glyph" aria-hidden="true">▮</div>
      <div class="notfound__code">${i(a(`nf.code`))}</div>
      <h1 class="notfound__title">${i(a(`nf.title`,{slug:n}))}</h1>
      <p class="notfound__sub">${i(a(`nf.sub`))}</p>
      ${s}
      <div class="actions" style="justify-content: center;">
        <a class="btn btn--primary" href="#/" data-link>${i(a(`nf.back`))}</a>
        <a class="btn" href="#/bundle" data-link>${i(a(`nf.bundle`))}</a>
      </div>
    </div>
  `}function O(e,t,n){let r=e.toLowerCase(),i=[];for(let e of t){let t=e.slug.toLowerCase(),n=0;n=t===r?100:t.startsWith(r)?50:t.includes(r)?25:k(r,t),n>0&&i.push({e,s:n})}return i.sort((e,t)=>t.s-e.s),i.slice(0,n).map(e=>e.e)}function k(e,t){if(e.length<2||t.length<2)return 0;let n=new Set;for(let t=0;t<e.length-1;t++)n.add(e.slice(t,t+2));let r=0;for(let e=0;e<t.length-1;e++)n.has(t.slice(e,e+2))&&r++;return r}export{l as renderDetail,D as renderNotFound};