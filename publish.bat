@echo off
set /p msg="Enter git commit message: "
@echo on

git add .
git commit -m "%msg%"
git push

@REM yarn deploy

@echo off
echo.
echo DONE!
echo.
set /p pid="<< TO EXIT, PRESS ANY KEY OR CLOSE THE TERMINAL >>"

