cd $1
  md5_old=`md5sum package.json|awk '{print $1;}'`

  sudo git checkout master
  sudo git fetch --all
  sudo git reset --hard origin/master
  sudo git pull

  md5_new=`md5sum package.json|awk '{print $1;}'`

if [ $md5_old = $md5_new ]
then
  sudo npm run build

  pm2 restart all

else
  # npm install
  sudo npm install --unsafe-perm
  sudo npm run build

  pm2 restart npm -- run serve
fi 
