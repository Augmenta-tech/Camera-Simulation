(function() {

    // Check if modal & builder are present
    const register_login_modal = document.querySelector('#form-modal');
    const augBuilderEl = document.querySelector('#augmenta-builder');
    if ( !register_login_modal || !augBuilderEl ) {
        return;
    }

    let user_logged = false;

    // Handle click event on builder submit button
    const augSubmitEl = augBuilderEl.querySelector('#request-quote-button-my-system');
    augSubmitEl.addEventListener( 'click', submit_builder_data );
    function submit_builder_data(ev) {

        // Get builder data
        const sceneInfos = localStorage.getItem('sceneInfos');
        if ( !sceneInfos ) {
            alert('No builder data found in storage. Please restart the setup.')
        }

        toggle_loader();

        if ( !user_logged ) {

            // Check if user is logged-in
            let formData = new FormData();
            formData.append('action', 'aug_is_user_logged_in');
            formData.append('nonce', window.builder.nonce);

            fetch(window.builder.ajax, {
               method: 'POST', // or 'PUT'
               headers: {
                //    'Content-Type': 'application/json',
               },
               body: formData,
            })
            .then((response) => response.json())
            .then((data) => {
                toggle_loader();
                data?.success ? submit_form() : toggle_register_login_modal();
            })
            .catch((error) => {
                toggle_loader();
                console.error('Error: ', error);
                console.log('Error: ', error);
                toggle_error_modal(error);
            });

        } else {

            toggle_loader();
            submit_form();

        }

    }

    // Listen to iframe to know when to send the data
    console.log('Wait for builder form success...');
    document.addEventListener('builder_form_success', (ev) => {
        console.log('Builder form success!');
        if ( ev?.detail ) {
            user_logged = ev.detail;
        }
        toggle_register_login_modal();
        submit_builder_data();
    });

    const lock_form = () => {
        const formEl = document.querySelector('#builder-loader-modal');
        if ( !formEl ) {
            return;
        }

        formEl.classList.toggle('hidden');
    }

    // Toggle login & register modal
    const toggle_register_login_modal = () => {
        if ( !register_login_modal ) {
            return;
        }

        register_login_modal.classList.toggle('hidden');
        document.documentElement.classList.toggle('overflow-y-hidden');
    }

    // Close login & register modal
    const close_register_login_modal = () => {
        if ( !register_login_modal ) {
            return;
        }

        register_login_modal.classList.add('hidden');
        document.documentElement.classList.remove('overflow-y-hidden');
    }

    // Submit form data
    const submit_form = () => {

        let sceneInfos = localStorage.getItem('sceneInfos');
        sceneInfos = sceneInfos ? JSON.parse( sceneInfos ) : {};
        sceneInfos.sceneName = document.querySelector('#my-system-scene-name-input').value;
        sceneInfos.sceneDesc = document.querySelector('#my-system-scene-message-input').value;
        sceneInfos = sceneInfos ? JSON.stringify( sceneInfos ) : '';

        const formData = new FormData();
        formData.append('action', 'aug_submit_builder');
        formData.append('nonce', window.builder.nonce);
        formData.append('scene_infos', sceneInfos);
        formData.append('lang', document.documentElement.getAttribute('lang'));
        if ( user_logged ) {
            formData.append( 'email', user_logged?.m );
            formData.append( 'pass', user_logged?.p );
        }

        toggle_loader();

        fetch(window.builder.ajax, {
           method: 'POST', // or 'PUT'
           headers: {
               //    'Content-Type': 'application/json',
            },
            body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            toggle_loader();
            if ( data?.success === true ) {
                reset_builder_form();
                close_register_login_modal();
                toggle_success_modal();
            } else {
                toggle_error_modal(data?.data);
            }
        })
        .catch((error) => {
            toggle_loader();
            console.error('Error:', error);
            toggle_error_modal(error);
        });

    }

    const reset_builder_form = () => {
        console.log('reset builder form.');
        localStorage.removeItem('sceneInfos');
        localStorage.removeItem('builderStep');
    }

    const toggle_success_modal = () => {
        console.log('success');
        const successModalEl = document.querySelector('#success-modal');
        if ( !successModalEl ) {
            return;
        }

        successModalEl.classList.toggle('hidden');
    }

    const toggle_error_modal = (err) => {
        const errorModalEl = document.querySelector('#error-modal');
        if ( !errorModalEl ) {
            return;
        }

        const previousErrorEl = errorModalEl.querySelector('.error-msg');
        if ( previousErrorEl ) {
            previousErrorEl.remove();
        }

        const errorEl = document.createElement('p');
        errorEl.classList = 'error-msg | text-2xl text-red-500 pb-0';
        errorEl.innerHTML = err;
        errorModalEl.querySelector('.form-wrapper .relative').append(errorEl);
        errorModalEl.classList.toggle('hidden');
    }

    const toggle_loader = () => {

        const loaderEl = document.querySelector('#builder-loader-modal');
        if ( !loaderEl ) {
            return;
        }

        loaderEl.classList.toggle('hidden');

    }

})();
