variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  sensitive   = true
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "Southeast Asia"
}

variable "project_name" {
  description = "Prefix for all resource names"
  type        = string
  default     = "ticketing"
}

variable "vm_size" {
  description = "Azure VM size for all nodes"
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "Admin username for all VMs"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "~/.ssh/ticketing_key.pub"
}

variable "admin_source_ip" {
  description = "Your public IP for SSH access (format: x.x.x.x/32)"
  type        = string
  sensitive   = true
}
