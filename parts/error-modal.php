<div id="error-modal" class="builder-modal | hidden fixed inset-0 w-full h-full z-[9998]">
    <div class="modal-overlay absolute inset-0 w-full h-full bg-black bg-opacity-75" onclick="this.closest('.builder-modal').classList.toggle('hidden');"></div>
    <div class="form-wrapper inset-10 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:p-12 absolute p-8 bg-white rounded-lg shadow-2xl">
        <div class="relative">
            <?php
            // $error_message = get_field( 'builder_error_message', 'options' );
            // echo $error_message; ?>
            <i class="-right-8 -top-8 absolute left-auto not-italic font-normal text-black cursor-pointer"
                onclick="this.closest('.builder-modal').classList.toggle('hidden');">x</i>
        </div>
    </div>
</div>
<?php
