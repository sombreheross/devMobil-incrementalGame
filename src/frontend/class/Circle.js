import { TAU } from "/utils/math.js"; // Constante représentant 2*PI pour simplifier les calculs d'angles complets

export default class Circle {

  // Step 1 - Initialisation des propriétés du cercle
  constructor({ x, y, r, speed = 0, dir = 0, color }) {
    this.x = x; // Position x du cercle
    this.y = y; // Position y du cercle
    this.r = r; // Rayon du cercle
    this.color = color; // Couleur du cercle
    this.speed = speed; // Vitesse du cercle
    this.dir = dir; // Direction du cercle en radians
  }

  // Step 2 - Accesseurs et mutateurs
  getRadius() {
    return this.r; // Retourne le rayon du cercle
  }

  setSpeed(speed) {
    this.speed = speed; // Définit la vitesse du cercle
  }

  setColor(color) {
    this.color = color; // Définit la couleur du cercle
  }

  setDir(dir) {
    this.dir = dir; // Définit la direction du cercle en radians
  }

  compareTo(otherCircle) {
    // Compare le rayon de ce cercle avec un autre
    return this.getRadius() - otherCircle.getRadius();
  }

  // Step 3 - Méthode pour calculer la distance entre deux points (le centre du cercle et un point donné)
  distanceTo({ x, y }) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy); // Calcul de la distance euclidienne
  }

  // Vérifie si un point est à l'intérieur du cercle
  isInside({ x, y }) {
    return this.distanceTo({ x, y }) < this.r; // Retourne vrai si la distance est inférieure au rayon
  }

  // Step 4 - Méthode pour dessiner le cercle sur le canvas
  draw(ctx) {
    ctx.beginPath(); // Commence un nouveau chemin pour dessiner
    ctx.fillStyle = this.color; // Définit la couleur de remplissage
    ctx.arc(this.x, this.y, this.r, 0, TAU); // Dessine un arc complet, soit un cercle
    ctx.closePath(); // Ferme le chemin
    ctx.fill(); // Remplit le cercle avec la couleur définie
  }

  // Step 5 - Méthode pour déplacer le cercle en fonction de sa vitesse et direction
  move(deltaT) {
    // Calcul des déplacements en x et y en fonction de la vitesse et de la direction
    const distX = this.speed * deltaT * Math.cos(this.dir);
    const distY = this.speed * deltaT * Math.sin(this.dir);
    this.x += distX; // Met à jour la position x
    this.y += distY; // Met à jour la position y
  }
}
