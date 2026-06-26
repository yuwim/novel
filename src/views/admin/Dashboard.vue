<template>
  <div class="home-page">
    <div class="welcome-section">
      <h2>欢迎回来，{{ nickName || '管理员' }}</h2>
      <p class="welcome-desc">您可以通过下方快捷入口快速进入各项管理功能</p>
    </div>

    <div class="quick-nav-cards">
      <router-link to="/admin/book_manage" class="nav-card card-blue">
        <div class="nav-icon">📚</div>
        <div class="nav-info">
          <h4>小说管理</h4>
          <p>查看、编辑、新增小说信息</p>
        </div>
      </router-link>
      <router-link to="/admin/book_audit" class="nav-card card-green">
        <div class="nav-icon">✅</div>
        <div class="nav-info">
          <h4>小说审核</h4>
          <p>审核待上架的小说内容</p>
        </div>
      </router-link>
      <a href="javascript:void(0)" class="nav-card card-orange">
        <div class="nav-icon">👥</div>
        <div class="nav-info">
          <h4>用户管理</h4>
          <p>管理注册用户及权限</p>
        </div>
      </a>
      <router-link to="/admin/comment_manage" class="nav-card card-purple">
        <div class="nav-icon">💬</div>
        <div class="nav-info">
          <h4>评论管理</h4>
          <p>审核及管理用户评论</p>
        </div>
      </router-link>
    </div>

    <div class="bottom-panels">
      <div class="panel">
        <div class="panel-header"><h3>系统信息</h3></div>
        <div class="panel-body">
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">系统版本</span>
              <span class="info-value">v2.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">前端框架</span>
              <span class="info-value">Vue 3 + Element Plus</span>
            </div>
            <div class="info-item">
              <span class="info-label">运行环境</span>
              <span class="info-value">{{ runtime }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><h3>快捷操作</h3></div>
        <div class="panel-body">
          <ul class="quick-links">
            <li><a href="/#/home" target="_blank">预览前台首页</a></li>
            <li><a href="/#/bookclass">浏览全部分类</a></li>
            <li><a href="/#/book_rank">查看排行榜</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { getNickName } from "@/utils/auth";

export default {
  name: "adminDashboard",
  setup() {
    const nickName = computed(() => getNickName());
    const runtime = navigator.userAgent.includes("Windows") ? "Windows" : navigator.platform || "Unknown";

    return { nickName, runtime };
  },
};
</script>

<style scoped>
.home-page {
  max-width: 960px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 28px;
}
.welcome-section h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1f2a44;
  margin-bottom: 8px;
}
.welcome-desc {
  font-size: 14px;
  color: #999;
}

.quick-nav-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.nav-card {
  background: #fff;
  border-radius: 10px;
  padding: 28px 20px;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}
.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
.nav-icon {
  font-size: 36px;
  margin-bottom: 14px;
}
.nav-info h4 {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}
.nav-info p {
  font-size: 12px;
  color: #aaa;
  line-height: 1.5;
}

.bottom-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.panel-header h3 {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.panel-body {
  padding: 16px 20px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info-label {
  font-size: 13px;
  color: #999;
}
.info-value {
  font-size: 13px;
  color: #333;
}

.quick-links {
  list-style: none;
  padding: 0;
  margin: 0;
}
.quick-links li {
  padding: 8px 0;
}
.quick-links li a {
  font-size: 13px;
  color: #409eff;
  text-decoration: none;
}
.quick-links li a:hover {
  color: #66b1ff;
}
</style>
