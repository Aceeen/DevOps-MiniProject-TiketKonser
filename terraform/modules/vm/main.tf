# Public IP — hanya untuk Load Balancer
resource "azurerm_public_ip" "lb" {
  name                = "pip-lb-${var.project_name}"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags = {
    Project = var.project_name
    Role    = "loadbalancer"
  }
}

# Network Interface — Load Balancer (public + private IP)
resource "azurerm_network_interface" "lb" {
  name                = "nic-lb-${var.project_name}"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig-lb"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Static"
    private_ip_address            = "10.0.1.4"
    public_ip_address_id          = azurerm_public_ip.lb.id
  }
}

# Virtual Machine — Load Balancer
resource "azurerm_linux_virtual_machine" "lb" {
  name                = "vm-lb-${var.project_name}"
  location            = var.location
  resource_group_name = var.resource_group_name
  size                = var.vm_size
  admin_username      = var.admin_username

  network_interface_ids = [azurerm_network_interface.lb.id]

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 30
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  tags = {
    Role    = "loadbalancer"
    Project = var.project_name
  }
}

# Network Interface — Worker Nodes (private IP only, TANPA public IP)
resource "azurerm_network_interface" "workers" {
  count               = 4
  name                = "nic-worker-${count.index + 1}-${var.project_name}"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig-worker-${count.index + 1}"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Static"
    # WK-01: 10.0.1.10, WK-02: 10.0.1.11, WK-03: 10.0.1.20, WK-04: 10.0.1.21
    private_ip_address = count.index < 2 ? "10.0.1.${count.index + 10}" : "10.0.1.${count.index + 18}"
  }
}

# Virtual Machine — 4 Worker Nodes
resource "azurerm_linux_virtual_machine" "workers" {
  count               = 4
  name                = "vm-worker-${count.index + 1}-${var.project_name}"
  location            = var.location
  resource_group_name = var.resource_group_name
  size                = var.vm_size
  admin_username      = var.admin_username

  network_interface_ids = [azurerm_network_interface.workers[count.index].id]

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 30
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  tags = {
    Role    = count.index < 2 ? "frontend" : "backend"
    Project = var.project_name
  }
}
