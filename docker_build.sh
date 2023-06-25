
#!/bin/bash
echo "$1"
tag="latest"
if [ "$2" ]; then
    tag="$2"
fi
echo "$tag"
echo "$3"
git pull
git submodule update --init --recursive
docker build -t $1 -f docker/Dockerfile  .
docker tag $1:latest $3/$1:$tag
docker push $3/$1:$tag
