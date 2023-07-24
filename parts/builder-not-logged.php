<?php

defined( 'ABSPATH' ) || exit;

$theme_url  = trailingslashit( get_stylesheet_directory_uri() );
$theme_path = trailingslashit( get_stylesheet_directory() );

?>
<div id="locked">
    <div class="overlay"></div>
    <img class="locked-img" src="<?php echo "{$theme_url}builder-v2/img/designer-locked.png"; ?>" fetchpriority="high">
    <div class="modal">
        <div class="modal-content">
            <span><?php _e( 'You need to be signed in to access the Augmenta builder' ); ?></span>
            <br />
            <a class="underline" href="<?php echo home_url( 'sign-in/?referer=' . $_SERVER['REQUEST_URI'] ); ?>">
                <?php _e( 'Log in / Sign up' ); ?>
            </a>
        </div>
    </div>
</div>
