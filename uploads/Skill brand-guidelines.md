---
name: brand-guidelines
description: Aplica los colores y tipografía oficiales de Anthropic a cualquier artefacto que pueda beneficiarse de tener la apariencia de Anthropic. Úsala cuando se requieran colores de marca, guías de estilo, formato visual o estándares de diseño corporativo.
license: Términos completos en LICENSE.txt
---

# Estilo de Marca de Anthropic

## Descripción General

Para acceder a la identidad de marca oficial y los recursos de estilo de Anthropic, usa esta skill.

**Palabras clave**: branding, identidad corporativa, identidad visual, post-procesamiento, estilo, colores de marca, tipografía, marca Anthropic, formato visual, diseño visual

## Directrices de Marca

### Colores

**Colores Principales:**

- Oscuro: `#141413` - Texto principal y fondos oscuros
- Claro: `#faf9f5` - Fondos claros y texto sobre fondo oscuro
- Gris Medio: `#b0aea5` - Elementos secundarios
- Gris Claro: `#e8e6dc` - Fondos sutiles

**Colores de Acento:**

- Naranja: `#d97757` - Acento principal
- Azul: `#6a9bcc` - Acento secundario
- Verde: `#788c5d` - Acento terciario

### Tipografía

- **Alineaciones/Títulos**: Poppins (con alternativa a Arial)
- **Cuerpo de texto**: Lora (con alternativa a Georgia)
- **Nota**: Las fuentes deben estar preinstaladas en tu entorno para obtener mejores resultados.

## Características

### Aplicación Inteligente de Fuentes

- Aplica la fuente Poppins a los encabezados (24pt o más).
- Aplica la fuente Lora al cuerpo del texto.
- Automáticamente usa Arial/Georgia si las fuentes personalizadas no están disponibles.
- Preserva la legibilidad en todos los sistemas.

### Estilo de Texto

- Encabezados (24pt+): Fuente Poppins
- Cuerpo de texto: Fuente Lora
- Selección inteligente de color basada en el fondo
- Preserva la jerarquía y el formato del texto

### Colores de Formas y Acentos

- Las formas que no son de texto utilizan colores de acento
- Alterna entre acentos naranja, azul y verde
- Mantiene el interés visual respetando la marca

## Detalles Técnicos

### Gestión de Fuentes

- Usa las fuentes Poppins y Lora instaladas en el sistema cuando están disponibles.
- Proporciona respaldo automático a Arial (títulos) y Georgia (cuerpo).
- No requiere instalación de fuentes - funciona con las fuentes del sistema existentes.
- Para mejores resultados, preinstala Poppins y Lora en tu entorno.

### Aplicación de Color

- Usa valores de color RGB para una coincidencia exacta de la marca.
- Aplicado a través de la clase RGBColor de python-pptx.
- Mantiene la fidelidad del color en diferentes sistemas.
