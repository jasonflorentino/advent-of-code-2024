#! /usr/bin/env bash

if [ -z "$1" ];
  then 
    echo "Error: Expected a day number, like 07."
    exit 1;
  else echo "Setting up new day $1..."; 
fi

echo "Making day directory..."
mkdir $1

echo "Creating files..."
cd $1
touch input
touch test
cp ../template.mjs index.mjs

cd ..
echo "Done!"