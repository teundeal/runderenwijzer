const stages = [
  {title:"Kalf",text:"0 tot 6 maanden · jong rund",image:"images/kalf.jpg.png",size:"scale(.88)"},
  {title:"Pink",text:"6 tot ongeveer 18 maanden · vrouwelijk rund dat nog niet heeft gekalfd",image:"images/pink.jpg.png",size:"scale(.96)"},
  {title:"Vaars",text:"Ongeveer 15 tot 24 maanden · vrouwelijk rund tot de eerste kalving",image:"images/vaars.jpg.png",size:"scale(1)"},
  {title:"Koe",text:"Volwassen vrouwelijk rund na het eerste kalf",image:"images/koe.jpg.png",size:"scale(1.05)"}
];

const editPrefix="runderenwijzer-page-v2:";
const pageKey=location.pathname.replace(/\/+$/,"")||"/";

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
  oog:{title:"Het oog",text:"Met de ogen kan een rund zijn omgeving waarnemen. Zicht speelt onder andere een rol bij het herkennen van beweging en andere dieren.",link:"anatomie.html"},
  oor:{title:"Het oor",text:"Runderen hebben een goed gehoor en kunnen hun oren onafhankelijk van elkaar bewegen. Oorstand en beweging kunnen ook iets zeggen over gedrag.",link:"gedrag.html"},
  mond:{title:"De mond",text:"Een rund gebruikt de mond om voer op te nemen. Met de tong en tanden wordt het voer verwerkt voordat het verder door het spijsverteringsstelsel gaat.",link:"voeding.html"},
  buik:{title:"De buik",text:"In de buik bevinden zich de vier magen van een rund. Hierdoor kan een rund plantaardig voer goed benutten en herkauwen.",link:"voeding.html"},
  poot:{title:"De poot en klauw",text:"Sterke en gezonde klauwen zijn belangrijk voor beweging en welzijn. Regelmatige controle helpt problemen vroeg te herkennen.",link:"gezondheid.html"},
  uier:{title:"De uier",text:"Bij een melkkoe bestaat de uier uit vier kwartieren. Een goede uiergezondheid is belangrijk voor het welzijn van de koe en de melkproductie.",link:"gezondheid.html"}
};

const anatomySaved=JSON.parse(localStorage.getItem(editPrefix+"hotspots")||"{}");
Object.keys(anatomySaved).forEach(k=>{if(anatomyData[k])anatomyData[k]={...anatomyData[k],...anatomySaved[k]};});

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
  return [...document.querySelectorAll("main h1,main h2,main h3,main p,main .growth-info strong,main .growth-info span")]
    .filter(el=>!el.closest(".button")&&!el.closest(".hotspot"));
}
function loadTextEdits(){
  editable=collectEditable();
  editable.forEach((el,i)=>{
    const saved=localStorage.getItem(pageEditKey(i));
    if(saved!==null)el.innerHTML=saved;
  });
}
function saveTextEdits(){editable.forEach((el,i)=>localStorage.setItem(pageEditKey(i),el.innerHTML));}
function clearTextEdits(){editable.forEach((el,i)=>localStorage.removeItem(pageEditKey(i)));}

const addedImagesKey=editPrefix+"added:"+pageKey;
function getAddedImages(){try{return JSON.parse(localStorage.getItem(addedImagesKey)||"[]")}catch(e){return []}}
function saveAddedImages(list){localStorage.setItem(addedImagesKey,JSON.stringify(list))}
function renderAddedImages(){
  let sec=document.getElementById("userAddedImages");
  const main=document.querySelector("main");
  if(!main)return;
  if(!sec){
    sec=document.createElement("section");
    sec.id="userAddedImages";
    sec.className="user-added-images";
    sec.innerHTML='<div class="section-heading"><p class="eyebrow">Eigen beeldmateriaal</p><h2>Mijn afbeeldingen</h2><p>Afbeeldingen die je zelf aan deze pagina hebt toegevoegd.</p></div><div class="user-images-grid"></div>';
    main.appendChild(sec);
  }
  const grid=sec.querySelector(".user-images-grid");
  grid.innerHTML="";
  getAddedImages().forEach((item,i)=>{
    const card=document.createElement("article");
    card.className="user-image-item";
    const img=document.createElement("img");
    img.src=item.src; img.alt=item.name||"Eigen afbeelding"; img.className="user-added-image";
    const p=document.createElement("p"); p.textContent=item.name||"Eigen afbeelding";
    card.append(img,p); grid.appendChild(card);
  });
}
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

  bar.addEventListener("click",e=>{
    const a=e.target.closest("button")?.dataset.a;if(!a)return;
    if(a==="toggle"){
      setEditMode(!editMode);
      e.target.textContent=editMode?"✓ Bewerken aan":"✎ Bewerken";
    }
    if(a==="save"){
      saveTextEdits();
      setEditMode(false);
      bar.querySelector('[data-a="toggle"]').textContent="✎ Bewerken";
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

loadTextEdits();
loadImageEdits();
renderAddedImages();
buildEditor();
setEditMode(false);
