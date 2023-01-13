#!/usr/bin/python3

from argparse import ArgumentParser
import os
import subprocess
import sys
from tempfile import NamedTemporaryFile
from time import sleep
from typing import NamedTuple, Tuple
from uuid import uuid4

import requests


class Options(NamedTuple):
    factory: str
    sota_dir: str
    tag: str
    apps: str
    hwid: str
    uuid: str
    name: str
    production: bool


def create_key(uuid: str, factory: str, production: bool) -> Tuple[bytes, bytes]:
    key = subprocess.check_output(
        ["openssl", "ecparam", "-genkey", "-name", "prime256v1"]
    )

    with NamedTemporaryFile() as cnf:
        cnf.write(
            f"""[req]
prompt = no
distinguished_name = dn
req_extensions = ext

[dn]
CN={uuid}
OU={factory}
""".encode()
        )
        if production:
            cnf.write(b"businessCategory=production\n")
        cnf.write(
            b"""
[ext]
keyUsage=critical, digitalSignature
extendedKeyUsage=critical, clientAuth
"""
        )
        cnf.flush()

        r = subprocess.run(
            ["openssl", "req", "-new", "-config", cnf.name, "-key", "-"],
            input=key,
            stdout=subprocess.PIPE,
        )
        r.check_returncode()
    print("ANDY", r.stdout.decode())
    return key, r.stdout


def _get_oauth_token(factory: str, uuid: str):
    data = {"client_id": uuid}
    r = requests.post("https://app.foundries.io/oauth/authorization/device/", data=data)
    if r.status_code != 200:
        sys.exit(f"ERROR: HTTP_{r.status_code}: {r.text}")

    user_code = r.json()["user_code"]
    device_code = r.json()["device_code"]
    link = r.json()["verification_uri"]
    interval = r.json()["interval"]

    print(f"Active at {link} with code {user_code}")

    data = {
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "device_code": r.json()["device_code"],
        "client_id": uuid,
        "scope": factory + ":devices:create",
    }

    i = 0
    WHEELS = ["|", "/", "-", "\\"]
    while True:
        r = requests.post("https://app.foundries.io/oauth/token/", data=data)
        if r.status_code == 200:
            return r.json()["access_token"]
        if r.status_code == 400:
            if r.json().get("error") == "authorization_pending":
                sys.stdout.write(
                    "Waiting for authorization " + WHEELS[i % len(WHEELS)] + "\r"
                )
                sys.stdout.flush()
                i += 1
            else:
                sys.exit("Error authorizing device: " + r.json()["error_description"])
        else:
            print(f"ERROR: HTTP_{r.status_code}: {r.text}")
        sleep(interval)


def main(opts: Options):
    token = _get_oauth_token(opts.factory, opts.uuid)
    pkey, csr = create_key(opts.uuid, opts.factory, opts.production)
    data = {
        "name": opts.name,
        "uuid": opts.uuid,
        "csr": csr.decode(),
        "hardware-id": opts.hwid,
        "sota-config-dir": opts.sota_dir,
        "overrides": {
            "pacman": {
                "type": '"ostree+compose_apps"',
                "tags": '"' + opts.tag + '"',
                "compose_apps_root": os.path.join(opts.sota_dir, "compose-apps"),
            },
        },
    }

    if opts.apps:
        data["overrides"]["pacman"]["compose_apps"] = '"' + opts.apps + '"'  # type: ignore

    r = requests.post(
        "https://api.foundries.io/ota/devices/",
        json=data,
        headers={"Authorization": f"Bearer {token}"},
    )
    if r.status_code != 201:
        sys.exit("ERROR: HTTP_%d: %s" % (r.status_code, r.text))

    with open(os.path.join(opts.sota_dir, "pkey.pem"), "wb") as f:
        f.write(pkey)

    for k, v in r.json().items():
        with open(os.path.join(opts.sota_dir, k), mode="w") as f:  # type: ignore
            f.write(v)

    with open(os.path.join(opts.sota_dir, "curl"), "wb") as f:
        os.fchmod(f.fileno(), 0o755)
        f.write(
            f"""#!/bin/sh -e
cd {opts.sota_dir}
curl --cert client.pem --key pkey.pem --cacert root.crt $*""".encode()
        )


def get_parser() -> ArgumentParser:
    p = ArgumentParser(description="Example client to ease local testing")
    p.add_argument(
        "--factory", "-f", required=True, help="Name of factory to register device in"
    )
    p.add_argument("--production", action="store_true", help="Make 'production' cert")
    p.add_argument("--sota-dir", "-d", default="/var/sota", help="default=%(default)s")
    p.add_argument("--tag", "-t", default="master", help="default=%(default)s")
    p.add_argument("--apps", "-a")
    p.add_argument(
        "--hwid", "-i", default="intel-corei7-64", help="default=%(default)s"
    )
    p.add_argument("--uuid", "-u", help="Default value is a random uuid")
    p.add_argument("--name", "-n", help="Default value is the uuid")
    return p


if __name__ == "__main__":
    args = get_parser().parse_args()
    if not args.uuid:
        args.uuid = str(uuid4())
    if not args.name:
        args.name = args.uuid
    args.sota_dir = os.path.abspath(args.sota_dir)

    options = Options(
        factory=args.factory,
        sota_dir=args.sota_dir,
        tag=args.tag,
        apps=args.apps,
        hwid=args.hwid,
        uuid=args.uuid,
        name=args.name,
        production=args.production,
    )
    main(options)
