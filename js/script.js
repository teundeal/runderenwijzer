const stages = [
  {title:"Kalf",text:"0 tot 6 maanden · jong rund",image:"images/kalf.jpg.png",size:"scale(.88)"},
  {title:"Pink",text:"6 tot ongeveer 18 maanden · vrouwelijk rund dat nog niet heeft gekalfd",image:"images/pink.jpg.png",size:"scale(.96)"},
  {title:"Vaars",text:"Ongeveer 15 tot 24 maanden · vrouwelijk rund tot de eerste kalving",image:"images/vaars.jpg.png",size:"scale(1)"},
  {title:"Koe",text:"Volwassen vrouwelijk rund na het eerste kalf",image:"images/koe.jpg.png",size:"scale(1.05)"}
];

const editPrefix="runderenwijzer-page-v2:";
const pageKey=location.pathname.replace(/\/+$/,"")||"/";
const editorApi="https://runderenwijze-editor.teunboerlage11.workers.dev/";
let editorPassword="";
function getPageFilePath(){const p=location.pathname.split("/").filter(Boolean);return p.length?p[p.length-1]:"index.html";}
async function verifyEditorPassword(value){
  const response=await fetch(editorApi,{method:"POST",headers:{"Content-Type":"application/json","X-Editor-Password":value},body:JSON.stringify({path:"__auth_check__",content:""})});
  if(response.status===403)return true;
  if(response.status===401)return false;
  throw new Error("De editor kon het wachtwoord niet controleren.");
}
async function getEditorPassword(){
  if(editorPassword)return editorPassword;
  const value=prompt("Voer je editor-wachtwoord in om te kunnen bewerken:");
  if(!value)return null;
  if(!(await verifyEditorPassword(value))){
    alert("Ongeldig wachtwoord.");
    return null;
  }
  editorPassword=value;
  return value;
}
function cleanPageHtml(){
  const clone=document.documentElement.cloneNode(true);
  ["editorToolbar","imageFileInput","hotspotEditor"].forEach(id=>clone.querySelector("#"+id)?.remove());
  clone.querySelectorAll("[contenteditable]").forEach(el=>el.removeAttribute("contenteditable"));
  clone.querySelectorAll("[data-bound]").forEach(el=>el.removeAttribute("data-bound"));
  clone.querySelector("body")?.classList.remove("edit-mode");
  return "<!DOCTYPE html>\n"+clone.outerHTML;
}
async function publishPageToGitHub(){
  const password=await getEditorPassword();
  if(!password)return false;
  const response=await fetch(editorApi,{method:"POST",headers:{"Content-Type":"application/json","X-Editor-Password":password},body:JSON.stringify({path:getPageFilePath(),content:cleanPageHtml(),message:"Wijziging via Runderenwijzer editor"})});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||!result.success)throw new Error(result.error||"Opslaan naar GitHub is mislukt.");
  return true;
}

const cow=document.getElementById("cowIllustration");
if(cow){
  const title=document.getElementById("growthTitle");
  const description=document.getElementById("growthText");
  const number=document.getElementById("growthNumber");
  const fill=document.getElementById("growthFill");
  let stage=0;
  function showStage(){
    const s=stages[stage];
    cow.classList.add("is-changing");
    setTimeout(()=>{
      cow.src=s.image;
      cow.alt=s.title;
      cow.style.transform=s.size;
      if(title)title.textContent=s.title;
      if(description)description.textContent=s.text;
      if(number)number.textContent=(stage+1)+" / "+stages.length;
      if(fill)fill.style.width=((stage+1)/stages.length*100)+"%";
      cow.classList.remove("is-changing");
    },180);
  }
  setInterval(()=>{stage=(stage+1)%stages.length;showStage();},4000);
  showStage();
}

const anatomyData={
  pens:{title:"Pens",text:"Klik op Bewerken om zelf informatie over de pens toe te voegen.",link:"#organen"},
  netmaag:{title:"Netmaag",text:"Klik op Bewerken om zelf informatie over de netmaag toe te voegen.",link:"#organen"},
  boekmaag:{title:"Boekmaag",text:"Klik op Bewerken om zelf informatie over de boekmaag toe te voegen.",link:"#organen"},
  lebmaag:{title:"Lebmaag",text:"Klik op Bewerken om zelf informatie over de lebmaag toe te voegen.",link:"#organen"},
  dunnedarm:{title:"Dunne darm",text:"Klik op Bewerken om zelf informatie over de dunne darm toe te voegen.",link:"#organen"},
  dikkedarm:{title:"Dikke darm",text:"Klik op Bewerken om zelf informatie over de dikke darm toe te voegen.",link:"#organen"},
  lever:{title:"Lever",text:"Klik op Bewerken om zelf informatie over de lever toe te voegen.",link:"#organen"},
  hart:{title:"Hart",text:"Klik op Bewerken om zelf informatie over het hart toe te voegen.",link:"#organen"},
  longen:{title:"Longen",text:"Klik op Bewerken om zelf informatie over de longen toe te voegen.",link:"#organen"},
  nieren:{title:"Nieren",text:"Klik op Bewerken om zelf informatie over de nieren toe te voegen.",link:"#organen"}
};

function showPart(key){
  const d=anatomyData[key]; if(!d)return;
  const t=document.getElementById("partTitle"),p=document.getElementById("partText"),l=document.getElementById("partLink"),tag=document.querySelector(".info-tag");
  if(t)t.textContent=d.title;
  if(p)p.textContent=d.text;
  if(l)l.href=d.link;
  if(tag)tag.textContent="Geselecteerd";
}
function openHotspotEditor(key){
  const d=anatomyData[key],panel=document.getElementById("hotspotEditor"); if(!d||!panel)return;
  panel.dataset.key=key;
  panel.querySelector("[data-editor-title]").value=d.title;
  panel.querySelector("[data-editor-text]").value=d.text;
  panel.querySelector("[data-editor-link]").value=d.link;
  panel.classList.add("visible");
}

document.querySelectorAll(".hotspot").forEach(btn=>btn.addEventListener("click",()=>{
  showPart(btn.dataset.part);
  if(document.body.classList.contains("edit-mode"))openHotspotEditor(btn.dataset.part);
}));

let editMode=false;
let editable=[];

function pageEditKey(i){return editPrefix+"text:"+pageKey+":"+i;}
function collectEditable(){
  return [...document.querySelectorAll("main h1,main h2,main h3,main p,main .growth-info strong,main .growth-info span,footer strong,footer span,footer a")]
    .filter(el=>!el.closest(".button")&&!el.closest(".hotspot"));
}
function loadTextEdits(){
  editable=collectEditable();
  editable.forEach((el,i)=>{
    const saved=localStorage.getItem(pageEditKey(i));
    if(saved!==null)el.innerHTML=saved;
  });
}
async function saveTextEdits(){editable.forEach((el,i)=>localStorage.setItem(pageEditKey(i),el.innerHTML));await publishPageToGitHub();}
function clearTextEdits(){editable.forEach((el,i)=>localStorage.removeItem(pageEditKey(i)));}

const addedImagesKey=editPrefix+"added:"+pageKey;
function getAddedImages(){try{return JSON.parse(localStorage.getItem(addedImagesKey)||"[]")}catch(e){return []}}
function saveAddedImages(list){localStorage.setItem(addedImagesKey,JSON.stringify(list))}
function renderAddedImages(){
  let sec=document.getElementById("userAddedImages");
  const main=document.querySelector("main");
  if(!main)return;
  const list=getAddedImages();
  if(!sec){
    if(!list.length)return;
    sec=document.createElement("section");
    sec.id="userAddedImages";
    sec.className="user-added-images";
    sec.innerHTML='<div class="section-heading"><p class="eyebrow">Bronnen</p><h2>Bronnen</h2><p>Voeg hier de bronnen toe die je voor deze pagina hebt gebruikt.</p></div><div class="user-images-grid"></div>';
    main.appendChild(sec);
  }
  const grid=sec.querySelector(".user-images-grid");
  if(!grid)return;
  if(!list.length)return;
  grid.innerHTML="";
  list.forEach((item,i)=>{
    const card=document.createElement("article");
    card.className="user-image-item";
    const img=document.createElement("img");
    img.src=item.src; img.alt=item.name||"Eigen afbeelding"; img.className="user-added-image";
    const p=document.createElement("p"); p.textContent=item.name||"Eigen afbeelding";
    card.append(img,p); grid.appendChild(card);
  });
}
function imageKey(i){return editPrefix+"image:"+pageKey+":"+i;}
function images(){return [...document.querySelectorAll("main img")].filter(img=>!img.closest(".hotspot"));}

function loadImageEdits(){images().forEach((img,i)=>{const saved=localStorage.getItem(imageKey(i));if(saved)img.src=saved;});}

function pickImage(i){
  const input=document.getElementById("imageFileInput"); if(!input)return;
  input.dataset.index=i;
  input.dataset.mode="replace";
  input.value="";
  input.click();
}
function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=()=>reject(new Error("Afbeelding kon niet worden gelezen."));
    r.readAsDataURL(file);
  });
}
async function addNewImageFromFile(file){
  const data=await fileToDataURL(file);
  const list=getAddedImages();
  list.push({src:data,name:file.name.replace(/\\.[^.]+$/,"")});
  saveAddedImages(list);
  renderAddedImages();
}
document.addEventListener("change",async e=>{
  if(e.target.id!=="imageFileInput")return;
  const file=e.target.files&&e.target.files[0]; if(!file)return;
  const i=Number(e.target.dataset.index);
  try{
    if(e.target.dataset.mode==="add"){
      await addNewImageFromFile(file);
      e.target.dataset.mode="replace";
      const status=document.getElementById("editorStatus");if(status)status.textContent="Nieuwe afbeelding toegevoegd en opgeslagen op deze computer.";
    }else{
      const data=await fileToDataURL(file);
      localStorage.setItem(imageKey(i),data);
      const img=images()[i]; if(img)img.src=data;
      const status=document.getElementById("editorStatus");if(status)status.textContent="Afbeelding aangepast en opgeslagen op deze computer.";
    }
  }catch(err){alert(err.message);}
});

function setEditMode(on){
  editMode=on;
  document.body.classList.toggle("edit-mode",on);
  editable.forEach(el=>el.contentEditable=on?"true":"false");
  images().forEach((img,i)=>{
    img.classList.toggle("editable-image",on);
    if(on&&!img.dataset.bound){
      img.addEventListener("click",e=>{e.preventDefault();pickImage(i);});
      img.dataset.bound="1";
    }
  });
  const status=document.getElementById("editorStatus");
  if(status)status.textContent=on?"Klik op tekst om te typen. Klik op een afbeelding om die te vervangen.":"Wijzigingen worden op deze computer opgeslagen.";
}

function buildEditor(){
  if(document.getElementById("editorToolbar"))return;
  const bar=document.createElement("div");
  bar.id="editorToolbar";
  bar.innerHTML='<button class="editor-main-btn" data-a="toggle">✎ Bewerken</button><span id="editorStatus">Wijzigingen worden op deze computer opgeslagen.</span><button data-a="save">Opslaan</button><button data-a="add-image">+ Nieuwe afbeelding</button><button data-a="reset">Wis mijn wijzigingen</button>';
  document.body.appendChild(bar);

  const input=document.createElement("input");
  input.type="file"; input.accept="image/*"; input.id="imageFileInput"; input.hidden=true;
  document.body.appendChild(input);

  bar.addEventListener("click",async e=>{
    const a=e.target.closest("button")?.dataset.a;if(!a)return;
    if(a==="toggle"){
      if(editMode){
        setEditMode(false);
        e.target.textContent="✎ Bewerken";
        return;
      }
      try{
        const password=await getEditorPassword();
        if(!password)return;
        setEditMode(true);
        e.target.textContent="✓ Bewerken aan";
      }catch(err){
        alert(err.message);
      }
    }
    if(a==="save"){
      const status=document.getElementById("editorStatus");
      const saveButton=bar.querySelector('[data-a="save"]');
      try{
        if(saveButton)saveButton.disabled=true;
        if(status)status.textContent="Wijzigingen worden naar GitHub opgeslagen...";
        await saveTextEdits();
        setEditMode(false);
        bar.querySelector('[data-a="toggle"]').textContent="✎ Bewerken";
        if(status)status.textContent="Opgeslagen op GitHub. De website wordt zo bijgewerkt.";
      }catch(err){
        if(status)status.textContent="Opslaan mislukt: "+err.message;
        alert(err.message);
      }finally{
        if(saveButton)saveButton.disabled=false;
      }
    }
    if(a==="add-image"){
      if(!editMode){alert("Klik eerst op 'Bewerken'.");return;}
      input.dataset.mode="add";
      input.dataset.index="";
      input.value="";
      input.click();
    }
    if(a==="reset"){
      if(confirm("Wil je jouw wijzigingen op deze pagina wissen?")){clearTextEdits();Object.keys(localStorage).filter(k=>k.startsWith(editPrefix+"image:"+pageKey+":")).forEach(k=>localStorage.removeItem(k));localStorage.removeItem(addedImagesKey);location.reload();}
    }
  });

  if(document.querySelector(".hotspot")){
    const panel=document.createElement("div");
    panel.id="hotspotEditor";
    panel.innerHTML='<div class="hotspot-editor-box"><button type="button" class="hotspot-editor-close">×</button><h3>Lichaamsdeel bewerken</h3><label>Titel<input data-editor-title></label><label>Uitleg<textarea rows="6" data-editor-text></textarea></label><label>Link<input data-editor-link></label><button type="button" class="button" data-editor-save>Opslaan</button></div>';
    document.body.appendChild(panel);
    panel.querySelector(".hotspot-editor-close").onclick=()=>panel.classList.remove("visible");
    panel.querySelector("[data-editor-save]").onclick=()=>{
      const k=panel.dataset.key;if(!k)return;
      anatomyData[k]={title:panel.querySelector("[data-editor-title]").value,text:panel.querySelector("[data-editor-text]").value,link:panel.querySelector("[data-editor-link]").value};
      localStorage.setItem(editPrefix+"hotspots",JSON.stringify(anatomyData));
      showPart(k);panel.classList.remove("visible");
    };
  }
}

renderAddedImages();
loadTextEdits();
loadImageEdits();
buildEditor();
setEditMode(false);


/* Signalement mini-game */
const checkSignal=document.getElementById("checkSignal");
if(checkSignal){
  checkSignal.addEventListener("click",()=>{
    const fields=[...document.querySelectorAll("[data-signal]")];
    const result=document.getElementById("signalResult");
    const complete=fields.every(field=>field.value);
    if(!complete){result.textContent="Vul eerst alle kenmerken in.";return;}
    const score=fields.filter(field=>field.value==="correct").length;
    result.textContent=score===fields.length?"Goed gedaan! Je hebt het rund volledig correct geïdentificeerd.":"Je hebt "+score+" van de "+fields.length+" kenmerken goed. Kijk opnieuw naar het signalement.";
  });
}

/* Klikbare anatomieplaten met kleine, lokaal opgeslagen informatiebox */
const anatomyInfoKey=editPrefix+"anatomy-info:"+pageKey;
function getAnatomyInfo(){
  try{return JSON.parse(localStorage.getItem(anatomyInfoKey)||"{}")}catch(e){return {}}
}
const anatomyInfo=getAnatomyInfo();
const anatomyTitles={
  mond:"Mond",speekselklieren:"Speekselklieren",slokdarm:"Slokdarm",pens:"Pens",netmaag:"Netmaag",boekmaag:"Boekmaag",lebmaag:"Lebmaag",
  lever:"Lever",alvleesklier:"Alvleesklier",blindedarm:"Blinde darm",dunnedarm:"Dunne darm",dikkedarm:"Dikke darm",endeldarm:"Endeldarm",anus:"Anus",
  oor:"Oor",oog:"Oog",neus:"Neus",hoorn:"Hoorn",nek:"Nek",schouder:"Schouder",rug:"Rug",buik:"Buik",
  uier:"Uier",staart:"Staart",heup:"Heup",been:"Been",klauw:"Klauw",kogel:"Kogel"
};
function showAnatomyPart(key,btn){
  const title=anatomyTitles[key]||key;
  const d=anatomyInfo[key]||"Klik op Bewerken om hier je eigen uitleg in te vullen.";
  const section=btn?.closest(".anatomy-plate-section");
  const popup=section?.querySelector(".anatomy-popup");
  const t=popup?.querySelector("[data-popup-title]") || popup?.querySelector("#anatomyPopupTitle");
  const p=popup?.querySelector("[data-popup-text]") || popup?.querySelector("#anatomyPopupText");
  if(t)t.textContent=title;
  if(p)p.textContent=d;
}
let selectedAnatomyButton=null;

/* In de bewerkmodus kunnen anatomiepunten rechtstreeks worden versleept. */
let draggedAnatomyPoint=null;
let anatomyPointerStart=null;
let suppressAnatomyClick=false;
document.querySelectorAll(".anatomy-plate .anatomy-part").forEach(btn=>{
  btn.addEventListener("pointerdown",e=>{
    if(!editMode || e.button!==0)return;
    const wrap=btn.closest(".anatomy-image-wrap");
    if(!wrap)return;
    const rect=wrap.getBoundingClientRect();
    draggedAnatomyPoint={btn,wrap,pointerId:e.pointerId,moved:false};
    anatomyPointerStart={x:e.clientX,y:e.clientY,left:parseFloat(btn.style.left)||0,top:parseFloat(btn.style.top)||0,width:rect.width,height:rect.height};
    btn.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  btn.addEventListener("pointermove",e=>{
    if(!draggedAnatomyPoint || draggedAnatomyPoint.btn!==btn || draggedAnatomyPoint.pointerId!==e.pointerId)return;
    const dx=e.clientX-anatomyPointerStart.x,dy=e.clientY-anatomyPointerStart.y;
    if(Math.abs(dx)+Math.abs(dy)>2)draggedAnatomyPoint.moved=true;
    if(!draggedAnatomyPoint.moved)return;
    const left=Math.max(0,Math.min(100,anatomyPointerStart.left+dx/anatomyPointerStart.width*100));
    const top=Math.max(0,Math.min(100,anatomyPointerStart.top+dy/anatomyPointerStart.height*100));
    btn.style.left=left.toFixed(2)+"%";
    btn.style.top=top.toFixed(2)+"%";
    const status=document.getElementById("editorStatus");
    if(status)status.textContent="Punt verplaatst. Sleep andere punten en klik daarna op Opslaan.";
    e.preventDefault();
  });
  const finishDrag=e=>{
    if(!draggedAnatomyPoint || draggedAnatomyPoint.btn!==btn || draggedAnatomyPoint.pointerId!==e.pointerId)return;
    suppressAnatomyClick=draggedAnatomyPoint.moved;
    draggedAnatomyPoint=null;
    anatomyPointerStart=null;
  };
  btn.addEventListener("pointerup",finishDrag);
  btn.addEventListener("pointercancel",finishDrag);
});
document.querySelectorAll(".anatomy-part").forEach(btn=>btn.addEventListener("click",e=>{
  if(suppressAnatomyClick){suppressAnatomyClick=false;e.preventDefault();return;}

  const key=btn.dataset.anatomy;
  selectedAnatomyButton=btn;
  showAnatomyPart(key,btn);
  const editor=document.querySelector("[data-anatomy-info-editor]");
  if(editor){
    editor.dataset.key=key;
    editor.value=anatomyInfo[key]||"";
  }
}));
document.querySelectorAll("[data-anatomy-info-save]").forEach(btn=>btn.addEventListener("click",()=>{
  const editor=document.querySelector("[data-anatomy-info-editor]");
  const key=editor?.dataset.key;
  if(!key)return;
  anatomyInfo[key]=editor.value.trim();
  localStorage.setItem(anatomyInfoKey,JSON.stringify(anatomyInfo));
  showAnatomyPart(key,selectedAnatomyButton);
  const status=document.getElementById("editorStatus");
  if(status)status.textContent="Uitleg opgeslagen op deze computer.";
}));
