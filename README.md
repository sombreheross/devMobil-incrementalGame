# L’histoire

Vous vous réveillez en 2077. Une guerre nucléaire a ravagé la terre et les survivants se sont organisés en camp de survivants. Vous rencontrez Garry, un vieil homme qui s’est donné la lourde tâche de retaper une centrale énergétique abandonnée, dans le but de produire assez d’énergie pour subvenir à ses besoins, et ceux des autres.
Votre rôle est d’assister Garry. Achetez du matériel et des installations et produisez de plus en plus d’énergie afin de la revendre au camp voisin pour vous acheter encore plus de matériel. Bienvenue dans Watt’s Left.

# Le fonctionnement

L’interface de Watt’s Left est séparée en deux onglets. Dans l’onglet production, vous pourrez voir la liste des installations que vous possédez, son rendement énergétique ainsi que votre stock d’énergie et d’argent.
L’onglet magasin permet de vendre son énergie contre de l’argent, et d’acheter des améliorations pour augmenter votre rendement énergétique.

En plus de ces fonctionnalités, le jeu intègre deux mécaniques clés : la localisation et la dynamo. 
- La localisation vérifie si vous vous trouvez en intérieur ou en extérieur. Si vous êtes en extérieur, votre rendement énergétique bénéficie d’un bonus de 10 %. Cela fonctionne à l’image d’un panneau solaire qui produit davantage d’énergie en étant exposé à une forte lumière.
- La dynamo, de son côté, vous offre la possibilité d’augmenter temporairement votre rendement énergétique de 100 %, ce bonus durant une durée proportionnelle au nombre de secouages effectués, à raison de 3 secondes de boost par secouage. Par exemple, si vous activez la dynamo et secouez l’appareil trois fois, votre rendement sera doublé pendant 9 secondes (3 secouages × 3 secondes). Cette mécanique s’inspire du fonctionnement d’une éolienne, qui génère de l’énergie grâce au mouvement de ses pales.

# L’installation

Le jeu se joue sans avoir nécessairement besoin d’une installation. Il est possible d’y jouer en ligne à l’URL suivante : https://devmobil-incrementalgame.onrender.com/.

Toutefois, si vous souhaitez y jouer hors ligne, voici le processus d’installation :

## 1. Cloner le projet

```jsx
git clone https://github.com/sombreheross/devMobil-incrementalGame.git
cd devMobil-incrementalGame
```

## 2. Installer les dépendances

```jsx
npm install
```

## 3. Build du projet

```jsx
npm run build
```

## 4. Preview en local

```jsx
npm run preview
```

Et voilà, vous pouvez accéder au jeu localement!
