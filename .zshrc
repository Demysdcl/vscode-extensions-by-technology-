export ZSH="$HOME/.oh-my-zsh"

ZSH_THEME="agnoster"

export PATH=$HOME/bin:/usr/local/bin:$PATH
export PATH=/usr/local/share/npm/bin:$PATH
export PATH=$HOME/.local/bin:$PATH
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:/usr/local/bin
export JAVA_HOME=/usr/lib/jvm/jdk-11.0.8-10
export PATH="$PATH:$JAVA_HOME/bin"

# clone highlighting
# git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting

source $ZSH/oh-my-zsh.sh
source $HOME/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

plugins=(zsh-autosuggestions zsh-syntax-highlighting zsh-history-substring-search history git npm node mvn gradle yarn docker brew aws copyfile cp docker-compose docker-machine dotenv emoji flutter gcloud nvm postgres rails redis-cli ruby sdk spring sudo ubuntu vscode)

gitcp() {
	git checkout $1
	git pull origin $1
}

gitpl() {
	git pull origin $1
}

gitph() {
	git push origin $1
}

gitac() {
	git add .
	git commit -m $1
}

gitnb() {
	git checkout -b $1
}
