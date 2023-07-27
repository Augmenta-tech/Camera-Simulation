<?php
use com\sellsy\sellsy\libs;

defined( 'ABSPATH' ) || exit;

if ( !class_exists( 'Builder_Config_V2' ) ) {

    /**
     * Class Builder_Config_V2
     */
    class Builder_Config_V2 {

        const NONCE = 'augmenta-builder';

        /**
         * Builder_Config_V2 constructor.
         */
        public function __construct() {

            // WP hooks
            add_action( 'wp_enqueue_scripts', array( $this, 'load_builder_assets' ), 999 );
            // add_filter( 'query_vars', array( $this, 'add_builder_form_var' ), 0, 1 );
            // add_action( 'init', array( $this, 'generate_builder_form_route' ), 10 );
            // add_action( 'template_include', array( $this, 'builder_form_template' ), 10 );
            // add_action( 'wp_footer', array( $this, 'emit_event_after_builder_form_success' ), 20 );

            // Ajax hooks
            add_action( 'wp_ajax_aug_check_email_user_exists', array( $this, 'ajax_check_email_user_exists' ) );
            add_action( 'wp_ajax_nopriv_aug_check_email_user_exists', array( $this, 'ajax_check_email_user_exists' ) );
            add_action( 'wp_ajax_aug_is_user_logged_in', array( $this, 'ajax_check_user_logged_in' ) );
            add_action( 'wp_ajax_nopriv_aug_is_user_logged_in', array( $this, 'ajax_check_user_logged_in' ) );
            add_action( 'wp_ajax_aug_submit_builder', array( $this, 'ajax_submit_builder' ) );
            add_action( 'wp_ajax_nopriv_aug_submit_builder', array( $this, 'ajax_submit_builder' ) );

        }

        public function ajax_check_email_user_exists() {

            // Retrieve email data from ajax request
            $nonce = wp_unslash( sanitize_text_field( acf_maybe_get_POST( '_nonce' ) ) );
            if ( $nonce && !wp_verify_nonce( $nonce, 'augmenta' ) ) {
                wp_send_json_error( __( 'The entry time has expired, please try again' ) );
            }

            $email = wp_unslash( sanitize_email( acf_maybe_get_POST( 'email' ) ) );
            if ( !$email ) {
                wp_send_json_error( __( 'Email is not in valid format' ) );
            }

            // Check if user exists with this email
            $user_id = email_exists( $email );
            if ( !$user_id ) {
                wp_send_json_error( __( 'Invalid email' ) );
            }

            // Successfully found account linked to this email
            wp_send_json_success();

        }

        // Emit JS event from iframes form to parent window
        public function emit_event_after_builder_form_success() {

            $builder_form_var = get_query_var( 'builder_form' );
            $builder_form_var = str_replace( '-', '_', $builder_form_var );
            if ( !$builder_form_var ) {
                return;
            }

            // if ( isset( $_SESSION['sellsy'] ) ) {
            //     acf_log( 'DEBUG: $_SESSION[sellsy]', $_SESSION['sellsy'] );
            // }

            // Check Sellsy form response & ACFE form response to see if we can send success event
            // $form_success = isset( $_SESSION['sellsy'] ) || acfe_is_form_success( $builder_form_var );
            $form_success = acfe_is_form_success( $builder_form_var );
            if ( !$form_success ) {
                return;
            }
            ?>
            <script>
                // Tell parent of iframe that the form was successfully submitted
                const success_event = new CustomEvent('builder_form_success', {});
                window.parent.document.dispatchEvent(success_event);
            </script>
            <?php
        }

        // Load correct template for builder form iframes
        public function builder_form_template( $template ) {
            $builder_form_template = get_query_var( 'builder_form' );
            if ( !$builder_form_template ) {
                return $template;
            }

            return get_stylesheet_directory() . "/builder/parts/$builder_form_template.php";
        }

        // Generate builder form route to use in iframes
        public function generate_builder_form_route() {
            add_rewrite_rule( 'builder/([a-z0-9-]+)[/]?$', 'index.php?builder_form=$matches[1]', 'top' );
        }

        // Add builder_form query var
        public function add_builder_form_var( $vars ) {
            $vars[] = 'builder_form';
            return $vars;
        }

        // Load Builder assets
        public function load_builder_assets() {
            if ( is_page_template( 'page-builder-v2.php' ) ) {

                $theme_path = trailingslashit( get_stylesheet_directory() );
                $theme_url  = trailingslashit( get_stylesheet_directory_uri() );

                $designer_path = $theme_path . 'builder-v2/designer/';
                $designer_url  = $theme_url . 'builder-v2/designer/';

                // CSS
                wp_enqueue_style( 'aug-build-my-system', "{$theme_url}builder-v2/css/main.css", array(), filemtime( "{$theme_path}builder-v2/css/main.css" ) );
                wp_enqueue_style( 'aug-designer', "{$designer_url}dist/index.css", array(), filemtime( "{$designer_path}dist/index.css" ) );

                // JS
                wp_enqueue_script( 'iconify', 'https://code.iconify.design/2/2.1.0/iconify.min.js', array(), '2.1.0', true );
                wp_enqueue_script( 'es-module-shims', 'https://ga.jspm.io/npm:es-module-shims@1.5.9/dist/es-module-shims.js', array(), '1.5.9', true );
                wp_enqueue_script( 'filesaver', 'https://cdn.rawgit.com/eligrey/FileSaver.js/5ed507ef8aa53d8ecfea96d96bc7214cd2476fd2/FileSaver.min.js', array(), '1.0.0', true );
                wp_register_script( 'aug-form', "{$designer_url}js/form.js", array(), filemtime( "{$designer_path}js/form.js" ), true );
                wp_localize_script(
                    'aug-form',
                    'builder',
                    array(
                        'ajax'  => admin_url( 'admin-ajax.php' ),
                        'theme' => get_stylesheet_directory_uri(),
                        'nonce' => wp_create_nonce( self::NONCE ),
                    )
                );
                wp_enqueue_script( 'aug-form' );

                $unregister_list = array(
                    '/wp-includes/css/dist',
                    '/themes/salient/',
                    '/uploads/',
                    // '/wp-content/plugins/',
                );

                // Remove bloat CSS from WP env to keep it as minimal / clean as possible
                global $wp_styles;
                foreach ( $wp_styles->queue as $style ) {
                    $style_src    = $wp_styles->registered[ $style ]->src ?? '';
                    $style_handle = $wp_styles->registered[ $style ]->handle ?? '';
                    if ( !$style_src ) {
                        continue;
                    }

                    foreach ( $unregister_list as $unregister ) {
                        if ( strpos( $style_src, $unregister ) !== false ) {
                            wp_deregister_style( $style_handle );
                        }
                    }
                }

                // Remove bloat JS from WP env to keep it as minimal / clean as possible
                global $wp_scripts;
                foreach ( $wp_scripts->queue as $script ) {
                    $script_src    = $wp_scripts->registered[ $script ]->src ?? '';
                    $script_handle = $wp_scripts->registered[ $script ]->handle ?? '';
                    if ( !$script_src ) {
                        continue;
                    }

                    foreach ( $unregister_list as $unregister ) {
                        if ( strpos( $script_src, $unregister ) !== false ) {
                            wp_deregister_script( $script_handle );
                        }
                    }
                }
            }
        }

        // Ajax - Check if user is logged in
        public function ajax_check_user_logged_in() {

            // Make sure we are getting a valid AJAX request
            //! FIXME: Nonce are session based so you can't use it to check if you were a guest when page loaded then a logged-in user afterwards
            // $nonce_data = wp_unslash( sanitize_text_field( acf_maybe_get_POST( 'nonce' ) ) );
            // check_ajax_referer( $nonce_data, self::NONCE );

            return is_user_logged_in() ? wp_send_json_success() : wp_send_json_error();
        }

        // Ajax - submit form data
        public function ajax_submit_builder() {

            // Make sure we are getting a valid AJAX request
            $nonce_data = wp_unslash( sanitize_text_field( acf_maybe_get_POST( 'nonce' ) ) );
            if ( !$nonce_data || !wp_verify_nonce( $nonce_data, self::NONCE ) ) {
                wp_send_json_error();
            }

            // User data
            $lang  = wp_unslash( sanitize_text_field( acf_maybe_get_POST( 'lang' ) ) );
            $email = wp_unslash( sanitize_email( acf_maybe_get_POST( 'email' ) ) );
            $pass  = wp_unslash( normalize_whitespace( acf_maybe_get_POST( 'pass' ) ) );

            // Check if user is really logged-in
            $current_user      = wp_get_current_user();
            $current_user_data = is_a( $current_user, 'WP_User' ) ? (array) $current_user->data : false;

            // Check if user is partially logged-in (login post-registration)
            if ( !$current_user_data && $email && $pass ) {
                $log_user          = wp_signon(
                    array(
                        'user_login'    => $email,
                        'user_password' => $pass,
                    )
                );
                $current_user_data = is_a( $log_user, 'WP_User' ) ? (array) $log_user->data : false;
            }

            if ( !$current_user_data ) {
                wp_send_json_error();
            }

            // Check if there is data
            $json_scene_infos = wp_unslash( sanitize_text_field( acf_maybe_get_POST( 'scene_infos' ) ) );
            if ( !$json_scene_infos ) {
                wp_send_json_error( $json_scene_infos );
            }

            // Check if invalid json
            $scene_infos = json_decode( $json_scene_infos, true );
            if ( !$scene_infos ) {
                wp_send_json_error( $json_scene_infos );
            }

            $builder_data                 = array();
            $builder_data['scene_infos']  = $scene_infos;
            $builder_data['current_user'] = $current_user_data;

            // Send mail to owner, confirmation mail to user & send Sellsy API data
            $this->send_builder_data_to_admin_mail( $builder_data );
            // $this->send_builder_data_to_customer_mail( $json_scene_infos );
            // $this->send_builder_data_to_sellsy( $builder_data, $lang );

            // Success
            wp_send_json_success( $scene_infos );

        }

        private function send_builder_data_to_sellsy( $builder_data, $lang ) {
            $sellsy_v2_api = new Sellsy_API_V2();
            $sellsy_v2_api->generate_devis_with_builder_data( $builder_data, $lang );
        }

        private function send_builder_data_to_admin_mail( $builder_data ) {

            // $builder_data Array
                //     (
                //         [scene_infos] => Array
                //             (
                //                 [sceneEnvironment] => indoor
                //                 [sceneSize] => Array
                //                     (
                //                         [0] => 10
                //                         [1] => 5
                //                     )

                //                 [unit] => Array
                //                     (
                //                         [value] => 1
                //                         [label] => m
                //                         [squaredLabel] => m²
                //                     )

                //                 [trackingMode] => human-tracking
                //                 [heightDetected] => 1.2
                //                 [objects] => Array
                //                     (
                //                         [nodes] => Array
                //                             (
                //                                 [0] => Array
                //                                     (
                //                                         [id] => 0
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 1.2371057254829
                //                                         [p_y] => 0.85855595885669
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [1] => Array
                //                                     (
                //                                         [id] => 1
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 1.2371057254829
                //                                         [p_y] => 2.5
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [2] => Array
                //                                     (
                //                                         [id] => 2
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 1.2371057254829
                //                                         [p_y] => 4.1414440411433
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [3] => Array
                //                                     (
                //                                         [id] => 3
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 3.1185528627415
                //                                         [p_y] => 0.85855595885669
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [4] => Array
                //                                     (
                //                                         [id] => 4
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 3.1185528627415
                //                                         [p_y] => 2.5
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [5] => Array
                //                                     (
                //                                         [id] => 5
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 3.1185528627415
                //                                         [p_y] => 4.1414440411433
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [6] => Array
                //                                     (
                //                                         [id] => 6
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 5
                //                                         [p_y] => 0.85855595885669
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [7] => Array
                //                                     (
                //                                         [id] => 7
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 5
                //                                         [p_y] => 2.5
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [8] => Array
                //                                     (
                //                                         [id] => 8
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 5
                //                                         [p_y] => 4.1414440411433
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [9] => Array
                //                                     (
                //                                         [id] => 9
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 6.8814471372585
                //                                         [p_y] => 0.85855595885669
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [10] => Array
                //                                     (
                //                                         [id] => 10
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 6.8814471372585
                //                                         [p_y] => 2.5
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [11] => Array
                //                                     (
                //                                         [id] => 11
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 6.8814471372585
                //                                         [p_y] => 4.1414440411433
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [12] => Array
                //                                     (
                //                                         [id] => 12
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 8.7628942745171
                //                                         [p_y] => 0.85855595885669
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [13] => Array
                //                                     (
                //                                         [id] => 13
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 8.7628942745171
                //                                         [p_y] => 2.5
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                                 [14] => Array
                //                                     (
                //                                         [id] => 14
                //                                         [cameraTypeId] => 6
                //                                         [p_x] => 8.7628942745171
                //                                         [p_y] => 4.1414440411433
                //                                         [p_z] => 3
                //                                         [r_x] => 0
                //                                         [r_y] => 0
                //                                         [r_z] => 0
                //                                     )

                //                             )

                //                         [lidars] => Array
                //                             (
                //                             )

                //                         [dummies] => Array
                //                             (
                //                             )

                //                     )

                //                 [sceneUrl] => https://www.beta.designer.augmenta.tech?L=10,l=5,m=human-tracking,h=1.2&amp;sensor=node,id=0,typeID=6,px=1.24,py=0.86,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=1,typeID=6,px=1.24,py=2.5,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=2,typeID=6,px=1.24,py=4.14,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=3,typeID=6,px=3.12,py=0.86,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=4,typeID=6,px=3.12,py=2.5,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=5,typeID=6,px=3.12,py=4.14,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=6,typeID=6,px=5,py=0.86,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=7,typeID=6,px=5,py=2.5,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=8,typeID=6,px=5,py=4.14,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=9,typeID=6,px=6.88,py=0.86,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=10,typeID=6,px=6.88,py=2.5,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=11,typeID=6,px=6.88,py=4.14,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=12,typeID=6,px=8.76,py=0.86,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=13,typeID=6,px=8.76,py=2.5,pz=3,rx=0,ry=0,rz=0&amp;sensor=node,id=14,typeID=6,px=8.76,py=4.14,pz=3,rx=0,ry=0,rz=0
                //                 [sceneName] => My super scene name
                //                 [sceneDesc] => Custom message description
                //             )

                //     )

            $scene_infos = acf_maybe_get( $builder_data, 'scene_infos' );
            $scene_url   = acf_maybe_get( $scene_infos, 'sceneUrl' );
            $scene_name  = acf_maybe_get( $scene_infos, 'sceneName' );
            $scene_desc  = acf_maybe_get( $scene_infos, 'sceneDesc' );
            // $json_scene_infos = wp_json_encode( $scene_infos );

            // User data
            $current_user_data = acf_maybe_get( $builder_data, 'current_user' );
            $user_id           = acf_maybe_get( $current_user_data, 'ID' );
            $user_email        = acf_maybe_get( $current_user_data, 'user_email' );
            $user_display_name = acf_maybe_get( $current_user_data, 'display_name' );
            $user_data_full    = get_userdata( $user_id );
            $first_name        = $user_data_full->first_name ?? '';
            $last_name         = $user_data_full->last_name ?? '';
            $company_name      = get_field( 'company_name', "user_$user_id" );
            $company_type      = get_field( 'company_type', "user_$user_id" );
            $function          = get_field( 'function', "user_$user_id" );
            $address           = get_field( 'address', "user_$user_id" );
            $country           = get_field( 'country', "user_$user_id" );
            $town              = get_field( 'town', "user_$user_id" );
            $zip               = get_field( 'zip', "user_$user_id" );

            $headers = array( 'Content-Type: text/html; charset=UTF-8', "Reply-To: $user_display_name <$user_email>" );
            $to      = get_field( 'builder_mail_admin', 'options' );

            $subject = get_field( 'builder_subject_mail_to_admin', 'options' );
            $subject = str_replace( '%country%', $country, $subject );
            $subject = str_replace( '%company%', $company_name, $subject );
            $subject = str_replace( '%first_name%', $first_name, $subject );
            $subject = str_replace( '%last_name%', $last_name, $subject );

            ob_start(); ?><a href="<?php echo $scene_url; ?>"><?php echo $scene_url; ?></a>
            <?php
            $builder_link = ob_get_clean();

            $body = get_field( 'builder_mail_to_admin', 'options' );
            $body = str_replace( '%%USER%%', $user_display_name, $body );
            $body = str_replace( '%%USER_MAIL%%', $user_email, $body );
            $body = str_replace( '%%BUILDER_LINK%%', $builder_link, $body );
            $body = str_replace( '%%SCENE_NAME%%', $scene_name, $body );
            $body = str_replace( '%%SCENE_DESC%%', $scene_desc, $body );

            $body = str_replace( '%first_name%', $first_name, $body );
            $body = str_replace( '%last_name%', $last_name, $body );
            $body = str_replace( '%function%', $function, $body );
            $body = str_replace( '%company%', $company_name, $body );
            $body = str_replace( '%address%', $address, $body );
            $body = str_replace( '%country%', $country, $body );

            wp_mail( $to, $subject, $body, $headers );

        }

        private function send_builder_data_to_customer_mail( $builder_data ) {

            $scene_infos = acf_maybe_get( $builder_data, 'scene_infos' );
            $scene_url   = acf_maybe_get( $scene_infos, 'sceneUrl' );
            $scene_name  = acf_maybe_get( $scene_infos, 'sceneName' );
            $scene_desc  = acf_maybe_get( $scene_infos, 'sceneDesc' );
            // $json_scene_infos = wp_json_encode( $scene_infos );

            $current_user_data  = acf_maybe_get( $builder_data, 'current_user' );
            $user_email         = acf_maybe_get( $current_user_data, 'user_email' );
            $user_display_name  = acf_maybe_get( $current_user_data, 'display_name' );
            $builder_mail_admin = get_field( 'builder_mail_admin', 'options' );

            $headers = array( 'Content-Type: text/html; charset=UTF-8', "Reply-To: Augmenta Tech <$builder_mail_admin>" );
            $to      = $user_email;
            $subject = get_field( 'builder_subject_mail_to_guest', 'options' );
            ob_start(); ?><a href="<?php echo $scene_url; ?>"><?php echo $scene_url; ?></a>
            <?php
            $builder_link = ob_get_clean();

            $body = get_field( 'builder_mail_to_user', 'options' );
            $body = str_replace( '%%USER%%', $user_display_name, $body );
            $body = str_replace( '%%BUILDER_LINK%%', $builder_link, $body );
            $body = str_replace( '%%SCENE_NAME%%', $scene_name, $body );
            $body = str_replace( '%%SCENE_DESC%%', $scene_desc, $body );

            wp_mail( $to, $subject, $body, $headers );

        }

        // Generate Builder config ACF option page
        public function generate_acf_options_page() {

            if ( function_exists( 'acf_add_options_page' ) ) {

                acf_add_options_page(
                    array(
                        'page_title'  => __( 'Configuration du builder' ),
                        'menu_title'  => __( 'Builder config' ),
                        'parent_slug' => 'theme-general-settings',
                        // 'capability' => 'edit_posts',
                        // 'redirect'   => false,
                    )
                );

                // acf_add_options_sub_page(array(
                //  'page_title'    => 'Theme Header Settings',
                //  'menu_title'    => 'Header',
                //  'parent_slug'   => 'theme-general-settings',
                // ));

                // acf_add_options_sub_page(array(
                //  'page_title'    => 'Theme Footer Settings',
                //  'menu_title'    => 'Footer',
                //  'parent_slug'   => 'theme-general-settings',
                // ));
            }

        }

    }

    /**
     * Instantiate class
     * Use acf_get_instance( 'Builder_Config_V2' ) to get class and use functions inside it
     */
    if ( function_exists( 'acf_new_instance' ) ) {
        acf_new_instance( 'Builder_Config_V2' );
    }
}
