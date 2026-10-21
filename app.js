/* TextRank extractive summarizer + keywords + readability */
(function(){
'use strict';
const STOP=new Set('the a an and or but if then else when at by for with about into through during before after above below to from up down in out on off over under again further once here there all any both each few more most other some such no nor not only own same so than too very can will just should now i me my we our you your he him his she her it its they them their this that these those am is are was were be been being have has had having do does did doing would could ought as of'.split(' '));
function sentences(text){
  return text.replace(/\s+/g,' ').match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g)?.map(s=>s.trim()).filter(s=>s.length>1)||[];
}
function words(s){return s.toLowerCase().match(/[a-z][a-z'-]*/g)?.filter(w=>!STOP.has(w))||[]}
function textrank(sents){
  const n=sents.length;
  if(n===0)return{scores:[],sim:null};
  const bow=sents.map(s=>new Set(words(s)));
  const sim=Array.from({length:n},()=>Array(n).fill(0));
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    let inter=0;for(const w of bow[i])if(bow[j].has(w))inter++;
    const denom=Math.log2(1+bow[i].size)+Math.log2(1+bow[j].size);
    const s=denom?inter/denom:0;sim[i][j]=sim[j][i]=s;
  }
  let scores=Array(n).fill(1/n);const d=0.85;
  for(let it=0;it<40;it++){
    const next=Array(n).fill((1-d)/n);
    for(let j=0;j<n;j++){
      let sum=0;for(let k=0;k<n;k++)sum+=sim[j][k];
      if(sum===0)continue;
      for(let i=0;i<n;i++)if(sim[j][i])next[i]+=d*sim[j][i]/sum*scores[j];
    }
    scores=next;
  }
  return{scores,sim};
}
function flesch(text){
  const sents=Math.max(1,(text.match(/[.!?]+/g)||[]).length);
  const ws=text.match(/[a-zA-Z']+/g)||[];
  const syl=w=>{w=w.toLowerCase().replace(/[^a-z]/g,'');if(!w)return 1;let c=(w.match(/[aeiouy]+/g)||[]).length;if(w.endsWith('e'))c--;return Math.max(1,c)};
  const sy=ws.reduce((a,w)=>a+syl(w),0);
  if(!ws.length)return 0;
  return Math.round(206.835-1.015*(ws.length/sents)-84.6*(sy/ws.length));
}
function summarize(){
  const text=$('#input').value.trim();
  if(!text){toast('Paste some text first');return}
  const sents=sentences(text);
  if(sents.length<3){toast('Need at least 3 sentences to summarize');return}
  const{scores}=textrank(sents);
  const totalWords=text.split(/\s+/).length;
  const target=Math.max(1,Math.round(sents.length*(+$('#len').value)/100));
  const ranked=scores.map((s,i)=>({s,i})).sort((a,b)=>b.s-a.s);
  const chosen=ranked.slice(0,target).sort((a,b)=>a.i-b.i);
  const chosenSet=new Set(chosen.map(c=>c.i));
  const sumText=chosen.map(c=>sents[c.i]).join(' ');
  $('#summary').innerHTML=chosen.map(c=>`<span class="sent-hl" title="TextRank score ${c.s.toFixed(4)}">${esc(sents[c.i])}</span>`).join(' ');
  $('#stOrig').textContent=totalWords;
  $('#stSum').textContent=sumText.split(/\s+/).length;
  $('#stComp').textContent=Math.round(100*(1-sumText.split(/\s+/).length/totalWords))+'%';
  $('#stRead').textContent=flesch(text);
  // keywords
  const freq={};words(text).forEach(w=>{if(w.length>2)freq[w]=(freq[w]||0)+1});
  const kws=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,12);
  const max=kws.length?kws[0][1]:1;
  $('#kw').innerHTML=kws.map(([w,c])=>`<span class="kw">${esc(w)}<span class="bar"><i style="width:${Math.round(100*c/max)}%"></i></span><span style="color:var(--ink-faint);font-size:.74rem">${c}</span></span>`).join('')||'<span style="color:var(--ink-faint)">No keywords found.</span>';
  // highlighted original
  $('#orig').innerHTML=sents.map((s,i)=>chosenSet.has(i)?`<mark>${esc(s)}</mark>`:esc(s)).join(' ');
  toast('Summary ready');
}
$('#sumBtn').addEventListener('click',summarize);
$('#len').addEventListener('input',()=>$('#lenVal').textContent=$('#len').value+'%');
$('#sampleBtn').addEventListener('click',()=>{
  $('#input').value=`Artificial intelligence has moved from research labs into everyday life over the past decade. Systems that once needed supercomputers now run on ordinary phones, translating speech, recognising faces and recommending what to watch next. The change happened because of three forces working together: much larger datasets, faster graphics processors, and better learning algorithms.
Machine learning models learn patterns from examples instead of following hand-written rules. A spam filter, for instance, studies millions of labelled emails and discovers which words and senders signal junk. The same approach powers medical tools that flag tumours in scans and farm apps that spot plant disease from a leaf photo.
Yet the technology has real limits. Models can inherit bias from their training data, and they often cannot explain why they made a decision. Small changes to an image, invisible to humans, can fool a classifier completely. These weaknesses matter most when systems make decisions about loans, jobs or healthcare.
Researchers are responding on several fronts. Explainability tools show which parts of an input influenced a prediction. Adversarial training makes models harder to fool, and careful dataset curation reduces bias. Regulators in many countries are also writing rules for high-risk uses.
The next decade will likely bring models that reason more reliably and use far less energy. For now, the healthiest attitude is neither hype nor fear: these are powerful tools that still need thoughtful humans in charge.`;
  summarize();
});
$('#copyBtn').addEventListener('click',()=>{
  const t=$('#summary').innerText.trim();if(!t||t.includes('appears here')){toast('No summary yet');return}
  navigator.clipboard.writeText(t).then(()=>toast('Summary copied'));
});
$('#dlBtn').addEventListener('click',()=>{
  const t=$('#summary').innerText.trim();if(!t||t.includes('appears here')){toast('No summary yet');return}
  const a=document.createElement('a');a.download='summary.txt';a.href=URL.createObjectURL(new Blob([t],{type:'text/plain'}));a.click();
});
})();
