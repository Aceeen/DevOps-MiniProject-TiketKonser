variable "project_name" {
  description = "Prefix for all resource names"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "admin_source_ip" {
  description = "Admin IP for SSH access (use /32 CIDR)"
  type        = string
  sensitive   = true
}
