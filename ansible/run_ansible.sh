#!/bin/bash
# Script ini untuk bypass issue "World Writable Directory" di WSL
# dengan meng-inject konfigurasi langsung via flag CLI / Environment Variables

export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_ROLES_PATH=./roles

echo "🚀 Memulai Deployment ke Azure..."
ansible-playbook -i inventory/hosts.ini playbooks/site.yml \
  -u azureuser \
  --private-key ~/.ssh/ticketing_key \
  -b
