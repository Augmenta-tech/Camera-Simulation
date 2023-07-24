## Camera-Simulation
This branch correspond of **Camera-Simulation** integrated into the **Augmenta WP Site** with additional features like:
- Login wall
- Send quote data to Sellsy API

### Must read
- **Camera-Simulation repo code** is located into `designer` folder.
- Some files have been edited to match correct paths for the WP env *(mostly JS imports)*
- The `index.html` file is not used in the integration, it has been splitted into **multiple PHP parts files** located in `parts/` folder:
  - `class-Builder-Config-V2.php` is the "**Controller**" and is also used to handle & load assets *(CSS / JS)* the WP way.
  - `parts/builder.php` is the equivalent of `<body>` internal part of `index.html`
  - `parts/custom-scripts.php` are scripts / importmap inside `index.html`
