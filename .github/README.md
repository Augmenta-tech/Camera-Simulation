## Camera-Simulation
This branch correspond of **Camera-Simulation** integrated into the **Augmenta WP Site** with additional features like:
- Login wall
- Send quote data to Sellsy API

### Must read / Infos
- **Camera-Simulation repo code** is located into `designer` folder.
- `class-Builder-Config-V2.php` is the "**Controller**" and is also used to handle & load assets *(CSS / JS)* the WP way.
- **The Camera Simulation** on the website has been splitted into **multiple PHP files** located in `parts/` folder:
  - `parts/builder.php` is parsing HTML `<body>` content of `designer/dist/index.html` and change dynamically some paths.  
  - `parts/custom-scripts.php` are scripts / importmap inside `designer/dist/index.html`

### Installation instructions
If you want to update **Camera Simulation version** used on Augmenta site:
  1. **Build prod assets** using `npm run build`
  2. Deploy manually or with CI / Github action in `wp-content/themes/salient-child/builder-v2/designer/` folder

### Error codes
Explanations of differents error codes in order of execution when a user submit the **Request a quote** form:
- `EAI` => Can't find the related "prospect" ID on Sellsy with his WordPress account email
- `EP` => No "prospect" found with his ID _(shouldn't happen)_
- `EC` => Can't find "contact" on Sellsy based on "prospect"
- `ECI` => No "contact" found with his ID _(shouldn't happen)_
- `OPI` => Failed to create an "opportunity" on Sellsy
- `OAI` => Failed to attach json scene file to "opportunity" on Sellsy
- `DI` => Failed to create a "quote" on Sellsy
- `DIA` => Failed to attach json scene file to "quote" on Sellsy
