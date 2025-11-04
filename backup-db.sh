#!/bin/bash
# MongoDB Backup Script
# Sử dụng: ./backup-db.sh

# Tạo folder backups nếu chưa có
mkdir -p ./backups

# Tạo tên backup với timestamp
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="./backups/$BACKUP_NAME"

echo "🔄 Đang backup MongoDB..."

# Backup trong container
docker exec ecomnodejs-mongodb-1 mongodump \
  --db ecommerce \
  --out /dump/$BACKUP_NAME

# Copy ra máy host
docker cp ecomnodejs-mongodb-1:/dump/$BACKUP_NAME $BACKUP_PATH

# Xóa dump trong container
docker exec ecomnodejs-mongodb-1 rm -rf /dump/$BACKUP_NAME

echo "✅ Backup thành công: $BACKUP_PATH"
echo ""
echo "📊 Backup info:"
du -sh $BACKUP_PATH
ls -lh $BACKUP_PATH/ecommerce/

# Giữ chỉ 7 backups gần nhất
echo ""
echo "🧹 Dọn dẹp backups cũ (giữ 7 gần nhất)..."
ls -t ./backups | tail -n +8 | xargs -I {} rm -rf ./backups/{}

echo ""
echo "📁 Danh sách backups hiện có:"
ls -lh ./backups/

echo ""
echo "✨ Hoàn tất!"
echo ""
echo "Để restore backup này:"
echo "  docker cp $BACKUP_PATH ecomnodejs-mongodb-1:/dump/"
echo "  docker exec ecomnodejs-mongodb-1 mongorestore --db ecommerce --drop /dump/$BACKUP_NAME/ecommerce"

