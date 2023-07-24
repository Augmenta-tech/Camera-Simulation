<?php
defined( 'ABSPATH' ) || exit;

// Theme path / url
$theme_path = trailingslashit( get_stylesheet_directory() );
$theme_url  = trailingslashit( get_stylesheet_directory_uri() );

/**
 *  Custom scripts:
 *  - Import maps polyfill
 *  - Remove this when import maps will be widely supported
 */

 // This code is mostly the equivalent of <body> inside "designer/index.html" file
?>
<script type="esms-options">{ "polyfillEnable": ["json-modules"] }</script>
<script type="importmap">
{
    "imports": {
        "three": "<?php echo $theme_url . 'builder-v2/designer/js/lib/three-js/build/three.module.js'; ?>",
        "three-loaders/": "<?php echo $theme_url . 'builder-v2/designer/js/lib/three-js/examples/jsm/loaders/'; ?>",
        "three-text-geometry": "<?php echo $theme_url . 'builder-v2/designer/js/lib/three-js/examples/jsm/geometries/TextGeometry.js'; ?>",
        "polybool": "<?php echo $theme_url . 'builder-v2/designer/js/lib/polybooljs/dist/polybool.min.js'; ?>"
    }
}
</script>
<script async type="module" src="<?php echo $theme_url; ?>builder-v2/designer/js/main.js"></script>
<?php
