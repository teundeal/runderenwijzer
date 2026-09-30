const stages = [
  { title: "Kalf", text: "De eerste levensfase", emoji: "🐮", size: "scale(0.72)" },
  { title: "Jong rund", text: "In de groeifase", emoji: "🐮", size: "scale(0.86)" },
  { title: "Jongvolwassen", text: "Bijna volgroeid", emoji: "🐄", size: "scale(0.96)" },
  { title: "Volwassen rund", text: "Volgroeid rund", emoji: "🐄", size: "scale(1.08)" }
];
const cow = document.getElementById("cowIllustration");
const title = document.getElementById("growthTitle");
const text = document.getElementById("growthText");
const number = document.getElementById("growthNumber");
const fill = document.getElementById("growthFill");
let stage = 0;

function showStage() {
  const current = stages[stage];
  cow.style.transform = "scale(0.55)";
  setTimeout(() => {
    cow.textContent = current.emoji;
    cow.style.transform = current.size;
    title.textContent = current.title;
    text.textContent = current.text;
    number.textContent = (stage + 1) + " / " + stages.length;
    fill.style.width = ((stage + 1) / stages.length * 100) + "%";
  }, 180);
}
setInterval(() => {
  stage = (stage + 1) % stages.length;
  showStage();
}, 2600);
showStage();