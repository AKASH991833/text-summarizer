module.exports.run = async (page, base, shot) => {
  const out=[];
  await page.evaluate(()=>document.querySelector('#sampleBtn').click());
  await new Promise(r=>setTimeout(r,600));
  out.push(['words in/out/comp', await page.evaluate(()=>[document.querySelector('#stOrig').textContent,document.querySelector('#stSum').textContent,document.querySelector('#stComp').textContent].join('/'))]);
  const sum=await page.evaluate(()=>document.querySelector('#summary').innerText);
  out.push(['summary len>50', String(sum.length>50), sum.slice(0,90)]);
  out.push(['keywords', await page.evaluate(()=>document.querySelectorAll('.kw').length)]);
  out.push(['highlighted sents', await page.evaluate(()=>document.querySelectorAll('#orig mark').length)]);
  out.push(['flesch', await page.evaluate(()=>document.querySelector('#stRead').textContent)]);
  // length slider effect
  await page.evaluate(()=>{const l=document.querySelector('#len');l.value=10;l.dispatchEvent(new Event('input'));document.querySelector('#sumBtn').click()});
  await new Promise(r=>setTimeout(r,400));
  out.push(['at 10% words out', await page.evaluate(()=>document.querySelector('#stSum').textContent)]);
  await page.evaluate(()=>{const l=document.querySelector('#len');l.value=25;l.dispatchEvent(new Event('input'))});
  await page.screenshot({path:shot});
  return out;
};
