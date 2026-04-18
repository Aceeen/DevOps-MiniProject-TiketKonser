module "network" {
  source          = "./modules/network"
  project_name    = var.project_name
  location        = var.location
  admin_source_ip = var.admin_source_ip
}

module "vm" {
  source              = "./modules/vm"
  project_name        = var.project_name
  location            = var.location
  vm_size             = var.vm_size
  admin_username      = var.admin_username
  ssh_public_key_path = var.ssh_public_key_path
  subnet_id           = module.network.subnet_id
  resource_group_name = module.network.resource_group_name
}
