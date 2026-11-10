// Route « Seven Hells » (revanches d'arènes), d'après le PDF communautaire « Lucky Girl Syndrome »
// et l'adaptation d'Eevelen ; traduite en français. Généré une fois depuis la fiche, édité à la main ensuite.
export interface Gym { id: string, region: string, num: string, city: string, en: string, leads: string[], base: string[], cases: { when: string, steps: string[], risk?: boolean }[], notes: string[], optional?: boolean, warn?: string }

export const REGIONS = [
  {
    id: 'hoenn',
    name: 'Hoenn',
    checkpoint: 'Soignez-vous en fin de région. Si vous avez fait Atalanopolis, remettez le Mouchoir Choix à Meloetta.',
  },
  {
    id: 'kanto',
    name: 'Kanto',
    checkpoint: 'Après Kanto, Meloetta passe aux Lunettes Choix jusqu\'à la fin. Soignez-vous avant Sinnoh.',
  },
  {
    id: 'sinnoh',
    name: 'Sinnoh',
    checkpoint: 'Soignez-vous après la région. Meloetta garde les Lunettes Choix.',
  },
  {
    id: 'unova',
    name: 'Unys',
    checkpoint: 'Après Port Yoneuve (optionnelle), rechargez les PP de Giclédo et Blizzard avec des Baies Mepo. Soignez-vous avant Johto.',
  },
  {
    id: 'johto',
    name: 'Johto',
    checkpoint: 'Soignez-vous avant Oliville et avant Ébénelle.',
  },
]

export const GYMS: Gym[] = [
  {
    id: 'h1',
    region: 'hoenn',
    num: '—',
    city: 'Algatia',
    en: 'Mossdeep City',
    leads: [
      'Ptéra',
      'Minotaupe',
    ],
    base: [
      'Les attaques d\'ouverture ne sont pas précisées par la source.',
    ],
    cases: [
      {
        when: 'Si Minotaupe tombe',
        steps: [
          'Envoyez Tortank.',
        ],
      },
      {
        when: 'Si Ptéra tombe',
        steps: [
          'Envoyez Typhlosion.',
        ],
      },
    ],
    notes: [
      'Ptéra est plus rapide que le Minotaupe adverse et ne craint pas son Séisme.',
      'Le Lucario Jovial au Mouchoir Choix est un mauvais duel pour cette équipe.',
    ],
    optional: true,
  },
  {
    id: 'h2',
    region: 'hoenn',
    num: '1',
    city: 'Vermilava',
    en: 'Lavaridge Town',
    leads: [
      'Meloetta',
      'Tortank',
    ],
    base: [
      'Meloetta tient le Mouchoir Choix.',
      'Coup d\'Main (Meloetta) + Giclédo (Tortank).',
    ],
    cases: [
      {
        when: 'Ouverture Chartor + Démolosse',
        steps: [
          'Mégaphone + Giclédo.',
        ],
      },
      {
        when: 'Un Arcanin N.85 apparaît',
        steps: [
          'Spécial + sur Tortank.',
          'Puis Mégaphone + Giclédo.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 'h3',
    region: 'hoenn',
    num: '2',
    city: 'Village Myokara',
    en: 'Dewford Town',
    leads: [
      'Meloetta',
      'Tortank',
    ],
    base: [
      'Meloetta tient le Mouchoir Choix.',
      'Pas de séquence précise : Giclédo nettoie le terrain la plupart du temps.',
    ],
    cases: [],
    notes: [
      'Petit risque que Giclédo ne mette pas tout le monde K.O.',
    ],
  },
  {
    id: 'h4',
    region: 'hoenn',
    num: '3',
    city: 'Lavandia',
    en: 'Mauville City',
    leads: [
      'Meloetta',
      'Typhlosion',
    ],
    base: [
      'Meloetta tient le Mouchoir Choix.',
    ],
    cases: [
      {
        when: 'Un Électrode apparaît',
        steps: [
          'Tour 1, action 1 : Vitesse + sur Typhlosion.',
          'Tour 1, action 2 : Éruption.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 'h5',
    region: 'hoenn',
    num: '4',
    city: 'Mérouville',
    en: 'Rustboro City',
    leads: [
      'Ptéra',
      'Minotaupe',
    ],
    base: [],
    cases: [
      {
        when: 'Ouverture Tyranocif + Tarinorme, ou Tyranocif + Relicanth',
        steps: [
          'Vitesse + sur Minotaupe.',
          'Séisme.',
        ],
      },
    ],
    notes: [
      'Éboulement peut rater. Vitesse + évite les animations de Kabutops et ses soins éventuels.',
    ],
  },
  {
    id: 'h6',
    region: 'hoenn',
    num: '5',
    city: 'Cimetronelle',
    en: 'Fortree City',
    leads: [
      'Ptéra',
      'Sorbouboul',
    ],
    base: [],
    cases: [
      {
        when: 'Altaria en tête',
        steps: [
          'Précision +.',
          'Blizzard.',
        ],
      },
      {
        when: 'Bekipan en tête',
        steps: [
          'T1 : Éboulement + Vent Glace.',
          'T2 : Éboulement + Attaque + sur Ptéra.',
          'T3 : Éboulement + Précision + sur Ptéra.',
        ],
      },
      {
        when: 'Ouverture Maskadra + Léviator',
        steps: [
          'T1 : Spécial +, puis Blizzard.',
          'T2 : Coup d\'Main, puis Blizzard.',
        ],
      },
    ],
    notes: [
      'Léviator + Airmure peuvent faire échouer un nettoyage en 3 tours si les dégâts tombent bas.',
      'Attention à Altaria (Ciel Gris) et Bekipan (Crachin).',
    ],
  },
  {
    id: 'h7',
    region: 'hoenn',
    num: '6',
    city: 'Atalanopolis',
    en: 'Sootopolis City',
    leads: [
      'Ptéra ou Typhlosion',
      'Meloetta',
    ],
    base: [
      'Ptéra ou Typhlosion doit connaître Clairvoyance (capacité œuf).',
      'Meloetta tient les Lunettes Choix.',
      'Tour 1 : Spécial + puis Mégaphone.',
    ],
    cases: [
      {
        when: 'Lokhlass ou Aquali apparaissent',
        steps: [
          'T1 : Spécial + puis Mégaphone.',
          'T2 : Clairvoyance puis Mégaphone.',
        ],
      },
      {
        when: 'Il pleut',
        steps: [
          'Laissez tomber Ptéra/Typhlosion, puis envoyez Sorbouboul.',
        ],
      },
      {
        when: 'Corayon arrive au tour 2',
        steps: [
          'Encore un Spécial + sur Meloetta, ou Coup d\'Main si Typhlosion est sur le terrain.',
        ],
      },
    ],
    notes: [
      'Utilisez un Repousse en traversant la zone jusqu\'à Kanto.',
      'Après cette arène : remettez le Mouchoir Choix à Meloetta pour tout Kanto.',
      'Plus rentable que Clémenti-Ville.',
    ],
    optional: true,
  },
  {
    id: 'k1',
    region: 'kanto',
    num: '8',
    city: 'Carmin sur Mer',
    en: 'Vermilion City',
    leads: [
      'Meloetta',
      'Typhlosion',
    ],
    base: [
      'Meloetta tient le Mouchoir Choix.',
    ],
    cases: [
      {
        when: 'Il pleut, ou Électrode est sur le terrain',
        steps: [
          'Mégaphone + Spécial +.',
        ],
      },
      {
        when: 'Sinon',
        steps: [
          'Mégaphone + Calcination.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 'k2',
    region: 'kanto',
    num: '9',
    city: 'Cramois\'Île',
    en: 'Cinnabar Island',
    leads: [
      'Ptéra',
      'Tortank',
    ],
    base: [
      'Tour 1 : remplacez Ptéra par Sorbouboul, sauf exception ci-dessous.',
    ],
    cases: [
      {
        when: 'Ouverture Chartor + Sulfura',
        steps: [
          'T1 : Spécial + puis Giclédo.',
          'T2 : Attaque + puis Éboulement.',
        ],
      },
    ],
    notes: [],
    warn: 'La source ne précise pas l\'ordre exact des deux actions du tour 2.',
  },
  {
    id: 'k3',
    region: 'kanto',
    num: '10',
    city: 'Argenta',
    en: 'Pewter City',
    leads: [
      'Ptéra',
      'Minotaupe',
    ],
    base: [
      'Pas de séquence par défaut.',
    ],
    cases: [],
    notes: [
      'Si Ptéra a peu de PV, soignez-le : le Pisto-Poing de Cizayox l\'attend plus loin.',
    ],
  },
  {
    id: 'k4',
    region: 'kanto',
    num: '11',
    city: 'Safrania',
    en: 'Saffron City',
    leads: [
      'Ptéra',
      'Minotaupe',
    ],
    base: [
      'Ptéra doit commencer avec tous ses PV.',
    ],
    cases: [
      {
        when: 'Fouinar utilise Abri',
        steps: [
          'Aucune solution documentée par la source.',
        ],
        risk: true,
      },
    ],
    notes: [],
    warn: 'Le cas « Fouinar utilise Abri » n\'a pas de solution connue.',
  },
  {
    id: 'k5',
    region: 'kanto',
    num: '12',
    city: 'Céladopole',
    en: 'Celadon City',
    leads: [
      'Ptéra',
      'Typhlosion',
    ],
    base: [
      'Spécial + sur Ptéra, Typhlosion attaque.',
    ],
    cases: [
      {
        when: 'Dracolosse ou Farfaduvet en tête',
        steps: [
          'Laissez tomber Ptéra et remplacez-le par Sorbouboul.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 'k6',
    region: 'kanto',
    num: '13',
    city: 'Parmanie',
    en: 'Fuchsia City',
    leads: [
      'Ptéra',
      'Typhlosion',
    ],
    base: [
      'Meloetta doit déjà tenir le Mouchoir Choix pendant tout Kanto.',
    ],
    cases: [
      {
        when: 'Meloetta est forcée d\'entrer par Carton Rouge face à Ectoplasma',
        steps: [
          'Ball\'Ombre ou Psyko sur Ectoplasma + Éruption.',
        ],
      },
      {
        when: 'Minotaupe est forcé d\'entrer par Carton Rouge',
        steps: [
          'Éboulement avec Minotaupe.',
        ],
      },
      {
        when: 'La route demande de mettre Typhlosion K.O.',
        steps: [
          'Séisme avec Minotaupe.',
        ],
      },
    ],
    notes: [
      'Après Kanto : Lunettes Choix sur Meloetta jusqu\'à la fin.',
    ],
  },
  {
    id: 's1',
    region: 'sinnoh',
    num: '14',
    city: 'Verchamps',
    en: 'Pastoria City',
    leads: [
      'Ptéra',
      'Meloetta',
    ],
    base: [
      'Au tour 2, TOUJOURS Spécial + sur Meloetta.',
    ],
    cases: [
      {
        when: 'Sharpedo + n\'importe qui en tête',
        steps: [
          'Éboulement + Mégaphone.',
        ],
      },
      {
        when: 'Sharpedo n\'est PAS en tête',
        steps: [
          'Spécial + sur Meloetta + Mégaphone.',
        ],
      },
      {
        when: 'Il pleut',
        steps: [
          'Envoyez Sorbouboul quand Ptéra tombe.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 's2',
    region: 'sinnoh',
    num: '15',
    city: 'Voilaroc',
    en: 'Veilstone City',
    leads: [
      'Ptéra',
      'Typhlosion',
    ],
    base: [
      'Zénith avec Ptéra.',
      'Une fois le soleil actif, Éboulement avec Ptéra.',
    ],
    cases: [],
    notes: [],
  },
  {
    id: 's3',
    region: 'sinnoh',
    num: '16',
    city: 'Vestigion',
    en: 'Eterna City',
    leads: [
      'Meloetta',
      'Typhlosion',
    ],
    base: [
      'Seule la paire d\'ouverture est donnée.',
    ],
    cases: [],
    notes: [],
  },
  {
    id: 's4',
    region: 'sinnoh',
    num: '17',
    city: 'Charbourg',
    en: 'Oreburgh City',
    leads: [
      'Ptéra',
      'Minotaupe',
    ],
    base: [],
    cases: [
      {
        when: 'Ouverture Minotaupe + Gigalithe',
        steps: [
          'Éboulement + Séisme.',
        ],
      },
      {
        when: 'Ouverture Tyranocif + Minotaupe',
        steps: [
          'Abri + Séisme.',
          'Votre Minotaupe a besoin d\'IV défensifs élevés pour ne pas encaisser le Séisme adverse.',
        ],
      },
      {
        when: 'Variante risquée contre Tyranocif + Minotaupe',
        steps: [
          'Éboulement + Séisme peut finir en 3 tours, avec une faible chance de survie.',
          'Il faut 31 en IV PV et Défense pour que ça ait une chance.',
        ],
        risk: true,
      },
      {
        when: 'Ouverture Tyranocif + Tarinorme',
        steps: [
          'La composition avec Drattak prend toujours 4 tours.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 's5',
    region: 'sinnoh',
    num: '18',
    city: 'Rivamar',
    en: 'Sunyshore City',
    leads: [
      'Meloetta',
      'Tortank',
    ],
    base: [],
    cases: [
      {
        when: 'Lanturn apparaît',
        steps: [
          'Mégaphone + Spécial +.',
        ],
      },
    ],
    notes: [
      'Certains adversaires peuvent être plus rapides que Meloetta : ça ne change rien à la stratégie.',
    ],
  },
  {
    id: 'u1',
    region: 'unova',
    num: '19',
    city: 'Volucité',
    en: 'Castelia City',
    leads: [
      'Sorbouboul',
      'Tortank',
    ],
    base: [
      'Seule la paire d\'ouverture est donnée.',
    ],
    cases: [],
    notes: [],
  },
  {
    id: 'u2',
    region: 'unova',
    num: '20',
    city: 'Port Yoneuve',
    en: 'Driftveil City',
    leads: [
      'Sorbouboul',
      'Tortank',
    ],
    base: [],
    cases: [
      {
        when: 'Tempête de sable',
        steps: [
          'Vitesse + sur Tortank + Giclédo.',
          'Puis Vent Glace avec Sorbouboul.',
        ],
      },
      {
        when: 'Ténéfix sur le terrain',
        steps: [
          'Spécial + sur Sorbouboul + Blizzard.',
        ],
      },
      {
        when: 'Crapustule sur le terrain au tour 2',
        steps: [
          'Spécial + sur Sorbouboul + Blizzard.',
        ],
      },
    ],
    notes: [
      'Après cette arène, rechargez les PP de Giclédo et Blizzard avec des Baies Mepo.',
      'Le PDF espagnol l\'appelle Parsemille, mais la position dans la route correspond à Port Yoneuve. La vraie arène Vol de Parsemille est l\'étape 26.',
    ],
    optional: true,
  },
  {
    id: 'u3',
    region: 'unova',
    num: '21',
    city: 'Ogoesse · Feu',
    en: 'Striaton City (Fire)',
    leads: [
      'Meloetta',
      'Tortank',
    ],
    base: [
      'Coup d\'Main + Giclédo.',
    ],
    cases: [
      {
        when: 'Feunard et Typhlosion apparaissent',
        steps: [
          'Spécial + sur Tortank + Giclédo.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 'u4',
    region: 'unova',
    num: '22',
    city: 'Ogoesse · Plante',
    en: 'Striaton City (Grass)',
    leads: [
      'Meloetta',
      'Typhlosion',
    ],
    base: [
      'Typhlosion utilise Calcination.',
    ],
    cases: [],
    notes: [],
  },
  {
    id: 'u5',
    region: 'unova',
    num: '23',
    city: 'Ogoesse · Eau',
    en: 'Striaton City (Water)',
    leads: [
      'Meloetta',
      'Typhlosion',
    ],
    base: [
      'Mégaphone + Éruption.',
    ],
    cases: [],
    notes: [],
  },
  {
    id: 'u6',
    region: 'unova',
    num: '24',
    city: 'Janusia',
    en: 'Opelucid City',
    leads: [
      'Sorbouboul',
      'Typhlosion',
    ],
    base: [
      'Seule la paire d\'ouverture est donnée.',
    ],
    cases: [],
    notes: [],
  },
  {
    id: 'u7',
    region: 'unova',
    num: '25',
    city: 'Flocombe',
    en: 'Icirrus City',
    leads: [
      'Ptéra',
      'Typhlosion',
    ],
    base: [
      'Zénith avec Ptéra.',
    ],
    cases: [],
    notes: [],
  },
  {
    id: 'u8',
    region: 'unova',
    num: '26',
    city: 'Parsemille',
    en: 'Mistralton City',
    leads: [
      'Tortank',
      'Sorbouboul',
    ],
    base: [
      'Tortank : Blizzard. Sorbouboul : Vent Glace.',
    ],
    cases: [
      {
        when: 'Ni Farfaduvet ni Airmure en tête',
        steps: [
          'Blizzard (Tortank) + Spécial +.',
        ],
      },
      {
        when: 'Dès que possible',
        steps: [
          'Double Blizzard.',
          'Rechargez les PP avec des Baies Mepo si besoin pour garantir 3 tours.',
        ],
      },
      {
        when: 'Vous avez fait Port Yoneuve',
        steps: [
          'Vous pouvez enchaîner Blizzard + Giclédo.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 'u9',
    region: 'unova',
    num: '27',
    city: 'Méanville',
    en: 'Nimbasa City',
    leads: [
      'Meloetta',
      'Typhlosion',
    ],
    base: [
      'Typhlosion : Calcination et Éruption dès que possible.',
    ],
    cases: [
      {
        when: 'Pharamp ou Milobellus apparaît',
        steps: [
          'Mégaphone + Spécial +.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 'j1',
    region: 'johto',
    num: '27',
    city: 'Doublonville',
    en: 'Goldenrod City',
    leads: [
      'Meloetta',
      'Typhlosion',
    ],
    base: [],
    cases: [
      {
        when: 'Ouverture Chinchidou + Écrémeuh',
        steps: [
          'Remplacez les deux par Ptéra + Minotaupe.',
        ],
      },
    ],
    notes: [],
    warn: 'Le numéro 27 sert aussi à Méanville : numérotation d\'origine conservée.',
  },
  {
    id: 'j2',
    region: 'johto',
    num: '28',
    city: 'Écorcia',
    en: 'Azalea Town',
    leads: [
      'Ptéra',
      'Typhlosion',
    ],
    base: [
      'Typhlosion utilise Calcination.',
    ],
    cases: [
      {
        when: 'Ouverture Yanmega + Papilusion',
        steps: [
          'Coup d\'Main + Éruption (composition avec Maraiste).',
        ],
      },
      {
        when: 'Ouverture Dardargnan + Foretress',
        steps: [
          'Remplacez les deux par Ptéra + Minotaupe.',
        ],
      },
    ],
    notes: [],
    warn: 'La source demande de passer sur Ptéra alors qu\'il est déjà en tête : ambiguïté d\'origine.',
  },
  {
    id: 'j3',
    region: 'johto',
    num: '29',
    city: 'Mauville',
    en: 'Violet City',
    leads: [
      'Tortank',
      'Sorbouboul',
    ],
    base: [],
    cases: [
      {
        when: 'Ouverture Bekipan + Électhor',
        steps: [
          'Spécial + sur Tortank + Giclédo.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 'j4',
    region: 'johto',
    num: '30',
    city: 'Acajou',
    en: 'Mahogany Town',
    leads: [
      'Ptéra',
      'Typhlosion',
    ],
    base: [
      'Zénith avec Ptéra.',
    ],
    cases: [],
    notes: [],
  },
  {
    id: 'j5',
    region: 'johto',
    num: '31',
    city: 'Irisia',
    en: 'Cianwood City',
    leads: [
      'Meloetta',
      'Typhlosion',
    ],
    base: [
      'Tour 1 : TOUJOURS Spécial + pour assurer le K.O. en un coup.',
      'Ensuite Coup d\'Main si ni Donphan ni Rhinastoc ne sont sur le terrain.',
    ],
    cases: [
      {
        when: 'Mackogneur + Kapoera (Donphan au T1)',
        steps: [
          'T1 : Mégaphone + Spécial +.',
          'T2 : Mégaphone, puis Éruption.',
        ],
      },
    ],
    notes: [],
  },
  {
    id: 'j6',
    region: 'johto',
    num: '32',
    city: 'Oliville',
    en: 'Olivine City',
    leads: [
      'Tortank',
      'Typhlosion',
    ],
    base: [
      'Éruption dès que possible.',
      'Arène bonus : soignez-vous AVANT le combat.',
    ],
    cases: [
      {
        when: 'Galopa apparaît',
        steps: [
          'Spécial + sur Tortank.',
        ],
      },
    ],
    notes: [],
    optional: true,
  },
  {
    id: 'j7',
    region: 'johto',
    num: '33',
    city: 'Ébénelle',
    en: 'Blackthorn City',
    leads: [
      'Ptéra',
      'Meloetta',
    ],
    base: [
      'Arène bonus : soignez-vous AVANT le combat.',
      'Tour 1 : toujours Spécial +.',
      'Laissez tomber Ptéra et remplacez-le par Sorbouboul.',
    ],
    cases: [],
    notes: [],
    optional: true,
  },
]

export const PREP = [
  {
    title: 'Avant de partir',
    items: [
      'Donner à chacun des six son objet tenu.',
      'Vérifier natures et IV 31 (Attaque ou Atq Spé, et Vitesse).',
      'Minotaupe : Jovial + Brise Moule, sans exception.',
      'Prendre l\'Ocarina Téléport et l\'Ocarina Vol.',
      'Monter au max les PP d\'Éboulement, Séisme, Giclédo, Éruption, Blizzard et Mégaphone.',
      'Mettre l\'attaque principale de chacun en 1re position pour enchaîner sur A.',
      'Meloetta commence avec le Mouchoir Choix.',
      'Équiper le Riches Charm (+100 %) si vous l\'avez.',
    ],
  },
  {
    title: 'Pendant les combats',
    items: [
      'Une consigne de changement vise le Pokémon qui sort ; l\'autre continue d\'attaquer.',
      '« A + B » : on remplace les deux Pokémon de tête dans cet ordre.',
      'Une chaîne « Tortank → Sorbouboul → Minotaupe » se fait sur des tours successifs.',
      '« Objet X + Pokémon » : l\'objet X se donne au Pokémon nommé.',
      'Soigner brûlure ou paralysie si le Pokémon resservira plus tard.',
    ],
  },
  {
    title: 'Optimiser la route',
    items: [
      'Toujours se soigner en changeant de région.',
      'Ne pas soigner un Pokémon qui ne resservira pas avant le prochain point de soin.',
      'Remonter Ptéra à fond, même avec des Potions de 20 PV ; idem Typhlosion, Tortank et Minotaupe si besoin.',
      'Sur plusieurs appareils : décaler les combats pour avancer sur l\'un pendant les animations de l\'autre.',
      'Un seul appareil suffit : l\'équipe reste efficace.',
    ],
  },
]

export const URGENT = [
  {
    problem: 'Éboulement rate',
    who: 'Ptéra',
    fix: 'Se déconnecter et attendre le temps de recharge de l\'arène.',
  },
  {
    problem: 'Un de vos Pokémon tombe',
    who: 'N\'importe lequel',
    fix: 'Profitez du changement forcé pour envoyer le meilleur remplaçant pour l\'arène suivante.',
  },
  {
    problem: 'Brûlure',
    who: 'Ptéra, Minotaupe',
    fix: 'Soigner s\'ils resservent avant le changement de région.',
  },
  {
    problem: 'Paralysie',
    who: 'N\'importe lequel',
    fix: 'Soigner si le Pokémon resservira.',
  },
  {
    problem: 'Intimidation',
    who: 'Ponchien, Léviator, Arcanin, Luxray, Maskadra, Tauros, Kapoera, Drattak, Granbull',
    fix: 'Suivre la solution prévue pour l\'arène concernée.',
  },
  {
    problem: 'Murs physiques',
    who: 'Bouldeneu, Noadkoko',
    fix: 'Continuer d\'attaquer, compter 4 tours ou plus.',
  },
  {
    problem: 'Murs spéciaux',
    who: 'Leveinard, Leuphorie, Ronflex, Milobellus, Kaimorse, Tyranocif',
    fix: 'Voir la variante de l\'arène. Objets X, ou passer sur Ptéra / Minotaupe.',
  },
  {
    problem: 'Adversaires rapides',
    who: 'Électrode, Lucario Mouchoir (Algatia), Minotaupe, Mustéflott, Kabutops, Fragilady, Florizarre…',
    fix: 'Vitesse + sur l\'attaquant principal ou Attaque + sur Ptéra ; sinon déconnexion et attente. Profiter du soleil quand il est là.',
  },
  {
    problem: 'Chasse-Neige / Rideau Neige',
    who: 'Polagriffe, Momartik',
    fix: 'Zénith avec Ptéra + Brise Moule de Minotaupe.',
  },
  {
    problem: 'Soleil',
    who: 'Chartor, Feunard',
    fix: 'Vitesse +, et profiter du soleil pour sortir Feunard.',
  },
  {
    problem: 'Pluie et talents absorbants',
    who: 'Bekipan, Tarpaud, Typhlosion, Feunard, Lugulabre, Démolosse, Heatran, Lanturn, Coatox, Vacilys, Lokhlass, Crapustule, Tartard, Aquali, Altaria',
    fix: 'Selon le cas : Sorbouboul pour changer la météo, Zénith ou Danse Pluie avec Ptéra, éviter les attaques Feu/Eau inutiles, Blizzard + Précision +, ou déconnexion.',
  },
  {
    problem: 'Lévitation',
    who: 'Motisma, Archéodong, Ohmassacre, Magirêve, Libégon, Séléroc, Solaroc, Kaorine',
    fix: 'Minotaupe avec Brise Moule.',
  },
  {
    problem: 'Cizayox',
    who: 'Contre Ptéra',
    fix: 'Laisser tomber Ptéra ou utiliser Abri.',
  },
  {
    problem: 'Fouinar utilise Abri',
    who: 'Fouinar',
    fix: 'Aucune solution documentée.',
  },
]
