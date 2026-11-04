/* ============================================================
   VITALIA · Capa de datos (RF2)
   Catálogo de recomendaciones, categorías, hábitos e iconografía.
   Separar los datos de la interfaz facilita la escalabilidad (RNF2):
   para agregar contenido solo se amplía este arreglo o se conecta
   a una API/CRM sin reescribir las vistas.
   ============================================================ */

const CATEGORIAS = {
  alimentacion: {
    nombre: "Alimentación",
    descripcion: "Recetas y hábitos para nutrirte con equilibrio.",
    color: "var(--cat-alimentacion)",
    icono: "manzana"
  },
  actividad: {
    nombre: "Actividad física",
    descripcion: "Movimiento diario adaptado a tu nivel y tiempo.",
    color: "var(--cat-actividad)",
    icono: "correr"
  },
  descanso: {
    nombre: "Descanso",
    descripcion: "Rutinas para dormir mejor y recuperar energía.",
    color: "var(--cat-descanso)",
    icono: "luna"
  },
  bienestar: {
    nombre: "Bienestar",
    descripcion: "Pequeños gestos que cuidan tu salud mental.",
    color: "var(--cat-bienestar)",
    icono: "corazon"
  }
};

const OBJETIVOS = {
  bajar_peso: "Bajar de peso",
  masa_muscular: "Ganar masa muscular",
  energia: "Tener más energía",
  mejor_descanso: "Dormir mejor",
  reducir_estres: "Reducir el estrés",
  digestion: "Mejorar la digestión",
  inmunidad: "Fortalecer las defensas"
};

const ALERGIAS = {
  ninguna: "Ninguna",
  lactosa: "Lactosa",
  gluten: "Gluten",
  frutos_secos: "Frutos secos",
  pescado: "Pescado y mariscos",
  huevo: "Huevo",
  soya: "Soya"
};

const RECOMENDACIONES = [
  {
    id: "r1",
    titulo: "Bowl de avena y frutos rojos",
    categoria: "alimentacion",
    resumen: "Un desayuno completo con fibra, antioxidantes y energía sostenida para empezar el día.",
    descripcion: "La avena aporta fibra soluble que favorece la saciedad y la digestión, mientras que los frutos rojos suman antioxidantes y vitamina C. Es una preparación sencilla que puedes dejar lista la noche anterior para ahorrar tiempo en la mañana.",
    duracion: "10 min",
    duracionMin: 10,
    nivel: "Fácil",
    porciones: "1 porción",
    tags: ["Desayuno", "Fibra", "Antioxidantes"],
    objetivos: ["energia", "digestion", "inmunidad"],
    contiene: ["gluten", "lactosa"],
    beneficio: "Aporta energía estable y mejora la saciedad.",
    pasos: [
      "Calienta la leche o bebida vegetal y mezcla con la avena.",
      "Cocina a fuego medio durante 4 minutos removiendo.",
      "Agrega los frutos rojos, la chía y un toque de canela.",
      "Deja reposar un minuto y sirve con fruta fresca."
    ],
    beneficios: [
      "Fibra que mejora la digestión",
      "Antioxidantes para tus defensas",
      "Energía sostenida sin picos de azúcar",
      "Preparación rápida y económica"
    ]
  },
  {
    id: "r2",
    titulo: "Ensalada de quinoa y aguacate",
    categoria: "alimentacion",
    resumen: "Proteína vegetal, grasas saludables y vegetales frescos en un plato colorido y completo.",
    descripcion: "La quinoa es un pseudocereal con proteína de alto valor y fibra; el aguacate aporta grasas monoinsaturadas beneficiosas para el corazón. Combinados con vegetales de temporada forman un almuerzo equilibrado que puedes personalizar según tus gustos.",
    duracion: "20 min",
    duracionMin: 20,
    nivel: "Fácil",
    porciones: "2 porciones",
    tags: ["Almuerzo", "Vegetariano", "Proteína vegetal"],
    objetivos: ["bajar_peso", "digestion", "energia"],
    contiene: [],
    beneficio: "Plato balanceado rico en fibra y grasas buenas.",
    pasos: [
      "Lava y cocina la quinoa en agua con una pizca de sal.",
      "Corta el aguacate, el tomate y el pepino en cubos.",
      "Mezcla los vegetales con la quinoa fría.",
      "Aliña con limón, aceite de oliva y hierbas frescas."
    ],
    beneficios: [
      "Proteína vegetal completa",
      "Grasas saludables para el corazón",
      "Alta en fibra y saciedad",
      "Ideal para llevar al trabajo"
    ]
  },
  {
    id: "r3",
    titulo: "Salmón al horno con verduras",
    categoria: "alimentacion",
    resumen: "Cena rica en omega-3 y proteína, acompañada de verduras asadas llenas de color.",
    descripcion: "El salmón es una de las mejores fuentes de omega-3, asociado a la salud cardiovascular y cerebral. Al hornearlo con verduras logras una cena completa en una sola bandeja, con poco aceite y sin perder nutrientes.",
    duracion: "30 min",
    duracionMin: 30,
    nivel: "Medio",
    porciones: "2 porciones",
    tags: ["Cena", "Omega-3", "Proteína"],
    objetivos: ["masa_muscular", "inmunidad", "energia"],
    contiene: ["pescado"],
    beneficio: "Proteína de calidad y omega-3 para tu corazón.",
    pasos: [
      "Precalienta el horno a 200 °C.",
      "Coloca el salmón y las verduras en una bandeja.",
      "Rocía aceite de oliva, limón y especias al gusto.",
      "Hornea durante 18 a 20 minutos y sirve."
    ],
    beneficios: [
      "Omega-3 para la salud cardiovascular",
      "Proteína completa para tus músculos",
      "Verduras ricas en vitaminas",
      "Una sola bandeja, fácil de limpiar"
    ]
  },
  {
    id: "r4",
    titulo: "Rutina de fuerza en casa",
    categoria: "actividad",
    resumen: "Circuito de 25 minutos con el peso corporal para tonificar y ganar fuerza sin equipos.",
    descripcion: "El entrenamiento de fuerza con el peso corporal mejora la masa muscular, la densidad ósea y el metabolismo. Este circuito combina sentadillas, flexiones y planchas en intervalos que puedes adaptar a tu nivel.",
    duracion: "25 min",
    duracionMin: 25,
    nivel: "Medio",
    porciones: "3 series",
    tags: ["Fuerza", "Sin equipos", "En casa"],
    objetivos: ["masa_muscular", "bajar_peso", "energia"],
    contiene: [],
    beneficio: "Aumenta fuerza y masa muscular en casa.",
    pasos: [
      "Calienta 5 minutos con movilidad articular.",
      "Realiza 12 sentadillas, 8 flexiones y 30 s de plancha.",
      "Descansa 60 segundos y repite el circuito 3 veces.",
      "Termina con estiramientos suaves."
    ],
    beneficios: [
      "Gana fuerza sin ir al gimnasio",
      "Mejora tu postura y equilibrio",
      "Acelera tu metabolismo",
      "Solo necesitas tu peso corporal"
    ]
  },
  {
    id: "r5",
    titulo: "Caminata activa de 30 minutos",
    categoria: "actividad",
    resumen: "Sal a caminar a paso firme para activar el cuerpo, despejar la mente y cuidar tu corazón.",
    descripcion: "Caminar es una de las actividades más accesibles y sostenibles. A paso moderado mejora la salud cardiovascular, regula el azúcar en sangre y libera tensiones. Puedes dividirla en dos bloques de 15 minutos si tu agenda es ajustada.",
    duracion: "30 min",
    duracionMin: 30,
    nivel: "Fácil",
    porciones: "1 sesión",
    tags: ["Cardio", "Aire libre", "Bajo impacto"],
    objetivos: ["bajar_peso", "energia", "reducir_estres"],
    contiene: [],
    beneficio: "Mejora el ánimo y la salud cardiovascular.",
    pasos: [
      "Elige un recorrido seguro y cómodo.",
      "Camina a paso firme durante 30 minutos.",
      "Mantén la espalda recta y respira profundo.",
      "Termina con estiramientos de piernas."
    ],
    beneficios: [
      "Cuida tu corazón y circulación",
      "Reduce el estrés y mejora el ánimo",
      "No requiere equipos ni costo",
      "Fácil de incluir en tu rutina"
    ]
  },
  {
    id: "r6",
    titulo: "Movilidad y estiramiento matutino",
    categoria: "actividad",
    resumen: "Doce minutos para despertar el cuerpo, soltar tensiones y empezar el día con flexibilidad.",
    descripcion: "Una rutina suave de movilidad al despertar activa la circulación y reduce la rigidez acumulada durante la noche. Es ideal para quienes pasan muchas horas sentados o trabajan frente a un computador.",
    duracion: "12 min",
    duracionMin: 12,
    nivel: "Fácil",
    porciones: "1 sesión",
    tags: ["Movilidad", "Mañana", "Estiramiento"],
    objetivos: ["reducir_estres", "digestion", "energia"],
    contiene: [],
    beneficio: "Despierta el cuerpo y libera tensión.",
    pasos: [
      "Inicia con respiraciones profundas de pie.",
      "Realiza giros suaves de cuello y hombros.",
      "Haz estiramientos de espalda y piernas.",
      "Cierra con una postura de apertura de pecho."
    ],
    beneficios: [
      "Mejora la flexibilidad",
      "Reduce la rigidez matutina",
      "Activa la circulación",
      "Solo toma 12 minutos"
    ]
  },
  {
    id: "r7",
    titulo: "Rutina de sueño reparador",
    categoria: "descanso",
    resumen: "Prepara tu cuerpo y tu espacio para un descanso profundo con una rutina nocturna de 20 minutos.",
    descripcion: "Dormir bien no empieza al acostarte: comienza una hora antes. Bajar la intensidad de la luz, desconectar pantallas y establecer una secuencia fija le indica al cerebro que es hora de descansar y mejora la calidad del sueño.",
    duracion: "20 min",
    duracionMin: 20,
    nivel: "Fácil",
    porciones: "Cada noche",
    tags: ["Higiene del sueño", "Noche", "Rutina"],
    objetivos: ["mejor_descanso", "reducir_estres", "energia"],
    contiene: [],
    beneficio: "Mejora la calidad y la duración del sueño.",
    pasos: [
      "Apaga las pantallas 30 minutos antes de dormir.",
      "Baja la intensidad de las luces de tu habitación.",
      "Prepara una infusión sin cafeína.",
      "Haz respiraciones lentas y acuéstate a la misma hora."
    ],
    beneficios: [
      "Concilias el sueño más rápido",
      "Despiertas con más energía",
      "Mejora tu concentración",
      "Reduce la sensación de cansancio"
    ]
  },
  {
    id: "r8",
    titulo: "Respiración 4-7-8",
    categoria: "descanso",
    resumen: "Una técnica sencilla para calmar el sistema nervioso y reducir la ansiedad en pocos minutos.",
    descripcion: "La respiración 4-7-8 consiste en inhalar, sostener y exhalar en tiempos específicos. Activa el sistema nervioso parasimpático, disminuye la frecuencia cardíaca y ayuda a recuperar la calma en momentos de estrés.",
    duracion: "8 min",
    duracionMin: 8,
    nivel: "Fácil",
    porciones: "4 ciclos",
    tags: ["Mindfulness", "Ansiedad", "Relajación"],
    objetivos: ["reducir_estres", "mejor_descanso"],
    contiene: [],
    beneficio: "Reduce la ansiedad y facilita la relajación.",
    pasos: [
      "Siéntate con la espalda recta y los ojos cerrados.",
      "Inhala por la nariz durante 4 segundos.",
      "Sostén el aire durante 7 segundos.",
      "Exhala lentamente por la boca durante 8 segundos y repite."
    ],
    beneficios: [
      "Calma el sistema nervioso",
      "Reduce la ansiedad",
      "Mejora la concentración",
      "Se puede hacer en cualquier lugar"
    ]
  },
  {
    id: "r9",
    titulo: "Pausa de descanso sin pantallas",
    categoria: "descanso",
    resumen: "Quince minutos de desconexión digital para descansar la vista y recuperar la atención.",
    descripcion: "Las pantallas mantienen al cerebro en un estado de alerta constante. Una pausa breve sin dispositivos, con luz natural y movimiento suave, reduce la fatiga visual y mental, y mejora el rendimiento en el resto del día.",
    duracion: "15 min",
    duracionMin: 15,
    nivel: "Fácil",
    porciones: "1 pausa",
    tags: ["Digital detox", "Pausa activa", "Descanso visual"],
    objetivos: ["mejor_descanso", "reducir_estres", "energia"],
    contiene: [],
    beneficio: "Recupera tu atención y descansa la vista.",
    pasos: [
      "Silencia las notificaciones y deja el celular lejos.",
      "Levántate y busca luz natural.",
      "Camina o estira suavemente durante 15 minutos.",
      "Vuelve a tus tareas con la mente despejada."
    ],
    beneficios: [
      "Reduce la fatiga visual",
      "Mejora la concentración",
      "Disminuye el estrés digital",
      "Aumenta tu productividad"
    ]
  },
  {
    id: "r10",
    titulo: "Diario de gratitud",
    categoria: "bienestar",
    resumen: "Escribe tres cosas buenas de tu día para entrenar tu mente hacia el bienestar.",
    descripcion: "La gratitud es una práctica sencilla con respaldo científico: ayuda a reducir el estrés, mejorar el estado de ánimo y fortalecer las relaciones. Dedicar diez minutos al final del día a reconocer lo positivo cambia el foco de atención.",
    duracion: "10 min",
    duracionMin: 10,
    nivel: "Fácil",
    porciones: "Cada noche",
    tags: ["Mindfulness", "Hábitos", "Bienestar emocional"],
    objetivos: ["reducir_estres", "mejor_descanso"],
    contiene: [],
    beneficio: "Mejora el ánimo y reduce el estrés.",
    pasos: [
      "Busca un lugar tranquilo y sin distracciones.",
      "Escribe tres cosas por las que te sientes agradecido.",
      "Anota por qué fue importante cada una.",
      "Cierra con una respiración profunda."
    ],
    beneficios: [
      "Mejora el estado de ánimo",
      "Reduce el estrés y la ansiedad",
      "Fortalece la autoestima",
      "Favorece un mejor descanso"
    ]
  },
  {
    id: "r11",
    titulo: "Hidratación inteligente",
    categoria: "bienestar",
    resumen: "Aprende a distribuir el agua del día con recordatorios simples y sin esfuerzo.",
    descripcion: "Mantener una hidratación adecuada mejora la concentración, la digestión y la energía. Más que beber mucha agua de golpe, lo importante es distribuirla a lo largo del día y asociarla a tus actividades cotidianas.",
    duracion: "5 min",
    duracionMin: 5,
    nivel: "Fácil",
    porciones: "2 litros/día",
    tags: ["Agua", "Hábitos", "Energía"],
    objetivos: ["energia", "digestion", "inmunidad"],
    contiene: [],
    beneficio: "Mejora tu energía y concentración.",
    pasos: [
      "Llena una botella de 1 litro al iniciar el día.",
      "Bebe un vaso al despertar y otro antes de cada comida.",
      "Asocia la hidratación a tus pausas activas.",
      "Ajusta la cantidad según tu actividad y clima."
    ],
    beneficios: [
      "Mejora la concentración",
      "Favorece la digestión",
      "Regula la temperatura corporal",
      "Previene dolores de cabeza"
    ]
  },
  {
    id: "r12",
    titulo: "Snack de frutos secos y fruta",
    categoria: "bienestar",
    resumen: "Una merienda práctica con grasas saludables y fibra para evitar picoteos poco nutritivos.",
    descripcion: "Un puñado de frutos secos sin sal junto a una fruta fresca es una merienda equilibrada que combina grasas saludables, fibra y vitaminas. Ayuda a controlar el hambre entre comidas y a mantener la energía estable.",
    duracion: "5 min",
    duracionMin: 5,
    nivel: "Fácil",
    porciones: "1 porción",
    tags: ["Snack", "Energía", "Grasas saludables"],
    objetivos: ["energia", "inmunidad", "bajar_peso"],
    contiene: ["frutos_secos"],
    beneficio: "Merienda nutritiva que controla el hambre.",
    pasos: [
      "Elige un puñado pequeño de frutos secos sin sal.",
      "Acompáñalo con una fruta de temporada.",
      "Evita versiones fritas o con azúcar añadida.",
      "Come despacio y sin distracciones."
    ],
    beneficios: [
      "Grasas saludables para el corazón",
      "Fibra y vitaminas naturales",
      "Controla el hambre entre comidas",
      "Fácil de llevar contigo"
    ]
  },
  {
    id: "r13",
    titulo: "Meditación guiada de 10 minutos",
    categoria: "bienestar",
    resumen: "Un espacio de calma para observar tus pensamientos y volver al presente.",
    descripcion: "La meditación guiada entrena la atención plena: observar sin juzgar lo que ocurre en el cuerpo y la mente. Diez minutos diarios pueden reducir los niveles de estrés, mejorar el sueño y aumentar la claridad mental.",
    duracion: "10 min",
    duracionMin: 10,
    nivel: "Fácil",
    porciones: "1 sesión",
    tags: ["Mindfulness", "Meditación", "Calma"],
    objetivos: ["reducir_estres", "mejor_descanso", "energia"],
    contiene: [],
    beneficio: "Entrena la calma y la atención plena.",
    pasos: [
      "Siéntate cómodo con la espalda apoyada.",
      "Cierra los ojos y lleva la atención a tu respiración.",
      "Cuando aparezcan pensamientos, déjalos pasar.",
      "Vuelve lentamente al entorno al terminar."
    ],
    beneficios: [
      "Reduce el estrés percibido",
      "Mejora la claridad mental",
      "Favorece el descanso nocturno",
      "Aumenta la atención plena"
    ]
  }
];

const HABITOS_BASE = [
  { id: "h1", titulo: "Desayuno consciente", categoria: "alimentacion", meta: "Sin pantallas, sin prisa", frecuencia: "Todos los días" },
  { id: "h2", titulo: "30 minutos de movimiento", categoria: "actividad", meta: "Caminar o entrenar", frecuencia: "5 días / semana" },
  { id: "h3", titulo: "2 litros de agua", categoria: "bienestar", meta: "Distribuidos en el día", frecuencia: "Todos los días" },
  { id: "h4", titulo: "Rutina de sueño 8 horas", categoria: "descanso", meta: "Misma hora cada noche", frecuencia: "Todos los días" },
  { id: "h5", titulo: "10 minutos de respiración", categoria: "bienestar", meta: "Respiración 4-7-8", frecuencia: "Todos los días" }
];

/* Iconografía: trazos simples, coherentes y accesibles.
   Se usan como cadenas para reutilizarlos en todas las vistas. */
const ICONOS = {
  hoja: '<path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16Z"/><path d="M4 21c3-6 7-9 12-11"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  corazon: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  nivel: '<path d="M5 20v-5M12 20V9M19 20V4"/>',
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  flechaIzq: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  cerrar: '<path d="m6 6 12 12M18 6 6 18"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  basura: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>',
  salir: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  escudo: '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  estrella: '<path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L3.6 9.8l6.5-.9L12 3Z"/>',
  fuego: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6-3-10-3 2-4 5-4 7-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 6 7 6Z"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
  grafico: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  chispa: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  manzana: '<path d="M12 8c-1.5-2-4-2.5-6-1C3.5 8.5 4 13 6.5 17c1.2 1.9 2.6 3 3.5 3 .8 0 1.3-.5 2-.5s1.2.5 2 .5c.9 0 2.3-1.1 3.5-3C20 13 20.5 8.5 18 7c-2-1.5-4.5-1-6 1Z"/><path d="M12 8c0-2 1-3.5 3-4"/>',
  correr: '<circle cx="15" cy="4.5" r="1.8"/><path d="m13 8-3 4 3 2-2 5M13 8l4 2 3-1M10 12l-3 1-2 4M14 14l4 3 1 4"/>',
  luna: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
  pulso: '<path d="M3 12h4l2-5 3 10 2-5h7"/>',
  gota: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  candado: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'
};
