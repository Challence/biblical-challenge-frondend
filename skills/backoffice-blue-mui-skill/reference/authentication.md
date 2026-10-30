# Módulo de autenticación — composición visual y flujos

## Cuándo consultar

Leer esta referencia únicamente al crear o modificar las pantallas **Login, Register, Forgot Password y Reset Password**, sus estados o navegación. Consultar `form-fields.md` si se intervienen controles y `alertas-modales.md` si se intervienen errores/avisos accionables. El módulo no utiliza el shell administrativo (`Sidebar` + `Topbar`), salvo que el producto lo requiera expresamente.

## 1. Identidad visual y estructura común (obligatorio)

Las cuatro pantallas comparten el **mismo AuthShell** en términos visuales, no necesariamente una nueva abstracción de código. Preservar las rutas, componentes y arquitectura existentes.

```text
Viewport / AuthShell — min-height: 100dvh
├── Fondo azul con gradiente diagonal y ondas decorativas discretas
├── Contenido centrado horizontal y verticalmente (scroll si es necesario)
│   └── Card de autenticación blanca
│       ├── Logo de la aplicación (centrado)
│       ├── Título claro y único (h1)
│       ├── Subtítulo breve con contexto
│       ├── Contenido del flujo actual (campos, ayudas, avisos)
│       ├── Acción principal full width
│       └── Enlaces secundarios y retorno
└── Elementos institucionales opcionales, sin competir con el formulario
```

**Tokens visuales aproximados**, sometidos a los tokens reales del proyecto:

- Background: `linear-gradient(35deg, #0139A4 0%, #3985EF 43%, #93CAFD 75%, #D2E9FD 100%)`. Ondas SVG o pseudo-elementos puramente decorativos y sin interceptar clicks. Si existen `tokens.json` o tema MUI, colocar ahí los valores y evitar duplicados.
- Card: blanca `background.paper`; ancho preferido 420–460 px para login/forgot/reset, 460–520 px para register cuando haya más campos; `width: min(100% - 32px, maxWidth)`; padding 32–48 px desktop, 24 px móvil; `borderRadius` ~20–24 px; sombra azul discreta.
- Logo: centrado, dimensiones visuales aproximadas 64–80 px de altura, con recurso real. No inventar una marca. Separación logo/título 20–24 px.
- Título: azul navy `#08132E`, peso 700, 28–34 px desktop, 25–30 px móvil; texto secundario `#7085AD`, 14–16 px, centrado y no más de 2–3 líneas.
- Campos: labels visibles arriba, `size="small"`, `variant="outlined"`, 40–44 px de altura visual, full width, 12–16 px entre controles. Tomar medidas y estados de `form-fields.md`.
- Acción primaria: ancho completo, azul principal (opcional gradiente `#2588FF` → `#0758EE`), 44–48 px de alto, radio 10–12 px, texto blanco. Nunca usar colores inline aislados si hay tokens.
- Acción secundaria: `Link` o botón de texto azul; no competir con CTA. Espaciado vertical entre secciones 20–24 px.
- Anchura mínima útil y scroll: el card no puede recortar campos, botones, validación o teclado móvil. **No imponer altura fija al card**. Centrado vertical solo cuando haya espacio.

### Jerarquía visual

1. Logo y nombre/identidad del producto.
2. Título del flujo actual, no genérico repetido.
3. Subtítulo orientado a la tarea.
4. Campos principales y validaciones inline.
5. Acción primaria y estados del proceso.
6. Enlaces de navegación entre flujos (debajo del botón, salvo recuperación de contraseña contextual).

## 2. Login / Iniciar sesión

```text
[LOGO]
Iniciar sesión
Accede a tu cuenta
Correo electrónico *
[ usuario@empresa.com       ]
Contraseña *
[ •••••••••••         (ojo) ]
                           ¿Olvidaste tu contraseña?
[          Iniciar sesión          ]
¿No tienes una cuenta? Registrarse  [solo si registro público habilitado]
```

- Orden obligatorio: email → password → forgot password (alineado a la derecha, junto o debajo del campo) → botón de envío → registro opcional.
- Controles: `TextField` email (`type=email`, `autoComplete=username`), contraseña con toggle accesible (`autoComplete=current-password`), `Button type=submit`. Mostrar/ocultar contraseña sin perder valor/foco.
- Errores de formato/obligatoriedad inline. Credenciales inválidas: mensaje general claro y seguro, no revelar si existe la cuenta; preferir un aviso persistente visible y dialog accionable solo si requiere decisión/reintento significativo. No disparar modal por cada tecla.
- `loading`: deshabilitar doble envío, indicar progreso, conservar email y permitir reintento. Añadir SSO, recordarme, MFA o captcha **solo si el producto los exige**; no inventarlos.

## 3. Register / Crear cuenta

```text
[LOGO]
Crear cuenta
Completa tus datos para comenzar
[Nombre completo *]
[Correo electrónico *]
[Contraseña *           (ojo)]
[Confirmar contraseña * (ojo)]
[Checkbox de términos, solo si requerido]
[             Crear cuenta            ]
¿Ya tienes una cuenta? Iniciar sesión
```

- Campos básicos recomendados: nombre, email, contraseña, confirmar contraseña. Ajustar al proceso real: username, empresa, teléfono, invitación o role únicamente si el backend/negocio lo contempla.
- Una columna por defecto en el card estrecho; en registros largos permitir agrupaciones/secciones progresivas, no imponer una grilla de dos columnas dentro de 460 px.
- Reglas de contraseña y coincidencia accesibles junto al campo; no inventar requisitos como longitud, especiales o confirmaciones no respaldadas por negocio.
- Contraseñas con toggles independientes; `autoComplete=new-password`.
- Checkbox de aceptación de condiciones solo cuando exista texto legal real y sea exigible; jamás marcarlo automáticamente.
- Respuesta de registro: confirmar estado real (por ejemplo, verificar correo) sin declarar que se envió email hasta recibir resultado exitoso. Si el registro está cerrado o es solo invitación, ocultar la ruta/enlace o mostrar estado apropiado; no abrir un alta ficticia.

## 4. Forgot Password / Recuperar contraseña

```text
[LOGO]
¿Olvidaste tu contraseña?
Indica tu correo y te explicaremos cómo recuperar el acceso.
Correo electrónico *
[ usuario@empresa.com       ]
[        Enviar instrucciones        ]
← Volver a iniciar sesión
```

- Un solo dato obligatorio habitual: correo electrónico, salvo requisitos existentes adicionales.
- Tras respuesta exitosa mostrar **estado de confirmación dentro de la misma card** (icono informativo, título, explicación y botón para volver a login); no mantener un formulario innecesario visible.
- Por privacidad, mensaje neutro sobre cuentas existentes: «Si el correo corresponde a una cuenta, recibirás instrucciones», ajustado al comportamiento real del servidor. No filtrar existencia de usuarios.
- Errores de formato inline; fallos de red / servicio con posibilidad de reintentar. No prometer entrega ni fechas de expiración inventadas.

## 5. Reset Password / Establecer nueva contraseña

```text
[LOGO]
Restablecer contraseña
Define una nueva contraseña segura.
Nueva contraseña *
[ •••••••••••         (ojo) ]
Confirmar contraseña *
[ •••••••••••         (ojo) ]
[       Guardar contraseña       ]
← Volver a iniciar sesión
```

- Validar token/código de restablecimiento mediante el flujo/backend existente, **sin mostrar secretos ni tokens en pantalla o logs**. No crear un token simulado.
- Contraseña nueva + confirmación, con políticas reales del producto y errores inline. `autoComplete=new-password` en ambos campos.
- Estados obligatorios: enlace válido/cargando → formulario; enlace inválido o expirado → card con explicación y CTA «Solicitar otro enlace»; éxito real → card con confirmación y CTA «Iniciar sesión».
- No iniciar sesión automáticamente ni redirigir sin cumplir el contrato real del backend. Limpiar sensibles al terminar y no exponer datos en URL/logs.

## 6. Comportamientos y estados transversales

| Estado                                 | Tratamiento                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Default                                | Card y campos con jerarquía común                                                                                |
| Focus                                  | Borde/foco azul visible y tabulación correcta                                                                    |
| Validación de campo                    | Error de borde + helper text inline con `aria-describedby`                                                       |
| Loading                                | CTA con progreso accesible; evitar múltiples envíos                                                              |
| Error global accionable                | `Dialog` interactivo cuando exija decisión, alternativa o recuperación; ver `alertas-modales.md`                 |
| Fallo simple de credenciales / formato | Mensaje persistente contextual, sin modal intrusivo                                                              |
| Success                                | Estado de confirmación en card o Snackbar según redirección; nunca afirmar éxito antes de respuesta del servidor |
| Token inválido/expirado                | Card de estado con salida clara a recuperación                                                                   |
| Disabled                               | Contraste suficiente y razón explícita cuando resulte útil                                                       |

## 7. MUI y composición responsive

- Preferir `Box`, `Stack`, `Paper`/`Card`, `Typography`, `TextField`, `FormControl`, `InputAdornment`, `IconButton`, `Button`, `Link`, `FormHelperText`, `CircularProgress` y `Alert`/`Dialog` según la acción. Priorizar existentes.
- Colocar estilos recurrentes del módulo en el tema/tokens existentes; componente/slot para gradiente y waves si ya existe. No introducir librerías de formularios, validación, routing o auth por la guía solamente.
- Desktop: centrado en viewport, card y espacios amplios. Tablet: conservar card centrada y ajustar padding. Mobile: `width: calc(100% - 24px)` en pantallas estrechas, padding 20–24 px y acceso sin scroll horizontal; viewport 100dvh, safe areas. El formulario es desplazable si el teclado ocupa parte de la pantalla.
- Entrada por teclado: `Enter` envía cuando corresponde; navegación Tab predecible; mostrar foco; usar atributos `autoComplete`; contraste suficiente y mensajes anunciados; links reales. Mantener idioma de la interfaz.

## 8. Límites de composición y variación

- La card centrada, la identidad azul, la jerarquía de campos y las acciones son el patrón de familia visual. **Los diagramas son bloques de referencia, no una estructura rígida que deba copiarse pixel por pixel.**
- Campos extra, avisos legales, registro multietapa, verificación por correo, MFA, invitación o SSO solo cuando existen requerimientos y backend compatibles.
- Los cuatro flujos deben percibirse como parte del mismo producto: mismo logo, fondo, espaciado, tamaño de controles, botón principal y tratamiento de enlaces. Variar card height según contenido, nunca rellenar espacio artificial.
- Un flujo debe tener un solo CTA principal destacado. Evitar sidebar o topbar del backoffice en auth, salvo exigencia explícita.

## 9. Checklist para agentes IA

- [ ] Se conservaron las rutas, el backend de autenticación y la gestión real de sesiones/tokens.
- [ ] Login, Register, Forgot Password y Reset Password usan la misma identidad visual.
- [ ] Hay un solo título y un solo CTA primario por flujo; navegación entre pantallas clara.
- [ ] Login permite acceso y recuperación; Register solo aparece si está habilitado.
- [ ] Forgot Password confirma sin revelar si la cuenta existe.
- [ ] Reset Password contempla enlace válido, expirado/inválido y éxito.
- [ ] Inputs y toggles son accesibles, con errores inline.
- [ ] Fallos accionables siguen la política de dialogs; éxito no simulado.
- [ ] No hay datos ficticios, tokens falsos, credenciales hardcodeadas ni dependencias innecesarias.
- [ ] Vista móvil sin overflow, card con altura flexible y testable con teclado.

> Prioridad: seguridad/requerimiento de negocio → implementación existente y tokens → patrón de esta referencia → defaults de MUI.
