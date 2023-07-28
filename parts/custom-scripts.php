<?php
defined( 'ABSPATH' ) || exit;

// Theme path / url
$theme_path = trailingslashit( get_stylesheet_directory() );
$theme_url  = trailingslashit( get_stylesheet_directory_uri() );

$designer_path = $theme_path . 'builder-v2/designer/';
$designer_url  = $theme_url . 'builder-v2/designer/';

$user_data = wp_get_current_user();
$user_email = $user_data->data->user_email ?? '';
$user_data = array( 'email' => $user_email );

/**
 *  Custom scripts:
 *  - Import maps polyfill
 *  - Remove this when import maps will be widely supported
 */
?>
<script type="esms-options">{ "polyfillEnable": ["json-modules"] }</script>
<!-- <script type="importmap">
{
    "imports": {
        "three": "<?php echo $designer_url . 'js/lib/three-js/build/three.module.js'; ?>",
        "three-loaders/": "<?php echo $designer_url . 'js/lib/three-js/examples/jsm/loaders/'; ?>",
        "three-text-geometry": "<?php echo $designer_url . 'js/lib/three-js/examples/jsm/geometries/TextGeometry.js'; ?>",
        "polybool": "<?php echo $designer_url . 'js/lib/polybooljs/dist/polybool.min.js'; ?>"
    }
}
</script> -->

<?php // Load "build" version of the designer ?>
<script>window.designerPath = '<?php echo $designer_url; ?>';</script>
<script>window.user_data = '<?php echo wp_json_encode( $user_data ); ?>';</script>
<link rel="modulepreload" crossorigin href="<?php echo $designer_url; ?>dist/vendor.js">
<script type="module" crossorigin src="<?php echo $designer_url; ?>dist/index.js"></script>
<?php
