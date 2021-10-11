# Update
sudo add-apt-repository universe
sudo apt-get update
sudo apt-get upgrade -y

#Fira-code and cascadia fonts
sudo add-apt-repository "deb http://archive.ubuntu.com/ubuntu $(lsb_release -sc) universe"
sudo apt-get update
sudo apt-get install fonts-firacode
sudo apt-get install fonts-cascadia-code

# Install curl
sudo apt-get install curl

# Install golang
sudo apt-get install golang -y

# Utilities
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get install ./google-chrome-stable_current_amd64.deb
sudo add-apt-repository ppa:peek-developers/stable
sudo apt-get update
sudo apt-get install peek
sudo apt-get install -y deepin-screenshot
sudo apt-get install xclip
sudo snap install discord
sudo snap install rambox

# Install DBeaver
wget -O - https://dbeaver.io/debs/dbeaver.gpg.key | apt-key add -
echo "deb https://dbeaver.io/debs/dbeaver-ce /" | tee /etc/apt/sources.list.d/dbeaver.list
sudo apt-get update -y
sudo apt-get install dbeaver-ce -y

# Install gdebi
sudo apt-get install gdebi

# Install sdkman
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh | bash

# Install Python, VENV and PIP
sudo apt install python3 python3-venv python3-pip -y

#IDEs
sudo snap install --classic code
sudo snap install intellij-idea-community --classic --edge
sudo apt install android-studio -y

# Install docker
sudo apt-get install apt-transport-https ca-certificates software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install docker-ce

# Install docker-composer
sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

#Create SSH Keys
ssh-keygen

# Oh My Shell
sudo apt install zsh -y
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

git clone https://github.com/zsh-users/zsh-autosuggestions.git $ZSH_CUSTOM/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting
sudo chsh -s /usr/bin/zsh root
sudo usermod --shell $(which zsh) $USER

# Create docker group and add current user in it
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
