@echo off
set /p msg="Enter git commit message: "
@echo on

git add .
git commit -m "%msg%"
git push

@REM yarn deploy

echo
echo Done!
