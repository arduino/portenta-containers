package firmware

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"x8-ootb/utils"

	"github.com/inconshreveable/log15"
)

type WriteCounter struct {
	Progress   uint64
	Percentage *float64
	Total      uint64
}

func (wc *WriteCounter) Write(p []byte) (int, error) {
	n := len(p)
	wc.Progress += uint64(n)
	*wc.Percentage = (float64(wc.Progress) / float64(wc.Total)) * 100
	// fmt.Println("Download -", *wc.Percentage)

	return n, nil
}

func DownloadVersion(url string, percentage *float64, md5Error *error, untarError *error, status *string, md5 string) {
	err := DownloadFile("update-latest.tar.gz", url, percentage)
	if err != nil {
		log15.Error("Download update error", "url", url, "err", err)
		return
	}

	*status = "md5"
	out, err := utils.ExecSh("md5 -q update-latest.tar.gz")
	if err != nil {
		log15.Error("Checking md5 error", "err", err)
		return
	}

	trimmedOut := out[0:32]
	if trimmedOut != md5 {
		log15.Error("md5 mismatch", "err", err, "out", out, "trimmedOut", trimmedOut, "md5", md5)
		*md5Error = err
		return
	}

	*status = "tar"
	_, err = utils.ExecSh("tar xzf update-latest.tar.gz")
	if err != nil {
		log15.Error("Untar file error", "err", err)
		*untarError = err
		return
	}

	*status = "dbus"
	dbusOut, err := utils.ExecSh("gdbus call --system --dest org.freedesktop.systemd1 --object-path /org/freedesktop/systemd1 --method org.freedesktop.systemd1.Manager.StartUnit \"offline-update.service\" \"fail\"")
	if err != nil {
		log15.Error("Sending data via DBus error", "err", err, "dbusOut", dbusOut)
		return
	}

	*status = "Completed"
}

func DownloadFile(filepath string, url string, percentage *float64) error {
	out, err := os.Create(filepath + ".tmp")
	if err != nil {
		return err
	}

	resp, err := http.Get(url)
	if err != nil {
		out.Close()
		return err
	}
	defer resp.Body.Close()

	counter := &WriteCounter{
		Percentage: percentage,
		Total:      uint64(resp.ContentLength),
	}
	if _, err = io.Copy(out, io.TeeReader(resp.Body, counter)); err != nil {
		out.Close()
		return err
	}

	fmt.Print("\n")

	out.Close()

	if err = os.Rename(filepath+".tmp", filepath); err != nil {
		return err
	}
	return nil
}
