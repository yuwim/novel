<template>
  <AuthorHeader />
  <div class="main box_center cf">
    <div class="userBox cf">
      <div class="my_l">
        <ul class="log_list">
          <li>
            <router-link class="link_4" :to="{ name: 'authorBookList' }">小说管理</router-link>
          </li>
          <li>
            <router-link class="link_4 on" :to="{ name: 'authorAuditFeedback' }">审核反馈</router-link>
          </li>
        </ul>
      </div>
      <div class="my_r">
        <div class="my_bookshelf">
          <div class="title cf">
            <h2 class="fl">审核反馈</h2>
          </div>

          <!-- 筛选栏 -->
          <div class="filter-bar">
            <el-select v-model="filterStatus" placeholder="审核状态" clearable size="small" @change="handleFilterChange">
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="未通过" :value="2" />
            </el-select>
            <el-select v-if="activeTab === 'chapter'" v-model="filterBookId" placeholder="全部作品" clearable size="small" @change="handleFilterChange">
              <el-option v-for="b in bookList" :key="b.id" :label="b.bookName" :value="b.id" />
            </el-select>
          </div>

          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="作品审核" name="book" />
            <el-tab-pane label="章节审核" name="chapter" />
          </el-tabs>

          <div v-if="total === 0 && !loading" class="no_contet">
            暂无审核记录
          </div>

          <div v-else class="updateTable">
            <table cellpadding="0" cellspacing="0">
              <thead>
                <tr>
                  <th class="name">名称</th>
                  <th class="goread">审核状态</th>
                  <th class="chapter">审核意见</th>
                  <th class="time">提交时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in list" :key="item.id" @click="showDetail(item)" style="cursor: pointer">
                  <td class="name">
                    <span class="audit-name">{{ activeTab === 'book' ? item.bookName : item.chapterName }}</span>
                  </td>
                  <td class="goread">
                    <el-tag :type="statusTagType(item.auditStatus)" size="small">
                      {{ statusText(item.auditStatus) }}
                    </el-tag>
                  </td>
                  <td class="chapter">
                    <span class="feedback-msg" :class="{ 'reject-msg': item.auditStatus == 2 }">
                      {{ item.auditMessage || (item.auditStatus == 2 ? '未填写驳回原因' : '-') }}
                    </span>
                  </td>
                  <td class="time">{{ item.createTime || '-' }}</td>
                </tr>
              </tbody>
            </table>

            <el-pagination
              small
              layout="prev, pager, next"
              :background="true"
              :page-size="pageSize"
              :total="total"
              :current-page="pageNum"
              class="mt-4"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 详情弹窗 -->
  <el-dialog v-model="detailVisible" :title="activeTab === 'book' ? '作品审核详情' : '章节审核详情'" width="680px" :close-on-click-modal="false">
    <div v-if="detail" class="detail-wrap">
      <template v-if="activeTab === 'book'">
        <div class="d-row"><span class="d-label">作品名称</span><span>{{ detail.bookName }}</span></div>
        <div class="d-row"><span class="d-label">作者</span><span>{{ detail.authorName }}</span></div>
        <div class="d-row"><span class="d-label">分类ID</span><span>{{ detail.categoryId || '-' }}</span></div>
        <div class="d-row"><span class="d-label">简介</span><p class="d-desc">{{ detail.bookDesc || '无' }}</p></div>
      </template>
      <template v-else>
        <div class="d-row"><span class="d-label">章节名称</span><span>{{ detail.chapterName }}</span></div>
        <div class="d-row"><span class="d-label">所属书籍ID</span><span>{{ detail.bookId }}</span></div>
        <div class="d-row"><span class="d-label">作者</span><span>{{ detail.authorName }}</span></div>
        <div class="d-row"><span class="d-label">字数</span><span>{{ detail.wordCount || 0 }} 字</span></div>
        <div class="d-row"><span class="d-label">章节内容</span><pre class="d-content">{{ detail.chapterContent || '无' }}</pre></div>
      </template>
      <div class="d-divider"></div>
      <div class="d-row">
        <span class="d-label">审核状态</span>
        <el-tag :type="statusTagType(detail.auditStatus)" size="small">{{ statusText(detail.auditStatus) }}</el-tag>
      </div>
      <div class="d-row" v-if="detail.auditMessage">
        <span class="d-label">审核意见</span>
        <span class="d-feedback" :class="{ 'reject-msg': detail.auditStatus == 2 }">{{ detail.auditMessage }}</span>
      </div>
      <div class="d-row">
        <span class="d-label">提交时间</span><span>{{ detail.createTime || '-' }}</span>
      </div>
      <div class="d-row" v-if="detail.auditTime">
        <span class="d-label">审核时间</span><span>{{ detail.auditTime }}</span>
      </div>
      <div class="d-actions" v-if="detail.auditStatus == 2">
        <router-link
          v-if="activeTab === 'book'"
          class="btn_ora"
          :to="{ name: 'authorBookAdd' }"
        >重新提交作品</router-link>
        <router-link
          v-else
          class="btn_ora"
          :to="{ name: 'authorChapterAdd', query: { id: detail.bookId } }"
        >重新提交章节</router-link>
      </div>
    </div>
    <template #footer>
      <el-button @click="detailVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import "@/assets/styles/book.css";
import { reactive, toRefs, onMounted } from "vue";
import {
  listBookAudits, getBookAuditDetail,
  listChapterAudits, getChapterAuditDetail,
  listBooks,
} from "@/api/author";
import AuthorHeader from "@/components/author/Header.vue";

export default {
  name: "authorAuditFeedback",
  components: { AuthorHeader },
  setup() {
    const state = reactive({
      activeTab: "book",
      list: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      loading: false,
      filterStatus: null,
      filterBookId: null,
      bookList: [],
      detailVisible: false,
      detail: null,
    });

    const fetchListApi = () => (state.activeTab === "book" ? listBookAudits : listChapterAudits);
    const fetchDetailApi = () => (state.activeTab === "book" ? getBookAuditDetail : getChapterAuditDetail);

    const loadBooks = async () => {
      try {
        const res = await listBooks({ page: 1, size: 999 });
        const result = res?.data || res || {};
        state.bookList = result.list || [];
      } catch { state.bookList = []; }
    };

    const loadData = async () => {
      state.loading = true;
      try {
        const params = { page: state.pageNum, size: state.pageSize };
        if (state.filterStatus != null) params.auditStatus = state.filterStatus;
        if (state.activeTab === "chapter" && state.filterBookId) params.bookId = state.filterBookId;
        const res = await fetchListApi()(params);
        const result = res?.data || res || {};
        state.list = result.list || [];
        state.total = Number(result.total) || 0;
      } catch {
        state.list = [];
        state.total = 0;
      } finally {
        state.loading = false;
      }
    };

    const handleTabChange = () => {
      state.pageNum = 1;
      state.filterStatus = null;
      state.filterBookId = null;
      loadData();
    };

    const handleFilterChange = () => {
      state.pageNum = 1;
      loadData();
    };

    const handlePageChange = (page) => {
      state.pageNum = page;
      loadData();
    };

    const showDetail = async (item) => {
      try {
        const res = await fetchDetailApi()(item.id);
        state.detail = res?.data || res || item;
      } catch {
        state.detail = item;
      }
      state.detailVisible = true;
    };

    const statusText = (s) => ({ 0: "待审核", 1: "已通过", 2: "未通过" }[s] || "待审核");
    const statusTagType = (s) => ({ 0: "info", 1: "success", 2: "danger" }[s] || "info");

    onMounted(() => {
      loadBooks();
      loadData();
    });

    return {
      ...toRefs(state),
      handleTabChange, handleFilterChange, handlePageChange, showDetail,
      statusText, statusTagType,
    };
  },
};
</script>

<style scoped>
.filter-bar {
  display: flex; gap: 12px; margin-bottom: 8px;
}

.audit-name {
  font-weight: 500; color: #333;
  max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block;
}
.feedback-msg {
  color: #999;
  max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block;
}
.reject-msg { color: #f56c6c; font-weight: 500; }

/* 详情弹窗 */
.detail-wrap { padding: 4px 0; }
.d-row {
  display: flex; align-items: flex-start; margin-bottom: 12px; font-size: 14px;
}
.d-label { color: #999; min-width: 80px; flex-shrink: 0; }
.d-desc { color: #555; line-height: 1.7; margin: 0; flex: 1; }
.d-content {
  flex: 1; max-height: 260px; overflow-y: auto; background: #f8f9fa; padding: 10px 12px;
  border-radius: 6px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; word-break: break-word;
  margin: 0; font-family: inherit;
}
.d-feedback { font-size: 14px; }
.d-divider { border-top: 1px solid #eee; margin: 16px 0; }
.d-actions { margin-top: 16px; text-align: center; }

.btn_ora {
  display: inline-block; padding: 6px 20px; font-size: 13px;
  color: #f80; border: 1px solid #f80; border-radius: 4px; text-decoration: none;
  transition: all 0.2s;
}
.btn_ora:hover { background: #f80; color: #fff; }

.userBox {
  margin: 0 auto 50px; background: #fff; border-radius: 6px;
  border: 1px solid #e6ecf7; box-shadow: 0 12px 28px rgba(30, 52, 102, 0.1);
}
.my_l {
  width: 198px; float: left; font-size: 13px; padding-top: 20px;
}
.my_l li a {
  display: block; height: 42px; line-height: 42px; padding-left: 62px;
  border-left: 4px solid #fff; margin-bottom: 5px; color: #666;
}
.my_l li .on {
  background-color: #fafafa; border-left: 2px solid #f80; color: #000;
  border-radius: 0 2px 2px 0;
}
.my_l .link_4 { background-position: 32px -314px; }
.my_r {
  width: 739px; padding: 0 30px 30px; float: right;
  border-left: 1px solid #efefef; min-height: 470px;
}
.my_bookshelf .title { padding: 20px 0 15px; line-height: 30px; }
.my_bookshelf h2 { font-size: 18px; font-weight: normal; }
.updateTable { width: 100%; color: #999; }
.updateTable table { width: 100%; margin-bottom: 14px; }
.updateTable th,
.updateTable td {
  height: 40px; line-height: 40px; vertical-align: middle;
  padding-left: 6px; font-weight: normal; text-align: left;
}
.updateTable th { background: #f9f9f9; color: #333; border-top: 1px solid #eee; }
.updateTable tbody tr:hover { background: #f5f7fa; }
.updateTable .name { width: 140px; padding-right: 10px; }
.updateTable .chapter { padding-right: 5px; }
.updateTable .goread { width: 80px; text-align: center; }
.updateTable .time { width: 140px; }
.updateTable tr:nth-child(2n) td { background: #fafafa; }
.no_contet { padding: 190px 0 40px; text-align: center; color: #999; border-top: 1px solid #eee; }
.mt-4 { justify-content: center; }
</style>
