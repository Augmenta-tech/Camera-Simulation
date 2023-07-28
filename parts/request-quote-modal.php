<?php
defined( 'ABSPATH' ) || exit;
?>
<div id="quote-form-modal" class="builder-modal | hidden fixed inset-0 w-full h-full z-[9998]">

    <div
        class="modal-overlay absolute inset-0 w-full h-full bg-black bg-opacity-75"
        onclick="this.parentElement.classList.toggle('hidden'); document.documentElement.classList.toggle('overflow-y-hidden');"></div>
    <div class="form-wrapper inset-10 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:p-12 absolute p-8 overflow-y-auto bg-white rounded-lg shadow-2xl">
        <div class="relative grid grid-cols-1 gap-6 overflow-y-auto">
            <div class="quote-form">

                <h2 class="text-4xl font-bold"><?php _e( 'Request a quote' ); ?></h2>
                <p class="mt-4 mb-4 text-lg"><?php _e( 'Please tell us more about your interactive project:' ); ?></p>

                <textarea class="w-full" name="note" id="note" rows="6"></textarea>
                <button id="send-quote" class="dark-cta mt-4" type="button"><?php _e( 'Send' ); ?></button>

                <script>
                    (function() {

                        // Toggle modal on advanced trackers inputs
                        // const trackersInputsEls = document.querySelectorAll('[name="tracking-mode-selection-builder"]');
                        // for ( const trackerInputEl of trackersInputsEls ) {
                        //     trackerInputEl.addEventListener('click', (ev) => {
                        //         const value = ev.target.value;

                        //         if (
                        //             value === 'fast-objects-tracking' ||
                        //             value === 'curved-wall' ||
                        //             value === 'feet-tracking'
                        //         )
                        //         {
                        //             toggle_contact_form_modal();
                        //         }

                        //     });
                        // }

                        // const dimensionsNeedSomethingDifferentEl = document.querySelector('#dimensions-need-something-different-button');
                        // const hardwareNeedSomethingDifferentEl = document.querySelector('#hardware-need-something-different-button');
                        // const hardwareWarningEl = document.querySelector('#hardware-warning-button');
                        // const getInTouchExpertsEl = document.querySelector('#dimensions-warning-button');

                        // // Toggle modal on "Click here to get in touch with our experts."
                        // dimensionsNeedSomethingDifferentEl.addEventListener('click', toggle_contact_form_modal);
                        // hardwareNeedSomethingDifferentEl.addEventListener('click', toggle_contact_form_modal);
                        // hardwareWarningEl.addEventListener('click', toggle_contact_form_modal);
                        // getInTouchExpertsEl.addEventListener('click', toggle_contact_form_modal);

                        // Init
                        update_messages();
                        hide_form_on_success();

                        document.addEventListener('DOMContentLoaded', () => {

                        });

                        function toggle_contact_form_modal() {

                            const contactFormModalEl = document.querySelector('#quote-form-modal');
                            if ( contactFormModalEl ) {
                                contactFormModalEl.classList.toggle('hidden');
                                if ( !contactFormModalEl.classList.contains('hidden') ) {
                                    document.documentElement.classList.toggle('overflow-y-hidden');
                                }
                            }

                        }

                        function update_messages() {
                            const successMsgEl = document.querySelector('.quote-form .sellsy-success-message');
                            if ( !successMsgEl ) { return; }

                            successMsgEl.textContent = 'Votre demande a bien été envoyée';

                            const errorMsgEl = document.querySelector('.quote-form .sellsy-error-message');
                            if ( errorMsgEl ) {
                                successMsgEl.remove();
                            }
                        }

                        function hide_form_on_success() {
                            const successMsgEl = document.querySelector('.quote-form .sellsy-success-message');
                            if ( !successMsgEl ) { return; }

                            const formEl = document.querySelector('.quote-form form');
                            formEl.remove();
                        }

                    })();
                </script>
            </div>
        </div>
    </div>
</div>
<?php
