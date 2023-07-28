<div id="success-modal" class="builder-modal | hidden fixed inset-0 w-full h-full z-[9998]" onclick="window.location.reload();">
    <div class="modal-overlay absolute inset-0 bg-black bg-opacity-75 w-full h-full"></div>
    <div class="form-wrapper absolute inset-10 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 bg-white rounded-lg shadow-2xl p-8 lg:p-12">
        <div class="relative">
            <?php
            $success_message = get_field( 'builder_success_message', 'options' );
            echo $success_message; ?>
            <i class="absolute left-auto -top-2 -right-2 lg:-right-4 lg:-top-4 text-black font-normal not-italic cursor-pointer">x</i>
        </div>
    </div>
</div>
<?php
