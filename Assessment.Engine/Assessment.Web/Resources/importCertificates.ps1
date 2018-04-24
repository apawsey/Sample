$pfxPassword = ConvertTo-SecureString -String "FreedomDev" -Force -AsPlainText

# import the pfx certificate
Import-PfxCertificate -FilePath ./localhost.pfx Cert:\LocalMachine\My -Password $pfxPassword -Exportable

# trust the certificate by importing the pfx certificate into your trusted root
Import-Certificate -FilePath ./localhost.cer -CertStoreLocation Cert:\CurrentUser\Root