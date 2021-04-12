# extensions-vscode-by-tecnology

## My favorities extensions by technology

*   Vue
*   Svelte
*   React
*   Kotlin
*   Python
*   Ruby

## How to use?

In your user try to find '.vscode' folder, in that folder remove the extensions folder and code and paste the extensions folder from technology who you will use.

If you will user other technology, then again delete the extensions folder and copy from the other technology you want to use.

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

