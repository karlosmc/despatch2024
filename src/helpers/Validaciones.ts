
export default function rucValido(ruc) {
  //11 dígitos y empieza en 10,15,16,17 o 20
  if (!(ruc >= 1e10 && ruc < 11e9
     || ruc >= 15e9 && ruc < 18e9
     || ruc >= 2e10 && ruc < 21e9))
      return false;
  
  for (var suma = -(ruc%10<2), i = 0; i<11; i++, ruc = ruc/10|0)
      suma += (ruc % 10) * (i % 7 + (i/7|0) + 1);
  return suma % 11 === 0;
}
