@echo off
REM MongoDB Backup Script for Windows
REM Usage: backup-db.bat

setlocal enabledelayedexpansion

REM Tạo folder backups nếu chưa có
if not exist "backups" mkdir backups

REM Tạo tên backup với timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_NAME=backup-%datetime:~0,8%-%datetime:~8,6%
set BACKUP_PATH=backups\%BACKUP_NAME%

echo 🔄 Đang backup MongoDB...
echo.

REM Backup trong container
docker exec ecomnodejs-mongodb-1 mongodump --db ecommerce --out /dump/%BACKUP_NAME%

REM Copy ra máy host
docker cp ecomnodejs-mongodb-1:/dump/%BACKUP_NAME% %BACKUP_PATH%

REM Xóa dump trong container
docker exec ecomnodejs-mongodb-1 rm -rf /dump/%BACKUP_NAME%

echo.
echo ✅ Backup thành công: %BACKUP_PATH%
echo.

REM Hiển thị thông tin backup
echo 📊 Backup info:
dir /s %BACKUP_PATH%\ecommerce

echo.
echo 📁 Danh sách backups hiện có:
dir /b backups

echo.
echo ✨ Hoàn tất!
echo.
echo Để restore backup này:
echo   docker cp %BACKUP_PATH% ecomnodejs-mongodb-1:/dump/
echo   docker exec ecomnodejs-mongodb-1 mongorestore --db ecommerce --drop /dump/%BACKUP_NAME%/ecommerce

pause

