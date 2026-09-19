const DB = {
  "ia": [
    {t:"Comment j'ai gagné 10K€ en 30 jours avec l'IA", c:"Guru IA", v:1234567},
    {t:"Les 5 meilleures prompts pour Claude en 2024", c:"Prompt Pro", v:897321},
    {t:"Transformation vidéo : Long vers Shorts en 10 min", c:"Video Tech", v:567890},
  ],
  "ecommerce": [
    {t:"Les 10 produits qui vont exploser en 2024", c:"Ecom Expert", v:2345678},
    {t:"Comment j'ai quitté mon job grâce à Shopify", c:"Libre", v:1122334},
    {t:"AliExpress vs Shopify : le vrai comparatif", c:"Tech Comp", v:987654},
  ],
  "immo": [
    {t:"Comment j'ai fait 5K€/mois en immo sans apport", c:"Immo Libre", v:876543},
    {t:"Les 3 erreurs qui te ruinent en investissement", c:"Immo Pro", v:654321},
    {t:"Visite : appartement 40m2 rentabilité 9%", c:"Chasseur", v:432109},
  ],
  "coach": [
    {t:"Comment j'ai vendu 5000€ de coaching en 1 semaine", c:"Coach Star", v:543210},
    {t:"Les 5 phrases qui bloquent tes clients", c:"Mindset", v:321098},
    {t:"Ma routine matinale productivité extrême", c:"Productif", v:234567},
  ],
  "formation": [
    {t:"Formation complète : zéro à expert en 3 mois", c:"Learning Pro", v:3456789},
    {t:"Les 5 erreurs à ne pas faire sur Udemy", c:"Course Maker", v:765432},
    {t:"Comment j'ai vendu 5000€ de formation", c:"Formateur", v:543210},
  ]
};

function pickBase(q){
  q=q.toLowerCase();
  if(q.includes('e-com')||q.includes('ecommerce')||q.includes('shopify')||q.includes('commerce')) return DB.ecommerce;
  if(q.includes('immo')||q.includes('immobilier')||q.includes('appart')) return DB.immo;
  if(q.includes('coach')) return DB.coach;
  if(q.includes('formation')||q.includes('udemy')||q.includes('cours')) return DB.formation;
  return DB.ia;
}

function ideasFor(v){
  const t=v.t.toLowerCase();
  const k=Math.round(v.v/1000);
  if(t.includes("comment j'ai")||t.includes('gagné')||t.includes('quitté')||t.includes('vendu')){
    return [
      {type:'resultat_choquant', hook:`J'ai fait ${k}K vues/€ — voici comment en 30s`, angle:'Avant / Après', dur:30, scenes:["Annonce du résultat chiffré face cam","Preuve écran","L'action clé en 1 phrase","CTA: commente GO"]},
      {type:'transformation_rapide', hook:'De zéro à résultat en 3 étapes', angle:'Tuto express', dur:35, scenes:["Problème","Étape 1-2-3 rapide","Résultat","CTA"]},
    ];
  }
  if(t.includes('meilleur')||t.includes('top')||t.includes('10 produits')||t.includes('5 ')){
    return [
      {type:'top_3_reveal', hook:'Le N°3 va te surprendre !', angle:'Top 3', dur:35, scenes:["Teasing","N°3","N°2","N°1 + CTA"]},
      {type:'liste_rapide', hook:'3 astuces que personne ne donne', angle:'Valeur pure', dur:30, scenes:["Astuce 1","Astuce 2","Astuce 3 + CTA"]},
    ];
  }
  if(t.includes('erreur')){
    return [
      {type:'avertissement', hook:'Arrête ça MAINTENANT', angle:'Erreur à éviter', dur:25, scenes:["Erreur filmée","Conséquence","Correction","CTA"]},
      {type:'conseil_urgent', hook:'3 erreurs qui te coûtent cher', angle:'Pédago', dur:30, scenes:["Erreur 1","Erreur 2","Solution"]},
    ];
  }
  return [
    {type:'extraits_cle', hook:'La minute qui a tout changé', angle:'Best-of', dur:30, scenes:["Meilleure phrase","Action","Résultat","CTA"]},
    {type:'best_of', hook:'10 secondes à retenir', angle:'Compilation', dur:25, scenes:["Moment 1","Moment 2","CTA"]},
  ];
}

let lastJSON=null;

function generate(){
  const q=document.getElementById('query').value||'IA monétisation';
  const base=pickBase(q);
  const avg=Math.round(base.reduce((a,b)=>a+b.v,0)/base.length);

  const stats=document.getElementById('stats');
  stats.hidden=false;
  document.getElementById('statsBox').innerHTML=`
    <div class="stat"><b>${base.length}</b><span>vidéos analysées</span></div>
    <div class="stat"><b>${avg.toLocaleString('fr-FR')}</b><span>vues moyennes</span></div>
    <div class="stat"><b>9:16</b><span>format vertical</span></div>
    <div class="stat"><b>${base.length*2}</b><span>clips générés</span></div>`;

  const box=document.getElementById('results');
  box.innerHTML='';
  const out={generated_at:new Date().toISOString(), query:q, average_views:avg, format:'9:16', subtitles:true, clips:[]};

  base.forEach(v=>{
    const ideas=ideasFor(v);
    out.clips.push({source:v.t, views:v.v, concepts:ideas});
    const div=document.createElement('div');
    div.className='clip';
    div.innerHTML=`<h3>📹 ${v.t}</h3>
      <span class="tag">${v.c}</span><span class="tag">${v.v.toLocaleString('fr-FR')} vues</span>
      ${ideas.map(c=>`
        <div class="hook">🎯 [${c.type}] ${c.hook}</div>
        <div class="small">Angle : ${c.angle} • ⏱ ${c.dur}s • Sous-titres ON</div>
        <ul>${c.scenes.map(s=>`<li>${s}</li>`).join('')}</ul>
        <button class="copy" data-copy="${c.hook} — ${c.scenes.join(' / ')}">📋 Copier le plan</button>
      `).join('')}`;
    box.appendChild(div);
  });

  document.querySelectorAll('.copy').forEach(b=>b.onclick=()=>{
    navigator.clipboard.writeText(b.dataset.copy);
    b.textContent='✅ Copié !';
    setTimeout(()=>b.textContent='📋 Copier le plan',1200);
  });

  lastJSON=out;
  document.getElementById('results').scrollIntoView({behavior:'smooth'});
}

function download(){
  if(!lastJSON){generate();}
  const blob=new Blob([JSON.stringify(lastJSON,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`shorts_${Date.now()}.json`;
  a.click();
}

document.getElementById('go').onclick=generate;
document.getElementById('dl').onclick=download;
document.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{
  document.getElementById('query').value=b.dataset.q;
  generate();
});
document.getElementById('calc').onclick=()=>{
  const n=+document.getElementById('nb').value||0;
  const p=+document.getElementById('prix').value||0;
  document.getElementById('revenu').textContent=`= ${(n*p).toLocaleString('fr-FR')} € / mois`;
};
generate();
