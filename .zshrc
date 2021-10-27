# If you come from bash you might have to change your $PATH.
export PATH=$HOME/bin:/usr/local/bin:$PATH
export PATH=$HOME/.local/bin:$PATH
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

export JAVA_HOME=/usr/lib/jvm/jdk-11.0.8-10
export PATH="$PATH:$JAVA_HOME/bin"
export PATH="$PATH:/home/.deno/bin"

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion" # This loads nvm bash_completion

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="agnoster"

# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in $ZSH/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to automatically update without prompting.
# DISABLE_UPDATE_PROMPT="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_ZSH_DAYS=13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(zsh-autosuggestions zsh-syntax-highlighting git npm node mvn gradle yarn docker brew aws copydir copyfile cp docker-compose docker-machine dotenv emoji flutter gcloud nvm postgres rails redis-cli ruby sdk spring sudo ubuntu vscode)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

start_feature() {
	git flow feature start $1
}

finish_feature() {
	git flow feature finish $1
}

publish_feature() {
	git flow feature publish $1
}

pull_feature() {
	git flow feature pull $1
}

start_release() {
	git flow release start RELEASE $1
}

publish_release() {
	git flow release publish RELEASE
}

pull_release() {
	git flow release pull RELEASE
}

finish_release() {
	git flow release finish RELEASE
}

start_hotfix() {
	git flow hotfix start VERSION $1
}

publish_hotfix() {
	git flow hotfix publish VERSION
}

pull_hotfix() {
	git flow hotfix pull VERSION
}

finish_hotfix() {
	git flow hotfix finish VERSION
}


vscodeext() {
	echo "Removing $HOME/.vscode/extensions"
	rm -rf $HOME/.vscode/extensions 
	
	echo "Copying default extensions"
	cp -a $HOME/.vscode/default/. $HOME/.vscode/extensions

	echo "Copying $1"
	cp -r $HOME/.vscode/$1/extensions $HOME/.vscode 
	
	if [  ! -z "\$2" ]
	then
	  echo "Copying $2"
	  cp -r $HOME/.test/$2/extensions $HOME/.test
	fi
	
	echo "opening vscode"
	code
	
	echo "Bye bye!!!"
	exit
}

git_create_release() {
	git checkout master
	git pull origin master
	git checkout -b feature/$1
}

git_create_feature() {
	git checkout master
	git pull origin master
	git checkout -b feature/$1
}

git_create_conflict() {
	git checkout $1
	git pull origin $1
	git branch -D conflict/$2
	git checkout -b conflict/$2
	
	if [  ! -z "\$3" ]
	then
	   	git pull origin feature/$2   
	fi
	
}

git_check_pull() {
	git checkout $1
	git pull origin $1
}

#THIS MUST BE AT THE END OF THE FILE FOR SDKMAN TO WORK!!!
export SDKMAN_DIR="$HOME/.sdkman"
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"

###-tns-completion-start-###
if [ -f $HOME/.tnsrc ]; then 
    source $HOME/.tnsrc 
fi
###-tns-completion-end-###

export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

# The next line updates PATH for the Google Cloud SDK.
if [ -f '$HOME/google-cloud-sdk/path.zsh.inc' ]; then . '$HOME/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '$HOME/google-cloud-sdk/completion.zsh.inc' ]; then . '$HOME/google-cloud-sdk/completion.zsh.inc'; fi
