const stages = [
  { title: "Kalf", text: "0 tot 6 maanden · jong rund", image: "images/kalf.jpg.png", size: "scale(.88)" },
  { title: "Pink", text: "6 tot ongeveer 18 maanden · vrouwelijk rund dat nog niet heeft gekalfd", image: "images/pink.jpg.png", size: "scale(.96)" },
  { title: "Vaars", text: "Ongeveer 15 tot 24 maanden · vrouwelijk rund tot de eerste kalving", image: "images/vaars.jpg.png", size: "scale(1)" },
  { title: "Koe", text: "Volwassen vrouwelijk rund na het eerste kalf", image: "images/koe.jpg.png", size: "scale(1.05)" }
];

const cow = document.getElementById("cowIllustration");
const title = document.getElementById("growthTitle");
const description = document.getElementById("growthText");
const number = document.getElementById("growthNumber");
const fill = document.getElementById("growthFill");

if (cow && title && description && number && fill) {
  let stage = 0;

  function showStage() {
    const current = stages[stage];
    cow.classList.add("is-changing");
    window.setTimeout(() => {
      cow.src = current.image;
      cow.alt = current.title;
      cow.style.transform = current.size;
      title.textContent = current.title;
      description.textContent = current.text;
      number.textContent = (stage + 1) + " / " + stages.length;
      fill.style.width = ((stage + 1) / stages.length * 100) + "%";
      cow.classList.remove("is-changing");
    }, 180);
  }

  cow.addEventListener("error", () => {
    cow.alt = "Afbeelding ontbreekt: " + stages[stage].image;
  });

  window.setInterval(() => {
    stage = (stage + 1) % stages.length;
    showStage();
  }, 4000);

  showStage();
}

const anatomyData = {
  oog: { title: "Het oog", text: "Met de ogen kan een rund zijn omgeving waarnemen. Zicht speelt onder andere een rol bij het herkennen van beweging en andere dieren.", link: "anatomie.html" },
  oor: { title: "Het oor", text: "Runderen hebben een goed gehoor en kunnen hun oren onafhankelijk van elkaar bewegen. Oorstand en beweging kunnen ook iets zeggen over gedrag.", link: "gedrag.html" },
  mond: { title: "De mond", text: "Een rund gebruikt de mond om voer op te nemen. Met de tong en tanden wordt het voer verwerkt voordat het verder door het spijsverteringsstelsel gaat.", link: "voeding.html" },
  buik: { title: "De buik", text: "In de buik bevinden zich de vier magen van een rund. Hierdoor kan een rund plantaardig voer goed benutten en herkauwen.", link: "voeding.html" },
  poot: { title: "De poot en klauw", text: "Sterke en gezonde klauwen zijn belangrijk voor beweging en welzijn. Regelmatige controle helpt problemen vroeg te herkennen.", link: "gezondheid.html" },
  uier: { title: "De uier", text: "Bij een melkkoe bestaat de uier uit vier kwartieren. Een goede uiergezondheid is belangrijk voor het welzijn van de koe en de melkproductie.", link: "gezondheid.html" }
};

const anatomyStorageKey = "runderenwijzer-hotspots-v1";
function loadAnatomyData() {
  try {
    const saved = JSON.parse(localStorage.getItem(anatomyStorageKey) || "{}");
    Object.keys(saved).forEach(key => {
      if (anatomyData[key]) anatomyData[key] = { ...anatomyData[key], ...saved[key] };
    });
  } catch (e) {}
}
loadAnatomyData();

function showAnatomyPart(key) {
  const data = anatomyData[key];
  if (!data) return;
  const partTitle = document.getElementById("partTitle");
  const partText = document.getElementById("partText");
  const partLink = document.getElementById("partLink");
  const infoTag = document.querySelector(".info-tag");
  if (partTitle) partTitle.textContent = data.title;
  if (partText) partText.textContent = data.text;
  if (partLink) partLink.href = data.link;
  if (infoTag) infoTag.textContent = "Geselecteerd";
}

document.querySelectorAll(".hotspot").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.part;
    showAnatomyPart(key);
    if (document.body.classList.contains("edit-mode")) {
      openHotspotEditor(key);
    }
  });
});

const editStoragePrefix = "runderenwijzer-page-v1:";
let editableElements = [];
let originalHTML = new Map();
let editMode = false;
let activePageKey = location.pathname.replace(/\/+$/, "") || "/";

function getEditableElements() {
  return Array.from(document.querySelectorAll(
    "main h1, main h2, main h3, main p, main .growth-info strong, main .growth-info span"
  )).filter(el => !el.closest(".button") && !el.closest(".hotspot"));
}

function storageKeyFor(index) {
  return editStoragePrefix + activePageKey + ":" + index;
}

function loadPageEdits() {
  editableElements = getEditableElements();
  editableElements.forEach((el, index) => {
    const saved = localStorage.getItem(storageKeyFor(index));
    if (saved !== null) el.innerHTML = saved;
  });
}

function setEditState(on) {
  editMode = on;
  document.body.classList.toggle("edit-mode", on);
  editableElements.forEach(el => {
    el.contentEditable = on ? "true" : "false";
    el.spellcheck = on;
  });
  const toolbar = document.getElementById("editorToolbar");
  const status = document.getElementById("editorStatus");
  if (toolbar) toolbar.classList.toggle("editing", on);
  if (status) status.textContent = on
    ? "Je kunt nu op de tekst klikken en typen."
    : "Wijzigingen worden op deze computer opgeslagen.";
}

function savePageEdits() {
  editableElements.forEach((el, index) => {
    localStorage.setItem(storageKeyFor(index), el.innerHTML);
  });
  localStorage.setItem(editStoragePrefix + activePageKey + ":saved", "1");
}

function cancelPageEdits() {
  editableElements.forEach(el => {
    const original = originalHTML.get(el);
    if (original !== undefined) el.innerHTML = original;
  });
}

function resetPageEdits() {
  editableElements.forEach((el, index) => {
    localStorage.removeItem(storageKeyFor(index));
  });
  location.reload();
}

function openHotspotEditor(key) {
  const data = anatomyData[key];
  if (!data) return;
  const panel = document.getElementById("hotspotEditor");
  if (!panel) return;
  panel.dataset.key = key;
  panel.querySelector("[data-editor-title]").value = data.title;
  panel.querySelector("[data-editor-text]").value = data.text;
  panel.querySelector("[data-editor-link]").value = data.link;
  panel.classList.add("visible");
}

function saveHotspotEditor() {
  const panel = document.getElementById("hotspotEditor");
  if (!panel) return;
  const key = panel.dataset.key;
  if (!anatomyData[key]) return;
  anatomyData[key].title = panel.querySelector("[data-editor-title]").value.trim() || anatomyData[key].title;
  anatomyData[key].text = panel.querySelector("[data-editor-text]").value.trim() || anatomyData[key].text;
  anatomyData[key].link = panel.querySelector("[data-editor-link]").value.trim() || anatomyData[key].link;
  const saved = JSON.parse(localStorage.getItem(anatomyStorageKey) || "{}");
  saved[key] = anatomyData[key];
  localStorage.setItem(anatomyStorageKey, JSON.stringify(saved));
  showAnatomyPart(key);
  panel.classList.remove("visible");
}

function createEditorUI() {
  if (document.getElementById("editorToolbar")) return;

  const toolbar = document.createElement("div");
  toolbar.id = "editorToolbar";
  toolbar.innerHTML = `
    <button type="button" class="editor-main-btn" data-action="toggle">✎ Bewerken</button>
    <span id="editorStatus">Wijzigingen worden op deze computer opgeslagen.</span>
    <button type="button" data-action="save" hidden>Opslaan</button>
    <button type="button" data-action="cancel" hidden>Annuleren</button>
    <button type="button" data-action="reset">Wis mijn wijzigingen</button>
  `;
  document.body.appendChild(toolbar);

  toolbar.addEventListener("click", event => {
    const action = event.target.closest("button")?.dataset.action;
    if (!action) return;
    if (action === "toggle") {
      if (editMode) {
        savePageEdits();
        setEditState(false);
      } else {
        originalHTML = new Map(editableElements.map(el => [el, el.innerHTML]));
        setEditState(true);
      }
      const toggle = toolbar.querySelector('[data-action="toggle"]');
      if (toggle) toggle.textContent = editMode ? "✓ Bewerkmodus aan" : "✎ Bewerken";
      toolbar.querySelector('[data-action="save"]').hidden = !editMode;
      toolbar.querySelector('[data-action="cancel"]').hidden = !editMode;
    }
    if (action === "save") {
      savePageEdits();
      setEditState(false);
      toolbar.querySelector('[data-action="toggle"]').textContent = "✎ Bewerken";
      toolbar.querySelector('[data-action="save"]').hidden = true;
      toolbar.querySelector('[data-action="cancel"]').hidden = true;
    }
    if (action === "cancel") {
      cancelPageEdits();
      setEditState(false);
      toolbar.querySelector('[data-action="toggle"]').textContent = "✎ Bewerken";
      toolbar.querySelector('[data-action="save"]').hidden = true;
      toolbar.querySelector('[data-action="cancel"]').hidden = true;
    }
    if (action === "reset") {
      if (window.confirm("Wil je jouw eigen wijzigingen op deze pagina wissen?")) resetPageEdits();
    }
  });

  if (document.querySelector(".hotspot")) {
    const panel = document.createElement("div");
    panel.id = "hotspotEditor";
    panel.innerHTML = `
      <div class="hotspot-editor-box">
        <button type="button" class="hotspot-editor-close" aria-label="Sluiten">×</button>
        <h3>Lichaamsdeel bewerken</h3>
        <label>Titel<input type="text" data-editor-title></label>
        <label>Uitleg<textarea rows="6" data-editor-text></textarea></label>
        <label>Link<input type="text" data-editor-link></label>
        <button type="button" class="button" data-editor-save>Opslaan</button>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelector(".hotspot-editor-close").addEventListener("click", () => panel.classList.remove("visible"));
    panel.querySelector("[data-editor-save]").addEventListener("click", saveHotspotEditor);
  }
}

loadPageEdits();
createEditorUI();

