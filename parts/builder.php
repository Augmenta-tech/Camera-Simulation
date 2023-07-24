<?php

defined( 'ABSPATH' ) || exit;

$theme_url  = trailingslashit( get_stylesheet_directory_uri() );
$theme_path = trailingslashit( get_stylesheet_directory() );

?>
<div class="row full-height">

    <!-- HEADER/VIEWPORT - LEFT -->
    <div id="left-section" class="column">

    <!-- HEADER -->
    <div id="header" class="row center-x-spaced center-y">
        <!-- LOGO -->
        <div id="augmenta-link-logo">
        <a href="https://www.augmenta.tech">
            <img id="augmenta-link-logo-img" src="<?php echo $theme_url; ?>builder-v2/designer/img/augmenta-logo.png" alt="Augmenta">
        </a>
        </div>

        <!-- TITLE -->
        <div>
        <h1 id="website-title">Augmenta Designer (beta)</h1>
        </div>

        <!-- SHARE, CONTACT, HELP... BUTTONS -->
        <div id="header-buttons">
        <div id="generate-link" class="button main-button">
            <span class="iconify main-icon" data-icon="ci:share"></span>
            <p> Share </p>
        </div>

        <!-- SHARE MODAL -->
        <div id="share-modal" class="modal hidden">
            <div id="share-modal-content" class="column center-x center-y modal-content">
                <p id="copy-feedback-text" class="main-text">URL of your scene has been copied to clipboard !</p>
            </div>
        </div>
        <!-- END SHARE MODAL -->

        <!-- REQUEST QUOTE BUTTON -->
        <a id="request-quote-button" class="button main-button" href="javascript:;">
            <span class="iconify main-icon" data-icon="ci:mail"></span>
            <p><?php _e( 'Request a quote' ); ?></p>
        </a>
        <!-- END REQUEST QUOTE BUTTON -->

        <!-- TO ADD HELP BUTTON <p>Help ?</p> -->
        </div>
    </div>

    <!-- VIEWPORT -->
    <div id="viewport">
        <!-- ADD TOOLS
        <div id="toolbar" class="row">
        <div data-tool="1" class="active">
            <span class="iconify" data-icon="fluent:cursor-20-filled"></span>
        </div>
        <div data-tool="2">
            <span class="iconify" data-icon="fluent:hand-right-16-filled"></span>
        </div>
        <div data-tool="3">
            <span class="iconify" data-icon="fluent:arrow-rotate-clockwise-16-filled"></span>
        </div>
        <div data-tool="4">
            <span class="iconify" data-icon="fluent:zoom-in-16-filled"></span>
        </div>
        </div> -->

        <!-- VIEWPORT BUTTONS -->
        <div id="viewport-buttons" class="row center-x">
        <!-- FRUSTUMS BUTTON -->
        <div id="display-frustums-button" class="button main-button">
            <span id="display-frustums-button-icon" class="iconify main-icon" data-icon="akar-icons:eye-open"></span>
            <p id="display-frustums-button-text">Frustums</p>
        </div>

        <!-- ADD MEASURES BUTTON
        <div class="button main-button">
            <p>Measures</p>
        </div> -->

        <!-- UNITS BUTTON -->
        <div id="toggle-unit-button" class="button main-button">
            <span class="iconify main-icon" data-icon="codicon:arrow-both"></span>
            <p id="toggle-unit-button-m" class="bold-font">m</p><p> / </p><p id="toggle-unit-button-ft">ft</p>
        </div>
        </div>

        <!-- DUMMIES BUTTONS -->
        <div id="dummies-buttons" class="row">

        <!-- ADD BUTTON -->
        <div id="add-dummy-button" class="button main-button">
            <p>+ Add dummy</p>
        </div>

        <!-- DELETE BUTTON -->
        <div id="delete-all-dummies-button" class="button default-button">
            <span class="iconify secondary-icon" data-icon="fluent:delete-16-filled"></span>
            <p>Delete all dummies</p>
        </div>
        </div>
    </div>
    </div>

    <!-- INSPECTOR - RIGHT -->
    <div id="right-section">
    <div id="inspector" class="full-height">

        <!-- SCENE PANEL -->
        <div id="scene-infos" class="column sections-container">

        <!-- WIZARD BUTTON -->
        <div id="open-wizard" class="row center-x center-y">
            <div id="open-wizard-button" class="button main-button">
            <span class="iconify main-icon" data-icon="fa:magic"></span>
            <p >Generate scene</p>
            </div>
        </div>

        <!-- WIZARD MODAL -->
        <div id="wizard-modal" class="modal hidden">
            <div id="wizard-content" class="modal-content">
            <span id="close-wizard" class="close">&times;</span>

            <!-- WIZARD CONTENT -->
            <div class="column sections-container">
                <!-- TRACKING SECTION IN WIZARD -->
                <div id="tracking-section-wizard">

                <!-- TRACKING MODE -->
                <div id="tracking-mode-wizard">
                    <h3>What do you want to track ?</h3>
                    <select title="tracking-mode-wizard" name="tracking-mode-wizard" id="tracking-mode-selection-wizard">
                    <option value="human-tracking" selected>Floor (people tracking)</option>
                    <option value="hand-tracking">Table (hand tracking)</option>
                    </select>
                </div>

                <!-- HEIGHT DETECTED FOR OVERLAPS -->
                <div id="overlap-height-wizard">
                    <p>Target overlap height detection</p>
                    <select title="overlap-height-wizard" name="overlap-height-wizard" id="overlap-height-selection-wizard">
                    <!-- <option value="0.3">Feet</option>
                    <option value="0.7">Knees</option> -->
                    <option value="1.2" selected>Hips</option>
                    <option value="1.6">Shoulders</option>
                    <option value="2">Entire body</option>
                    </select>
                </div>
                </div>

                <!-- SCENE SECTION IN WIZARD -->
                <div>
                <h3>Scene size</h3>

                <!-- WIDTH INPUT -->
                <div>
                    <p>Width (<span data-unittext="1">m</span>)</p>
                    <input id="input-scene-width-wizard" type="number" placeholder="w" min="0" max="100" step = "0.1">
                </div>

                <!-- LENGTH INPUT -->
                <div>
                    <p>Length (<span data-unittext="1">m</span>)</p>
                    <input id="input-scene-length-wizard" type="number" placeholder="h" min="0" max="100" step = "0.1">
                </div>

                <!-- HOOK HEIGHT INPUT -->
                <div id="hook-height-input">
                    <p>Camera hook height from scene (<span data-unittext="1">m</span>) </p>
                    <input id="input-hook-height-wizard" type="number" placeholder="r" min="0" max="100" step = "0.1">
                </div>
                </div>

                <!-- CAMERA TYPES SECTION IN WIZARD -->
                <div>
                <div id="cam-types-checkboxes-wizard">
                    <h3>Choose the type.s of camera.s you want to use</h3>
                    <!-- filled in javascript -->
                </div>
                <div>
                    <p>No suitable sensor ? <a href="https://augmenta.tech/contact/" target="_blank">Contact us</a> !</p>
                </div>
                </div>

                <!-- GENERATE SCENE BUTTON IN WIZARD -->
                <div id="generate-scene-wizard-button" class="button main-button">
                <span class="iconify main-icon" data-icon="fa:magic"></span>
                <p>Generate scene</p>
                </div>
            </div>
            </div>
        </div>
        <!-- END WIZARD MODAL -->

        <!-- TRACKING SECTION IN INSPECTOR -->
        <div id="tracking-section-inspector">

            <!-- TRACKING MODE -->
            <div id="tracking-mode-inspector">
            <h3>What do you want to track ?</h3>
            <select title="tracking-mode-inspector" name="tracking-mode-inspector" id="tracking-mode-selection-inspector">
                <option value="human-tracking" selected>Floor (people tracking)</option>
                <option value="hand-tracking">Table (hand tracking)</option>
            </select>
            </div>

            <!-- HEIGHT DETECTED FOR OVERLAPS -->
            <div id="overlap-height-inspector" class="">
            <p>Target overlap height detection</p>
            <select title="overlap-height-inspector" name="overlap-height-inspector" id="overlap-height-selection-inspector">
                <!-- <option value="0.3">Feet</option>
                <option value="0.7">Knees</option> -->
                <option id="default-height-detected" value="1.2" selected>Hips</option>
                <option value="1.6">Shoulders</option>
                <option id="dummy-height-reference" value="2">Entire body</option>
            </select>
            </div>
        </div>

        <!-- SCENE SECTION IN INSPECTOR -->
        <div>
            <h3>Scene size</h3>

            <!-- WIDTH INPUT -->
            <div>
            <p>Width (<span data-unittext="1">m</span>)</p>
            <input id="input-scene-width-inspector" type="number" placeholder="w" min="0" max="100" step = "0.1">
            </div>

            <!-- LENGTH INPUT -->
            <div>
            <p>Length (<span data-unittext="1">m</span>)</p>
            <input id="input-scene-length-inspector" type="number" placeholder="h" min="0" max="100" step = "0.1">
            </div>

            <!-- SENSOR HEIGHT -->
            <div>
            <p>Sensor height (<span data-unittext="1">m</span>)</p>
            <input id="input-scene-sensor-height-inspector" type="number" placeholder="sh" min="0" max="30" step="0.1" disabled>
            </div>
        </div>

        <!-- SCENE COVERED FEEDBACK -->
        <div class="row">
            <p>Scene fully covered: </p><span id="scene-fully-covered-icon" class="iconify-inline" data-icon="ion:checkmark-circle-sharp"></span>
        </div>
        </div>

        <!-- SENSORS PANEL -->
        <div id="sensors-infos" class="column sections-container">
        <!-- NUMBER OF NODES FEEDBACK -->
        <div id="number-sensors" class="row center-x center-y">
            <p class="main-text">Number of nodes: <span id="number-nodes-value">0</span></p>
        </div>

        <!-- NODES BUTTONS -->
        <div id="nodes-buttons" class="row center-x">
            <!-- ADD BUTTON -->
            <div id="add-node-button" class="button main-button" >
            <p>+ New node</p>
            </div>

            <!-- DELETE BUTTON -->
            <div id="delete-all-nodes-button" class="button default-button" >
            <span class="iconify secondary-icon" data-icon="fluent:delete-16-filled"></span>
            <p>Delete all nodes</p>
            </div>
        </div>
        </div>
    </div>
    </div>

</div>

<!-- Beta style management -->
<script>
{
  const url = document.location.href;
  if(url.includes('beta'))
  {
    // TITLE
    document.getElementById('website-title').innerHTML += ' (beta)';

    /* DARK MODE */
    // SHARE MODAL
    document.getElementById('share-modal-content').classList.add('dark-mode');
    document.getElementById('copy-feedback-text').classList.add('dark-mode');

    // INSPECTOR
    const inspectorChilds = document.getElementById('inspector').getElementsByTagName("*");
    for(let i = 0; i < inspectorChilds.length; i++)
    {
      inspectorChilds[i].classList.add('dark-mode');
    }
    document.getElementById('inspector').classList.add('dark-mode');
  }
}
</script>
<?php
