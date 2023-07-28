(function() {

    // Handle click event on builder submit button
    const quoteBtnEl = document.querySelector('#contact-button');
    if ( !quoteBtnEl ) return;

    // Get user data in DOM
    let user_data = window?.user_data || [];
    user_data = JSON.parse(user_data);

    let form_locked = false;

    // Send data
    quoteBtnEl.addEventListener( 'click', submit_builder_data );
    function submit_builder_data(ev) {

        ev.preventDefault();

        if ( form_locked ) return;

        form_locked = true;

        // Get builder data
        let sceneInfos = sessionStorage.getItem('sceneInfos');
        if ( !sceneInfos || sceneInfos == 'null' ) {
            alert('No builder data found in storage. Please restart the setup.')
        }

        submit_form();

    }

    // Submit form data
    const submit_form = () => {

        let sceneInfos = sessionStorage.getItem('sceneInfos');
        if ( !sceneInfos || sceneInfos == 'null' ) {
            return console.error('No scene data found in storage.')
        }

        // Create an URL with a sceneData parameter with the string json of the scene if it doesn't exists
        sceneInfos = JSON.parse(sceneInfos);
        if ( !sceneInfos?.sceneUrl ) {
            const url = new URL(document.location.href.split('?')[0]);
            url.searchParams.append('sceneData', JSON.stringify(sceneInfos));
            sceneInfos.sceneUrl = url;
        }
        sceneInfos = JSON.stringify(sceneInfos);

        const formData = new FormData();
        formData.append('action', 'aug_submit_builder');
        formData.append('nonce', window?.builder?.nonce);
        formData.append('scene_infos', sceneInfos);
        formData.append('lang', document.documentElement.getAttribute('lang'));
        formData.append('email', user_data?.email);

        toggle_loader();

        fetch(window?.builder?.ajax, {
           method: 'POST', // or 'PUT'
           headers: {
               //    'Content-Type': 'application/json',
            },
            body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            toggle_loader();
            form_locked = false;
            if ( data?.success === true ) {
                toggle_success_modal();
                reset_builder_form();
            } else {
                toggle_error_modal(data?.data);
            }
        })
        .catch((error) => {
            toggle_loader();
            form_locked = false;
            console.error('Error:', error);
            toggle_error_modal(error);
        });

    }

    const reset_builder_form = () => {
        console.log('reset builder form.');
        sessionStorage.removeItem('sceneInfos');
        sessionStorage.removeItem('builderStep');
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
