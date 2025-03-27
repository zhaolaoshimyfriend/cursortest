<template>
  <footer class="footer">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12">
        <div class="contact-info">
          <h3>联系我们</h3>
          <p>张三</p>
          <p>邮箱：contact@example.com</p>
          <div>
            <p>微信扫码添加：</p>
            <img src="https://via.placeholder.com/120x120/000000/FFFFFF?text=微信二维码" alt="微信二维码" class="qr-code">
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="24" :md="12">
        <div class="external-links">
          <h3>相关链接</h3>
          <a href="https://www.cursor.com/cn" target="_blank">Cursor 官网</a>
          <a href="#" target="_blank">开发者社区</a>
          <a href="#" target="_blank">学习资源</a>
          <a href="#" target="_blank">API 文档</a>
          <a href="#" target="_blank">常见问题</a>
        </div>
      </a-col>
    </a-row>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  background-color: #050505; /* 比主色稍深一点 */
  color: var(--text-color);
  padding: 60px 50px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-info {
  margin-bottom: 30px;
}

.contact-info h3 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.qr-code {
  width: 120px;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 5px;
  background-color: #000;
}

.external-links h3 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.external-links a {
  display: block;
  color: var(--text-color);
  margin-bottom: 10px;
  transition: color 0.3s;
}

.external-links a:hover {
  color: var(--primary-color);
}

@media screen and (max-width: 768px) {
  .footer {
    padding: 40px 20px;
  }
  
  .contact-info, .external-links {
    text-align: center;
  }
}
</style> 