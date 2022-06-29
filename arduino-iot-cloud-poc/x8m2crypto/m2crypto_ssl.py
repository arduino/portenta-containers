from M2Crypto import Engine, m2, BIO, SSL

ENGINE_PATH = "/usr/lib/engines-1.1/libpkcs11.so"
MODULE_PATH = "/usr/lib/libckteec.so.0"

def wrap_socket(sock_in, certfile, keyfile, pin, ca_certs=None, ciphers=None, engine_path=ENGINE_PATH, module_path=MODULE_PATH):
    Engine.load_dynamic_engine("pkcs11", engine_path)
    pkcs11 = Engine.Engine("pkcs11")
    pkcs11.ctrl_cmd_string("MODULE_PATH", module_path)
    pkcs11.ctrl_cmd_string("PIN", pin)
    pkcs11.init()
    key = pkcs11.load_private_key(keyfile)
    cert = pkcs11.load_certificate(certfile)

    ctx = SSL.Context('tls')
    ctx.set_default_verify_paths()
    ctx.set_allow_unknown_ca(False)
    if ciphers is not None:
        ctx.set_cipher_list(ciphers)
    if ca_certs is not None:
        if ctx.load_verify_locations(ca_certs) != 1:
            raise Exception('Failed to load CA certs')
        ctx.set_verify(SSL.verify_peer | SSL.verify_fail_if_no_peer_cert, depth=9)

    # Set key/cert
    m2.ssl_ctx_use_x509(ctx.ctx, cert.x509)
    m2.ssl_ctx_use_pkey_privkey(ctx.ctx, key.pkey)
    SSL.Connection.postConnectionCheck = None
    return SSL.Connection(ctx, sock=sock_in)
