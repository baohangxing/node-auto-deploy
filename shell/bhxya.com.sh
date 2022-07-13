#! /bin/bash
set -e

cd $1
  md5_old=`md5sum package.json|awk '{print $1;}'`

  sudo git checkout main
  sudo git fetch --all
  sudo git reset --hard origin/main
  sudo git pull

  md5_new=`md5sum package.json|awk '{print $1;}'`

if [ $md5_old = $md5_new ]
then
  sudo npm run build

  pm2 restart blog -- run serve

else
  sudo npm install --unsafe-perm
  sudo npm run build

  pm2 restart blog -- run serve
fi 
