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
	CidrIpv4     string `json:"cidrIpv4"`
	Ip           string `json:"ip"`
	Subnet       string `json:"subnet"`
	MAC          string `json:"mac"`
	Gateway      string `json:"gateway"`
	PreferredDns string `json:"preferredDns"`
	AlternateDns string `json:"alternateDns"`
	IsDhcp       bool   `json:"isDhcp"`
}

type EthConnection struct {
	IP           *string `json:"ip"`
	Subnet       *string `json:"subnet"`
	Gateway      *string `json:"gateway"`
	PreferredDns *string `json:"preferredDns"`
	AlternateDns *string `json:"alternateDns"`
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

// `mmcli -m 0 --output-json`
type MmcliParser struct {
	Modem Modem `json:"modem"`
}
type Modem struct {
	Generic Generic `json:"generic"`
	Gpp     Gpp     `json:"3gpp"`
}
type Generic struct {
	AccessTechnologies []string      `json:"access-technologies"`
	SignalQuality      SignalQuality `json:"signal-quality"`
	DeviceIdentifier   string        `json:"device-identifier"`
}
type SignalQuality struct {
	Value string `json:"value"`
}
type Gpp struct {
	OperatorName string `json:"operator-name"`
	OperatorCode string `json:"operator-code"`
}
