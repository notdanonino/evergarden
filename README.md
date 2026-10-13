# EverGarden — Contexto de Proyecto para IA y Colaboradores

## Identidad del proyecto

**EverGarden** es un sitio web de catálogo para un negocio de arreglos florales artificiales. El proyecto comunica una estética elegante, cálida, artesanal y romántica; el mensaje central es que ofrece **“belleza que no se marchita”**.

El sitio no es un e-commerce tradicional con carrito y pagos integrados. Funciona como catálogo visual y canal de captación: el cliente explora arreglos, abre sus detalles y realiza pedidos o consultas por WhatsApp.

La marca está orientada a:

- Arreglos florales artificiales.
- Decoración de hogar.
- Regalos.
- Piezas artesanales y exclusivas.
- Pedidos personalizados.

## Objetivo de este documento

Este README sirve como **contexto operativo y de producto** para otra IA, desarrollador o colaborador que llegue al proyecto sin conocerlo.

No debe interpretarse como una guía de despliegue paso a paso. El objetivo principal es entender:

- Qué es EverGarden.
- Cómo se comporta el catálogo.
- Qué partes del sistema existen.
- Qué reglas comerciales y de diseño deben preservarse.
- Cómo se relacionan Vercel, Supabase, Storage y el panel admin.
- Qué cambios son seguros y cuáles requieren cuidado.

## Resumen funcional

```text
EverGarden muestra arreglos florales artificiales disponibles.

Cada arreglo contiene información visual y comercial:
- Imagen.
- Nombre.
- Precio.
- Descripción.
- Estado de disponibilidad.

El visitante puede:
- Explorar productos disponibles.
- Abrir detalles de un arreglo.
- Solicitarlo por WhatsApp.
- Ver una galería de arreglos vendidos.
- Solicitar un arreglo personalizado.
```

## Arquitectura conceptual

```text
Sitio público (index.html)
      │
      ├── Solicita arreglos disponibles
      │       └── /api/productos
      │               └── Supabase: tabla productos
      │
      ├── Solicita arreglos vendidos
      │       └── /api/galeria
      │               └── Supabase: tabla productos
      │
      └── Dirige pedidos a WhatsApp

Panel administrativo (admin.html)
      │
      └── Administra registros del catálogo
              └── Supabase: tabla productos

Supabase Storage
      │
      └── Almacena fotografías de arreglos
              └── URL pública guardada en productos.imagen
```

## Archivos importantes

| Archivo | Función dentro del producto |
|---|---|
| `index.html` | Sitio público de EverGarden: catálogo, galería, textos de marca, contacto y pedidos por WhatsApp |
| `admin.html` | Panel para agregar, modificar, ocultar o marcar arreglos como vendidos |
| `api/productos.js` | Función serverless que entrega al frontend arreglos disponibles |
| `api/galeria.js` | Función serverless que entrega arreglos vendidos para la galería |
| `README.md` | Contexto de producto, reglas y decisiones del proyecto |

## Modelo de catálogo

La fuente de verdad del catálogo es una tabla de Supabase llamada:

```text
public.productos
```

Cada registro representa un arreglo floral. La tabla debe soportar, al menos, información equivalente a:

```text
id
created_at
nombre
precio
descripcion
imagen
disponible
vendido
```

### Significado de campos importantes

| Campo | Significado |
|---|---|
| `nombre` | Nombre comercial del arreglo |
| `precio` | Precio mostrado al cliente, normalmente en MXN |
| `descripcion` | Texto corto que explica estilo, colores, flores o uso sugerido |
| `imagen` | URL pública de la imagen alojada en Supabase Storage |
| `disponible` | Indica si el arreglo puede mostrarse como disponible para compra |
| `vendido` | Indica que ya se vendió y debe mostrarse como pieza de galería |
| `created_at` | Permite ordenar nuevos productos antes que los antiguos |

## Reglas de estado del producto

Esta es una regla central del proyecto. No cambiarla sin entender cómo afecta el catálogo y la galería.

| Estado real del arreglo | `disponible` | `vendido` | Comportamiento esperado |
|---|---:|---:|---|
| Disponible para compra | `true` | `false` | Aparece en el catálogo principal |
| Vendido | `false` | `true` | Sale del catálogo y aparece en la galería |
| Oculto temporalmente | `false` | `false` | No aparece en ninguna sección pública |

La lógica actual de los endpoints es:

```text
Catálogo principal:
disponible = true AND vendido != true

Galería:
vendido = true
```

## Gestión de imágenes

Las imágenes no deben incrustarse directamente en el HTML del catálogo.

El flujo esperado es:

```text
1. Fotografiar o preparar imagen del arreglo.
2. Subirla a Supabase Storage.
3. Obtener la URL pública del archivo.
4. Pegar esa URL en el campo de imagen dentro de admin.html.
5. Guardar el producto en la tabla productos.
6. index.html carga la URL desde los datos recibidos por la API.
```

### Convención recomendada para imágenes

- Preferir JPG, WebP o PNG optimizado.
- Usar nombres descriptivos y consistentes.
- Evitar nombres ambiguos como `imagen-final-final.jpg`.
- Mantener proporciones similares para que la cuadrícula se vea consistente.
- No borrar una imagen de Storage si la URL sigue siendo utilizada por un producto o la galería.

Ejemplos de nombres apropiados:

```text
arreglo-rosas-pastel-01.webp
centro-mesa-primavera.jpg
ramo-tonos-rosa.png
```

## Comportamiento de productos vendidos

Los arreglos vendidos siguen siendo valiosos para el sitio porque funcionan como portafolio visual e inspiración para pedidos futuros.

Cuando un arreglo se vende:

```text
disponible = false
vendido = true
```

No debe eliminarse automáticamente de Supabase ni de Storage. Debe conservarse para la galería, salvo que exista una razón expresa para retirarlo.

La página comunica que, aunque una pieza ya fue vendida, EverGarden puede crear una versión similar personalizada. No se debe prometer que será idéntica, porque cada pieza es artesanal y única.

## Pedidos personalizados

Los pedidos personalizados son una parte importante del negocio.

El tono del sitio debe comunicar que el cliente puede explicar:

- Colores deseados.
- Flores o elementos favoritos.
- Estilo.
- Ocasión.
- Tamaño aproximado.
- Idea o referencia visual.

Reglas comerciales comunicadas actualmente:

```text
- Los pedidos personalizados requieren un anticipo mínimo del 50%.
- Si no se recibe el pago correspondiente dentro de 24 horas,
  la solicitud no puede procesarse.
- Cada pieza es artesanal, por lo que puede ser similar a una referencia,
  pero no necesariamente idéntica.
```

Estas reglas deben mantenerse consistentes en cualquier texto nuevo, modal, formulario o sección de FAQ que se agregue.

## WhatsApp como canal de conversión

WhatsApp es el canal principal de pedidos y contacto.

El propósito de los botones de producto es abrir WhatsApp con un mensaje contextualizado, idealmente incluyendo:

```text
- Nombre del arreglo.
- Precio mostrado.
- Interés de compra o solicitud de información.
```

No reemplazar WhatsApp por un checkout complejo sin que el propietario del proyecto lo solicite explícitamente.

## Diseño y tono de marca

### Sensación visual

La interfaz debe sentirse:

- Elegante.
- Delicada.
- Cálida.
- Artesanal.
- Moderna, pero no tecnológica en exceso.
- Femenina o romántica sin perder legibilidad.

### Mensajes clave

El sitio utiliza y debe respetar ideas como:

```text
Belleza que no se marchita.
Arreglos elegantes para decorar tu hogar o regalar con amor.
Cada pieza es única e irrepetible.
```

### Evitar

No introducir de forma innecesaria:

- Diseño agresivamente corporativo.
- Estética gamer, neón o dashboard técnico.
- Lenguaje frío o excesivamente automatizado.
- Promesas de disponibilidad cuando un arreglo ya está vendido.
- Texto que haga parecer los arreglos producidos en masa.

## Contenido actual de marca

EverGarden comunica actualmente:

- Venta de arreglos florales artificiales.
- Decoración y regalos.
- Catálogo sujeto a disponibilidad.
- Piezas artesanales y exclusivas.
- Pedidos personalizados por WhatsApp.
- Ubicación en Guadalupe, Nuevo León, México.
- Horario de lunes a sábado, 9:00 am a 8:00 pm.
- Teléfono/WhatsApp: +52 81 3400 0720.

Si se modifica alguno de esos datos, buscar todas las apariciones en el sitio para mantener consistencia.

## API y backend

Las funciones serverless existentes consultan la REST API de Supabase en servidor.

### Endpoint de disponibles

`api/productos.js` obtiene productos con la lógica:

```text
disponible = true
vendido != true
orden: created_at descendente
```

### Endpoint de galería

`api/galeria.js` obtiene productos con la lógica:

```text
vendido = true
orden: created_at descendente
```

### Caché

Los endpoints usan caché de Vercel:

```text
s-maxage=60
stale-while-revalidate=300
```

Implicación: después de editar un producto, el contenido público puede tardar alrededor de un minuto en actualizar. No diagnosticar automáticamente un fallo si el cambio acaba de realizarse.

## Seguridad y secretos

La aplicación usa variables de entorno en Vercel para conectar las funciones serverless con Supabase.

Los nombres documentados de variables son:

```text
SUPABASE_URL
SUPABASE_KEY
```

Reglas obligatorias:

```text
- No incluir valores reales de claves, tokens o contraseñas en HTML público.
- No subir service_role keys a GitHub.
- No exponer secretos en README, capturas, commits o archivos JavaScript del cliente.
- Mantener las credenciales en Vercel Environment Variables.
```

Si `SUPABASE_KEY` corresponde a una clave privilegiada, solo debe utilizarse dentro de funciones serverless, nunca directamente desde el navegador.

## Decisiones de producto ya tomadas

- El catálogo no usa carrito de compras.
- WhatsApp es el principal canal de conversión.
- Supabase es la fuente de datos de productos.
- Supabase Storage es el alojamiento de imágenes.
- Vercel aloja el frontend y las funciones API.
- Los productos vendidos se conservan como galería/portafolio.
- El panel admin administra datos del catálogo sin editar el HTML público.
- Los arreglos personalizados requieren anticipo de 50% y plazo de 24 horas.

## Cambios seguros para futuras iteraciones

Generalmente son seguros:

- Mejorar estilos visuales sin romper legibilidad.
- Ajustar textos de marketing manteniendo tono artesanal.
- Añadir secciones de preguntas frecuentes.
- Mejorar modal de detalles del producto.
- Agregar filtros o categorías, si se actualiza el modelo de datos y panel admin.
- Mejorar accesibilidad, rendimiento y diseño móvil.
- Agregar testimonios reales con autorización.
- Agregar opciones de ordenamiento visual.

## Cambios que requieren cuidado

Revisar impacto antes de modificar:

- Filtros de `disponible` y `vendido` en los endpoints.
- Nombres de columnas de la tabla `productos`.
- URLs de WhatsApp.
- Variables de entorno de Vercel.
- Permisos de Supabase Storage.
- Lógica del panel `admin.html`.
- Nombre y ubicación de funciones dentro de `api/`.
- Reglas relacionadas con anticipos y pedidos personalizados.

## Diagnóstico conceptual

### Un producto no aparece

Posibles causas:

```text
- disponible no es true.
- vendido es true.
- La fila no se guardó correctamente.
- La API está devolviendo un error.
- La caché aún no se actualiza.
- La imagen tiene URL inválida, aunque el producto sí exista.
```

### Un vendido no aparece en galería

Posibles causas:

```text
- vendido no es true.
- La API /api/galeria falla.
- La caché todavía sirve resultados antiguos.
- La URL de imagen dejó de ser pública o el archivo fue eliminado.
```

### La imagen no carga

Posibles causas:

```text
- URL pública incompleta o incorrecta.
- El archivo fue renombrado/eliminado en Storage.
- Bucket sin lectura pública.
- URL almacenada con espacios o caracteres inválidos.
```

## Instrucciones para una IA futura

Al recibir solicitudes de cambios:

1. Identificar si el cambio afecta únicamente UI, datos, backend, Storage o reglas comerciales.
2. Preservar las reglas de disponibilidad y vendidos.
3. No inventar productos, precios, reseñas, políticas o datos de contacto como si fueran reales.
4. No exponer secretos ni solicitar service keys en archivos públicos.
5. Si se cambia el esquema de productos, actualizar simultáneamente admin, endpoints y frontend.
6. Si se agrega una funcionalidad que requiere datos nuevos, definir claramente columnas, defaults y migración.
7. Antes de cambiar filtros del backend, verificar cómo afectan catálogo y galería.
8. Mantener el español como idioma predominante del negocio, salvo petición explícita.
9. Priorizar una experiencia móvil sencilla, visual y orientada a conversión por WhatsApp.
10. Respetar que el producto es una pieza artesanal; evitar promesas de exactitud o producción masiva.

## Resumen operativo corto

```text
EverGarden = catálogo de arreglos florales artificiales.

Supabase Storage = donde viven las fotos.
Supabase productos = donde viven los datos y estados del catálogo.
admin.html = donde se agrega/gestiona cada arreglo.
index.html = donde los clientes ven los productos.
/api/productos = disponibles.
/api/galeria = vendidos.
WhatsApp = canal de pedido.
Vercel = hosting y funciones serverless.
```
