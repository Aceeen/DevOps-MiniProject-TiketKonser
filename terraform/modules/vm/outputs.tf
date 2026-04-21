output "lb_public_ip" {
  description = "Public IP address of Load Balancer"
  value       = azurerm_public_ip.lb.ip_address
}

output "lb_private_ip" {
  description = "Private IP of Load Balancer"
  value       = "10.0.1.4"
}

output "worker_private_ips" {
  description = "Private IPs of all 4 worker nodes"
  value = {
    "wk-01-frontend" = try(azurerm_network_interface.workers[0].private_ip_address, "")
    "wk-02-backend"  = try(azurerm_network_interface.workers[1].private_ip_address, "")
  }
}
