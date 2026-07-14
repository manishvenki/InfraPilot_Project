resource "docker_network" "infrapilot_network" {
  name = var.network_name
}

resource "docker_volume" "infrapilot_volume" {
  name = var.volume_name
}