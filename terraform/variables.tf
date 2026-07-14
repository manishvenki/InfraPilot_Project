variable "network_name" {
  description = "Docker network name"
  type        = string
  default     = "infrapilot-network"
}

variable "volume_name" {
  description = "Docker volume name"
  type        = string
  default     = "infrapilot-db"
}

variable "frontend_image" {
  default = "infrapilot-frontend:latest"
}

variable "backend_image" {
  default = "infrapilot-backend:latest"
}

variable "nginx_image" {
  default = "infrapilot-nginx:latest"
}