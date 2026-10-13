# EverGarden — Documentación del proyecto

## Propósito

**EverGarden** es un catálogo web para la venta de arreglos florales artificiales. La página pública muestra los arreglos disponibles, permite consultar detalles y dirige los pedidos a WhatsApp. Los arreglos marcados como vendidos salen del catálogo principal y aparecen en la galería.

El proyecto está desplegado en **Vercel** y utiliza **Supabase** para almacenar el catálogo. Las imágenes se alojan en Supabase Storage y sus URLs se guardan en la tabla de productos.

## Arquitectura

```text
Visitante → index.html → /api/productos → Supabase (tabla productos)
                      └→ /api/galeria  → Supabase (productos vendidos)

Administrador → admin.html → gestión del catálogo → Supabase

Supabase Storage → imágenes → URL pública → producto en Supabase
```

## Archivos principales

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Página pública: portada, catálogo, galería, pedidos por WhatsApp, historia y contacto |
| `admin.html` | Panel administrativo para registrar y administrar arreglos |
| `api/productos.js` | Función serverless que devuelve productos disponibles |
| `api/galeria.js` | Función serverless que devuelve productos vendidos |
| `README.md` | Documentación y guía de operación |

> Las funciones serverless deben vivir en una carpeta `api/` para poder ser consultadas como `/api/productos` y `/api/galeria` en Vercel.

## Cómo funciona el catálogo

### Productos disponibles

`api/productos.js` consulta la tabla `productos` con estos filtros:

```text
disponible = true
vendido != true
```

Los resultados se ordenan por `created_at.desc`, de más reciente a más antiguo. Estos productos aparecen en el catálogo principal.

### Galería de vendidos

`api/galeria.js` consulta productos con:

```text
vendido = true
```

Los productos vendidos desaparecen del catálogo principal y aparecen en la sección de galería.

### Caché

Ambos endpoints usan:

```http
Cache-Control: s-maxage=60, stale-while-revalidate=300
```

Por ello, después de modificar un producto puede haber un retraso aproximado de un minuto. Usa `Ctrl + F5` para recargar sin caché.

## Tabla `productos` en Supabase

La tabla utilizada es:

```text
public.productos
```

Las funciones existentes requieren al menos:

| Columna | Uso |
|---|---|
| `created_at` | Ordenar productos |
| `disponible` | Mostrar en catálogo principal |
| `vendido` | Mostrar en galería |

El panel también suele requerir estos campos:

```sql
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
nombre text not null,
precio numeric not null,
descripcion text,
imagen text not null,
disponible boolean default true,
vendido boolean default false
```

### Estados recomendados

| Estado | `disponible` | `vendido` | Resultado |
|---|---:|---:|---|
| A la venta | `true` | `false` | Catálogo principal |
| Vendido | `false` | `true` | Galería |
| Oculto temporalmente | `false` | `false` | No aparece en el sitio |

## Agregar un nuevo arreglo

### 1. Preparar la imagen

- Usa JPG, PNG o WebP.
- Comprime la imagen antes de subirla para que el catálogo cargue rápido.
- Usa nombres descriptivos, por ejemplo:

```text
arreglo-rosas-blancas-01.webp
centro-mesa-primavera.jpg
ramo-rosa-pastel.png
```

### 2. Subir la foto a Supabase Storage

1. Entra al dashboard de Supabase.
2. Abre **Storage**.
3. Entra al bucket de imágenes del proyecto.
4. Selecciona **Upload file**.
5. Elige la imagen y espera a que termine de subir.

### 3. Obtener la URL de la imagen

1. Ubica el archivo dentro del bucket.
2. Abre el menú de opciones del archivo.
3. Selecciona **Get public URL** o **Copy URL**.
4. Copia la URL completa.

La URL suele verse así:

```text
https://TU-PROYECTO.supabase.co/storage/v1/object/public/TU-BUCKET/carpeta/archivo.jpg
```

### 4. Agregar el producto desde `admin.html`

1. Abre el panel administrativo `admin.html`.
2. Busca **Agregar nuevo arreglo**.
3. Captura nombre, precio, descripción y los campos solicitados.
4. Pega la URL pública de Supabase Storage en el campo de imagen.
5. Marca el producto como disponible.
6. Guarda el arreglo.

### 5. Verificar en la página pública

1. Abre el sitio público.
2. Recarga con `Ctrl + F5`.
3. Espera hasta 60 segundos si el endpoint sigue en caché.
4. Confirma imagen, nombre, descripción y precio.

## Requisito de Supabase Storage

El bucket de imágenes debe permitir lectura pública si las imágenes se cargan mediante una URL pública. Revisa:

- Que el bucket correcto exista.
- Que la URL copiada sea completa.
- Que el archivo siga existiendo.
- Que el nombre del archivo no haya cambiado después de guardar su URL en la tabla.

Si el bucket es privado, se requerirían URLs firmadas generadas desde backend. El flujo actual asume URLs públicas.

## Uso del panel administrativo

### Agregar un arreglo

```text
1. Subir imagen a Supabase Storage.
2. Copiar URL pública.
3. Abrir admin.html.
4. Agregar nombre, precio, descripción y URL.
5. Guardar el arreglo como disponible.
```

### Marcar un arreglo como vendido

Al vender un arreglo, cambia sus valores a:

```text
disponible = false
vendido = true
```

El producto dejará de salir en disponibles y se moverá a la galería tras el periodo de caché.

### Ocultar temporalmente

```text
disponible = false
vendido = false
```

Así el arreglo no aparece ni en catálogo ni en galería.

## Pedidos por WhatsApp

La página pública dirige pedidos a WhatsApp. El mensaje suele incluir datos del producto, como:

```text
Hola, me interesa el arreglo: [Nombre].
Precio mostrado: $[Precio].
```

Para cambiar el número de WhatsApp, busca URLs con este formato dentro de `index.html`:

```text
https://wa.me/5218134000720
```

El número mostrado actualmente en el sitio es:

```text
+52 81 3400 0720
```

## Variables de entorno en Vercel

Las funciones serverless leen estas variables:

```text
SUPABASE_URL
SUPABASE_KEY
```

### Configuración

1. Abre el proyecto en Vercel.
2. Ve a **Settings → Environment Variables**.
3. Confirma o agrega:

```text
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_KEY=TU_CLAVE_DE_SUPABASE
```

4. Aplica las variables en Production, Preview y Development según sea necesario.
5. Haz un nuevo deployment.

### Seguridad

- Nunca pongas `SUPABASE_KEY` en `index.html` o en JavaScript público.
- Nunca subas claves privadas a GitHub.
- Si `SUPABASE_KEY` es una `service_role key`, debe estar únicamente en Vercel Environment Variables y ser utilizada solo por funciones serverless.

## Endpoints

| URL | Archivo | Uso |
|---|---|---|
| `/api/productos` | `api/productos.js` | Devuelve productos disponibles y no vendidos |
| `/api/galeria` | `api/galeria.js` | Devuelve productos vendidos |

Ejemplo conceptual de respuesta:

```json
[
  {
    "id": "uuid-del-producto",
    "nombre": "Arreglo Rosas Pastel",
    "precio": 850,
    "descripcion": "Arreglo floral artificial.",
    "imagen": "https://.../arreglo-rosas-pastel.jpg",
    "disponible": true,
    "vendido": false,
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

## Desarrollo local

Abre la carpeta del proyecto en VS Code:

```powershell
cd "C:\Users\cdtru\Documents\Evergarden"
code .
```

Para probar funciones de Vercel localmente:

```powershell
npm install -g vercel
vercel login
vercel dev
```

Luego abre la URL local que indique Vercel, generalmente:

```text
http://localhost:3000
```

## Publicar cambios

Con GitHub y Vercel conectados:

```powershell
git add .
git commit -m "Describe el cambio"
git push
```

Ejemplos:

```powershell
git add .
git commit -m "Actualizar textos de pedidos personalizados"
git push
```

```powershell
git add .
git commit -m "Agregar arreglos nuevos"
git push
```

Vercel detectará el push y generará un deployment automáticamente.

## Diagnóstico rápido

### Un producto no aparece

Revisa:

1. Existe una fila en `productos`.
2. `disponible = true`.
3. `vendido = false`.
4. La URL de `imagen` funciona al abrirla directamente.
5. Espera un minuto por caché o usa `Ctrl + F5`.
6. Confirma que `/api/productos` responda correctamente.

### Un producto vendido no aparece en la galería

Revisa:

1. `vendido = true`.
2. La URL de imagen siga disponible.
3. `/api/galeria` responda correctamente.
4. Espera la actualización de caché.

### Error de variables de entorno

Si aparece:

```json
{ "error": "Variables de entorno no configuradas." }
```

Configura `SUPABASE_URL` y `SUPABASE_KEY` en Vercel y vuelve a desplegar.

### Una imagen no carga

Revisa:

- URL pública completa.
- Bucket correcto.
- Archivo existente.
- Permisos de lectura pública.
- Que no haya espacios extra al pegar la URL.

## Contenido comercial actual

El sitio comunica:

- Arreglos florales artificiales.
- Piezas artesanales, únicas e irrepetibles.
- Catálogo sujeto a disponibilidad.
- Pedidos personalizados por WhatsApp.
- Anticipo mínimo de 50% para pedidos personalizados.
- Plazo de 24 horas para recibir el pago del anticipo.
- Ubicación: Guadalupe, Nuevo León, México.
- Horario: lunes a sábado de 9:00 am a 8:00 pm.
- Teléfono: +52 81 3400 0720.

## Lista de verificación antes de publicar

- [ ] `index.html` carga correctamente.
- [ ] `admin.html` permite registrar o actualizar productos.
- [ ] Las imágenes están subidas a Supabase Storage.
- [ ] Las URLs públicas funcionan en navegador.
- [ ] La tabla `productos` contiene los campos necesarios.
- [ ] `SUPABASE_URL` está configurada en Vercel.
- [ ] `SUPABASE_KEY` está configurada en Vercel.
- [ ] `/api/productos` devuelve productos disponibles.
- [ ] `/api/galeria` devuelve productos vendidos.
- [ ] Los productos vendidos salen del catálogo y entran a galería.
- [ ] Los enlaces de WhatsApp contienen el número correcto.
- [ ] Los cambios fueron enviados a GitHub.

## Regla de mantenimiento

```text
Nuevo arreglo:
1. Subir foto a Supabase Storage.
2. Copiar URL pública.
3. Registrar producto en admin.html.
4. Marcar disponible.
5. Verificar en catálogo.

Arreglo vendido:
1. Abrir admin.html.
2. Buscar producto.
3. Marcar vendido.
4. Verificar galería.
```
