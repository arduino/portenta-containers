package networking

type Network struct {
	SSID     string `json:"ssid"`
	Signal   int    `json:"signal"`
	Security string `json:"security"`
}

type Connection struct {
	Connected bool   `json:"connected"`
	Network   string `json:"network"`
	IP        string `json:"ip"`
	MAC       string `json:"mac"`
	Gateway   string `json:"gateway"`
}
