<?php
defined( 'ABSPATH' ) || exit;

$theme_url  = trailingslashit( get_stylesheet_directory_uri() );
$theme_path = trailingslashit( get_stylesheet_directory() );

use voku\helper\HtmlDomParser;

require_once $theme_path . 'builder-v2/vendor/autoload.php';

$designer_path = $theme_path . 'builder-v2/designer/dist/';
$designer_url  = $theme_url . 'builder-v2/designer/dist/';

$html = HtmlDomParser::file_get_html( $designer_path . 'index.html' );

// Replace "src" from images to match current dir
$imgs = $html->find( 'img' );
foreach ( $imgs as $image ) {
    $img_src = $image->getAttribute( 'src' );
    if ( str_contains( $img_src, 'http' ) || str_contains( $img_src, 'data:image' ) ) {
        continue;
    }

    $img_src = "$designer_url$img_src";
    $image->setAttribute( 'src', $img_src );
}
$html->save();

// Output <body> content of designer html
$element = $html->findOne( 'body' )->innerHtml();
echo $element;
