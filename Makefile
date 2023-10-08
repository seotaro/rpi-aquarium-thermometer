NODE_MAJOR:=18

setup-node:
	sudo apt-get update
	sudo apt-get install -y ca-certificates curl gnupg
	sudo mkdir -p /etc/apt/keyrings
	curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

	echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$(NODE_MAJOR).x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

	sudo apt-get update
	sudo apt-get install nodejs -y
	sudo npm install --global yarn

enable-1-wire:
	echo "dtoverlay=w1-gpio" | sudo tee -a /boot/config.txt


setup-autostart:
	mkdir -p ~/.config/lxsession/LXDE-pi
	cp /etc/xdg/lxsession/LXDE-pi/autostart ~/.config/lxsession/LXDE-pi
	echo "@xset s off" >> ~/.config/lxsession/LXDE-pi/autostart
	echo "@xset s noblank" >> ~/.config/lxsession/LXDE-pi/autostart
	echo "@xset -dpms" >> ~/.config/lxsession/LXDE-pi/autostart
	echo "/home/pi/aquarium-0.1.0-armv7l.AppImage" >> ~/.config/lxsession/LXDE-pi/autostart

