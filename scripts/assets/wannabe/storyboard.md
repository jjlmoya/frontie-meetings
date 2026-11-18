# Wannabe — videoclip de cinco Fronties

## Dirección visual

Videoclip pop de grupo con cámara viva, humor y energía de los noventa. Las cinco personas conservan su identidad y sus disfraces de la foto del cosplay; se mueven como un grupo con personalidad, con pasos, poses y respuestas distintas. La referencia de movimiento es el tutorial oficial de baile de “Wannabe” y la entrada caótica del videoclip original en el hotel, traducidos a las ilustraciones del proyecto.

## Portada y apertura

- Abrir con la portada horizontal 16:9 durante dos segundos sin audio.
- Entrar al máster desde el segundo cero en la escena exterior del hotel.
- Cruzar a la galería y al pasillo; Ginger llega por la puerta cuando le toca.
- En el segundo 9,34 cambiar al escenario de actuación y presentar a las cinco en formación.
- Mantener coreografía de cuatro tiempos hasta el final de la primera frase, en la pausa del segundo 18,2.

## Escenas del resto de la canción

El montaje alterna planos de solista, dúo y grupo siguiendo los relevos vocales y el LRC de la edición single. Las frases solistas del primer y segundo verso pasan a una sola intérprete; el decorado cambia con un fundido de fondo de 0,25 s, sin duplicar bailarinas ni saltar su escala.

1. **Pasillo del hotel:** persecuciones laterales, entradas y salidas, juego con espejos y solos centrados en una persona.
2. **Escenario pop del hotel:** formaciones de cinco, dúos cara a cara y relevos de gestos en el salón de baile.
3. **Vestíbulo y galería de ascensores:** persecuciones cortas, entradas por puertas y planos de dúos con cambios de profundidad.
4. **Galería de espejos:** reflejos como motivo de escena, con movimientos sincronizados y encuadres alternos.
5. **Azotea e invernadero nocturno:** entrada desde la cabina roja, dúos, líneas y desplazamientos con viento sugerido por inclinaciones y pasos.
6. **Final:** regreso al salón de baile, relevo final, formación compacta y pose de grupo; confeti grande y escaso solo en el cierre.

El plan completo, con entradas ajustadas a los onsets de la edición single, está en `timing/full-cut.mjs`. `timing/full-performance.mjs` resuelve posiciones y coreografía según la escena; usa el stem vocal común para articular y el máster para el audio reproducido.

## Movimiento y sincronía

- Mantener contacto con el suelo y la escala de cada personaje según el plano.
- Alternar paso lateral, cruce, giro de hombros, brazos en diagonal y pose breve; evitar el balanceo idéntico y continuo.
- En los solos, queda en escena la cantante que lleva la frase; las demás desaparecen suavemente. En los dúos, solo quedan las dos voces del intercambio. En los coros, cantan las cinco.
- Hacer que las bocas sigan el stem vocal y cerrar en pausas e instrumentales. El MP3 trae una mezcla vocal común, no stems separados por cantante.
- Mantener marcas de suelo y escala estables entre planos; cambiar el decorado sin duplicar al reparto.
- Mostrar la letra solo cuando haya texto validado y sincronizado; no inventar palabras ni mostrar una línea antes de oírla.

## Capas

Las cinco intérpretes se componen desde cabeza, cuerpo, brazos, manos y piernas separados. Los escenarios son placas panorámicas raster independientes: escenario, vestíbulo, ascensor, galería de espejos, azotea e invernadero. Solo el fondo hace un fundido breve; no hay haces de luz añadidos sobre las escenas.
