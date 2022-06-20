#!/bin/bash
docker build --progress=plain --tag="$SWNDB_IMAGE" .
docker push "$SWNDB_IMAGE"