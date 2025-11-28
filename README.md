# Ahorcado Bíblico Third Wave

WordPress plugin - Juego interactivo de ahorcado con palabras bíblicas para dinámicas de jóvenes.

## Características

- **Modo Individual**: Juego para un solo jugador
- **Modo Equipos**: Competencia entre múltiples equipos con sistema de puntuación
- **Modo Test**: Selección manual de palabras para pruebas
- **6 Temas Visuales**: Cyberpunk, Retro Wave, Minimal, Dark Mode, Pastel, Matrix
- **5 Niveles de Dificultad**: Muy Fácil (7 intentos) a Extremo (3 intentos)
- **Categorías de Palabras**: Personas bíblicas, Libros de la Biblia, Conceptos bíblicos
- **Efectos de Sonido**: Sistema de audio programático con Web Audio API
- **Responsive Design**: Optimizado para proyectores, desktop y móviles
- **Fullscreen Overlay**: Interfaz inmersiva que cubre toda la pantalla

## Instalación

1. Subir la carpeta `ahorcado-biblico-thirdwave` a `/wp-content/plugins/`
2. Activar el plugin desde el panel de WordPress
3. Usar el shortcode `[ahorcado_biblico]` en cualquier página o post

## Uso

```php
[ahorcado_biblico]
```

### Parámetros opcionales:

```php
[ahorcado_biblico tema="cyberpunk" sonido="on" dificultad="normal" modo="wizard"]
```

## Tecnologías

- **Frontend**: Vanilla JavaScript (ES6+)
- **Estilos**: CSS3 con Custom Properties, Flexbox, Grid
- **Audio**: Web Audio API
- **Backend**: PHP 7.4+ (WordPress Plugin API)

## Estructura

```
ahorcado-biblico-thirdwave/
├── assets/
│   ├── css/          # Estilos (themes, wizard, game, etc.)
│   ├── js/           # Lógica del juego
│   └── images/       # SVGs del ahorcado y logo
├── ahorcado-biblico-thirdwave.php  # Plugin principal
├── palabras.json     # Base de datos de palabras
└── README.md
```

## Créditos

**Desarrollado por**: Alcance Victoria Venezuela  
**Versión**: 1.0.0  
**Licencia**: GPL v2 or later

## Soporte

Para reportar bugs o solicitar features, contactar a través de https://alcancevictoriavenezuela.com
