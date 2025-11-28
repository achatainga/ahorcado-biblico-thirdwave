<?php
/**
 * Plugin Name: Ahorcado Bíblico Third Wave
 * Plugin URI: https://alcancevictoriavenezuela.com
 * Description: Juego interactivo de ahorcado con palabras bíblicas para dinámicas de jóvenes. Modo individual y equipos con sistema de puntuación.
 * Version: 1.0.0
 * Author: Alcance Victoria Venezuela
 * Author URI: https://alcancevictoriavenezuela.com
 * License: GPL v2 or later
 * Text Domain: ahorcado-biblico-thirdwave
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('ABTW_VERSION', '1.0.0');
define('ABTW_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ABTW_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ABTW_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Plugin Class
 */
class Ahorcado_Biblico_ThirdWave {
    
    private static $instance = null;
    
    /**
     * Singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_shortcode('ahorcado_biblico', [$this, 'render_game']);
    }
    
    /**
     * Get file version with cache busting
     */
    private function get_file_version($file_path) {
        $full_path = ABTW_PLUGIN_DIR . $file_path;
        return file_exists($full_path) ? filemtime($full_path) : ABTW_VERSION;
    }
    
    /**
     * Enqueue CSS and JS assets
     */
    public function enqueue_assets() {
        // Only load on pages with shortcode
        global $post;
        if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'ahorcado_biblico')) {
            return;
        }
        
        // CSS with cache busting
        wp_enqueue_style(
            'abtw-themes',
            ABTW_PLUGIN_URL . 'assets/css/themes.css',
            [],
            $this->get_file_version('assets/css/themes.css')
        );
        
        wp_enqueue_style(
            'abtw-theme-selector',
            ABTW_PLUGIN_URL . 'assets/css/theme-selector.css',
            [],
            $this->get_file_version('assets/css/theme-selector.css')
        );
        
        wp_enqueue_style(
            'abtw-wizard',
            ABTW_PLUGIN_URL . 'assets/css/wizard.css',
            [],
            $this->get_file_version('assets/css/wizard.css')
        );
        
        wp_enqueue_style(
            'abtw-game-redesign',
            ABTW_PLUGIN_URL . 'assets/css/game-redesign.css',
            [],
            $this->get_file_version('assets/css/game-redesign.css')
        );
        
        wp_enqueue_style(
            'abtw-toast',
            ABTW_PLUGIN_URL . 'assets/css/toast.css',
            [],
            $this->get_file_version('assets/css/toast.css')
        );
        
        // JavaScript with cache busting
        wp_enqueue_script(
            'abtw-theme-selector',
            ABTW_PLUGIN_URL . 'assets/js/theme-selector.js',
            [],
            $this->get_file_version('assets/js/theme-selector.js'),
            true
        );
        
        wp_enqueue_script(
            'abtw-simple-confirm',
            ABTW_PLUGIN_URL . 'assets/js/simple-confirm.js',
            [],
            $this->get_file_version('assets/js/simple-confirm.js'),
            true
        );
        
        wp_enqueue_script(
            'abtw-sounds',
            ABTW_PLUGIN_URL . 'assets/js/sounds.js',
            [],
            $this->get_file_version('assets/js/sounds.js'),
            true
        );
        
        wp_enqueue_script(
            'abtw-wizard',
            ABTW_PLUGIN_URL . 'assets/js/wizard.js',
            [],
            $this->get_file_version('assets/js/wizard.js'),
            true
        );
        
        wp_enqueue_script(
            'abtw-game',
            ABTW_PLUGIN_URL . 'assets/js/game.js',
            ['abtw-sounds', 'abtw-simple-confirm'],
            $this->get_file_version('assets/js/game.js'),
            true
        );
        
        // Localize script with plugin URL for loading palabras.json
        wp_localize_script('abtw-game', 'ABTW', [
            'pluginUrl' => ABTW_PLUGIN_URL,
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('abtw_nonce')
        ]);
    }
    
    /**
     * Render game shortcode
     */
    public function render_game($atts) {
        $atts = shortcode_atts([
            'tema' => 'neon',
            'sonido' => 'on',
            'dificultad' => 'normal',
            'modo' => 'wizard'
        ], $atts, 'ahorcado_biblico');
        
        ob_start();
        ?>
        <div id="abtw-game-container" 
             class="abtw-container" 
             data-tema="<?php echo esc_attr($atts['tema']); ?>"
             data-sonido="<?php echo esc_attr($atts['sonido']); ?>"
             data-dificultad="<?php echo esc_attr($atts['dificultad']); ?>"
             data-modo="<?php echo esc_attr($atts['modo']); ?>"
             data-theme="cyberpunk">
            
            <!-- Theme Selector Screen -->
            <div id="abtw-theme-selector" class="abtw-screen active">
                <div class="abtw-theme-content">
                    <h1 class="abtw-title">AHORCADO BÍBLICO</h1>
                    <h2 class="abtw-subtitle">THIRD WAVE</h2>
                    <h3 class="abtw-theme-title">🎨 SELECCIONA TU TEMA</h3>
                    
                    <div class="abtw-theme-grid">
                        <button class="abtw-theme-card" data-theme="cyberpunk">
                            <div class="abtw-theme-preview" style="background: linear-gradient(135deg, #00F5FF, #9D00FF, #FF1493);"></div>
                            <span>Cyberpunk</span>
                            <small>Arcade Neón</small>
                        </button>
                        
                        <button class="abtw-theme-card" data-theme="retro">
                            <div class="abtw-theme-preview" style="background: linear-gradient(135deg, #FF6EC7, #FFD93D, #9D4EDD);"></div>
                            <span>Retro Wave</span>
                            <small>Años 80</small>
                        </button>
                        
                        <button class="abtw-theme-card" data-theme="minimal">
                            <div class="abtw-theme-preview" style="background: linear-gradient(135deg, #2563eb, #7c3aed, #06b6d4);"></div>
                            <span>Minimal</span>
                            <small>Moderno</small>
                        </button>
                        
                        <button class="abtw-theme-card" data-theme="dark">
                            <div class="abtw-theme-preview" style="background: linear-gradient(135deg, #60a5fa, #a78bfa, #34d399);"></div>
                            <span>Dark Mode</span>
                            <small>Elegante</small>
                        </button>
                        
                        <button class="abtw-theme-card" data-theme="pastel">
                            <div class="abtw-theme-preview" style="background: linear-gradient(135deg, #a78bfa, #f9a8d4, #86efac); border: 2px solid #e9d5ff;"></div>
                            <span>Pastel</span>
                            <small>Suave</small>
                        </button>
                        
                        <button class="abtw-theme-card" data-theme="matrix">
                            <div class="abtw-theme-preview" style="background: linear-gradient(135deg, #00FF00, #39FF14, #00CC00);"></div>
                            <span>Matrix</span>
                            <small>Hacker</small>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Wizard Screen -->
            <div id="abtw-wizard" class="abtw-screen">
                <div class="abtw-wizard-content">
                    <h1 class="abtw-title">AHORCADO BÍBLICO</h1>
                    <h2 class="abtw-subtitle">THIRD WAVE</h2>
                    
                    <div class="abtw-wizard-section">
                        <h3>🎯 MODO DE JUEGO</h3>
                        <div class="abtw-radio-group">
                            <label class="abtw-radio">
                                <input type="radio" name="modo" value="individual">
                                <span>Individual (1 Jugador)</span>
                            </label>
                            <label class="abtw-radio">
                                <input type="radio" name="modo" value="equipos" checked>
                                <span>Equipos (Competencia)</span>
                            </label>
                            <label class="abtw-radio">
                                <input type="radio" name="modo" value="test">
                                <span>🔧 TEST (Elegir Palabra)</span>
                            </label>
                        </div>
                    </div>
                    
                    <div id="abtw-test-config" class="abtw-wizard-section" style="display: none;">
                        <h3>🔧 SELECCIONAR PALABRA</h3>
                        <select id="abtw-test-word" class="abtw-select">
                            <option value="">Cargando palabras...</option>
                        </select>
                    </div>
                    
                    <div id="abtw-teams-config" class="abtw-wizard-section">
                        <h3>👥 CONFIGURAR EQUIPOS</h3>
                        <div id="abtw-teams-list"></div>
                        <button type="button" id="abtw-add-team" class="abtw-btn-secondary">+ Agregar Equipo</button>
                    </div>
                    
                    <div class="abtw-wizard-section">
                        <h3>📊 DIFICULTAD</h3>
                        <select id="abtw-difficulty" class="abtw-select">
                            <option value="muy_facil">Muy Fácil (7 intentos)</option>
                            <option value="facil">Fácil (6 intentos)</option>
                            <option value="normal" selected>Normal (5 intentos)</option>
                            <option value="dificil">Difícil (4 intentos)</option>
                            <option value="extremo">Extremo (3 intentos)</option>
                        </select>
                    </div>
                    
                    <div class="abtw-wizard-section">
                        <h3>📚 TIPO DE PALABRAS</h3>
                        <select id="abtw-word-type" class="abtw-select">
                            <option value="mezclado" selected>Mezclado (Recomendado)</option>
                            <option value="personas">Solo Personas Bíblicas</option>
                            <option value="libros">Solo Libros de la Biblia</option>
                            <option value="conceptos">Solo Conceptos Bíblicos</option>
                        </select>
                    </div>
                    
                    <div class="abtw-wizard-section">
                        <h3>🎨 ESTILO AHORCADO</h3>
                        <select id="abtw-hangman-style" class="abtw-select">
                            <option value="emoji" selected>Emojis (Rápido)</option>
                            <option value="neon">Neón (Third Wave)</option>
                            <option value="minimal">Minimalista</option>
                            <option value="classic">Clásico</option>
                        </select>
                    </div>
                    
                    <div class="abtw-wizard-section">
                        <h3>🔊 SONIDO</h3>
                        <label class="abtw-toggle">
                            <input type="checkbox" id="abtw-sound-toggle" checked>
                            <span class="abtw-toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="abtw-wizard-section">
                        <h3>🎵 MÚSICA</h3>
                        <label class="abtw-toggle">
                            <input type="checkbox" id="abtw-music-toggle" checked>
                            <span class="abtw-toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="abtw-wizard-section">
                        <h3>🏆 RONDAS PARA GANAR</h3>
                        <input type="number" id="abtw-rounds" class="abtw-input" value="5" min="1" max="20">
                    </div>
                    
                    <button type="button" id="abtw-start-game" class="abtw-btn-primary">COMENZAR JUEGO</button>
                    <button type="button" id="abtw-back-to-themes" class="abtw-btn-secondary">← CAMBIAR TEMA</button>
                </div>
            </div>
            
            <!-- Game Screen -->
            <div id="abtw-game" class="abtw-screen">
                <div class="abtw-game-header">
                    <img src="<?php echo ABTW_PLUGIN_URL . 'assets/images/tw-logo.png'; ?>" class="abtw-logo" alt="Third Wave Logo">
                    <div class="abtw-turn-indicator">
                        <span id="abtw-current-team">TURNO: <strong></strong></span>
                    </div>
                    <div class="abtw-game-stats">
                        <span id="abtw-attempts">Intentos: <span class="abtw-hearts"></span></span>
                        <span id="abtw-round-counter">Ronda: <span></span></span>
                    </div>
                </div>
                
                <div class="abtw-game-content">
                    <div id="abtw-hangman" class="abtw-hangman"></div>
                    
                    <div id="abtw-word-display" class="abtw-word-display"></div>
                    
                    <div id="abtw-keyboard" class="abtw-keyboard"></div>
                    
                    <div class="abtw-scoreboard">
                        <h3>📊 MARCADOR</h3>
                        <div id="abtw-scores"></div>
                    </div>
                    
                    <div class="abtw-game-actions">
                        <button type="button" id="abtw-hint-btn" class="abtw-btn-secondary">💡 PISTA</button>
                        <button type="button" id="abtw-exit-btn" class="abtw-btn-secondary">🚪 SALIR</button>
                    </div>
                </div>
            </div>
            
            <!-- Result Screen -->
            <div id="abtw-result" class="abtw-screen">
                <div class="abtw-result-content">
                    <h1 id="abtw-result-title"></h1>
                    <p id="abtw-result-word"></p>
                    
                    <div class="abtw-scoreboard">
                        <h3>📊 MARCADOR</h3>
                        <div id="abtw-result-scores"></div>
                    </div>
                    
                    <p id="abtw-next-turn"></p>
                    
                    <div class="abtw-result-actions">
                        <button type="button" id="abtw-continue-btn" class="abtw-btn-primary">CONTINUAR JUEGO</button>
                        <button type="button" id="abtw-restart-btn" class="abtw-btn-secondary">VOLVER A CONFIGURAR</button>
                    </div>
                </div>
            </div>
            
            <!-- Winner Screen -->
            <div id="abtw-winner" class="abtw-screen">
                <div class="abtw-winner-content">
                    <h1>🏆 ¡JUEGO TERMINADO! 🏆</h1>
                    
                    <div class="abtw-winner-box">
                        <h2 id="abtw-winner-name"></h2>
                        <p id="abtw-winner-subtitle"></p>
                    </div>
                    
                    <div class="abtw-scoreboard">
                        <h3>📊 MARCADOR FINAL</h3>
                        <div id="abtw-final-scores"></div>
                    </div>
                    
                    <div class="abtw-winner-actions">
                        <button type="button" id="abtw-play-again-btn" class="abtw-btn-primary">JUGAR DE NUEVO</button>
                        <button type="button" id="abtw-config-btn" class="abtw-btn-secondary">CONFIGURAR</button>
                    </div>
                </div>
            </div>
            
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize plugin
function abtw_init() {
    return Ahorcado_Biblico_ThirdWave::get_instance();
}
add_action('plugins_loaded', 'abtw_init');
