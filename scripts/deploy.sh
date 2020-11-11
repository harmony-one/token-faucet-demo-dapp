#!/usr/bin/env bash

usage() {
   cat << EOT
Usage: $0 [option] command
Options:
   --method     method      what method to use for deployment (truffle or harmony)
   --network    network     what network to deploy to (testnet or mainnet)
   --reset                  if truffle should be run with --reset
   --help                   print this help
EOT
}

while [ $# -gt 0 ]
do
  case $1 in
  --method) method="${2}" ; shift;;
  --network) network="${2}" ; shift;;
  --reset) reset=true;;
  --skip-dry-run) skip_dry_run=true;;
  -h|--help) usage; exit 1;;
  (--) shift; break;;
  (-*) usage; exit 1;;
  (*) break;;
  esac
  shift
done

set_defaults() {  
  if [ -z "$method" ]; then
    method="harmony"
  fi
  
  if [ -z "$network" ]; then
    network="testnet"
  fi
  
  if [ -z "$reset" ]; then
    reset=false
  fi

  if [ -z "$skip_dry_run" ]; then
    skip_dry_run=false
  fi
}

truffle_deployment() {
  reset_command=""
  if [ "$reset" = true ]; then
    reset_command="--reset"
  fi

  skip_dry_run_command=""
  if [ "$skip_dry_run" = true ]; then
    skip_dry_run_command="--skip-dry-run"
  fi

  echo "Deploying using truffle - command: truffle migrate --network $network $reset_command $skip_dry_run_command"
  truffle migrate --network $network $reset_command $skip_dry_run_command
}

harmony_deployment() {
  echo "Deploying using harmony-js/core - network: ${network}"
  node tools/deployment/deploy.js --network $network
}

deploy() {
  set_defaults

  if [ "$method" = "harmony" ]; then
    harmony_deployment
  else
    truffle_deployment
  fi
}

deploy
