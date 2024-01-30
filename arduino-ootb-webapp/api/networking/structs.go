package networking

type Network struct {
	SSID     string `json:"ssid"`
	BSSID    string `json:"bssid"`
	Signal   int    `json:"signal"`
	Security string `json:"security"`
}

type Connection struct {
	Connected    bool   `json:"connected"`
	Network      string `json:"network"`
	IP           string `json:"ip"`
	MAC          string `json:"mac"`
	Gateway      string `json:"gateway"`
	PreferredDns string `json:"preferredDns"`
	AlternateDns string `json:"alternateDns"`
}

type EthConnection struct {
	ConnectionName string  `json:"connectionName"`
	IP             *string `json:"ip"`
	Mask           *string `json:"mask"`
	Gateway        *string `json:"gateway"`
	PreferredDns   *string `json:"preferredDns"`
	AlternateDns   *string `json:"alternateDns"`
}

type ModemConnection struct {
	Connected      bool   `json:"connected"`
	IP             string `json:"ip"`
	AccessTecnlogy string `json:"accessTecnlogy"`
	SignalStrength string `json:"signalStrength"`
	SignalDetails  string `json:"signalDetails"`
	LocationInfo   string `json:"locationInfo"`
	Carrier        string `json:"carrier"`
	SerialNumber   string `json:"serialNumber"`
}
type ModemConnectionPayload struct {
	Apn      string  `json:"apn"`
	Pin      *string `json:"pin"`
	Username *string `json:"username"`
	Password *string `json:"password"`
}
