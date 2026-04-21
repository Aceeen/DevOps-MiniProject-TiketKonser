output "lb_public_ip" {
  description = "Public IP address of Load Balancer"
  value       = module.vm.lb_public_ip
}

output "lb_private_ip" {
  description = "Private IP of Load Balancer"
  value       = "10.0.1.4"
}

output "worker_private_ips" {
  description = "Private IPs of all worker nodes"
  value       = module.vm.worker_private_ips
}
