// 这个文件用于生成占位图像资源
// 在正式环境中，应该替换为实际的图像资源

// 创建base64格式的占位图像
const createPlaceholderImage = (width, height, color, text) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // 填充背景
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 添加文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  return canvas.toDataURL('image/png');
};

// 导出占位图像资源
export default {
  logo: createPlaceholderImage(120, 32, '#171936', 'LOGO'),
  videoPoster: createPlaceholderImage(800, 450, '#171936', '视频封面'),
  webProject1: createPlaceholderImage(400, 200, '#0E65F2', '智能编辑平台'),
  webProject2: createPlaceholderImage(400, 200, '#171936', '数据可视化工具'),
  webProject3: createPlaceholderImage(400, 200, '#0E65F2', '云端开发环境'),
  miniprogram1: createPlaceholderImage(400, 200, '#171936', '智能笔记助手'),
  miniprogram2: createPlaceholderImage(400, 200, '#0E65F2', '效率工作台'),
  miniprogram3: createPlaceholderImage(400, 200, '#171936', '技术学习助手'),
  miniprogramQRCode1: createPlaceholderImage(200, 200, '#FFFFFF', '小程序二维码1'),
  miniprogramQRCode2: createPlaceholderImage(200, 200, '#FFFFFF', '小程序二维码2'),
  miniprogramQRCode3: createPlaceholderImage(200, 200, '#FFFFFF', '小程序二维码3'),
  beginner1: createPlaceholderImage(400, 300, '#0E65F2', '小白指南 1'),
  beginner2: createPlaceholderImage(400, 300, '#171936', '小白指南 2'),
  beginner3: createPlaceholderImage(400, 300, '#0E65F2', '小白指南 3'),
  advanced1: createPlaceholderImage(400, 300, '#171936', '高级指南 1'),
  advanced2: createPlaceholderImage(400, 300, '#0E65F2', '高级指南 2'),
  advanced3: createPlaceholderImage(400, 300, '#171936', '高级指南 3'),
  qrcode: createPlaceholderImage(120, 120, '#FFFFFF', '微信二维码')
}; 