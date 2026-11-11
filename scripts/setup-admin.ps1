$ErrorActionPreference = 'Stop'
$OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$adminEmail = Read-Host 'Correo de la nueva cuenta de gestion'
$adminPassword = Read-Host 'Contrasena (12 caracteres como minimo)' -AsSecureString
$adminConfirm = Read-Host 'Repite la contrasena' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword)
$confirmPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminConfirm)
try {
  $passwordText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  $confirmText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($confirmPointer)
  if ($passwordText -cne $confirmText) { throw 'Las contrasenas no coinciden.' }
  $passwordText | node server/admin.mjs $adminEmail
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la cuenta de gestion.' }
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($confirmPointer)
  $passwordText = $null
  $confirmText = $null
}
