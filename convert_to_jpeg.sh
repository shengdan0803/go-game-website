#!/bin/bash
# 图片格式转换工具 - 转换为 JPEG

if [ $# -eq 0 ]; then
    echo "使用方法: $0 <输入图片>"
    echo "示例: $0 图片.png"
    exit 1
fi

INPUT="$1"
if [ ! -f "$INPUT" ]; then
    echo "错误: 文件 '$INPUT' 不存在"
    exit 1
fi

# 获取文件名（不含扩展名）
FILENAME=$(basename "$INPUT")
NAME="${FILENAME%.*}"
DIR=$(dirname "$INPUT")

# 输出文件名
OUTPUT="${DIR}/${NAME}.jpg"

echo "正在转换: $INPUT -> $OUTPUT"

# 使用 sips (macOS 系统自带工具) 转换
sips -s format jpeg -s formatOptions 90 "$INPUT" --out "$OUTPUT"

if [ $? -eq 0 ]; then
    echo "✅ 转换成功！"
    echo "输出文件: $OUTPUT"
    ls -lh "$OUTPUT"
else
    echo "❌ 转换失败"
    exit 1
fi
