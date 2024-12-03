#! /usr/bin/env bash

if [ -z "$1" ];
  then 
    echo "Error: Expected a day number, like 07."
    exit 1;
  else echo "testing $1..."; 
fi

cd $1
node index.mjs test 
cd ..