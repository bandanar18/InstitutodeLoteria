# Instituto de Mérida — renovación del portal

Nuevo inicio adaptable a móvil, con la información del sitio de referencia y las secciones de la imagen suministrada: seis juegos, canales físicos y digitales, acción social, accesos rápidos, juego responsable, misión, visión y transparencia.

## Ejecutar

```sh
npm install
npm run dev
```

En PowerShell con restricciones de scripts, utilizar `npm.cmd` en lugar de `npm`.

```sh
npm run check
npm run build
```

La web pública se compila en `dist`. El Portal en Línea ahora requiere también el servidor Node y almacenamiento persistente; publicar solo `dist` en Netlify no habilita cuentas, expedientes ni archivos.

## Portal en Línea

`npm run dev` inicia Vite y la API en el puerto local 3001. Acceder a `/portal` para crear una cuenta de solicitante. Las contraseñas se derivan con scrypt, las sesiones utilizan cookies HttpOnly y los archivos se descargan únicamente con sesión y autorización de propietario o gestor.

El portal implementa cinco clases de expediente y 73 recaudos del PDF, borradores, datos del representante y accionistas, fechas de vencimiento, georreferencia de centros, carga de PDF/JPG/PNG de hasta 10 MB, tarifas y contribuciones separadas, declaración y revisión de pagos, envío, observaciones, correcciones, aprobación documental y seguimiento. Los gestores tienen una bandeja con filtros, exportación CSV y configuración de la tasa de referencia.

El PDF de requisitos y tarifas de la **Lotería de Mérida** está en `public/documentos/requisitos-y-tarifas-loteria-merida.pdf` y se genera desde el catálogo del portal con `node scripts/generate-reference-pdf.mjs` (vuelve a ejecutarlo si cambias `shared/registration.js`). Las rifas y permisos promocionales se muestran como pendientes porque sus recaudos remiten a un aviso CONALOT no suministrado. No se inventan instrucciones bancarias, tasas de cambio ni documentos oficiales. Aprobar un expediente no genera una licencia legal.

### Crear acceso de gestión

En una terminal de Windows, dentro del proyecto:

```sh
npm.cmd run portal:setup
```

El asistente pide correo y contraseña de forma oculta y crea una cuenta de gestor. No hay contraseña predeterminada ni elevación automática del primer solicitante. Para otros sistemas, `npm run portal:admin -- correo@instituto.gob.ve` acepta la contraseña por entrada estándar. Una cuenta existente no se puede convertir en administradora con este comando.

### Persistencia y ejecución

- `data/portal.sqlite`: usuarios, sesiones, expedientes, revisiones y configuración.
- `data/documents/`: archivos privados, fuera de `public` y `dist`.
- `PORTAL_DATA_DIR`: permite ubicar ambos en un volumen persistente. Excluidos del control de versiones.
- `npm run build` seguido de `npm start`: sirve la aplicación compilada y la API en `http://127.0.0.1:3001`. `PORT` y `HOST` permiten configurar la escucha. Para producción se requiere HTTPS y un servidor Node con almacenamiento persistente; los respaldos deben incluir la base y los documentos. No exponer `data` como directorio estático.
- `npm run test:portal`: verifica registros completos, documentos, pagos, permisos, estados, persistencia tras reinicio y navegación móvil en una base temporal aislada. No crea cuentas ni expedientes en la base real. Usa Edge instalado para la verificación visual.

Las notificaciones y observaciones se consultan en el portal. No se integraron correo automático, recuperación de contraseña por correo, pasarela bancaria ni emisión de licencias oficiales. La cuenta se crea sin verificación de correo; esa integración y la validación jurídica quedan pendientes para una operación institucional pública.

## Archivos

- `src/main.js`: inicio, cabecera, pie, catálogo, menú y ventanas de detalle.
- `src/style.css`: diseño adaptable, animaciones y preferencias de movimiento reducido.
- `public/assets/interior.css`: actualización visual de las páginas interiores.
- `public/assets/original.js` y `original.css`: aplicación pública original conservada para no perder la información ni las rutas interiores. No se dispone de su código fuente sin compilar; conviene reemplazar estos dos archivos por los componentes fuente cuando estén disponibles.
- Imágenes originales descargadas del sitio de referencia. Las ilustraciones del catálogo, canales y hero proceden de recortes de la referencia facilitada por el usuario.

## Alcance

Los formularios de beneficencia y contacto del sitio original siguen siendo demostrativos. El nuevo portal sí guarda las cuentas, expedientes y archivos en el servidor local y comunica esa finalidad en el registro. No procesa cobros bancarios. Las modalidades de juegos, autorizaciones, documentos y textos institucionales siguen sujetos a validación oficial. No se ha modificado ni desplegado el sitio Netlify original.

## Agencias online (Fortuna.Bet)

La página `/agencias-online` explica la afiliación y redirige a Fortuna.Bet, que administra el registro de usuarios y la activación de agencias. Las direcciones se configuran en `.env` (ver `.env.example`):

- `VITE_FORTUNABET_URL`: web de la Lotería Fortuna.Bet (el botón «Crear mi cuenta» abre `<url>/registro`).
- `VITE_FORTUNABET_WALLET_URL`: Wallet de Agencias Virtuales (botón «Activar mi agencia»).
