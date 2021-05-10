# Update
sudo apt-get update
sudo apt-get upgrade -y

# Utils
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb
sudo add-apt-repository ppa:peek-developers/stable
sudo apt-get update
sudo apt-get install peek
sudo apt-get install -y deepin-screenshot
sudo apt-get install xclip


# Install DBeaver
wget -O - https://dbeaver.io/debs/dbeaver.gpg.key | apt-key add -
echo "deb https://dbeaver.io/debs/dbeaver-ce /" | tee /etc/apt/sources.list.d/dbeaver.list
sudo apt-get update -y
sudo apt-get install dbeaver-ce -y

# Install gdebi
sudo apt-get install gdebi

# Install curl
sudo apt-get install curl

# Install sdkman
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install java 8.0.232-trava
sdk install java 11.0.5-amzn

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh | bash
nvm install 8
nvm install 12
nvm install 14
nvm use 14

# Install yarn
npm i -g yarn

#IDEs
sudo snap install --classic code
sudo snap install intellij-idea-community --classic --edge

# Install docker
sudo apt-get install apt-transport-https ca-certificates software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install docker-ce

# Install docker-composer
sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create docker group and add current user in it
sudo groupadd docker
sudo usermod -aG docker $USER
