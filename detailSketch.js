let colorScale = {
  'Physics': '#5B9BFF',
  'Chemistry': '#3FD1BE',
  'Physiology or Medicine': '#FF6B4A',
  'Literature': '#FFC247',
  'Peace': '#8FD16B',
  'Economic Sciences': '#C58BFF',
}

let nomiCategorie = {
  'Physics': 'Fisica',
  'Chemistry': 'Chimica',
  'Physiology or Medicine': 'Medicina',
  'Literature': 'Letteratura',
  'Peace': 'Pace',
  'Economic Sciences': 'Economia',
}

let data;

// variabili in cui salvo la selezione fatta nella homepage
let selectedCategory;
let selectedDecade;
let selectedGender;

// lista dei laureati che corrispondono alla selezione
let laureates = [];

// Layout
let margine = 30;
let yTabella = 150;
let altezzaRiga = 40;

// Testo del link per tornare alla homepage e stato del rollover
let testoLink = "← Homepage";
let hoveredLink = false;

async function setup() {

  // carico i dati
  data = await loadTable("assets/nobel_prize_laureates_1901_2026.csv", ",", "header");

  // Legge i parametri passati nell'URL -
  let params = getURLParams();

  // salvo la selezione; decodeURIComponent riporta "%20" a uno spazio - AIUTO AI - non sapevo degli spazi nell'url
  selectedCategory = decodeURIComponent(params.category);
  selectedDecade = int(params.decade);
  selectedGender = params.gender;

  // Ogni riga del CSV: tengo solo i laureati della categoria, del decennio e del genere scelti
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let category = data.getString(rowNumber, "category");
    let gender = data.getString(rowNumber, "gender");
    let year = data.getNum(rowNumber, "awardYear");

    // Decennio di appartenenza
    let decade = floor(year / 10) * 10;

    // Le organizzazioni sono escluse da sole: il genere deve essere "male" o "female"
    if (category == selectedCategory && decade == selectedDecade && gender == selectedGender) {
      laureates.push({
        name: data.getString(rowNumber, "knownName"),
        year: year,
        birthDate: data.getString(rowNumber, "birthDate"),
        prize: data.getNum(rowNumber, "prizeAmount"),
      });
    }
  }

  // Ordino i laureati dall'anno più vecchio al più recente
 for (let g = 0; g < laureates.length - 1; g++) {
  for (let i = 0; i < laureates.length - 1 - g; i++) {
    if (laureates[i].year > laureates[i + 1].year) {
      let temporaneo = laureates[i];
      laureates[i] = laureates[i + 1];
      laureates[i + 1] = temporaneo;
    }
  }
}

  // creo il canvas, alto abbastanza per tutte le righe: se non ci stanno compare lo scroll
  createCanvas(windowWidth, yTabella + 25 + max(laureates.length, 1) * altezzaRiga + margine);

  // Evita la barra di scorrimento orizzontale causata dalla barra verticale
  document.body.style.overflowX = "hidden";
}

function draw() {
  background("#000000");

  // draw() parte anche prima che i dati siano caricati: aspetto.
  if (data == undefined) {
    return;
  }

  // Posizioni delle colonne
  let xNome = margine;
  let xAnno = width * 0.45;
  let xNascita = width * 0.58;
  let xPrize = width - margine;

  noStroke();

  // Link per tornare alla homepage
  textSize(14);
  textAlign(LEFT, TOP);
  let larghezzaLink = textWidth(testoLink);
  hoveredLink = mouseX >= margine && mouseX <= margine + larghezzaLink && mouseY >= 20 && mouseY <= 42;
  fill(235);
  text(testoLink, margine, 25);
  // sottolineatura al rollover
  if (hoveredLink) {
    stroke(235);
    strokeWeight(1);
    line(margine, 42, margine + larghezzaLink, 42);
    noStroke();
  } 

  // Titolo, nel colore della categoria
  fill(colorScale[selectedCategory]);
  textSize(34);
  textStyle(BOLD);
  text(nomiCategorie[selectedCategory] + ", " + selectedDecade + "s", margine, 65);
  textStyle(NORMAL);

  // Sottotitolo: genere e numero di laureati
  let genere = "Uomini";
  if (selectedGender == "female") {
    genere = "Donne";
  }
  fill(200);
  textSize(16);
  text(genere + ": " + laureates.length + " laureati", margine, 108);

  // Intestazione della tabella: serve da legenda delle colonne
  fill(140);
  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("Nome", xNome, yTabella);
  text("Anno del premio", xAnno, yTabella);
  text("Data di nascita", xNascita, yTabella);
  textAlign(RIGHT, CENTER);
  text("Prize amount", xPrize, yTabella);
  textStyle(NORMAL);

  stroke(80);
  strokeWeight(1);
  line(margine, yTabella + 15, width - margine, yTabella + 15);

  // Se la selezione non ha laureati (per esempio URL sbagliato) lo dico
  if (laureates.length == 0) {
    noStroke();
    fill(235);
    textAlign(LEFT, CENTER);
    textSize(15);
    text("Nessun laureato trovato per questa selezione.", margine, yTabella + 40);
    return;
  }

  // Ogni laureato diventa una riga
  for (let i = 0; i < laureates.length; i++) {
    let yTop = yTabella + 25 + i * altezzaRiga;
    let yCentro = yTop + altezzaRiga / 2;

    // Rollover: sfondo grigio scuro sulla riga sotto il mouse
    if (mouseY >= yTop && mouseY < yTop + altezzaRiga) {
      noStroke();
      fill(28);
      rect(0, yTop, width, altezzaRiga);
    }

    // Linea tra una riga e l'altra
    stroke(40);
    strokeWeight(1);
    line(margine, yTop + altezzaRiga, width - margine, yTop + altezzaRiga);

    noStroke();
    textSize(15);

    // Nome
    fill(255);
    textAlign(LEFT, CENTER);
    text(laureates[i].name, xNome, yCentro);

    // Anno, nel colore della categoria
    fill(colorScale[selectedCategory]);
    text(laureates[i].year, xAnno, yCentro);

    // Data di nascita
    fill(220);
    text(formattaData(laureates[i].birthDate), xNascita, yCentro);

    // Prize amount, con il punto come separatore delle migliaia
    textAlign(RIGHT, CENTER);
    text(laureates[i].prize.toLocaleString("it-IT"), xPrize, yCentro);
  }
}

// Il click sul link riporta alla homepage
function mousePressed() {
  if (hoveredLink) {
    window.location.href = "index.html";
  }
}

// Trasforma "1930-12-15" in "15/12/1930". Se mese o giorno sono "00" (dato mancante) li salta.
function formattaData(testoData) {
  let parti = testoData.split("-");

  if (parti[1] == "00") {
    return parti[0];
  }
  if (parti[2] == "00") {
    return parti[1] + "/" + parti[0];
  }
  return parti[2] + "/" + parti[1] + "/" + parti[0];
}

// Se cambia la finestra, ricalcolo la larghezza del canvas
function windowResized() {
  resizeCanvas(windowWidth, height);
}