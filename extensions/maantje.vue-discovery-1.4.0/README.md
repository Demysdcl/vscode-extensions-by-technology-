<p>
  <h1 align="center">Vue discovery 🔭</h1>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=Maantje.vue-discovery">
    <img src="https://vsmarketplacebadge.apphb.com/version-short/Maantje.vue-discovery.svg?style=flat-square">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=Maantje.vue-discovery">
    <img src="https://vsmarketplacebadge.apphb.com/downloads/Maantje.vue-discovery.svg?style=flat-square">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=Maantje.vue-discovery">
    <img src="https://vsmarketplacebadge.apphb.com/rating-star/Maantje.vue-discovery.svg?style=flat-square">
  </a>
</p>

This extension discovers Vue components in your workspace and provides IntelliSense for them. Just starting typing your component name and press enter to automatically import, register and expand any required props.

<img src="https://github.com/maantje/vue-discovery/raw/master/images/overview_o.gif" width="680">

## ✨ Features

##### Provide IntelliSense for components in template section
<img src="https://github.com/maantje/vue-discovery/raw/master/images/show-components.gif" width="680">

##### Automatically import, register and expand required props
<img src="https://github.com/maantje/vue-discovery/raw/master/images/auto-import.gif" width="680">

##### Provide IntelliSense for props on components
<img src="https://github.com/maantje/vue-discovery/raw/master/images/show-available-props.gif" width="680">

##### Show available props on hover
<img src="https://github.com/maantje/vue-discovery/raw/master/images/show-props-on-hover.gif" width="680">

##### Provide IntelliSense for events
<img src="https://github.com/maantje/vue-discovery/raw/master/images/event-intellisense.gif" width="680">

##### Uses your defined paths in `jsconfig.json`
<img src="https://github.com/maantje/vue-discovery/raw/master/images/uses-paths.gif" width="680">

##### Import with `cmd + i`, this is useful for importing pasted components
<img src="https://github.com/maantje/vue-discovery/raw/master/images/import-keybind.gif" width="680">


## 🔧 Extension Settings

This extension can be customized with the following settings:

* `vueDiscovery.rootDirectory`: this tells where to look for vue components (default: `src`)
* `vueDiscovery.componentCase`: The casing for the component, available options are `kebab` for kebab-case and `pascal` for PascalCase (default: `pascal`)
* `vueDiscovery.addTrailingComma`: Add a trailing comma to the registered component (default: `true`)
* `vueDiscovery.propCase`: The casing for the props, available options are `kebab` for kebab-case and `camel` for camelCase (default: `kebab`)

## 🔖 Release Notes

### 1.4.0

Add IntelliSense for events

### 1.3.1

Fix relative import for relative paths.

### 1.3.0

Add badges to readme and update description.

### 1.2.0

Add badges to readme and update description.

### 1.1.0

Add icon.

### 1.0.0

Initial release of Vue discovery.
