# extensions-vscode-by-tecnology

## My favorities extensions by technology

*   Vue
*   Svelte
*   React
*   Kotlin
*   Python
*   Ruby

## How to use?

The default folder contains the common extensions between each technology

Copy '.zshrc' to your user folder.

In your terminal type 'vscodeext desired_technology'

## How it is possible?

Oh My Shell has aliases and we can create alias as a function, so I create a function that copy the extensions from the informaded technology.

```sh
vscodeext() {
       rm -rf $HOME/.vscode/extensions 
       cp -r $HOME/.vscode/$1/extensions $HOME/.vscode 
       cp -a $HOME/.vscode/default/. $HOME/.vscode/extensions 
       code 
       exit
}

```

