# Tema y tokens MUI

## 2. Identidad visual — tokens de referencia

| Token | HEX / valor | Uso |
|---|---|---|
| `primary.main` | `#1677FF` | Botones, enlaces, indicadores activos |
| `primary.dark` | `#0753C5` | Sidebar / hover |
| `brand.deep` | `#063B9E` | Zona inferior del sidebar |
| `brand.navy` | `#091A49` | Títulos y métricas |
| `primary.light` | `#8FC5FF` | Acentos suaves |
| `background.default` | `#EAF3FF` | Lienzo |
| `background.paper` | `#FFFFFF` | Cards, menús y tabla |
| `surface.muted` | `#F4F8FF` | Filtros, cabecera de tablas |
| `divider` | `#DCE8FA` | Separadores |
| `text.secondary` | `#395786` | Descripciones |
| `text.muted` | `#7187AE` | Ayudas y metadatos |
| `success.main` | `#17B978` | Éxito |
| `warning.main` | `#F5A623` | Advertencias |
| `error.main` | `#F45B87` | Errores |
| `secondary.main` | `#7A5AF8` | Series / categorías secundarias |

**Gradientes clave:**

```css
/* Sidebar: sobre el Paper del Drawer */
linear-gradient(158deg, #1677FF 0%, #0753C5 45%, #063B9E 100%)

/* Fondo principal */
linear-gradient(135deg, #E5F1FF 0%, #F4F8FF 70%, #E9F2FF 100%)

/* Botón primario */
linear-gradient(180deg, #2588FF 0%, #0758EE 100%)
```

**Escala visual:** tipografía `Inter, system-ui, sans-serif`; `spacing` de **4 px**; radios `8 / 12 / 16 / 20 px`; tarjetas con sombra `0 8px 30px rgba(25,78,157,.07)`; hover `0 12px 32px rgba(25,78,157,.12)`. Evita efectos glassmorphism intensos, contornos gruesos y sombras oscuras.

## 3. Theme MUI — implementación de referencia

> Ajusta al tema presente antes de copiar. Los valores deben declararse una sola vez. En proyectos con `tokens.json`, deriva esta configuración de los tokens disponibles.

```tsx
// theme.ts (ejemplo MUI v5/v6/v7; adaptar imports al proyecto)
import { alpha, createTheme } from '@mui/material/styles';

const colors = {
  primary: '#1677FF', primaryDark: '#0753C5', primaryLight: '#8FC5FF',
  navy: '#091A49', textSecondary: '#395786',
  canvas: '#EAF3FF', paper: '#FFFFFF', muted: '#F4F8FF', border: '#DCE8FA',
  success: '#17B978', warning: '#F5A623', error: '#F45B87', purple: '#7A5AF8',
};

export const visualTokens = {
  sidebarWidth: 264,
  topbarHeight: 78,
  sidebarGradient: 'linear-gradient(158deg, #1677FF 0%, #0753C5 45%, #063B9E 100%)',
  pageGradient: 'linear-gradient(135deg, #E5F1FF 0%, #F4F8FF 70%, #E9F2FF 100%)',
  primaryGradient: 'linear-gradient(180deg, #2588FF 0%, #0758EE 100%)',
  cardShadow: '0 8px 30px rgba(25, 78, 157, 0.07)',
} as const;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: colors.primary, dark: colors.primaryDark, light: colors.primaryLight, contrastText: '#FFF' },
    secondary: { main: colors.purple },
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.error },
    background: { default: colors.canvas, paper: colors.paper },
    text: { primary: colors.navy, secondary: colors.textSecondary },
    divider: colors.border,
  },
  spacing: 4, // importante: theme.spacing(4) = 16px (no 32px)
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h4: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    h6: { fontSize: '1.125rem', fontWeight: 700 },
    body1: { fontSize: '0.9375rem' },
    body2: { fontSize: '0.875rem' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { background: visualTokens.pageGradient } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      styleOverrides: {
        root: { backgroundColor: colors.paper, borderRadius: 16,
          border: `1px solid ${colors.border}`, boxShadow: visualTokens.cardShadow },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, paddingInline: 16, borderRadius: 12 },
        containedPrimary: {
          background: visualTokens.primaryGradient,
          '&:hover': { background: 'linear-gradient(180deg, #1677FF 0%, #0648CE 100%)' },
        },
      },
    },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12, backgroundColor: colors.paper,
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 12, minHeight: 46,
          '&.Mui-selected': { backgroundColor: alpha('#FFFFFF', 0.18) },
          '&.Mui-selected:hover': { backgroundColor: alpha('#FFFFFF', 0.24) },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid #E7EFFB', paddingBlock: 12 },
        head: { color: colors.textSecondary, fontWeight: 600, backgroundColor: colors.muted },
      },
    },
  },
});
```

Montar **una sola vez** `ThemeProvider` y `CssBaseline` en el root/layout correspondiente. El degradado del `Drawer` debe aplicarse al slot `Paper` (ej.: `sx={{ '& .MuiDrawer-paper': { background: visualTokens.sidebarGradient, color: '#fff' } }}`), no al contenedor externo. Configurar `ListItemButton` seleccionado con suficiente contraste y `aria-current="page"`.
