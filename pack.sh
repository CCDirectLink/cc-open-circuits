#!/bin/sh
set -e
# BASE_NAME="$(jq '.id' ccmod.json | sed 's/^"//;s/"$//')"
BASE_NAME="cc-open-circuits"
NAME="${BASE_NAME}-$(jq '.version' ccmod.json | sed 's/^"//;s/"$//').ccmod"
rm -rf "$BASE_NAME"*
mkdir -p pack

cp -rf *.js assets ./pack

cd ./pack
for file in $(find . -iname '*.json') $(find . -iname '*.json.patch') $(find . -iname '*.json.patch.cond'); do
    jq '.' ../$file -c > $file
done
cp ../ccmod.json .
zip -r "../$NAME" .
cd ..
rm -rf pack
