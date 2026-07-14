output "network_name" {
  value = docker_network.infrapilot_network.name
}

output "volume_name" {
  value = docker_volume.infrapilot_volume.name
}