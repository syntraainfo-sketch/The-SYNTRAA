# Clears cached GitHub HTTPS credentials so the next `git push` can sign in as the
# correct user (e.g. syntraainfo-sketch) instead of a stale account like Anus-dev843
# (403: Permission denied).
#
# Usage (from repo root, PowerShell):
#   .\scripts\clear-github-https-credentials.ps1
# Then:
#   git push -u origin main
#
# If `origin` already exists, never use `git remote add origin` again — use:
#   git remote set-url origin https://github.com/OWNER/REPO.git

$ErrorActionPreference = "Continue"
$inputBlock = "protocol=https`nhost=github.com`n`n"

function Try-Erase([string]$exe) {
  if (-not (Get-Command $exe -ErrorAction SilentlyContinue)) { return $false }
  $inputBlock | & $exe erase 2>$null
  return $true
}

$cleared = $false
foreach ($name in @("git-credential-manager", "git-credential-manager-core", "credential-manager")) {
  if (Try-Erase $name) { $cleared = $true; break }
}

# Git's generic helper (some installs)
if (-not $cleared) {
  $inputBlock | git credential reject 2>$null
  if ($LASTEXITCODE -eq 0) { $cleared = $true }
}

if ($cleared) {
  Write-Host "GitHub HTTPS credentials cleared (or erase attempted). Next push should prompt for login." -ForegroundColor Green
} else {
  Write-Host "Automatic erase did not run. Manually remove GitHub entries:" -ForegroundColor Yellow
  Write-Host "  Control Panel -> Credential Manager -> Windows Credentials -> remove github.com" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Then run: git push -u origin main" -ForegroundColor Cyan
Write-Host "Use a Personal Access Token as the password if GitHub asks (HTTPS)." -ForegroundColor Cyan
