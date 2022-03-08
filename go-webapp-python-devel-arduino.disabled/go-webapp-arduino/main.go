package main

import (
	"fmt"
	"log"
	"net/http"
)

var (
	soc = newSoc()
)

func main() {
	fmt.Println("Hello world")

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("./web")))
	mux.HandleFunc("/wifi", handleWiFi)
	mux.Handle("/socket.io/", soc)

	go soc.Serve()
	defer soc.Close()

	server := http.Server{Addr: ":8000", Handler: mux}
	log.Fatal(server.ListenAndServe())
}
