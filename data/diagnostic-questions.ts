import type { DiagnosticQuestion } from '@/types'

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // --- Aritmética y Álgebra Básica ---
  {
    id: 'q-arit-1',
    text: '¿Cuánto es 1/2 + 1/3?',
    options: ['2/5', '5/6', '2/6', '1/6'],
    correctIndex: 1,
    moduleId: 'aritmetica-algebra-basica',
  },
  {
    id: 'q-arit-2',
    text: '¿Cuál es la solución de la ecuación 2x − 6 = 0?',
    options: ['x = −3', 'x = 3', 'x = 6', 'x = −6'],
    correctIndex: 1,
    moduleId: 'aritmetica-algebra-basica',
  },
  // --- Funciones y Gráficas ---
  {
    id: 'q-func-1',
    text: '¿Cuál es el dominio de f(x) = 1/x?',
    options: ['ℝ', 'ℝ − {0}', 'ℝ⁺', 'ℝ − {1}'],
    correctIndex: 1,
    moduleId: 'funciones-graficas',
  },
  {
    id: 'q-func-2',
    text: 'La función f(x) = x² tiene como eje de simetría:',
    options: ['x = 1', 'x = −1', 'x = 0', 'No tiene eje de simetría'],
    correctIndex: 2,
    moduleId: 'funciones-graficas',
  },
  // --- Trigonometría Esencial ---
  {
    id: 'q-trig-1',
    text: '¿Cuánto vale sen(30°)?',
    options: ['1', '√3/2', '1/2', '√2/2'],
    correctIndex: 2,
    moduleId: 'trigonometria-esencial',
  },
  {
    id: 'q-trig-2',
    text: '¿Cuál de las siguientes es la identidad trigonométrica fundamental?',
    options: [
      'sen(x) + cos(x) = 1',
      'sen²(x) + cos²(x) = 1',
      'sen(x) · cos(x) = 1',
      'tan(x) = sen(x) + cos(x)',
    ],
    correctIndex: 1,
    moduleId: 'trigonometria-esencial',
  },
  // --- Límites y Derivadas ---
  {
    id: 'q-lim-1',
    text: '¿Cuál es el límite de f(x) = x² cuando x tiende a 3?',
    options: ['3', '6', '9', 'No existe'],
    correctIndex: 2,
    moduleId: 'limites-derivadas-intro',
  },
  {
    id: 'q-lim-2',
    text: '¿Cuál es la derivada de f(x) = x³?',
    options: ['x²', '3x', '3x²', 'x³'],
    correctIndex: 2,
    moduleId: 'limites-derivadas-intro',
  },
  // --- Geometría Vectorial ---
  {
    id: 'q-geo-1',
    text: 'Si u = (1, 0) y v = (0, 1), ¿cuánto vale u · v (producto escalar)?',
    options: ['1', '0', '2', '−1'],
    correctIndex: 1,
    moduleId: 'geometria-vectorial-basica',
  },
  // --- Combinatoria y Lógica ---
  {
    id: 'q-comb-1',
    text: '¿Cuántas formas hay de ordenar 3 libros distintos en una estantería?',
    options: ['3', '6', '9', '12'],
    correctIndex: 1,
    moduleId: 'combinatoria-logica-basica',
  },
]
