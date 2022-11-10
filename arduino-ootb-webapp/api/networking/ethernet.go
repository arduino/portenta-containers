package networking

func GetEthernetConnection() (*Connection, error) {
	return GetConnection("802-3-ethernet")
}
