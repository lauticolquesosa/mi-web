# LCS Portfolio — Actualización Sección Proyectos
## Prompt para Claude Code · Adaptación al diseño actual + Preview scrolleable

> Este MD se escribe sobre el diseño que ya implementaste en la sección #proyectos.
> NO reemplaces el diseño de las cards — está bien como está.
> Este prompt hace DOS cosas específicas:
> 1. Corregir los badges de estado (todos los proyectos están ONLINE)
> 2. Agregar un preview scrolleable de página completa en cada modal

---

## CONTEXTO — EL ESTADO ACTUAL

El diseño de cards que implementaste funciona bien. Se mantiene:
- Grilla de 3 columnas con gradiente y nombre del proyecto
- Info debajo de cada card (nombre, descripción, VER CASO)
- Contador "6 casos · X en vivo · X en proceso"
- Estructura del modal existente

Lo que hay que cambiar:

### CORRECCIÓN 1 — Badges de estado

**Todos los 6 proyectos están online en producción.** Los 4 que marcaste como "EN PROCESO" están mal. Corregir:

| Proyecto | Badge actual | Badge correcto |
|---|---|---|
| La Vaca | EN VIVO ✅ | Sin cambio |
| Brunetti | EN VIVO ✅ | Sin cambio |
| Doña Salta | EN PROCESO ❌ | → EN VIVO |
| Espacio Zur | EN PROCESO ❌ | → EN VIVO |
| Jockey Club Salta | EN PROCESO ❌ | → EN VIVO |
| IPV | EN PROCESO ❌ | → EN VIVO |

Actualizar también el contador: de "2 en vivo · 4 en proceso" → **"6 en vivo"**

---

### CORRECCIÓN 2 — Preview scrolleable en cada modal

En cada modal, reemplazar el área hero estática actual (el div vacío oscuro grande) por un **mini browser scrolleable** que muestra el screenshot completo de la web. El usuario puede scrollear adentro del frame para ver toda la página.

---

## CSS NUEVO — agregar al bloque `<style>`

Agregar al final del CSS existente, sin tocar nada:

```css
/* ===========================
   MODAL PREVIEW — MINI BROWSER SCROLLEABLE
   =========================== */
.modal-preview {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 2rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

/* Barra superior tipo macOS */
.modal-preview__bar {
  background: #1e1e1e;
  padding: 9px 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.modal-preview__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.modal-preview__dot--red    { background: #ff5f57; }
.modal-preview__dot--yellow { background: #febc2e; }
.modal-preview__dot--green  { background: #28c840; }
.modal-preview__url {
  flex: 1;
  background: #151515;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 10px;
  font-family: monospace;
  color: rgba(255,255,255,0.35);
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Área scrolleable — muestra el screenshot completo */
.modal-preview__screen {
  height: 520px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #0a0a0a;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
  cursor: ns-resize;
}
.modal-preview__screen::-webkit-scrollbar {
  width: 4px;
}
.modal-preview__screen::-webkit-scrollbar-track {
  background: transparent;
}
.modal-preview__screen::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
}
.modal-preview__screen::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}

/* El screenshot ocupa el ancho completo, altura natural (puede ser muy larga) */
.modal-preview__screen img {
  width: 100%;
  display: block;
  height: auto;
  pointer-events: none;
  user-select: none;
}

/* Placeholder mientras no hay imagen */
.modal-preview__placeholder {
  height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #111 0%, rgba(17,152,102,0.08) 100%);
}
.modal-preview__placeholder-text {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
}
.modal-preview__placeholder-url {
  font-size: 0.75rem;
  color: rgba(17,152,102,0.5);
  font-family: monospace;
}

/* Hint de scroll */
.modal-preview__hint {
  text-align: center;
  padding: 0.5rem;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  background: #1a1a1a;
  border-top: 1px solid rgba(255,255,255,0.05);
}

@media (max-width: 768px) {
  .modal-preview__screen { height: 380px; }
  .modal-preview__placeholder { height: 380px; }
}
```

---

## HTML — REEMPLAZAR el hero de cada modal

En cada uno de los 6 modales, localizar el área del hero actual (el div vacío grande oscuro al principio del modal) y **reemplazarlo** por el siguiente bloque. Hacerlo para los 6 modales, cambiando la URL y el nombre de imagen en cada uno.

### Template del mini browser (repetir para cada modal):

```html
<!-- MINI BROWSER SCROLLEABLE -->
<div class="modal-preview">
  <div class="modal-preview__bar">
    <span class="modal-preview__dot modal-preview__dot--red"></span>
    <span class="modal-preview__dot modal-preview__dot--yellow"></span>
    <span class="modal-preview__dot modal-preview__dot--green"></span>
    <span class="modal-preview__url">[URL-DEL-PROYECTO]</span>
  </div>
  <div class="modal-preview__screen">
    <!--
      TODO (Lauti): reemplazá src con el screenshot full-page del proyecto.
      Capturalo con GoFullPage (Chrome), guardalo en assets/ con el nombre indicado.
      La imagen va a ser larga — el usuario scrollea adentro del frame para verla completa.
    -->
    <img src="assets/[NOMBRE-IMAGEN]-fullpage.jpg"
         alt="[NOMBRE DEL PROYECTO] — Preview completa"
         onerror="this.parentElement.innerHTML='<div class=\'modal-preview__placeholder\'><span class=\'modal-preview__placeholder-text\'>Screenshot pendiente</span><span class=\'modal-preview__placeholder-url\'>[URL-DEL-PROYECTO]</span></div>'" />
  </div>
  <div class="modal-preview__hint"
       data-es="↕ Scrolleá para ver la web completa"
       data-en="↕ Scroll to explore the full website">
    ↕ Scrolleá para ver la web completa
  </div>
</div>
```

### Valores por proyecto — reemplazar en cada modal:

| Proyecto | `[URL-DEL-PROYECTO]` | `[NOMBRE-IMAGEN]` |
|---|---|---|
| La Vaca | `la-vaca-web.vercel.app` | `lavaca` |
| Brunetti | `brunetti-jade.vercel.app` | `brunetti` |
| Doña Salta | `dona-salta-landing.vercel.app` | `donasalta` |
| Espacio Zur | `espacio-zur.vercel.app` | `zur` |
| Jockey Club | `jockeyclubsalta.vercel.app` | `jockey` |
| IPV Salta | `ipv-salta.vercel.app` | `ipv` |

### Nombres de archivos esperados en `/assets/`:

```
assets/lavaca-fullpage.jpg       → GoFullPage de la-vaca-web.vercel.app
assets/brunetti-fullpage.jpg     → GoFullPage de brunetti-jade.vercel.app
assets/donasalta-fullpage.jpg    → GoFullPage de dona-salta-landing.vercel.app
assets/zur-fullpage.jpg          → GoFullPage de espacio-zur.vercel.app
assets/jockey-fullpage.jpg       → GoFullPage de jockeyclubsalta.vercel.app
assets/ipv-fullpage.jpg          → GoFullPage de ipv-salta.vercel.app
```

> Nota: estos son los screenshots de PÁGINA COMPLETA (tall/larga). Son distintos de los
> que van en las cards (que son recortes del hero/above-the-fold, si se agregan después).

---

## RESUMEN — QUÉ CAMBIA, QUÉ NO

### Se mantiene (NO tocar):
- El diseño de las cards (3 columnas, gradiente, nombre del proyecto)
- Los badges ya correctos (La Vaca EN VIVO, Brunetti EN VIVO)
- La estructura del modal (meta, caso de estudio, etc.)
- Todo el resto del sitio

### Se cambia:
1. Badges de Doña Salta, Espacio Zur, Jockey Club, IPV → de EN PROCESO a EN VIVO
2. Contador "6 casos · 2 en vivo · 4 en proceso" → "6 casos · 6 en vivo"
3. El área hero de cada modal → mini browser scrolleable
4. CSS nuevo del mini browser → agregar al `<style>`

---

## CRITERIOS DE CALIDAD

Antes de terminar, verificar:

- [ ] Los 6 badges dicen EN VIVO (ninguno EN PROCESO)
- [ ] El contador muestra "6 casos · 6 en vivo" (o equivalente en el diseño actual)
- [ ] Cada modal tiene el mini browser con: barra de dots + URL + área scrolleable + hint de scroll
- [ ] La URL en cada mini browser corresponde al proyecto correcto
- [ ] El `onerror` muestra el placeholder cuando la imagen no existe todavía
- [ ] En mobile el área scrolleable tiene 380px de altura
- [ ] El hint "↕ Scrolleá para ver la web completa" tiene data-es y data-en para el toggle

---

## NOTA FINAL PARA LAUTI — Cómo agregar las imágenes después

Cuando tengas los screenshots:
1. Abrí cada sitio en Chrome
2. Scrolleá hasta abajo (para que cargue el lazy load)
3. Clic en GoFullPage → descargá el PNG
4. Renombrá según la tabla de arriba (ej: `lavaca-fullpage.jpg`)
5. Optimizá en squoosh.app (WebP o JPG, calidad 80)
6. Copiá a la carpeta `/assets/`
7. El mini browser ya los va a mostrar automáticamente — sin tocar más código

Para Jockey Club e IPV (multi-página): capturá la **página de inicio (home)** solamente.
Si querés mostrar páginas internas, podés agregar más imágenes en la galería del modal (`.modal-gallery`).

---

*Adaptado al diseño implementado por CC. Todos los proyectos confirmados online a junio 2026.*
