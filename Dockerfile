# 使用 Node.js 官方镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 weiqi-dashboard 目录下的 package 文件
COPY weiqi-dashboard/package.json weiqi-dashboard/package-lock.json ./

# 安装所有依赖
RUN npm install

# 复制 weiqi-dashboard 目录的所有文件
COPY weiqi-dashboard/ .

# 构建 Next.js 应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "start"]
