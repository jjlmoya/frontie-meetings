# Escenario medieval por piezas

Las piezas usan un lienzo común de 1672 × 941. Todas las piezas salvo `cielo-base.png` tienen canal alfa transparente y están colocadas en su posición de escena. La carpeta `_sources` contiene los recortes maestros de nubes, pilares, cortinas y muralla.

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

`escenario-reensamblado.png` es la vista previa. La web usa las mismas PNG transparentes, no esa composición plana. Para regenerar divisiones y vista previa: `node scripts/assemble-medieval-layers.mjs` desde la raíz del proyecto.
