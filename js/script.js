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
const anatomyData = {
  oog: { title: "Het oog", text: "Met de ogen kan een rund zijn omgeving waarnemen. Zicht speelt onder andere een rol bij het herkennen van beweging en andere dieren.", link: "anatomie.html" },
  oor: { title: "Het oor", text: "Runderen hebben een goed gehoor en kunnen hun oren onafhankelijk van elkaar bewegen. Oorstand en beweging kunnen ook iets zeggen over gedrag.", link: "gedrag.html" },
  mond: { title: "De mond", text: "Een rund gebruikt de mond om voer op te nemen. Met de tong en tanden wordt het voer verwerkt voordat het verder door het spijsverteringsstelsel gaat.", link: "voeding.html" },
  buik: { title: "De buik", text: "In de buik bevinden zich de vier magen van een rund. Hierdoor kan een rund plantaardig voer goed benutten en herkauwen.", link: "voeding.html" },
  poot: { title: "De poot en klauw", text: "Sterke en gezonde klauwen zijn belangrijk voor beweging en welzijn. Regelmatige controle helpt problemen vroeg te herkennen.", link: "gezondheid.html" },
  uier: { title: "De uier", text: "Bij een melkkoe bestaat de uier uit vier kwartieren. Een goede uiergezondheid is belangrijk voor het welzijn van de koe en de melkproductie.", link: "gezondheid.html" }
};
document.querySelectorAll(".hotspot").forEach(button => {
  button.addEventListener("click", () => {
    const data = anatomyData[button.dataset.part];
    if (!data) return;
    document.getElementById("partTitle").textContent = data.title;
    document.getElementById("partText").textContent = data.text;
    document.getElementById("partLink").href = data.link;
    document.querySelector(".info-tag").textContent = "Geselecteerd";
  });
});
