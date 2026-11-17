# Escenario medieval por piezas

Las piezas runtime usan un lienzo común de 1672 × 941. Todas salvo `cielo-base.png` tienen canal alfa transparente y están colocadas en su posición de escena. Los recortes maestros viven junto a `cielo-base-maestro.png` en `scripts/assets/medieval/layers/scene/`.

Orden de montaje:

1. `cielo-base.png` — cielo de papel sin sol.
2. `nube-izquierda.png`, `nube-derecha.png`.
3. `castillo-fondo.png`.
4. `arboleda.png`.
5. `casa-izquierda.png`, `casa-derecha.png`.
6. `muralla.png`.
7. `suelo-escenario.png`, `hojas-suelo.png`.
8. `pilar-izquierdo.png`, `pilar-derecho.png`.
9. `cortina-superior.png`, `cortina-izquierda.png`, `cortina-derecha.png`.
10. `banderines-izquierda.png`, `banderines-derecha.png`.

La vista plana `escenario-reensamblado.png` vive en `scripts/assets/medieval/previews/`. La web usa WebP lossless transparentes, no esa composición plana. Para regenerar las capas y la vista previa: `npm run build:medieval-assets` desde la raíz del proyecto.
