<template>
  <div class="admin-wrapper">
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <h2>管理后台</h2>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-item" :class="{ active: $route.path === '/admin' }">
          <router-link to="/admin">
            <i class="icon-dashboard"></i>主页
          </router-link>
        </li>
        <template v-if="token">
          <li class="menu-item" :class="{ active: $route.path === '/admin/console' }">
            <router-link to="/admin/console">
              <i class="icon-console"></i>控制台
            </router-link>
          </li>
          <li class="menu-item" :class="{ active: $route.path === '/admin/book_manage' }">
            <router-link to="/admin/book_manage">
              <i class="icon-book"></i>小说管理
            </router-link>
          </li>
          <li class="menu-item" :class="{ active: $route.path === '/admin/book_audit' }">
            <router-link to="/admin/book_audit">
              <i class="icon-audit"></i>小说审核
            </router-link>
          </li>
          <li class="menu-item" :class="{ active: $route.path === '/admin/comment_manage' }">
            <router-link to="/admin/comment_manage">
              <i class="icon-comment"></i>评论管理
            </router-link>
          </li>
        </template>
      </ul>
    </div>
    <div class="admin-main">
      <div class="admin-header">
        <div class="header-left">
          <span class="admin-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <a v-if="!token" class="admin-login-btn" href="javascript:void(0)" @click="showLoginDialog">管理员登入</a>
          <span v-if="token" class="admin-user-info">
            <span class="admin-nick">{{ nickName }}</span>
            <a class="admin-logout" href="javascript:void(0)" @click="handleLogout">退出</a>
          </span>
          <a class="back-home" href="/#/home">返回前台</a>
        </div>
      </div>
      <div class="admin-content">
        <router-view />
      </div>
    </div>

    <!-- 管理员登入弹窗 -->
    <el-dialog
      v-model="loginVisible"
      title="管理员登入"
      width="400px"
      :close-on-click-modal="false"
      center
    >
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="loginVisible = false">取消</el-button>
        <el-button type="primary" :loading="loginLoading" @click="handleLogin">登入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { adminLogin } from "@/api/admin";
import {
  getAdminToken, getAdminNickName,
  setAdminToken, setAdminNickName, setAdminUid,
  removeAdminToken, removeAdminNickName, removeAdminUid,
} from "@/utils/auth";

const titles = {
  adminDashboard: "主页",
  adminConsole: "控制台",
  adminBookManage: "小说管理",
  adminBookAudit: "小说审核",
  adminCommentManage: "评论管理",
};

export default {
  name: "adminLayout",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const pageTitle = computed(() => titles[route.name] || "管理后台");
    const token = ref(getAdminToken());
    const nickName = ref(getAdminNickName());

    const loginVisible = ref(false);
    const loginLoading = ref(false);
    const loginFormRef = ref(null);
    const loginForm = reactive({ username: "", password: "" });
    const loginRules = {
      username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
      password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    };

    const showLoginDialog = () => {
      loginForm.username = "";
      loginForm.password = "";
      loginVisible.value = true;
    };

    const handleLogin = async () => {
      const valid = await loginFormRef.value?.validate().catch(() => false);
      if (!valid) return;
      loginLoading.value = true;
      try {
        const res = await adminLogin({
          username: loginForm.username,
          password: loginForm.password,
        });
        const data = res?.data || res;
        if (data.token) {
          setAdminToken(data.token);
          setAdminNickName(data.name || data.nickName || loginForm.username);
          setAdminUid(data.uid || "");
          token.value = data.token;
          nickName.value = data.name || data.nickName || loginForm.username;
          ElMessage.success("管理员登入成功");
          loginVisible.value = false;
        }
      } catch {
        /* 登录接口的错误已由拦截器提示 */
      } finally {
        loginLoading.value = false;
      }
    };

    const handleLogout = () => {
      removeAdminToken();
      removeAdminNickName();
      removeAdminUid();
      token.value = "";
      nickName.value = "";
      router.push({ name: "adminDashboard" });
    };

    return {
      pageTitle, token, nickName,
      loginVisible, loginLoading, loginFormRef, loginForm, loginRules,
      showLoginDialog, handleLogin, handleLogout,
    };
  },
};
</script>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 220px;
  background: #304156;
  color: #bfcbd9;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 10;
}
.sidebar-header {
  padding: 22px 20px 18px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar-header h2 {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 2px;
}
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}
.menu-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.menu-item a,
.menu-item a:link,
.menu-item a:visited {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  color: #bfcbd9;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}
.menu-item a i {
  width: 18px;
  height: 18px;
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}
.menu-item a:hover,
.menu-item.active a,
.menu-item .router-link-active {
  background: #263445;
  color: #fff;
}
.menu-item.active .router-link-active {
  border-left: 3px solid #409eff;
  padding-left: 21px;
}

.admin-main {
  flex: 1;
  background: #f0f2f5;
  margin-left: 220px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.admin-header {
  height: 52px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 5;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.admin-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.admin-login-btn {
  font-size: 13px;
  color: #fff;
  text-decoration: none;
  padding: 5px 14px;
  background: #f80;
  border-radius: 4px;
  transition: all 0.2s;
}
.admin-login-btn:hover {
  background: #e67300;
  color: #fff;
}
.admin-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}
.admin-nick {
  color: #333;
}
.admin-logout {
  color: #999;
  text-decoration: none;
  font-size: 12px;
}
.admin-logout:hover {
  color: #f56c6c;
}
.back-home {
  font-size: 13px;
  color: #409eff;
  text-decoration: none;
  padding: 5px 12px;
  border: 1px solid #409eff;
  border-radius: 4px;
  transition: all 0.2s;
}
.back-home:hover {
  background: #409eff;
  color: #fff;
}

.admin-content {
  padding: 20px 24px;
  flex: 1;
}
</style>
