package networking

type Network struct {
	SSID     string `json:"ssid"`
	BSSID    string `json:"bssid"`
	Signal   uint8  `json:"signal"`
	Security string `json:"security"`
}

type Connection struct {
	Connected     bool   `json:"connected"`
	Network       string `json:"network"`
	CidrIpv4      string `json:"cidrIpv4"`
	Ip            string `json:"ip"`
	Subnet        string `json:"subnet"`
	MAC           string `json:"mac"`
	Gateway       string `json:"gateway"`
	PreferredDns  string `json:"preferredDns"`
	AlternateDns  string `json:"alternateDns"`
	IsDhcp        bool   `json:"isDhcp"`
	IgnoreAutoDns bool   `json:"ignoreAutoDns"`
}

type EthConnection struct {
	IP           *string `json:"ip"`
	Subnet       *string `json:"subnet"`
	Gateway      *string `json:"gateway"`
	PreferredDns *string `json:"preferredDns"`
	AlternateDns *string `json:"alternateDns"`
}

type ModemConnection struct {
	State            string `json:"connected"`
	IP               string `json:"ip"`
	AccessTechnology string `json:"accessTechnology"`
	LocationInfo     string `json:"locationInfo"`
	Carrier          string `json:"carrier"`
	SerialNumber     string `json:"serialNumber"`
	RxPower          string `json:"rxPower"`
	Quality          string `json:"quality"`
	OperatorName     string `json:"operatorName"`
	UnlockRetries    uint32 `json:"unlockRetries"`
}
type ModemConnectionPayload struct {
	Apn      string  `json:"apn"`
	Pin      *string `json:"pin"`
	Username *string `json:"username"`
	Password *string `json:"password"`
}
