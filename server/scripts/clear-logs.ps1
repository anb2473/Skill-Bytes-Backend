$original_path = Get-Location

while (-not (test-path "./logs")) {
    cd ..
}

cd ./logs

Remove-Item *.log

cd $original_path
