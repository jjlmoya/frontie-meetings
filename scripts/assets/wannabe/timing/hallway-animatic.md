# Prueba de montaje del pasillo

La prueba dura **20,2 s**: portada 16:9 en silencio durante 2 s y luego 18,2 s del montaje con audio. El corte queda en la pausa antes de la frase siguiente. Usa cinco ilustraciones individuales con transparencia en `../art-source/cosplay/`. Se exporta con `node scripts/build-wannabe-animatic.mjs --individual` a `../previews/hallway-cosplay-v19.mp4`. Cada personaje tiene cabeza, torso, brazos, antebrazos y piernas articulados. La frase repetida añade pasos laterales amplios y poses de brazo diferenciadas en un patrón de cuatro tiempos.

El montaje sigue a Sporty, Baby, Scary y Posh desde la calle hasta el pasillo del hotel. A los 3,10 s Ginger abre la puerta, que la oculta hasta que cruza el umbral. El resto reacciona con un cambio de peso. A partir de 4,46 s Scary y Ginger se turnan según los cues en `opening-cues.mjs`. Los dos encuadres comparten el fondo, la posición de los personajes y la puerta abierta de la escena anterior. Solo la solista del turno vocaliza y la risa anterior queda fuera de plano. Los subtítulos resaltan cada palabra usando tiempos aproximados obtenidos al alinear el texto con el máster y la voz aislada.

El plano de grupo monta un paso lateral de ida y vuelta. Los apoyos se alternan en los golpes de batería de 9,44, 9,98, 10,52 y 11,06 s. Cada persona remata con su propio gesto de brazos.

El primer montaje dura 10,8 s y usa el inicio de `public/assets/wannabe/wanna-be.mp3`. Se reproduce desde `../previews/hallway-animatic-v1.mp4` y se puede regenerar con `node scripts/build-wannabe-animatic.mjs` desde la raíz. La pista de batería sitúa los golpes que marcan los cortes de 5,62 y 7,80 s. La voz aislada mueve la boca del boceto en el primer plano como prueba.

La prueba usa muñecos de boceto animados por separado. Incluye la carrera, la frenada, el acercamiento a cámara y el remate grupal. Quedan por dibujar las puertas móviles, las poses de perfil y los giros, además de ajustar el canto y colocar la letra.

| Tiempo | Plano y acción | Poses que hay que preparar |
| --- | --- | --- |
| 0,00–1,98 | La cámara retrocede por el pasillo. Sporty abre una puerta de golpe y sale corriendo. | Apoyo contra la puerta, dos poses de carrera de perfil y giro de cabeza. |
| 1,98–3,73 | Baby se cruza con Sporty, frena y casi se cae. Posh pasa entre las dos a paso tranquilo. | Frenada con un pie clavado, rebote del peinado y dos apoyos de la caminata de Posh. |
| 3,73–5,62 | Scary se acerca tanto a la cámara que su zarpa tapa el plano. El gesto da paso al siguiente corte. | Perspectiva frontal, zarpa en primer plano como capa independiente y cara para el acercamiento. |
| 5,62–7,80 | Cambio de eje. Ginger abre la última puerta de una patada y las demás giran hacia ella. | Anticipación, patada, apoyo al aterrizar y puerta separada del marco. |
| 7,80–10,80 | Plano general. Las cinco ocupan su sitio y rematan juntas un paso de baile con gestos distintos. | Dos apoyos y una pose de remate por personaje. Sombra anclada al suelo. |

Cada plano tendrá su propio encuadre. Comprobar que el gag se entiende con el volumen a cero, que se pueden distinguir las cinco por su silueta y que la cámara deja sitio para la letra. El pase de canto y la sincronización de las palabras se ajustarán con la voz aislada y la letra.
