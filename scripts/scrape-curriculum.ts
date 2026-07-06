/**
 * scrape-curriculum.ts
 *
 * Intenta extraer el temario oficial de las guías docentes de la UGR para el
 * Grado en Ciencia de Datos e Inteligencia Artificial (CDIA), 1º curso.
 *
 * Si el scraping falla (sitio inaccesible, estructura inesperada, etc.),
 * usa los datos de fallback basados en las guías docentes oficiales.
 *
 * Genera:
 *   data/curriculum.json         — Temario oficial 1º CDIA
 *   data/curriculum-summer.json  — Temario de nivelación Summer Mode
 *
 * Ejecutar con: pnpm scrape
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import type { Curriculum, Subject, Topic } from '../types/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

const BASE_URL = 'https://grados.ugr.es/ciencia-datos-ia'
const PLAN_URL = `${BASE_URL}/docencia/plan-estudios`

// Slugs de las asignaturas de 1º en la web de la UGR
const SUBJECT_SLUGS = [
  'calculo',
  'fundamentos-fisicos-y-tecnologicos',
  'fundamentos-programacion',
  'fundamentos-del-software',
  'algebra-lineal-y-estructuras-matematicas',
  'estadistica',
  'ingenieria-empresa-y-sociedad',
  'logica-y-metodos-discretos',
  'metodologia-la-programacion',
  'tecnologia-y-organizacion-computadores',
]

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function fetchHtml(url: string, timeoutMs = 10_000): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CDIA-Tutor-Scraper/1.0 (academic project)' },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/**
 * Extrae el nombre oficial de la asignatura del <title> de la guía docente.
 */
function parseSubjectName(html: string): string | null {
  const $ = cheerio.load(html)
  // El título suele ser: "Guía docente de <Nombre> (<código>) | ..."
  const title = $('title').text()
  const match = title.match(/Guía docente de (.+?)\s*(?:\(|$)/i)
  if (match) return match[1].trim()

  // Fallback: buscar en <h1>
  const h1 = $('h1').first().text().trim()
  return h1 || null
}

/**
 * Extrae el temario de la guía docente.
 * Las guías UGR tienen una sección con encabezado "Temario" o "Contenidos"
 * seguida de una lista numerada de temas.
 */
function parseTopics(html: string): Topic[] {
  const $ = cheerio.load(html)
  const topics: Topic[] = []

  // Buscar el contenedor del temario
  // UGR usa .field--name-field-temario o .temario o un <section> con id "temario"
  const selectors = [
    '.field--name-field-temario',
    '#temario',
    '.temario',
    '[class*="temario"]',
    '[id*="temario"]',
  ]

  let temarioEl = null
  for (const sel of selectors) {
    const el = $(sel).first()
    if (el.length) {
      temarioEl = el
      break
    }
  }

  // Si no encontramos por selector, buscar por texto del heading
  if (!temarioEl) {
    $('h2, h3, h4').each((_, heading) => {
      const text = $(heading).text().toLowerCase()
      if (text.includes('temario') || text.includes('contenido')) {
        temarioEl = $(heading).parent()
        return false // break
      }
    })
  }

  if (!temarioEl) return []

  // Extraer items del temario (pueden ser <li>, <p>, o <tr>)
  const items: string[] = []
  temarioEl.find('li').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 3) items.push(text)
  })

  if (items.length === 0) {
    temarioEl.find('p').each((_, el) => {
      const text = $(el).text().trim()
      // Filtrar párrafos que parecen temas (suelen empezar con número o "Tema")
      if (/^(tema\s+\d+|bloque\s+\d+|\d+[\.\-])/i.test(text) && text.length > 5) {
        items.push(text)
      }
    })
  }

  // Convertir items en Topics
  items.forEach((item, idx) => {
    // Limpiar prefijos como "Tema 1:", "1.", "1-", "Bloque I:"
    const name = item
      .replace(/^(tema|bloque)\s+[\dIVXivx]+[\.\:\-\s]+/i, '')
      .replace(/^\d+[\.\:\-\s]+/, '')
      .trim()

    if (name.length > 3) {
      topics.push({
        id: slugify(`${idx + 1}-${name}`),
        name,
        subtopics: [],
      })
    }
  })

  return topics
}

// ---------------------------------------------------------------------------
// Scraping principal
// ---------------------------------------------------------------------------

async function scrapeSubjectGuide(slug: string): Promise<Partial<Subject> | null> {
  const guideUrl = `${BASE_URL}/docencia/plan-estudios/${slug}/guia-docente`
  console.log(`  → Intentando: ${guideUrl}`)
  const html = await fetchHtml(guideUrl)
  if (!html) {
    console.log(`    ✗ No accesible`)
    return null
  }

  const name = parseSubjectName(html)
  const topics = parseTopics(html)

  if (!name && topics.length === 0) {
    console.log(`    ✗ Sin datos útiles en la página`)
    return null
  }

  console.log(`    ✓ ${name ?? slug} — ${topics.length} temas`)
  return { name: name ?? undefined, topics: topics.length > 0 ? topics : undefined }
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}

// ---------------------------------------------------------------------------
// DATOS DE FALLBACK — Temario oficial 1º CDIA (basado en guías docentes UGR)
// ---------------------------------------------------------------------------

const FALLBACK_SUBJECTS: Subject[] = [
  // ─── SEMESTRE 1 ───────────────────────────────────────────────────────────
  {
    id: 'calculo',
    name: 'Cálculo',
    semester: 1,
    year: 1,
    topics: [
      {
        id: 'numeros-reales-funciones',
        name: 'Números reales y funciones reales de variable real',
        subtopics: [
          'Conjuntos numéricos: naturales, enteros, racionales, reales',
          'Funciones: dominio, imagen, composición e inversas',
          'Funciones elementales: polinómicas, racionales, exponencial, logarítmica, trigonométricas',
        ],
      },
      {
        id: 'limites-continuidad',
        name: 'Límites y continuidad',
        subtopics: [
          'Definición formal de límite (ε-δ)',
          'Álgebra de límites e indeterminaciones',
          'Continuidad: definición, clasificación de discontinuidades',
          'Teorema de Bolzano y Weierstrass',
        ],
      },
      {
        id: 'derivacion',
        name: 'Derivación',
        subtopics: [
          'Definición de derivada y su interpretación geométrica',
          'Reglas de derivación: suma, producto, cociente, cadena',
          'Derivadas de funciones elementales',
          'Derivación implícita y de funciones inversas',
        ],
      },
      {
        id: 'aplicaciones-derivada',
        name: 'Aplicaciones de la derivada',
        subtopics: [
          'Teoremas de Rolle, Lagrange y Cauchy',
          "Regla de L'Hôpital",
          'Monotonía, extremos locales y globales',
          'Convexidad, concavidad y puntos de inflexión',
          'Polinomios de Taylor y MacLaurin',
        ],
      },
      {
        id: 'integracion',
        name: 'Integración',
        subtopics: [
          'Integral de Riemann: definición y propiedades',
          'Teorema fundamental del cálculo',
          'Técnicas de integración: sustitución, partes, fracciones parciales',
          'Integrales impropias',
          'Aplicaciones: área, longitud de arco, volúmenes de revolución',
        ],
      },
      {
        id: 'series',
        name: 'Series numéricas y de potencias',
        subtopics: [
          'Sucesiones y series numéricas',
          'Criterios de convergencia: ratio, raíz, integral, comparación',
          'Series de potencias: radio e intervalo de convergencia',
          'Series de Taylor y MacLaurin: aplicaciones',
        ],
      },
    ],
  },

  {
    id: 'fundamentos-fisicos-tecnologicos',
    name: 'Fundamentos Físicos y Tecnológicos',
    semester: 1,
    year: 1,
    topics: [
      {
        id: 'magnitudes-unidades',
        name: 'Magnitudes físicas y unidades',
        subtopics: [
          'Sistema Internacional de Unidades',
          'Análisis dimensional y cambio de unidades',
          'Incertidumbre y cifras significativas',
        ],
      },
      {
        id: 'mecanica',
        name: 'Mecánica clásica',
        subtopics: [
          'Cinemática: movimiento rectilíneo y curvilíneo',
          'Dinámica: leyes de Newton',
          'Trabajo, energía y potencia',
          'Conservación de la energía mecánica',
        ],
      },
      {
        id: 'electricidad-magnetismo',
        name: 'Electricidad y magnetismo',
        subtopics: [
          'Ley de Coulomb y campo eléctrico',
          'Potencial eléctrico y capacidad',
          'Corriente eléctrica: ley de Ohm, resistencia',
          'Circuitos en serie y paralelo',
          'Campo magnético e inducción',
        ],
      },
      {
        id: 'electronica-basica',
        name: 'Electrónica básica',
        subtopics: [
          'Semiconductores: diodos y transistores',
          'Álgebra de Boole y puertas lógicas',
          'Circuitos combinacionales: multiplexores, demultiplexores',
          'Circuitos secuenciales: biestables, registros',
        ],
      },
      {
        id: 'ondas-optica',
        name: 'Ondas y óptica',
        subtopics: [
          'Movimiento ondulatorio: parámetros y clasificación',
          'Espectro electromagnético',
          'Reflexión y refracción',
          'Óptica geométrica: lentes y espejos',
        ],
      },
    ],
  },

  {
    id: 'fundamentos-programacion',
    name: 'Fundamentos de Programación',
    semester: 1,
    year: 1,
    topics: [
      {
        id: 'introduccion-programacion',
        name: 'Introducción a la programación y algoritmia',
        subtopics: [
          'Concepto de algoritmo y programa',
          'Diagramas de flujo y pseudocódigo',
          'Entornos de desarrollo: compilador, intérprete, IDE',
          'Primer programa: entrada, proceso y salida',
        ],
      },
      {
        id: 'tipos-datos-expresiones',
        name: 'Tipos de datos, variables y expresiones',
        subtopics: [
          'Tipos primitivos: enteros, reales, booleanos, caracteres',
          'Variables, constantes y ámbito',
          'Operadores aritméticos, relacionales y lógicos',
          'Conversión de tipos (casting)',
        ],
      },
      {
        id: 'estructuras-control',
        name: 'Estructuras de control',
        subtopics: [
          'Sentencias condicionales: if, else, switch',
          'Bucles: while, do-while, for',
          'Control de flujo: break, continue, return',
          'Anidamiento y complejidad',
        ],
      },
      {
        id: 'funciones',
        name: 'Funciones y modularidad',
        subtopics: [
          'Definición e invocación de funciones',
          'Paso de parámetros: por valor y por referencia',
          'Ámbito local y global de variables',
          'Recursión: casos base e inductivos',
          'Funciones de orden superior',
        ],
      },
      {
        id: 'arrays-cadenas',
        name: 'Arrays y cadenas de caracteres',
        subtopics: [
          'Arrays unidimensionales: declaración, acceso, recorrido',
          'Arrays multidimensionales y matrices',
          'Cadenas: operaciones básicas, comparación, búsqueda',
          'Algoritmos de ordenación: burbuja, inserción, selección',
        ],
      },
      {
        id: 'ficheros-es',
        name: 'Entrada/Salida y ficheros',
        subtopics: [
          'Flujos de E/S estándar',
          'Ficheros de texto: lectura y escritura',
          'Manejo de errores y excepciones básicas',
          'Procesamiento de datos tabulares (CSV)',
        ],
      },
    ],
  },

  {
    id: 'fundamentos-software',
    name: 'Fundamentos del Software',
    semester: 1,
    year: 1,
    topics: [
      {
        id: 'sistemas-operativos',
        name: 'Introducción a los sistemas operativos',
        subtopics: [
          'Concepto, historia y tipos de SO',
          'Estructura del SO: núcleo, llamadas al sistema',
          'Gestión de procesos: estados, planificación',
          'Gestión de memoria: paginación, segmentación',
        ],
      },
      {
        id: 'shell-scripting',
        name: 'Shell y scripting en Unix/Linux',
        subtopics: [
          'Sistema de ficheros: jerarquía, permisos',
          'Comandos esenciales: navegación, gestión de ficheros, tuberías',
          'Scripts bash: variables, condicionales, bucles',
          'Expresiones regulares y grep/sed/awk',
        ],
      },
      {
        id: 'control-versiones',
        name: 'Control de versiones con Git',
        subtopics: [
          'Conceptos: repositorio, commit, rama, merge',
          'Flujo de trabajo básico: init, add, commit, push, pull',
          'Ramas: creación, fusión, conflictos',
          'Plataformas: GitHub/GitLab, pull requests',
        ],
      },
      {
        id: 'herramientas-desarrollo',
        name: 'Herramientas de desarrollo de software',
        subtopics: [
          'IDEs y editores de código',
          'Depuración: puntos de interrupción, inspección de variables',
          'Gestores de paquetes y dependencias',
          'Introducción a la integración continua (CI)',
        ],
      },
      {
        id: 'ingenieria-software',
        name: 'Principios de ingeniería del software',
        subtopics: [
          'Ciclo de vida del software: modelos en cascada y ágiles',
          'Especificación de requisitos',
          'Calidad del software: métricas, revisiones de código',
          'Documentación técnica',
        ],
      },
    ],
  },

  {
    id: 'algebra-lineal-estructuras-matematicas',
    name: 'Álgebra Lineal y Estructuras Matemáticas',
    semester: 1,
    year: 1,
    topics: [
      {
        id: 'matrices-operaciones',
        name: 'Matrices y operaciones matriciales',
        subtopics: [
          'Definición, tipos y notación matricial',
          'Operaciones: suma, producto, transposición',
          'Matrices especiales: identidad, nula, diagonal, triangular, simétrica',
          'Matrices por bloques',
        ],
      },
      {
        id: 'sistemas-ecuaciones-lineales',
        name: 'Sistemas de ecuaciones lineales',
        subtopics: [
          'Representación matricial: Ax = b',
          'Método de Gauss-Jordan: escalonamiento y reducción',
          'Teorema de Rouché-Frobenius: discusión de sistemas',
          'Rango de una matriz',
        ],
      },
      {
        id: 'determinantes',
        name: 'Determinantes',
        subtopics: [
          'Definición y propiedades del determinante',
          'Cálculo: desarrollo por filas/columnas, regla de Sarrus',
          'Adjuntos y matriz inversa',
          'Regla de Cramer',
        ],
      },
      {
        id: 'espacios-vectoriales',
        name: 'Espacios vectoriales',
        subtopics: [
          'Definición axiomática de espacio vectorial',
          'Subespacios vectoriales',
          'Dependencia e independencia lineal',
          'Bases y dimensión',
          'Cambio de base y coordenadas',
        ],
      },
      {
        id: 'aplicaciones-lineales',
        name: 'Aplicaciones lineales',
        subtopics: [
          'Definición y ejemplos de aplicaciones lineales',
          'Núcleo e imagen: propiedades',
          'Teorema de la dimensión',
          'Matriz asociada a una aplicación lineal',
          'Isomorfismos y composición',
        ],
      },
      {
        id: 'valores-vectores-propios',
        name: 'Valores propios y diagonalización',
        subtopics: [
          'Polinomio característico y valores propios',
          'Vectores propios y subespacios propios',
          'Criterios y algoritmo de diagonalización',
          'Aplicaciones: potencias de matrices, sistemas dinámicos',
          'Diagonalización ortogonal: matrices simétricas',
        ],
      },
    ],
  },

  // ─── SEMESTRE 2 ───────────────────────────────────────────────────────────
  {
    id: 'estadistica',
    name: 'Estadística',
    semester: 2,
    year: 1,
    topics: [
      {
        id: 'estadistica-descriptiva',
        name: 'Estadística descriptiva',
        subtopics: [
          'Tipos de variables: cualitativas y cuantitativas',
          'Tablas de frecuencias y representaciones gráficas',
          'Medidas de centralización: media, mediana, moda',
          'Medidas de dispersión: varianza, desviación típica, rango intercuartílico',
          'Medidas de forma: asimetría y curtosis',
          'Distribuciones bivariantes: covarianza y correlación',
        ],
      },
      {
        id: 'probabilidad',
        name: 'Cálculo de probabilidades',
        subtopics: [
          'Espacio muestral y eventos',
          'Axiomas de Kolmogorov',
          'Probabilidad condicionada e independencia',
          'Teorema de la probabilidad total',
          'Teorema de Bayes y sus aplicaciones',
        ],
      },
      {
        id: 'variables-aleatorias-discretas',
        name: 'Variables aleatorias discretas',
        subtopics: [
          'Función de masa de probabilidad y distribución acumulada',
          'Esperanza, varianza y momentos',
          'Distribución Bernoulli y Binomial',
          'Distribución de Poisson',
          'Distribución Geométrica e Hipergeométrica',
        ],
      },
      {
        id: 'variables-aleatorias-continuas',
        name: 'Variables aleatorias continuas',
        subtopics: [
          'Función de densidad y distribución acumulada',
          'Distribución Uniforme y Exponencial',
          'Distribución Normal: estandarización y tabla Z',
          'Distribuciones Chi-cuadrado, t de Student y F de Snedecor',
          'Teorema Central del Límite',
        ],
      },
      {
        id: 'inferencia-estadistica',
        name: 'Inferencia estadística',
        subtopics: [
          'Muestras y estadísticos muestrales',
          'Estimación puntual: propiedades de estimadores',
          'Intervalos de confianza: media y proporción',
          'Tamaño de muestra',
        ],
      },
      {
        id: 'contraste-hipotesis',
        name: 'Contraste de hipótesis',
        subtopics: [
          'Hipótesis nula y alternativa: errores tipo I y II',
          'Valor p y nivel de significación',
          'Tests para la media: z-test y t-test',
          'Tests para proporciones y varianzas',
          'Tests no paramétricos: chi-cuadrado, Mann-Whitney',
        ],
      },
    ],
  },

  {
    id: 'ingenieria-empresa-sociedad',
    name: 'Ingeniería, Empresa y Sociedad',
    semester: 2,
    year: 1,
    topics: [
      {
        id: 'etica-profesional',
        name: 'Ética profesional y responsabilidad social',
        subtopics: [
          'Código deontológico del ingeniero informático',
          'Responsabilidad social corporativa',
          'Ética en inteligencia artificial y datos',
          'Sesgo, equidad y transparencia en sistemas IA',
        ],
      },
      {
        id: 'empresa-organizacion',
        name: 'Empresa y organización empresarial',
        subtopics: [
          'Tipos de empresa y formas jurídicas',
          'Estructura organizativa: funcional, matricial, plana',
          'El rol del ingeniero/científico de datos en la empresa',
          'Modelos de negocio digitales',
        ],
      },
      {
        id: 'gestion-proyectos',
        name: 'Gestión de proyectos tecnológicos',
        subtopics: [
          'Ciclo de vida de proyectos: inicio, planificación, ejecución, cierre',
          'Metodologías ágiles: Scrum, Kanban',
          'Estimación de esfuerzo y planificación',
          'Gestión de riesgos',
        ],
      },
      {
        id: 'marco-legal',
        name: 'Marco legal e intelectual',
        subtopics: [
          'Propiedad intelectual e industrial: patentes, marcas',
          'Licencias de software: privativas, libres (GPL, MIT, Apache)',
          'Reglamento General de Protección de Datos (RGPD)',
          'Normativa europea de IA: AI Act',
        ],
      },
    ],
  },

  {
    id: 'logica-metodos-discretos',
    name: 'Lógica y Métodos Discretos',
    semester: 2,
    year: 1,
    topics: [
      {
        id: 'logica-proposicional',
        name: 'Lógica proposicional',
        subtopics: [
          'Proposiciones, conectivas y tablas de verdad',
          'Tautologías, contradicciones y contingencias',
          'Formas normales conjuntiva y disyuntiva',
          'Resolución y demostración automática',
        ],
      },
      {
        id: 'logica-predicados',
        name: 'Lógica de predicados de primer orden',
        subtopics: [
          'Predicados, cuantificadores universal y existencial',
          'Fórmulas bien formadas e interpretaciones',
          'Razonamiento: modus ponens, modus tollens',
          'Introducción a la demostración formal',
        ],
      },
      {
        id: 'teoria-conjuntos',
        name: 'Teoría de conjuntos y relaciones',
        subtopics: [
          'Operaciones: unión, intersección, complementario, producto cartesiano',
          'Relaciones binarias: propiedades (reflexiva, simétrica, transitiva)',
          'Relaciones de equivalencia y orden',
          'Funciones: inyectivas, sobreyectivas, biyectivas',
        ],
      },
      {
        id: 'combinatoria',
        name: 'Combinatoria',
        subtopics: [
          'Principios de la suma y el producto',
          'Permutaciones con y sin repetición',
          'Combinaciones y números combinatorios',
          'Principio de inclusión-exclusión',
          'Relaciones de recurrencia',
        ],
      },
      {
        id: 'grafos',
        name: 'Grafos',
        subtopics: [
          'Definición, representación (matriz de adyacencia, lista de adyacencia)',
          'Tipos: dirigidos, no dirigidos, ponderados, bipartitos',
          'Recorridos: BFS y DFS',
          'Grafos eulerianos y hamiltonianos',
          'Árboles: propiedades, recorridos, árbol generador mínimo',
        ],
      },
      {
        id: 'induccion-recursion',
        name: 'Inducción matemática y recursión',
        subtopics: [
          'Principio de inducción matemática débil y fuerte',
          'Definiciones recursivas de conjuntos y funciones',
          'Análisis de la corrección de algoritmos recursivos',
        ],
      },
    ],
  },

  {
    id: 'metodologia-programacion',
    name: 'Metodología de la Programación',
    semester: 2,
    year: 1,
    topics: [
      {
        id: 'orientacion-objetos',
        name: 'Programación orientada a objetos',
        subtopics: [
          'Clases y objetos: atributos y métodos',
          'Encapsulamiento: modificadores de acceso',
          'Constructores, destructores y sobrecarga',
          'this, static y métodos de clase',
        ],
      },
      {
        id: 'herencia-polimorfismo',
        name: 'Herencia y polimorfismo',
        subtopics: [
          'Jerarquías de clases y herencia simple',
          'Sobreescritura de métodos (override)',
          'Polimorfismo en tiempo de compilación y ejecución',
          'Clases abstractas e interfaces',
        ],
      },
      {
        id: 'estructuras-datos',
        name: 'Estructuras de datos lineales',
        subtopics: [
          'Listas enlazadas: simples, dobles y circulares',
          'Pilas: implementación y aplicaciones (evaluación de expresiones)',
          'Colas: FIFO, colas de prioridad',
          'Complejidad algorítmica: notación O',
        ],
      },
      {
        id: 'estructuras-datos-no-lineales',
        name: 'Estructuras de datos no lineales',
        subtopics: [
          'Árboles binarios: recorridos (preorden, inorden, postorden)',
          'Árboles binarios de búsqueda',
          'Tablas hash: funciones hash, colisiones',
          'Conjuntos y mapas: operaciones y complejidad',
        ],
      },
      {
        id: 'patrones-calidad',
        name: 'Patrones de diseño y calidad del código',
        subtopics: [
          'Principios SOLID',
          'Patrones creacionales: Singleton, Factory',
          'Patrones estructurales: Adapter, Decorator',
          'Patrones de comportamiento: Observer, Strategy',
        ],
      },
      {
        id: 'pruebas-software',
        name: 'Pruebas del software',
        subtopics: [
          'Tipos de pruebas: unitarias, de integración, de sistema',
          'Desarrollo guiado por tests (TDD)',
          'Cobertura de código',
          'Mocks y stubs',
        ],
      },
    ],
  },

  {
    id: 'tecnologia-organizacion-computadores',
    name: 'Tecnología y Organización de Computadores',
    semester: 2,
    year: 1,
    topics: [
      {
        id: 'representacion-informacion',
        name: 'Representación de la información',
        subtopics: [
          'Sistemas de numeración: binario, octal, hexadecimal',
          'Aritmética binaria: suma, resta, multiplicación',
          'Complemento a dos: representación de enteros negativos',
          'Punto flotante: estándar IEEE 754',
          'Representación de texto: ASCII, Unicode',
        ],
      },
      {
        id: 'circuitos-combinacionales',
        name: 'Álgebra de Boole y circuitos combinacionales',
        subtopics: [
          'Álgebra de Boole: axiomas y teoremas',
          'Mapas de Karnaugh: simplificación de funciones',
          'Puertas lógicas: AND, OR, NOT, NAND, NOR, XOR',
          'Circuitos combinacionales: sumadores, multiplexores, codificadores',
        ],
      },
      {
        id: 'circuitos-secuenciales',
        name: 'Circuitos secuenciales',
        subtopics: [
          'Biestables: SR, D, JK, T',
          'Registros y desplazadores',
          'Contadores síncronos y asíncronos',
          'Máquinas de estados finitos: Moore y Mealy',
        ],
      },
      {
        id: 'organizacion-procesador',
        name: 'Organización del procesador',
        subtopics: [
          'Componentes: ALU, registros, unidad de control',
          'Ciclo de instrucción: fetch, decode, execute',
          'Conjunto de instrucciones (ISA): RISC vs CISC',
          'Modos de direccionamiento',
          'Segmentación (pipeline): etapas y hazards',
        ],
      },
      {
        id: 'memoria-jerarquia',
        name: 'Jerarquía de memoria',
        subtopics: [
          'Tipos de memoria: SRAM, DRAM, ROM, Flash',
          'Memoria caché: principio de localidad, mapeo directo y asociativo',
          'Memoria virtual: paginación y segmentación',
          'TLB y gestión de fallos de página',
        ],
      },
      {
        id: 'entrada-salida',
        name: 'Sistemas de entrada/salida',
        subtopics: [
          'Buses: tipos y protocolos',
          'Técnicas de E/S: polling, interrupciones, DMA',
          'Periféricos: almacenamiento secundario (HDD, SSD)',
          'Introducción a la arquitectura multiprocesador',
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// DATOS DE FALLBACK — Temario Summer Mode (nivelación previa al grado)
// ---------------------------------------------------------------------------

const SUMMER_CURRICULUM: Curriculum = {
  subjects: [
    {
      id: 'aritmetica-algebra-basica',
      name: 'Aritmética y Álgebra Básica',
      semester: 0,
      year: 0,
      topics: [
        {
          id: 'fracciones-decimales',
          name: 'Fracciones y números decimales',
          subtopics: [
            'Operaciones con fracciones: suma, resta, producto, cociente',
            'Simplificación y amplificación',
            'Conversión entre fracciones y decimales',
            'Fracciones equivalentes',
          ],
        },
        {
          id: 'potencias-raices',
          name: 'Potencias y raíces',
          subtopics: [
            'Propiedades de las potencias',
            'Notación científica',
            'Raíces cuadradas y cúbicas: simplificación',
            'Potencias con exponente fraccionario',
          ],
        },
        {
          id: 'polinomios-factorizacion',
          name: 'Polinomios y factorización',
          subtopics: [
            'Operaciones con polinomios: suma, resta, producto',
            'División de polinomios: Ruffini',
            'Factorización: factor común, trinomio cuadrado perfecto, diferencia de cuadrados',
            'Raíces de polinomios',
          ],
        },
        {
          id: 'ecuaciones-inecuaciones',
          name: 'Ecuaciones e inecuaciones',
          subtopics: [
            'Ecuaciones de primer grado: resolución y verificación',
            'Ecuaciones de segundo grado: fórmula general y discriminante',
            'Sistemas de ecuaciones lineales: sustitución y reducción',
            'Inecuaciones lineales y cuadráticas',
          ],
        },
      ],
    },
    {
      id: 'funciones-graficas',
      name: 'Funciones y Gráficas',
      semester: 0,
      year: 0,
      topics: [
        {
          id: 'concepto-funcion',
          name: 'Concepto de función',
          subtopics: [
            'Definición: dominio, codominio e imagen',
            'Representación: tabla, fórmula, gráfica',
            'Función inyectiva, sobreyectiva y biyectiva',
            'Función inversa',
          ],
        },
        {
          id: 'tipos-funciones',
          name: 'Tipos de funciones',
          subtopics: [
            'Funciones lineales y afines: pendiente e intersección',
            'Funciones cuadráticas: vértice, eje de simetría',
            'Funciones polinómicas de grado superior',
            'Funciones racionales: asíntotas',
          ],
        },
        {
          id: 'funciones-trascendentes',
          name: 'Funciones exponencial y logarítmica',
          subtopics: [
            'Función exponencial: base e y base 10',
            'Función logarítmica: propiedades del logaritmo',
            'Cambio de base',
            'Ecuaciones exponenciales y logarítmicas',
          ],
        },
        {
          id: 'transformaciones-graficas',
          name: 'Transformaciones de funciones',
          subtopics: [
            'Traslaciones horizontales y verticales',
            'Reflexiones y simetrías',
            'Escalados y compresiones',
            'Composición de funciones',
          ],
        },
      ],
    },
    {
      id: 'trigonometria-esencial',
      name: 'Trigonometría Esencial',
      semester: 0,
      year: 0,
      topics: [
        {
          id: 'angulos-medida',
          name: 'Ángulos y medida',
          subtopics: [
            'Grados sexagesimales y radianes: conversión',
            'Ángulos notables: 0°, 30°, 45°, 60°, 90°',
            'Ángulos en posición estándar y cuadrantes',
          ],
        },
        {
          id: 'razones-trigonometricas',
          name: 'Razones trigonométricas',
          subtopics: [
            'Seno, coseno y tangente en triángulo rectángulo',
            'Definición en la circunferencia unidad',
            'Valores de seno y coseno de ángulos notables',
            'Razones inversas: cosecante, secante, cotangente',
          ],
        },
        {
          id: 'identidades-formulas',
          name: 'Identidades y fórmulas trigonométricas',
          subtopics: [
            'Identidad fundamental: sin²x + cos²x = 1',
            'Fórmulas de la suma y diferencia de ángulos',
            'Fórmulas del ángulo doble',
            'Ecuaciones trigonométricas básicas',
          ],
        },
        {
          id: 'funciones-trigonometricas',
          name: 'Funciones trigonométricas',
          subtopics: [
            'Gráficas de seno, coseno y tangente',
            'Periodo, amplitud y desfase',
            'Funciones trigonométricas inversas: arcsen, arccos, arctan',
          ],
        },
      ],
    },
    {
      id: 'limites-derivadas-intro',
      name: 'Introducción a Límites y Derivadas',
      semester: 0,
      year: 0,
      topics: [
        {
          id: 'limites-intro',
          name: 'Concepto intuitivo de límite',
          subtopics: [
            'Límite de una función en un punto: aproximación gráfica y numérica',
            'Límites laterales y límite infinito',
            'Indeterminaciones básicas: 0/0, ∞/∞',
            'Asíntotas horizontales y verticales',
          ],
        },
        {
          id: 'continuidad-intro',
          name: 'Continuidad de funciones',
          subtopics: [
            'Definición intuitiva de continuidad',
            'Tipos de discontinuidades: evitable, de salto, esencial',
            'Continuidad de funciones elementales',
          ],
        },
        {
          id: 'derivada-intro',
          name: 'Concepto de derivada',
          subtopics: [
            'Interpretación geométrica: recta tangente',
            'Interpretación física: velocidad instantánea',
            'Derivadas de funciones elementales: potencias, sen, cos, exp, log',
            'Reglas básicas: suma, producto, cociente, cadena',
          ],
        },
        {
          id: 'aplicaciones-derivada-intro',
          name: 'Aplicaciones elementales de la derivada',
          subtopics: [
            'Monotonía: función creciente y decreciente',
            'Máximos y mínimos locales',
            'Optimización: problemas de máximos y mínimos',
          ],
        },
      ],
    },
    {
      id: 'geometria-vectorial-basica',
      name: 'Geometría Vectorial Básica',
      semester: 0,
      year: 0,
      topics: [
        {
          id: 'vectores-plano',
          name: 'Vectores en el plano',
          subtopics: [
            'Definición: módulo, dirección y sentido',
            'Suma de vectores y producto por escalar',
            'Vectores en coordenadas cartesianas',
            'Vectores unitarios y normalización',
          ],
        },
        {
          id: 'operaciones-vectores',
          name: 'Operaciones con vectores',
          subtopics: [
            'Producto escalar: definición y propiedades',
            'Producto escalar y ángulo entre vectores',
            'Proyección de un vector sobre otro',
            'Vectores ortogonales y ortogonales unitarios',
          ],
        },
        {
          id: 'vectores-espacio',
          name: 'Vectores en el espacio tridimensional',
          subtopics: [
            'Coordenadas en R³',
            'Módulo y distancia en R³',
            'Producto vectorial: definición geométrica',
            'Aplicaciones: área de triángulo, volumen de paralelepípedo',
          ],
        },
        {
          id: 'geometria-analitica',
          name: 'Geometría analítica básica',
          subtopics: [
            'Ecuación de la recta: paramétrica, implícita, explícita',
            'Distancia de un punto a una recta',
            'Ecuación del plano en R³',
            'Intersección de rectas y planos',
          ],
        },
      ],
    },
    {
      id: 'combinatoria-logica-basica',
      name: 'Combinatoria y Lógica Básica',
      semester: 0,
      year: 0,
      topics: [
        {
          id: 'teoria-conjuntos-basica',
          name: 'Teoría de conjuntos básica',
          subtopics: [
            'Notación y representación de conjuntos',
            'Operaciones: unión, intersección, complementario, diferencia',
            'Diagramas de Venn',
            'Producto cartesiano y pares ordenados',
          ],
        },
        {
          id: 'logica-basica',
          name: 'Lógica básica y razonamiento',
          subtopics: [
            'Proposiciones y conectivas: y, o, no, implica',
            'Tablas de verdad',
            'Leyes de De Morgan',
            'Razonamiento deductivo e inductivo',
          ],
        },
        {
          id: 'combinatoria-basica',
          name: 'Combinatoria básica',
          subtopics: [
            'Principio multiplicativo y aditivo',
            'Permutaciones sin repetición',
            'Combinaciones: coeficiente binomial',
            'Triángulo de Pascal',
            'Variaciones con repetición',
          ],
        },
        {
          id: 'probabilidad-basica',
          name: 'Probabilidad básica',
          subtopics: [
            'Espacio muestral y sucesos',
            'Definición clásica (Laplace) y frecuentista',
            'Probabilidad de la unión e intersección',
            'Probabilidad condicionada e independencia de sucesos',
          ],
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// Construcción del curriculum completo
// ---------------------------------------------------------------------------

async function buildCurriculum(): Promise<Curriculum> {
  console.log('\n📚 Construyendo curriculum.json...')
  console.log(`\nIntentando scraping desde: ${PLAN_URL}`)

  const subjects: Subject[] = []

  for (const fallback of FALLBACK_SUBJECTS) {
    console.log(`\n[${fallback.id}]`)
    const scraped = await scrapeSubjectGuide(fallback.id)

    const subject: Subject = {
      ...fallback,
      name: scraped?.name ?? fallback.name,
      topics:
        scraped?.topics && scraped.topics.length > 0 ? scraped.topics : fallback.topics,
    }

    subjects.push(subject)
  }

  return { subjects }
}

// ---------------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------------

async function main() {
  console.log('🎓 CDIA Tutor — Generador de curriculum\n')

  mkdirSync(DATA_DIR, { recursive: true })

  // 1. Curriculum oficial
  const curriculum = await buildCurriculum()
  const curriculumPath = join(DATA_DIR, 'curriculum.json')
  writeFileSync(curriculumPath, JSON.stringify(curriculum, null, 2), 'utf-8')
  console.log(`\n✅ curriculum.json generado → ${curriculumPath}`)
  console.log(
    `   ${curriculum.subjects.length} asignaturas, ${curriculum.subjects.reduce((acc, s) => acc + s.topics.length, 0)} temas totales`
  )

  // 2. Curriculum Summer Mode (siempre hardcodeado)
  const summerPath = join(DATA_DIR, 'curriculum-summer.json')
  writeFileSync(summerPath, JSON.stringify(SUMMER_CURRICULUM, null, 2), 'utf-8')
  console.log(`\n✅ curriculum-summer.json generado → ${summerPath}`)
  console.log(
    `   ${SUMMER_CURRICULUM.subjects.length} módulos, ${SUMMER_CURRICULUM.subjects.reduce((acc, s) => acc + s.topics.length, 0)} temas totales`
  )

  console.log('\n🏁 Listo.\n')
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
