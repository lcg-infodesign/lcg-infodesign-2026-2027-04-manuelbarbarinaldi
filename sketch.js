// Variabili condivise: i valori letti qui possono essere usati da più funzioni.
let data;
let counts = {};
let maxCount = 0;
let decades = [];
let backgroundColor = '#000000';

// Opacità (0-255) dello spicchio "female": meno opaco di quello "male"
let femaleAlpha = 120;

// Categorie dei premi
let categories = [
  'Physics',
  'Chemistry',
  'Physiology or Medicine',
  'Literature',
  'Peace',
  'Economic Sciences',
];

// Associa ogni categoria del CSV a un colore
let colorScale = {
  'Physics': '#5B9BFF',
  'Chemistry': '#3FD1BE',
  'Physiology or Medicine': '#FF6B4A',
  'Literature': '#FFC247',
  'Peace': '#8FD16B',
  'Economic Sciences': '#C58BFF',
}

// Nomi delle categorie da mostrare
let nomiCategorie = {
  'Physics': 'Fisica',
  'Chemistry': 'Chimica',
  'Physiology or Medicine': 'Medicina',
  'Literature': 'Letteratura',
  'Peace': 'Pace',
  'Economic Sciences': 'Economia',
}

// Layout
let hIntestazione = 50;
let margineSinistro = 80;
let margineDestro = 20;
let altezzaRiga = 100;
let diametroMinimo = 14;

// Variabili per l'interazione col mouse
let hovered = false;
let hoveredCategory = "";
let hoveredDecade = 0;
let hoveredGender = "";
let hoveredCount = 0;
let hoveredX = 0;
let hoveredY = 0;
let hoveredD = 0;
let hoveredStart = 0;
let hoveredStop = 0;


async function setup() {
  // Una riga per ogni decennio
  for (let decade = 1900; decade <= 2020; decade += 10) {
    decades.push(decade);
  }

  // Il canvas viene messo nella parte destra della pagina 
  let canvas = createCanvas(larghezzaArea(), hIntestazione + decades.length * altezzaRiga + 20);
  canvas.parent("area-glifi");
  angleMode(DEGREES);

// carico dataset
  data = await loadTable("assets/nobel_prize_laureates_1901_2026.csv", ",", "header");


 //contatore maschi/femmine 
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let gender = data.getString(rowNumber, "gender");
    // Escludo le organizzazioni
    if (gender == "organization") {
      continue;
    }

    let year = data.getNum(rowNumber, "awardYear");
    let category = data.getString(rowNumber, "category");

    // Decennio di appartenenza
    let decade = floor(year / 10) * 10;

    // Chiave unica per ogni cella: "Physics_1950"
    let key = category + "_" + decade;

    // Se è la prima volta che incontro questa cella, parto da zero uomini e zero donne
    if (counts[key] == undefined) {
      counts[key] = { male: 0, female: 0 };
    }
    counts[key][gender] += 1;

    // Conserva il valore massimo, necessario per riportare tutti i cerchi alla stessa scala.
    let total = counts[key].male + counts[key].female;
    if (total > maxCount) {
      maxCount = total;
    }
  }
}

function draw() {
  background(backgroundColor);

  if (data == undefined) {
    return;
  }

  let larghezzaColonna = (width - margineSinistro - margineDestro) / categories.length;
  let diametroMassimo = min(larghezzaColonna, altezzaRiga) * 0.95;

  hovered = false;

  /*// Intestazione: il nome di ogni categoria sopra la sua colonna
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);
  textStyle(BOLD);
  for (let c = 0; c < categories.length; c++) {
    let xCentro = margineSinistro + c * larghezzaColonna + larghezzaColonna / 2;
    fill(colorScale[categories[c]]);
    text(nomiCategorie[categories[c]], xCentro, hIntestazione / 2);
  }
  textStyle(NORMAL);*/

  // Una riga per ogni decennio
  for (let r = 0; r < decades.length; r++) {
    let yCentro = hIntestazione + r * altezzaRiga + altezzaRiga / 2;

    // Linea guida e etichetta del decennio
    stroke(45);
    strokeWeight(1);
    line(margineSinistro, yCentro, width - margineDestro, yCentro);
    noStroke();
    fill(235);
    textAlign(RIGHT, CENTER);
    textSize(13);
    text(decades[r] + "s", margineSinistro - 14, yCentro);

    // Un cerchio per ogni categoria
    for (let c = 0; c < categories.length; c++) {
      let key = categories[c] + "_" + decades[r];

      // Se in questo decennio non ci sono premi per la categoria, salto la cella
      if (counts[key] == undefined) {
        continue;
      }

      let male = counts[key].male;
      let female = counts[key].female;
      let total = male + female;

      // Scala logaritmica: i totali vanno da 1 a 28, con il lineare i piccoli sparirebbero
      let diametro = map(log(total), 0, log(maxCount), diametroMinimo, diametroMassimo);
      let xCentro = margineSinistro + c * larghezzaColonna + larghezzaColonna / 2;

      disegnaCerchio(xCentro, yCentro, diametro, male, female, colorScale[categories[c]]);

      // Verifica se il puntatore è dentro il cerchio e in quale spicchio
      if (dist(mouseX, mouseY, xCentro, yCentro) < diametro / 2) {
        // Angolo del mouse misurato dall'alto in senso orario (0-360)
        let angoloMouse = (atan2(mouseY - yCentro, mouseX - xCentro) + 90 + 360) % 360;
        let gradiMaschi = 360 * male / total;

        hovered = true;
        hoveredCategory = categories[c];
        hoveredDecade = decades[r];
        hoveredX = xCentro;
        hoveredY = yCentro;
        hoveredD = diametro;

        if (angoloMouse < gradiMaschi) {
          hoveredGender = "male";
          hoveredCount = male;
          hoveredStart = -90;
          hoveredStop = -90 + gradiMaschi;
        } else {
          hoveredGender = "female";
          hoveredCount = female;
          hoveredStart = -90 + gradiMaschi;
          hoveredStop = 270;
        }
      }
    }
  }

  // Evidenzia lo spicchio sotto il mouse e mostra il testo
  if (hovered) {
    cursor(HAND);

    noFill();
    stroke(255);
    strokeWeight(2);
    arc(hoveredX, hoveredY, hoveredD, hoveredD, hoveredStart, min(hoveredStop, hoveredStart + 359.99), PIE);

    let genere = "uomini";
    if (hoveredGender == "female") {
      genere = "donne";
    }
    let testo = nomiCategorie[hoveredCategory] + ", " + hoveredDecade + "s\n" + genere + ": " + hoveredCount + "\nClicca per vedere i nomi";

    // vicino al bordo destro va a sinistra
    let xTesto = mouseX + 14;
    if (mouseX > width - 200) {
      xTesto = mouseX - 196;
    }
    stroke(90);
    strokeWeight(1);
    fill(25);
    rect(xTesto - 6, mouseY + 8, 180, 56, 4);
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    textSize(12);
    text(testo, xTesto, mouseY + 14);
  } else {
    cursor(ARROW);
  }
}

// Disegna un cerchio diviso in due spicchi: male (pieno) e female (meno opaco).
// Lo spicchio male parte dall'alto e va in senso orario; female occupa il resto.
function disegnaCerchio(x, y, d, male, female, colore) {
  let c = color(colore);
  let gradiMaschi = 360 * male / (male + female);

  noStroke();

  if (male > 0) {
    fill(c);
    arc(x, y, d, d, -90, -90 + min(gradiMaschi, 359.99), PIE);
  }

  if (female > 0) {
    fill(red(c), green(c), blue(c), femaleAlpha);
    arc(x, y, d, d, -90 + gradiMaschi, 269.99, PIE);
  }
}

function mousePressed() {
  // Il click apre la pagina di dettaglio solo se il mouse è sopra uno spicchio.
  if (hovered) {
    // encodeURIComponent trasforma gli spazi ("Physiology or Medicine") in un testo valido per l'URL
    let newURL = "detail.html?category=" + encodeURIComponent(hoveredCategory) + "&decade=" + hoveredDecade + "&gender=" + hoveredGender;

    console.log(newURL);

    // Apre la pagina di dettaglio nella stessa scheda
    window.location.href = newURL;
  }
}

// Larghezza della parte destra
function larghezzaArea() {
  return document.getElementById("area-glifi").clientWidth;
}

// Se cambia la finestra, ricalcolo la larghezza del canvas
function windowResized() {
  resizeCanvas(larghezzaArea(), height);
}