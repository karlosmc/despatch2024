/**
 * Comparación de razones sociales que no coinciden carácter por carácter:
 * "SOLGAS S.A." y "SOLGAS SA" son la misma empresa.
 */

const SUFIJOS = [
  "SOCIEDAD ANONIMA CERRADA",
  "SOCIEDAD ANONIMA",
  "SOCIEDAD COMERCIAL DE RESPONSABILIDAD LIMITADA",
  "EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA",
  "SAC",
  "SA",
  "SRL",
  "SCRL",
  "EIRL",
  "SAA",
];

/** Mayúsculas, sin acentos ni puntuación y sin la forma societaria. */
export const normalizarRazonSocial = (texto: string): string => {
  let limpio = (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();

  // La forma societaria puede venir al final o después de un guion.
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const sufijo of SUFIJOS) {
      if (limpio.endsWith(` ${sufijo}`)) {
        limpio = limpio.slice(0, -sufijo.length - 1).trim();
        cambio = true;
      }
    }
  }
  return limpio.replace(/\s+/g, " ");
};

const bigramas = (texto: string): string[] => {
  const plano = texto.replace(/\s+/g, " ");
  const pares: string[] = [];
  for (let i = 0; i < plano.length - 1; i++) pares.push(plano.slice(i, i + 2));
  return pares;
};

/**
 * Parecido entre dos razones sociales, de 0 (nada) a 1 (iguales). Usa el
 * coeficiente de Dice sobre pares de letras, más un empujón cuando una contiene
 * a la otra ("SOLGAS" dentro de "SOLGAS GAS NATURAL").
 */
export const similitudRazonSocial = (a: string, b: string): number => {
  const x = normalizarRazonSocial(a);
  const y = normalizarRazonSocial(b);
  if (!x || !y) return 0;
  if (x === y) return 1;

  const paresX = bigramas(x);
  const paresY = bigramas(y);
  if (paresX.length === 0 || paresY.length === 0) return 0;

  const restantes = [...paresY];
  let comunes = 0;
  paresX.forEach((par) => {
    const i = restantes.indexOf(par);
    if (i >= 0) {
      comunes++;
      restantes.splice(i, 1);
    }
  });

  const dice = (2 * comunes) / (paresX.length + paresY.length);
  const contiene = x.includes(y) || y.includes(x);
  return contiene ? Math.max(dice, 0.9) : dice;
};

/** El más parecido de la lista, si llega al mínimo pedido. */
export const masParecido = <T>(
  texto: string,
  lista: T[],
  nombreDe: (item: T) => string,
  minimo = 0.6
): { item: T; puntaje: number } | null => {
  let mejor: { item: T; puntaje: number } | null = null;
  lista.forEach((item) => {
    const puntaje = similitudRazonSocial(texto, nombreDe(item));
    if (!mejor || puntaje > mejor.puntaje) mejor = { item, puntaje };
  });
  return mejor && mejor.puntaje >= minimo ? mejor : null;
};
