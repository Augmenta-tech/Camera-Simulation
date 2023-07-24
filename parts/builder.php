<?php
defined( 'ABSPATH' ) || exit;

$theme_url  = trailingslashit( get_stylesheet_directory_uri() );
$theme_path = trailingslashit( get_stylesheet_directory() );

// This code is mostly the equivalent of <body> inside "designer/index.html" file
?>
<!-- POPUP -->
<div id="popup" class="cd-popup is-visible" role="alert">
    <div class="cd-popup-container">
        <div id="bottom-section" class="column center-x">

            <!-- TABS -->
            <div id="builder-tabs" class="row center-x">
                <div id="setup-tab" class="column center-x tab passed-tab">
                    <h3>Setup</h3>
                    <div class="tab-line"></div>
                </div>
                <div id="dimensions-tab" class="column center-x tab">
                    <h3>Dimensions</h3>
                    <div class="tab-line"></div>
                </div>
                <div id="hardware-tab" class="column center-x tab">
                    <h3>Hardware</h3>
                    <div class="tab-line"></div>
                </div>
            </div>

            <!-- SETUP CONTENT -->
            <div id="setup-content" class="column builder-section">
                <!-- TRACKING MODE SELECTION -->
                <div id="tracking-mode-selection-builder" class="row wrap center-x center-y builder-section-content">
                    <label id="tracking-mode-human-tracking-input" class="tracking-mode-choice">
                        <input type="radio" name="tracking-mode-selection-builder" value="human-tracking" checked>
                        <img id="human-tracking-img" src="<?php echo $theme_url; ?>builder-v2/designer/img/human-tracking.png" alt="Human tracking">
                    </label>
                    <label id="tracking-mode-hand-tracking-input" class="tracking-mode-choice">
                        <input type="radio" name="tracking-mode-selection-builder" value="hand-tracking">
                        <img id="hand-tracking-img" src="<?php echo $theme_url; ?>builder-v2/designer/img/hand-tracking.png" alt="Hand tracking">
                    </label>
                    <label id="tracking-mode-wall-tracking-input" class="tracking-mode-choice">
                        <input type="radio" name="tracking-mode-selection-builder" value="wall-tracking">
                        <img id="wall-tracking-img" src="<?php echo $theme_url; ?>builder-v2/designer/img/wall-tracking.png" alt="Wall tracking">
                    </label>
                    <!-- ADVANCED TRACKING MODE BUTTONS
              <label id="tracking-mode-advanced" class="tracking-mode-choice">
                <img id="advanced-img" src="<?php echo $theme_url; ?>builder-v2/designer/img/advanced.png" alt="Advanced">
              </label>
              <label id="tracking-mode-curved-wall-input" class="tracking-mode-choice hidden">
                <input type="radio" name="tracking-mode-selection-builder" value="curved-wall">
                <img id="curved-wall-img" src="<?php echo $theme_url; ?>builder-v2/designer/img/curved-wall.png" alt="Curved Wall">
              </label>
              <label id="tracking-mode-feet-tracking-input" class="tracking-mode-choice hidden">
                <input type="radio" name="tracking-mode-selection-builder" value="feet-tracking">
                <img id="feet-tracking-img" src="<?php echo $theme_url; ?>builder-v2/designer/img/feet-tracking.png" alt="Feet tracking">
              </label>
              <label id="tracking-mode-fast-objects-tracking-input" class="tracking-mode-choice hidden">
                <input type="radio" name="tracking-mode-selection-builder" value="fast-objects-tracking">
                <img id="fast-objects-tracking-img" src="<?php echo $theme_url; ?>builder-v2/designer/img/fast-objects-tracking.png" alt="Fast objects">
              </label>
            -->
                </div>
                <div id="setup-target-overlap" class="popup-target-overlap-select hidden">
                    <p>Target overlap height detection</p>
                    <select title="overlap-height-popup" name="overlap-height-popup" id="overlap-height-selection-popup">
                        <!-- <option value="0.3">Feet</option>
                <option value="0.7">Knees</option> -->
                        <option value="1.2" selected>Hips</option>
                        <option value="1.6">Shoulders</option>
                        <option value="2">Entire body</option>
                    </select>
                </div>
                <div id="setup-target-overlap-wall" class="popup-target-overlap-select hidden">
                    <p>Target overlap detection</p>
                    <select title="overlap-wall-popup" name="overlap-wall-popup" id="overlap-wall-selection-popup">
                        <option value="1.2" selected>Hand tracking</option>
                        <option value="1.6">Finger tracking</option>
                        <option value="2">Large objects</option>
                    </select>
                </div>
                <div id="setup-target-overlap-table" class="popup-target-overlap-select hidden">
                    <p>Target overlap detection</p>
                    <select title="overlap-table-popup" name="overlap-table-popup" id="overlap-table-selection-popup">
                        <option value="1.2" selected>Hand tracking</option>
                    </select>
                </div>
                <div id="setup-warning-message" class="row center-x hidden">
                    <p id="setup-warning-text" class="warning-text">Please choose a surface to track</p>
                </div>

                <!-- SETUP BUTTONS-->
                <div class="column center-x center-y builder-section-buttons">
                    <div class="row center-x center-y nav-buttons">
                        <!-- NEXT BUTTON -->
                        <div id="next-button-setup" class="builder-button builder-main-button">
                            <p id="next-button-setup-text" class="bold-font"> NEXT </p>
                            <span class="iconify" data-icon="dashicons:arrow-right-alt2"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- DIMENSIONS CONTENT -->
            <div id="dimensions-content" class="column builder-section hidden">
                <!-- DIMENSIONS INPUTS -->
                <div id="dimensions-section-builder" class="column center-y builder-section-content">
                    <div id="gizmo-helper-image" class="row center-x center-y">
                        <img src="<?php echo $theme_url; ?>builder-v2/designer/img/gizmo-helper.png" alt="Gizmo helper">
                    </div>
                    <div id="dimensions-inputs" class="row wrap center-x center-y dimensions-inputs">
                        <div id="dimensions-width" class="column">
                            <div class="column">
                                <p id="dimensions-width-text">Width (<span data-unittext="1">m</span>)</p>
                            </div>
                            <div class="column">
                                <input id="dimensions-width-input" type="text" placeholder="Width" min="0" max="100" step="0.1" data-unit="1">
                            </div>
                        </div>
                        <div id="dimensions-length" class="column">
                            <div class="column">
                                <p id="dimensions-length-text">Length (<span data-unittext="1">m</span>)</p>
                            </div>
                            <div class="column">
                                <input id="dimensions-length-input" type="text" placeholder="Length" min="0" max="100" step="0.1" data-unit="1">
                            </div>
                        </div>
                        <div id="dimensions-distance" class="column">
                            <div class="column">
                                <p id="dimensions-distance-text-default">Sensor height (<span data-unittext="1">m</span>)</p>
                                <p id="dimensions-distance-text-hand-tracking" class="hidden">Sensor height (<span data-unittext="1">m</span>) <span id="sensor-height-infos" class="iconify" data-icon="el:info-circle"></span></p>
                                <div id="sensor-height-infos-text" class="hidden">
                                    <p>Please indicate the distance between the sensor and the table.</p>
                                </div>
                                <p id="dimensions-distance-text-wall-tracking" class="hidden">Height (<span data-unittext="1">m</span>)</p>
                            </div>
                            <div class="column">
                                <input id="dimensions-distance-input" type="text" placeholder="Sensor height" min="0" max="20" step="0.1" data-unit="1">
                            </div>
                        </div>
                    </div>
                    <div id="dimensions-warning-message" class="row center-x wrap hidden">
                        <p id="dimensions-warning-text" class="warning-text">No hardware setup found,</p>
                        <p id="dimensions-warning-button" class="text-button">click here to get in touch with our experts.</p>
                    </div>
                    <div id="dimensions-negative-values-warning" class="row center-x wrap hidden">
                        <p id="dimensions-negative-values-warning-text" class="warning-text">Please enter positive values.</p>
                    </div>
                    <div id="dimensions-no-value-warning" class="row center-x wrap hidden">
                        <p id="dimensions-no-value-warning-text" class="warning-text">Please fill all the fields.</p>
                    </div>
                    <div id="surface-warning-message" class="row center-x wrap hidden">
                        <!-- Injected by script -->
                    </div>
                </div>
                <!-- DIMENSIONS BUTTONS-->
                <div class="column center-x center-y builder-section-buttons">
                    <div class="row center-x center-y nav-buttons">
                        <!-- PREVIOUS BUTTON -->
                        <div id="previous-button-dimensions" class="builder-button builder-secondary-button">
                            <p id="previous-button-dimensions-text" class="bold-font"> PREVIOUS </p>
                        </div>
                        <!-- NEXT BUTTON -->
                        <div id="next-button-dimensions" class="builder-button builder-main-button">
                            <p id="next-button-dimensions-text" class="bold-font"> NEXT </p>
                            <span class="iconify" data-icon="dashicons:arrow-right-alt2"></span>
                        </div>
                    </div>
                    <!-- NEED SOMETHING DIFFERENT BUTTON -->
                    <div id="dimensions-need-something-different-button" class="row center-x">
                        <p id="dimensions-need-something-different-button" class="text-button"><a href="https://augmenta.tech/contact/" target="_blank">Need something different ?</a></p>
                    </div>
                </div>
            </div>

            <!-- HARDWARES CONTENT -->
            <div id="hardware-content" class="column builder-section hidden">
                <!-- HARDWARES SELECTION -->
                <div id="hardware-section-builder" class="column center-x center-y builder-section-content ">
                    <div id="hardware-switch-indoor-outdoor" class="row center-x center-y hidden">
                        <label class="hardware-radio-label">
                            <input id="hardware-input-radio-indoor" type="radio" name="switch-indoor-outdoor-builder" value="indoor" checked>
                            <div class="row center-x center-y hardware-switch">
                                <p>Indoor</p>
                            </div>
                        </label>
                        <label class="hardware-radio-label">
                            <input id="hardware-input-radio-outdoor" type="radio" name="switch-indoor-outdoor-builder" value="outdoor">
                            <div class="row center-x center-y hardware-switch">
                                <p>Outdoor</p>
                            </div>
                        </label>
                    </div>

                    <div class="row">
                        <!-- New Sensor selection -->
                        <div id="new-selector">
                            <h3 id="multi-select-label" for="multi-select">Select sensor</h3>
                            <div class="select select--multiple">
                                <select id="multi-select-sensors" size="3">
                                    <!-- FILLED IN JS WITH CORRECT SENSORS -->
                                </select>
                            </div>
                        </div>
                        <!-- Outdoor/Indoor toggle -->
                        <div id="new-toggle">
                            <p id="button-toggle-text">INDOOR</p>
                            <div class="button-toggle r" id="button-1">
                                <input id="toggle-outdoor-indoor" type="checkbox" class="checkbox" />
                                <div class="knobs"></div>
                                <div class="layer"></div>
                            </div>
                        </div>
                    </div>

                    <div id="hardware-sensors-selection" class="row wrap center-x center-y hidden">
                        <!-- FILLED IN JS WITH CORRECT SENSORS -->
                    </div>
                    <div id="hardware-warning-message" class="row center-x wrap hardware-warning-message hidden">
                        <p id="hardware-warning-text" class="warning-text">No hardware setup found,</p>
                        <p id="hardware-warning-button" class="text-button"><a href="https://augmenta.tech/contact/" target="_blank">click here to get in touch with our experts.</a></p>
                    </div>
                </div>
                <!-- HARDWARES BUTTONS-->
                <div class="column center-x center-y builder-section-buttons">
                    <div class="row center-x center-y nav-buttons">
                        <!-- PREVIOUS BUTTON -->
                        <div id="previous-button-hardware" class="builder-button builder-secondary-button">
                            <p id="previous-button-hardware-text" class="bold-font"> PREVIOUS </p>
                        </div>
                        <!-- NEXT BUTTON -->
                        <div id="next-button-hardware" class="builder-button builder-main-button">
                            <p id="next-button-hardware-text" class="bold-font"> GENERATE </p>
                            <span class="iconify" data-icon="dashicons:arrow-right-alt2"></span>
                        </div>
                    </div>
                    <!-- NEED SOMETHING DIFFERENT BUTTON -->
                    <div id="hardware-need-something-different-button" class="row center-x">
                        <p id="hardware-need-something-different-button" class="text-button"><a href="https://augmenta.tech/contact/" target="_blank">Need something different ?</a></p>
                    </div>
                </div>
            </div>

            <!-- MY SYSTEM CONTENT -->
            <div id="my-system-content" class="column builder-section hidden">
                <!-- RECAP -->
                <div id="my-system-section-builder" class="row center-x center-y builder-section-content">
                    <div id="my-system-scene-infos" class="row center-x center-y my-system-section my-system-line">
                        <div id="my-system-tracking-mode" class="column center-x center-y ">
                            <!-- FILLED IN JS WITH CHOSEN CONFIG -->
                        </div>
                        <div id="my-system-dimensions" class="column center-x center-y">
                            <!-- FILLED IN JS WITH CHOSEN CONFIG -->
                        </div>
                    </div>
                    <div id="my-system-recap" class="column center-y my-system-section">
                        <!-- FILLED IN JS WITH CHOSEN CONFIG -->
                    </div>
                </div>
                <!-- MY SYSTEM BUTTONS-->
                <div class="column center-x center-y builder-section-buttons">
                    <div class="row center-x center-y nav-buttons">
                        <!-- PREVIOUS BUTTON -->
                        <div id="previous-button-my-system" class="builder-button builder-secondary-button">
                            <p id="previous-button-my-system-text" class="bold-font"> PREVIOUS </p>
                        </div>
                        <!-- FINISH BUTTON -->
                        <div id="finish-button-my-system" class="builder-button builder-main-button">
                            <p id="finish-button-my-system-text" class="bold-font"> FINISH </p>
                            <span class="iconify" data-icon="dashicons:arrow-right-alt2"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <a id="close-popup" href="#0" class="cd-popup-close img-replace">Close</a>
    </div>
</div>

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

            <!-- SHARE SECTION -->
            <!-- <div class="row center-x center-y"> -->

            <!-- SHARE, CONTACT, HELP... BUTTONS -->
            <div id="header-buttons">
                <!-- LOAD FILE BUTTON -->
                <label id="load-file-button" class="button default-button">
                    <input type="file" id="load-file-input" class="hidden">
                    <span class="iconify secondary-icon" data-icon="eva:cloud-upload-outline"></span>
                    <p> Load file </p>
                </label>

                <!-- SHARE BUTTON -->
                <div id="generate-link" class="button main-button">
                    <span class="iconify main-icon" data-icon="ci:share"></span>
                    <p> Share </p>
                </div>

                <!-- SHARE MODAL -->
                <div id="share-modal" class="modal hidden">
                    <div id="share-modal-content" class="column center-x center-y modal-content">
                        <span id="close-share-modal" class="close">&times;</span>
                        <p id="copy-feedback-text" class="main-text">An URL of your scene has been copied to clipboard.</p>
                        <div class="center-x space-y">
                            <div id="copy-scene-link" class="button main-button">
                                <span class="iconify main-icon" data-icon="ph:copy"></span>
                                <p> Copy to clipboard </p>
                            </div>
                        </div>
                        <p class="main-text">You can also download a file for your scene below:</p>
                        <div class="row center-x space-y">
                            <input type="text" id="scene-file-name-input" placeholder="Your file name">
                            <div id="download-scene-file" class="button main-button">
                                <span class="iconify main-icon" data-icon="eva:cloud-download-outline"></span>
                                <p> Download </p>
                            </div>
                        </div>
                        <div id="warning-text-input-illegal-symbol" class="hidden">
                            <p class="warning-message">You cannot use '<span id="illegal-symbol-used"></span>' in your file name.</p>
                        </div>
                    </div>
                </div>
                <!-- END SHARE MODAL -->

                <!-- CONTACT BUTTON -->
                <a id="contact-button" class="button main-button" href="https://augmenta.tech/contact/" target="_blank">
                    <span class="iconify main-icon" data-icon="ci:mail"></span>
                    <p>Contact us</p>
                </a>
                <!-- END CONTACT BUTTON -->

                <!-- TO ADD HELP BUTTON <p>Help ?</p> -->

            </div>
        </div>

        <!-- VIEWPORT -->
        <div id="viewport">
            <pre id="file-content"></pre>
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
                    <p id="display-frustums-button-text">Cameras frustums</p>
                </div>

                <!-- LIDARS RAYS BUTTON -->
                <div id="display-lidars-rays-button" class="button main-button">
                    <span id="display-lidars-rays-button-icon" class="iconify main-icon" data-icon="akar-icons:eye-open"></span>
                    <p id="display-lidars-rays-button-text">Lidars rays</p>
                </div>


                <!-- ADD MEASURES BUTTON
            <div class="button main-button">
              <p>Measures</p>
            </div> -->

                <!-- UNITS BUTTON -->
                <div id="toggle-unit-button" class="button main-button">
                    <span class="iconify main-icon" data-icon="codicon:arrow-both"></span>
                    <p id="toggle-unit-button-m" class="bold-font">m</p>
                    <p> / </p>
                    <p id="toggle-unit-button-ft">ft</p>
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
                        <p>Generate scene</p>
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
                                        <option value="wall-tracking">Wall (hand tracking)</option>
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

                            <!-- FLOOR SCENE -->
                            <div id="floor-scene-size-wizard">
                                <h3 id="floor-scene-size-title-wizard">Floor scene size</h3>

                                <!-- WIDTH INPUT -->
                                <div>
                                    <p>Width (<span data-unittext="1">m</span>)</p>
                                    <input id="input-scene-width-wizard" type="number" placeholder="w" min="0" max="100" step="0.1">
                                </div>

                                <!-- LENGTH INPUT -->
                                <div>
                                    <p>Length (<span data-unittext="1">m</span>)</p>
                                    <input id="input-scene-length-wizard" type="number" placeholder="h" min="0" max="100" step="0.1">
                                </div>

                                <!-- HOOK HEIGHT INPUT -->
                                <div id="hook-height-input">
                                    <p>Camera hook height from scene (<span data-unittext="1">m</span>) </p>
                                    <input id="input-hook-height-wizard" type="number" placeholder="r" min="0" max="100" step="0.1">
                                </div>
                            </div>

                            <!-- WALL Y SCENE -->
                            <div id="wall-y-scene-size-wizard" class="hidden">
                                <h3>Front wall scene size</h3>

                                <!-- WIDTH INPUT -->
                                <div>
                                    <p>Width (<span data-unittext="1">m</span>)</p>
                                    <input id="input-wall-y-scene-width-wizard" type="number" placeholder="w" min="0" max="100" step="0.1">
                                </div>

                                <!-- HEIGHT INPUT -->
                                <div>
                                    <p>Height (<span data-unittext="1">m</span>)</p>
                                    <input id="input-wall-y-scene-height-wizard" type="number" placeholder="h" min="0" max="100" step="0.1">
                                </div>
                            </div>

                            <!-- CAMERA TYPES SECTION IN WIZARD -->
                            <div>
                                <div id="cam-types-checkboxes-wizard">
                                    <h3>Choose the type.s of sensor.s you want to use</h3>
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

                <img id="tracking-img" src="<?php echo $theme_url; ?>builder-v2/designer/img/human-tracking.png" alt="Tracking image" class="tracking-img">
                <h3 id="height-detection-text">Target overlap height detection: Hips</h3>

                <!-- TRACKING SECTION IN INSPECTOR -->
                <div id="tracking-section-inspector" class="hidden">

                    <!-- TRACKING MODE -->
                    <div id="tracking-mode-inspector">
                        <h3>What do you want to track ?</h3>
                        <select title="tracking-mode-inspector" name="tracking-mode-inspector" id="tracking-mode-selection-inspector">
                            <option value="human-tracking" selected>Floor (people tracking)</option>
                            <option value="hand-tracking">Table (hand tracking)</option>
                            <option value="wall-tracking">Wall (hand tracking)</option>
                        </select>
                    </div>

                    <!-- HEIGHT DETECTED FOR OVERLAPS -->
                    <div id="overlap-height-inspector" class="hidden">
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

                <!-- FLOOR SCENE -->
                <div class="hidden">
                    <div id="floor-scene-size-inspector">
                        <h3 id="floor-scene-size-title-inspector">Floor scene size</h3>

                        <!-- WIDTH INPUT -->
                        <div>
                            <p>Width (<span data-unittext="1">m</span>)</p>
                            <input id="input-scene-width-inspector" type="number" placeholder="w" min="0" max="100" step="0.1" disabled>
                        </div>

                        <!-- LENGTH INPUT -->
                        <div>
                            <p>Length (<span data-unittext="1">m</span>)</p>
                            <input id="input-scene-length-inspector" type="number" placeholder="h" min="0" max="100" step="0.1" disabled>
                        </div>

                        <!-- SENSOR HEIGHT -->
                        <div>
                            <p>Sensor height (<span data-unittext="1">m</span>)</p>
                            <input id="input-scene-sensor-height-inspector" type="number" placeholder="sh" min="0" max="30" step="0.1" disabled>
                        </div>
                    </div>
                </div>

                <!-- INSPECTOR READONLY SCENE SIZE -->
                <div id="scene-size-text-div">
                    <h3 id="scene-size-text">Scene size: <span data-unit="1">5</span>x<span data-unit="1">5</span>(<span data-unittext="1">m</span>) with a sensor height of <span data-unit="1">6</span>(<span data-unittext="1">m</span>)</h3>
                </div>

                <div id="info-table-height-inspector"></div>

                <div class="hidden">

                    <!-- WALL Y SCENE -->
                    <div id="wall-y-scene-size-inspector">
                        <h3>Front wall scene size</h3>

                        <!-- WIDTH INPUT -->
                        <div>
                            <p>Width (<span data-unittext="1">m</span>)</p>
                            <input id="input-wall-y-scene-width-inspector" type="number" placeholder="w" min="0" max="100" step="0.1" disabled>
                        </div>

                        <!-- HEIGHT INPUT -->
                        <div>
                            <p>Height (<span data-unittext="1">m</span>)</p>
                            <input id="input-wall-y-scene-height-inspector" type="number" placeholder="h" min="0" max="100" step="0.1" disabled>
                        </div>
                    </div>

                </div>
            </div>

            <!-- SENSORS PANEL -->
            <div id="sensors-infos" class="column sections-container">
                <!-- SCENE COVERED FEEDBACK -->
                <div class="row" id="coverage-section">
                    <p class="scene-fully-covered-text">Scene fully covered: </p>
                    <span id="scene-fully-covered-icon" class="iconify-inline" data-icon="ion:checkmark-circle-sharp"></span>
                </div>

                <!-- NUMBER OF NODES FEEDBACK -->
                <div id="number-sensors" class="row center-x center-y">
                    <p class="main-text">Number of sensors: <span id="number-nodes-value">0</span></p>
                </div>

                <!-- NODES BUTTONS -->
                <div id="nodes-buttons" class="row center-x">
                    <!-- ADD BUTTON -->
                    <div id="add-node-button" class="button main-button">
                        <p>+ New node</p>
                    </div>

                    <!-- DELETE BUTTON -->
                    <div id="delete-all-nodes-button" class="button default-button">
                        <span class="iconify secondary-icon" data-icon="fluent:delete-16-filled"></span>
                        <p>Delete all nodes</p>
                    </div>
                </div>

                <!-- LIDARS BUTTONS -->
                <div id="lidars-buttons" class="row center-x hidden">
                    <!-- ADD BUTTON -->
                    <div id="add-lidar-button" class="button main-button">
                        <p>+ New lidar</p>
                    </div>

                    <!-- DELETE BUTTON -->
                    <div id="delete-all-lidars-button" class="button default-button">
                        <span class="iconify secondary-icon" data-icon="fluent:delete-16-filled"></span>
                        <p>Delete all lidars</p>
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
        if (url.includes('beta')) {
            // TITLE
            document.getElementById('website-title').innerHTML += ' (beta)';

            /* DARK MODE */
            // SHARE MODAL
            document.getElementById('share-modal-content').classList.add('dark-mode');
            document.getElementById('copy-feedback-text').classList.add('dark-mode');

            // INSPECTOR
            const inspectorChilds = document.getElementById('inspector').getElementsByTagName("*");
            for (let i = 0; i < inspectorChilds.length; i++) {
                inspectorChilds[i].classList.add('dark-mode');
            }
            document.getElementById('inspector').classList.add('dark-mode');
        }
    }
</script>
<?php
