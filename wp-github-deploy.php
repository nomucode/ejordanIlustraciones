<?php

/**
 * Plugin Name: Deploy to GitHub Pages
 * Description: Añade un botón a la barra de administración para activar el despliegue del sitio en GitHub Actions.
 * Version: 1.0
 * Author: Tu Nombre
 */

// Evita el acceso directo al fichero
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Paso 1: Añadir el botón "Desplegar Sitio" a la barra de administración de WordPress.
 */
add_action('admin_bar_menu', 'add_deploy_button_to_admin_bar', 999);

function add_deploy_button_to_admin_bar($wp_admin_bar)
{
    // Solo muestra el botón a los administradores
    if (!current_user_can('manage_options')) {
        return;
    }

    // Crea el enlace que activará nuestra función de despliegue.
    // Usamos un 'nonce' por seguridad para verificar que la petición es legítima.
    $deploy_url = add_query_arg(
        [
            'action' => 'trigger_github_deploy',
            '_wpnonce' => wp_create_nonce('github_deploy_nonce'),
        ],
        admin_url('admin-post.php')
    );

    $args = [
        'id'    => 'github-deploy-button',
        'title' => '🚀 Desplegar Sitio',
        'href'  => $deploy_url,
        'meta'  => [
            'class' => 'github-deploy-button',
            'title' => 'Activar el despliegue del front-end en GitHub Actions',
        ],
    ];
    $wp_admin_bar->add_node($args);
}

/**
 * Paso 2: Escuchar la acción del botón y ejecutar la lógica de despliegue.
 * admin_post_{action} es el hook correcto para manejar este tipo de peticiones.
 */
add_action('admin_post_trigger_github_deploy', 'handle_github_deploy_request');

function handle_github_deploy_request()
{
    // 1. Verificación de seguridad: comprueba el nonce y los permisos del usuario.
    if (!isset($_GET['_wpnonce']) || !wp_verify_nonce($_GET['_wpnonce'], 'github_deploy_nonce') || !current_user_can('manage_options')) {
        wp_die('No tienes permiso para realizar esta acción.', 'Error de seguridad');
    }

    // 2. Definir los detalles de la API de GitHub.
    // ¡NUNCA pongas datos sensibles directamente en el código! Los leeremos de wp-config.php.
    $github_user = defined('GITHUB_USER') ? GITHUB_USER : '';
    $github_repo = defined('GITHUB_REPO') ? GITHUB_REPO : '';
    $github_token = defined('GITHUB_PAT') ? GITHUB_PAT : '';

    if (empty($github_user) || empty($github_repo) || empty($github_token)) {
        wp_die('La configuración de GitHub no está definida en wp-config.php.', 'Error de configuración');
    }

    $api_url = "https://api.github.com/repos/{$github_user}/{$github_repo}/dispatches";

    // 3. Preparar y enviar la petición a GitHub usando la función nativa de WordPress.
    $response = wp_remote_post($api_url, [
        'headers' => [
            'Accept'        => 'application/vnd.github.v3+json',
            'Authorization' => "token {$github_token}",
            'User-Agent'    => 'WordPress Deploy Trigger',
        ],
        'body'    => json_encode([
            'event_type' => 'deploy-from-wp', // Debe coincidir con el 'type' en el fichero .yml
        ]),
    ]);

    // 4. Redirigir al usuario de vuelta al panel con un mensaje de éxito o error.
    $redirect_url = admin_url('index.php'); // Redirige al escritorio

    if (is_wp_error($response)) {
        // Hubo un error en la conexión
        $error_message = $response->get_error_message();
        $redirect_url = add_query_arg('github_deploy_status', 'connection_error', $redirect_url);
    } elseif (wp_remote_retrieve_response_code($response) !== 204) {
        // GitHub devolvió un error (ej. 404 Not Found, 401 Unauthorized)
        $redirect_url = add_query_arg('github_deploy_status', 'api_error', $redirect_url);
    } else {
        // ¡Éxito! La petición fue aceptada por GitHub.
        $redirect_url = add_query_arg('github_deploy_status', 'success', $redirect_url);
    }

    wp_redirect($redirect_url);
    exit;
}

/**
 * Paso 3: Mostrar una notificación al usuario en el panel de administración.
 */
add_action('admin_notices', 'show_deploy_status_notice');

function show_deploy_status_notice()
{
    if (empty($_GET['github_deploy_status'])) {
        return;
    }

    $status = $_GET['github_deploy_status'];
    $message = '';
    $class = 'notice-info';

    switch ($status) {
        case 'success':
            $message = '¡Éxito! El despliegue ha sido activado en GitHub Actions. Puede tardar unos minutos en completarse.';
            $class = 'notice-success';
            break;
        case 'api_error':
            $message = 'Error: GitHub ha rechazado la petición. Verifica el token y los nombres de usuario/repositorio.';
            $class = 'notice-error';
            break;
        case 'connection_error':
            $message = 'Error de conexión: WordPress no pudo contactar con la API de GitHub.';
            $class = 'notice-error';
            break;
    }

    if ($message) {
        printf('<div class="notice %s is-dismissible"><p>%s</p></div>', esc_attr($class), esc_html($message));
    }
}
