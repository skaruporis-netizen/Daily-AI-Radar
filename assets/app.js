(() => {
  'use strict';
  const qs = s => document.querySelector(s);
  const esc = x => String(x ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const fmt = s => s ? new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s.slice(0,10)+'T12:00:00')) : 'Noch nicht aktualisiert';
  const model = { editorial:null, inbox:null, page:'dashboard', search:'', topic:'Alle', metric:'score', loading:false };
  const names = {dashboard:'Intelligence Overview',review:'60-Tage-Rückblick',benchmarks:'Modelle & Benchmarks',evolution:'Entwicklungslinien',news:'Meldungen & Quellen',settings:'Daten & Aktualisierung'};
  const tag = v => `<span class="tag ${esc(v)}">${esc(v)}</span>`;
  const external = (url, label='Originalquelle ↗') => /^https:\/\//.test(String(url||'')) ? `<a class="link" target="_blank" rel="noopener noreferrer" href="${esc(url)}">${esc(label)}</a>` : '';
  const metric = (label,value,small,colour='green') => `<article class="metric"><span class="label">${esc(label)}</span><strong class="${colour}">${esc(value)}</strong><small>${esc(small)}</small></article>`;
  const pagehead = (eyebrow,title,desc,chip='') => `<div class="pagehead"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${desc}</p></div>${chip ? `<div class="datechip">${chip}</div>` : ''}</div>`;
  const card = (content,klass='') => `<section class="card ${klass}">${content}</section>`;
  const topicCounts = () => model.editorial.events.reduce((p,v)=>{p[v.category]=(p[v.category]||0)+1;return p},{});
  function timelineSvg(events){
    const months=['Aug','Sep','Okt']; const bins=months.map((_,i)=>events.filter(e=>Number(e.date.slice(5,7))===i+8).length);const max=Math.max(1,...bins);
    return `<svg viewBox="0 0 700 160" width="100%" role="img" aria-label="Anzahl kuratierter Meldungen im August, September und Oktober 2026">
      <line x1="30" y1="115" x2="670" y2="115" stroke="#426174" />${months.map((v,i)=>{const x=100+i*230,h=83*bins[i]/max;return `<rect x="${x}" y="${115-h}" width="90" height="${h}" rx="5" fill="${['#679ab9','#9bd894','#b6cd7a'][i]}" opacity=".88"/><text x="${x+45}" y="${105-h}" fill="#dae7f2" font-size="16" text-anchor="middle">${bins[i]}</text><text x="${x+45}" y="143" fill="#9db2c5" font-size="14" text-anchor="middle">${v}</text>`}).join('')}</svg><div class="tiny">Anzahl der <b>redaktionell ausgewählten</b> Ereignisse; keine quantitative Messung des gesamten KI-Marktes.</div>`;
  }
  function dashboard(){
    const d=model.editorial,i=model.inbox;const c=topicCounts();const action=d.summary?.length?d.themes.filter(x=>x.priority==='ACTION').length:0;
    return `${pagehead('TECHNOLOGY INTELLIGENCE','KI verstehen.<br>Veränderungen erkennen.','Dein Arbeitsbereich für reale Entwicklungen, Entscheidungspunkte, Benchmarks und Engineering-Relevanz.','Analysestand '+fmt(d.as_of))}
      <div class="grid metrics">${metric('Kuratierte Entwicklungen',d.events.length,'Letzte 60 Tage')}${metric('Strategische Handlungsfelder',action,'ACTION-Priorität','cyan')}${metric('Modelle im Benchmark',d.benchmarks.models.length,'Geprüfter Snapshot','orange')}${metric('Neue Quellenfunde',i.items.length,'Ungeprüfte Inbox','pink')}</div>
      <div class="grid cols">
        ${card(`<div class="card-header"><h2>Executive View · Letzte 60 Tage</h2>${tag('ACTION')}</div><div class="desc">${esc(d.summary)}</div><h3 class="section-title" style="margin:22px 0 10px">Was jetzt wichtig ist</h3><div class="theme-list">${d.themes.slice(0,4).map(t=>`<div class="theme-row"><div class="rowtop"><b>${esc(t.name)}</b>${tag(t.priority)}</div><p>${esc(t.implication)}</p></div>`).join('')}</div><p style="margin:16px 0 0">${`<a class="link" href="#review">Vollständige 60-Tage-Einordnung ansehen →</a>`}</p>`,'topcard')}
        ${card(`<div class="card-header"><h2>Neue Veröffentlichungen</h2><a class="link" href="#news">Alle ansehen →</a></div><div class="side-list">${d.events.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(e=>`<div class="event-small"><div class="d">${fmt(e.date)} · ${esc(e.vendor)}</div><a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.title)}</a><div class="vendor">${esc(e.category)} · ${esc(e.priority)}</div></div>`).join('')}</div>`)}
      </div>
      <div class="two-stack">
        ${card(`<div class="card-header"><h2>Schwerpunkte im Rückblick</h2><span class="tiny">Kuratierte Meldungen</span></div><div class="simple-chart">${Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="barrow"><span>${esc(k)}</span><div class="barbg"><div class="barfill" style="width:${Math.max(6,v/d.events.length*100)}%"></div></div><strong>${v}</strong></div>`).join('')}</div>`)}
        ${card(`<div class="card-header"><h2>Entwicklung über 60 Tage</h2><span class="tiny">Ereignisse / Monat</span></div><div class="graphwrap">${timelineSvg(d.events)}</div>`)}
      </div>`;
  }
  function review(){
    const d=model.editorial;
    return `${pagehead('STRATEGIC REVIEW','Die letzten 60 Tage','Konzentrierter Rückblick mit technologischer Bedeutung, möglichen Experimenten und Quellen statt reiner Nachrichtenmenge.',`${fmt(d.window.from)} – ${fmt(d.window.to)}`)}
      <div class="banner">Redaktioneller Bewertungsstand vom ${fmt(d.as_of)}. Die tägliche Feed-Inbox ergänzt neue Hinweise, verändert diese geprüfte Zusammenfassung jedoch nicht ungefragt.</div>
      <div class="grid">${d.themes.map(t=>`<article class="full-theme"><div><div class="eyebrow">${esc(t.category)}</div><h3>${esc(t.name)}</h3><p>${esc(t.text)}</p><div class="notegrid"><div><strong>IMPLICATION</strong><span>${esc(t.implication)}</span></div><div><strong>EXPERIMENT / POC</strong><span>${esc(t.experiment)}</span></div><div><strong>MATURITY</strong><span>${esc(t.maturity)}</span></div><div><strong>QUELLEN</strong>${t.sources.map((u,j)=>`<div>${external(u,'Primärquelle '+(j+1)+' ↗')}</div>`).join('')}</div></div></div><div>${tag(t.priority)}</div></article>`).join('')}</div>`;
  }
  function benchmarkGraph(models, metricKey){
    const meta={score:{unit:'Indexpunkte',title:'Intelligence Index',max:65},cost:{unit:'USD je Index-Aufgabe',title:'Kosten pro Benchmark-Aufgabe',max:6.8},speed:{unit:'Tokens/s',title:'Ausgabegeschwindigkeit',max:160}}[metricKey];
    const arr=[...models].sort((a,b)=>metricKey==='cost'?a[metricKey]-b[metricKey]:((b[metricKey]??-1)-(a[metricKey]??-1)));
    return `<div class="simple-chart" style="margin:14px 0 26px">${arr.map(m=>{const v=m[metricKey];return `<div class="barrow" style="grid-template-columns:175px 1fr 70px"><span>${esc(m.name)}</span><div class="barbg" style="height:15px"><div class="barfill" style="width:${v==null?0:Math.min(100,(v/meta.max*100))}%"></div></div><strong>${v==null?'k. A.':metricKey==='cost'?'$'+v.toFixed(2):v}</strong></div>`}).join('')}</div><div class="tiny">${esc(meta.title)} · ${esc(meta.unit)} · ${metricKey==='cost'?'niedriger ist günstiger':'höher ist besser'}. Nur Werte gleicher Metrik vergleichen.</div>`;
  }
  function benchmarks(){
    const b=model.editorial.benchmarks, rows=b.models;
    return `${pagehead('MODEL LANDSCAPE','Modelle & Benchmarks','Unabhängige Vergleichswerte, Modellvarianten und Inferenzkosten – stets mit Quelle und Datumsstand.',`Snapshot ${fmt(b.checked_at)}`)}
      <div class="banner warn">Benchmark-Snapshot vom ${fmt(b.checked_at)} – <b>keine Live-Werte</b>. Scores hängen von Modellvariante und Effort ab. Kosten sind USD <b>pro AA-Index-Aufgabe</b>, nicht Tokenpreise; fehlende Werte bleiben offen.</div>
      ${card(`<div class="card-header"><h2>Capability / Cost / Speed Explorer</h2><select class="select" id="metricSelect" aria-label="Benchmark-Metrik wählen"><option value="score" ${model.metric==='score'?'selected':''}>Intelligence Index</option><option value="cost" ${model.metric==='cost'?'selected':''}>Kosten pro Aufgabe</option><option value="speed" ${model.metric==='speed'?'selected':''}>Ausgabetempo</option></select></div>${benchmarkGraph(rows,model.metric)}`)}
      <div style="height:16px"></div>
      ${card(`<div class="card-header"><h2>Vergleich nach Modellvariante</h2><span class="tiny">Quelle: Artificial Analysis</span></div><div class="tablewrap"><table class="bench-table"><thead><tr><th>Modell / Effort</th><th>Hersteller</th><th>Intelligence Index</th><th>Kosten / Task</th><th>Speed</th><th>Quelle</th></tr></thead><tbody>${rows.map(m=>`<tr><td><strong>${esc(m.name)}</strong><small>${esc(m.effort)}</small></td><td>${esc(m.vendor)}</td><td><div class="scorebox"><span class="scoretrack"><span style="width:${m.score/65*100}%"></span></span><b>${m.score}</b></div></td><td>${m.cost==null?'k. A.':('$'+Number(m.cost).toFixed(2))}</td><td>${m.speed==null?'k. A.':m.speed+' Tok./s'}</td><td>${external(m.url,'Messwerte ↗')}</td></tr>`).join('')}</tbody></table></div>`)}
      <div class="subbar"><b>Interpretation:</b> ${esc(b.description)}. Externe Modellwerte dürfen nicht ohne Normalisierung von Tools, Prompts, Reasoning-Aufwand und Hardware als kontrollierter Längsschnitt interpretiert werden.</div>`;
  }
  function evolution(){
    const d=model.editorial;
    return `${pagehead('MODEL EVOLUTION','Entwicklungslinien','Zeitliche Veröffentlichungspfade statt einer künstlichen Performance-Kurve: Jede Station verweist auf ein tatsächlich belegtes Release oder eine angekündigte Roadmap.',`Stand ${fmt(d.as_of)}`)}
    <div class="history">${d.lineages.map(l=>`<section class="lineage"><div class="card-header"><h3>${esc(l.vendor)}</h3><span class="tiny">${l.entries.length} beobachtete Stationen</span></div><div class="steps">${l.entries.map((e,i)=>`${i?'<span class="arrow">→</span>':''}<div class="step"><div class="date">${fmt(e.date.length===7?e.date+'-01':e.date)}</div><b>${esc(e.name)}</b><small>${esc(e.status)}</small></div>`).join('')}</div></section>`).join('')}</div>
    <div class="subbar">Entwicklung der Capability über Zeit wird erst dargestellt, sobald historische, methodengleiche Benchmark-Snapshots vorliegen. Aktuell existiert nur ein verifizierter Leistungs-Snapshot.</div>`;
  }
  function news(){
    const d=model.editorial, inbox=model.inbox;
    const choices=['Alle',...new Set(d.events.map(e=>e.category).concat(inbox.items.map(x=>x.category)))];
    const filters=`<div class="tools"><input id="newsSearch" class="filter" aria-label="Meldungen durchsuchen" placeholder="Meldung, Hersteller, Stichwort suchen …" value="${esc(model.search)}"/><select id="topicSelect" class="select" aria-label="Thema auswählen">${choices.map(v=>`<option ${v===model.topic?'selected':''}>${esc(v)}</option>`).join('')}</select></div>`;
    const needle=model.search.trim().toLowerCase();
    const match = x => (model.topic==='Alle'||x.category===model.topic) && (!needle||[x.title,x.vendor,x.source,x.description,x.summary].join(' ').toLowerCase().includes(needle));
    const curated=d.events.filter(match).sort((a,b)=>b.date.localeCompare(a.date));
    const incoming=inbox.items.filter(match).sort((a,b)=>b.date.localeCompare(a.date));
    const event = (x,verified)=>`<article class="news-item"><div class="meta"><span>${fmt(x.date)}</span><span>${esc(x.vendor||x.source||'Quelle')}</span>${tag(verified?x.priority:'UNREVIEWED')}</div><h3>${esc(x.title)}</h3><p>${esc(x.description||x.summary||'Für Details Originalquelle öffnen.')}</p>${external(x.url,'Quelle öffnen ↗')}</article>`;
    return `${pagehead('SIGNAL INBOX','Meldungen & Quellen','Geprüfte Redaktion und neu eingetroffene RSS-Funde bewusst getrennt; durchsuchbar nach Thema und Stichwort.',`${d.events.length+inbox.items.length} gespeicherte Einträge`)}${filters}
      <div class="card-header"><h2>Redaktionell ausgewählt <span class="tiny">(${curated.length})</span></h2><span class="tiny">Stand ${fmt(d.as_of)}</span></div>${curated.length?`<div class="news-list">${curated.map(e=>event(e,true)).join('')}</div>`:`<div class="empty">Keine redaktionellen Meldungen für diesen Filter.</div>`}
      <div style="height:30px"></div><div class="card-header"><h2>Automatisch gesammelte Quellen <span class="tiny">(${incoming.length})</span></h2><span class="tiny">Zuletzt gesammelt: ${fmt(inbox.updated_at)}</span></div>
      <div class="banner warn">Alle Einträge dieser Inbox sind <b>ungeprüfte Hinweise</b>. Ein Feed-Treffer ist keine bestätigte strategische Meldung. Originalquellen kontrollieren, bevor eine Entscheidung getroffen wird.</div>
      ${incoming.length?`<div class="news-list">${incoming.map(e=>event(e,false)).join('')}</div>`:`<div class="empty">Noch keine neuen RSS-Meldungen im veröffentlichten Datenbestand. Der tägliche GitHub-Workflow befüllt diese Ansicht nach der Freischaltung.</div>`}`;
  }
  function settings(){
    const d=model.editorial,i=model.inbox;
    return `${pagehead('DATA OPERATIONS','Daten & Aktualisierung','Nachvollziehbarer Aktualisierungsprozess ohne versteckte API-Schlüssel und ohne vorgetäuschte Live-Benchmarks.')}
      <div class="grid metrics">${metric('Letzter Quellenabruf',fmt(i.updated_at),'Geplante Ausführung: 08:00 Berlin','cyan')}${metric('Redaktion geprüft',fmt(d.as_of),'Nur bei fachlicher Aktualisierung','green')}${metric('Benchmark geprüft',fmt(d.benchmarks.checked_at),'AA-Snapshot','orange')}${metric('Erfolgreiche RSS-Feeds',i.success_count||0,'Beim letzten Lauf','pink')}</div>
      ${i.errors?.length?`<div class="banner warn">Fehler beim letzten Feedlauf: ${i.errors.map(esc).join(' · ')}</div>`:''}
      ${card(`<h2>Was macht „Jetzt aktualisieren“?</h2><p class="desc">Der Button lädt den zuletzt <b>auf GitHub Pages veröffentlichten</b> Datenstand neu. Er startet aus Sicherheitsgründen keinen GitHub-Workflow mit Schreibrechten direkt aus dem Browser.</p><button class="refresh-btn" id="refreshSecondary" style="margin-top:12px">↻ Jetzt aktualisieren</button><div class="subbar">Wenn du sofort neue externe Quellen sammeln möchtest, starte in GitHub Actions den Workflow manuell: ${external('https://github.com/skaruporis-netizen/Daily-AI-Radar/actions/workflows/daily-update.yml','Workflow in GitHub öffnen ↗')} → „Run workflow“. Danach hier erneut laden.</div>`)}
      <div style="height:16px"></div>${card(`<h2>Automatik</h2><div class="theme-list"><div class="theme-row"><b>1 · Quellen lesen</b><p>GitHub Actions startet werktags und am Wochenende täglich um etwa 08:00 Berliner Ortszeit und ruft öffentliche RSS-/Atom-Quellen ab.</p></div><div class="theme-row"><b>2 · Duplikate / Zeitfenster</b><p>Links werden dedupliziert und mit Veröffentlichungsdatum in der 60-Tage-Inbox gespeichert. Fehlgeschlagene Feeds werden im Status gemeldet.</p></div><div class="theme-row"><b>3 · Veröffentlichung</b><p>Nur Datenänderungen werden committet. GitHub Pages liefert anschließend den aktuellen Stand aus.</p></div><div class="theme-row"><b>4 · Fachliche Kuratierung</b><p>Benchmarkwerte, ACTION/WATCH und 60-Tage-Einordnung werden separat quellengeprüft. Automatisches Einsammeln behauptet nicht, eine KI-Analyse zu ersetzen.</p></div></div>`)}
      <div class="subbar">Repository: ${external('https://github.com/skaruporis-netizen/Daily-AI-Radar','skaruporis-netizen/Daily-AI-Radar ↗')} · Quellen offen, keine privaten internen Entwicklungsdaten.</div>`;
  }
  function showToast(text){const el=qs('#toast');el.textContent=text;el.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.remove('show'),4200)}
  async function fetchJson(path, bust){const res=await fetch(path+(bust?'?t='+Date.now():''),{cache:bust?'no-store':'default'});if(!res.ok)throw new Error(res.status+' '+path);return res.json()}
  async function update(bust){if(model.loading)return;model.loading=true;const btn=qs('#refresh');btn.disabled=true;btn.classList.add('loading');qs('#refreshText').textContent='Lade …';try{
      const [ed,inbox]=await Promise.all([fetchJson('data/editorial.json',bust),fetchJson('data/inbox.json',bust)]);
      if(!Array.isArray(ed.events)||!Array.isArray(ed.benchmarks?.models)||!Array.isArray(inbox.items))throw new Error('Ungültiges Datenformat');
      const previous=model.inbox?.updated_at;model.editorial=ed;model.inbox=inbox;render();
      qs('#headerStatus').innerHTML=`<i></i> Redaktion: ${esc(fmt(ed.as_of))} · Feed: ${esc(fmt(inbox.updated_at))}`;
      if(bust)showToast(previous===inbox.updated_at?'Neuester veröffentlichter Stand geladen – keine neue Feed-Version.':'Neuester veröffentlichter Datenstand geladen.');
    }catch(e){if(!model.editorial)qs('#main').innerHTML='<div class="empty">Daten konnten nicht geladen werden. Bitte über einen Webserver oder GitHub Pages öffnen; bei Dateiöffnung direkt im Browser verhindert die Browser-Sicherheitsrichtlinie oft JSON-fetch.</div>';showToast('Aktualisierung fehlgeschlagen: '+e.message)}finally{model.loading=false;btn.disabled=false;btn.classList.remove('loading');qs('#refreshText').textContent='Jetzt aktualisieren'} }
  function render(){if(!model.editorial)return;const p=names[model.page]?model.page:'dashboard';qs('#pageLabel').textContent=names[p];qs('#main').innerHTML=({dashboard,review,benchmarks,evolution,news,settings})[p]();document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.dataset.page===p));const metricSelect=qs('#metricSelect');if(metricSelect)metricSelect.addEventListener('change',e=>{model.metric=e.target.value;render()});const ns=qs('#newsSearch');if(ns)ns.addEventListener('input',e=>{const val=e.target.value;const pos=e.target.selectionStart;model.search=val;render();let input=qs('#newsSearch');input.focus();input.setSelectionRange(pos,pos)});const topicSelect=qs('#topicSelect');if(topicSelect)topicSelect.addEventListener('change',e=>{model.topic=e.target.value;render()});const secondary=qs('#refreshSecondary');if(secondary)secondary.addEventListener('click',()=>update(true));}
  function route(){model.page=location.hash.replace('#','')||'dashboard';if(!names[model.page])model.page='dashboard';render();window.scrollTo(0,0);qs('.sidebar').classList.remove('open')}
  qs('#refresh').addEventListener('click',()=>update(true));qs('#menu').addEventListener('click',()=>qs('.sidebar').classList.toggle('open'));window.addEventListener('hashchange',route);route();update(false);
})();
