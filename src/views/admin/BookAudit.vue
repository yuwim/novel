<template>
  <div>
    <div class="search-bar">
      <div class="search-row">
        <div class="search-item">
          <label>关键字</label>
          <el-input
            v-model="searchForm.keyword"
            placeholder="书名 / 作者"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="search-item">
          <label>审核状态</label>
          <el-select v-model="searchForm.auditStatus" placeholder="全部状态" clearable class="search-select">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="未通过" :value="2" />
          </el-select>
        </div>
        <div class="search-actions">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="audit-tabs">
      <el-tab-pane label="作品审核" name="book" />
      <el-tab-pane label="章节审核" name="chapter" />
    </el-tabs>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="success" :disabled="!selectedIds.length" @click="batchAudit(1)">批量通过</el-button>
        <el-button type="warning" :disabled="!selectedIds.length" @click="batchAudit(2)">批量驳回</el-button>
      </div>
      <span class="toolbar-tip">共 {{ total }} 条，其中待审核 {{ pendingCount }} 条</span>
    </div>

    <div class="table-panel">
      <el-table
        ref="tableRef"
        :data="list"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="44" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="封面" width="80" align="center" v-if="activeTab === 'book'">
          <template #default="{ row }">
            <img :src="imgBaseUrl + row.picUrl" class="table-cover" onerror="this.style.display='none'" />
          </template>
        </el-table-column>
        <el-table-column label="名称" min-width="160">
          <template #default="{ row }">
            <span class="name-cell">{{ activeTab === 'book' ? row.bookName : row.chapterName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="作者" width="110" />
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="auditTagType(row.auditStatus)" size="small">
              {{ auditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核意见" min-width="120">
          <template #default="{ row }">
            <span class="opinion-cell">{{ row.auditMessage || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="160">
          <template #default="{ row }">{{ row.createTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.auditStatus != 1"
              type="success" link size="small"
              @click="handleAudit(row, 1)"
            >通过</el-button>
            <el-button
              v-if="row.auditStatus != 2"
              type="warning" link size="small"
              @click="handleReject(row)"
            >驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="searchForm.pageNum"
        :page-size="searchForm.pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="loadData"
      />
    </div>

    <!-- 查看弹窗 -->
    <el-dialog v-model="viewVisible" title="审核详情" width="700px" :close-on-click-modal="false">
      <div v-if="viewRow" class="view-detail">
        <template v-if="activeTab === 'book'">
          <div class="detail-row">
            <span class="detail-label">作品名称：</span>
            <span>{{ viewRow.bookName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">作者：</span>
            <span>{{ viewRow.authorName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">封面：</span>
            <img v-if="viewRow.picUrl" :src="imgBaseUrl + viewRow.picUrl" class="detail-cover" />
            <span v-else>无</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">简介：</span>
            <p class="detail-desc">{{ viewRow.bookDesc || '无' }}</p>
          </div>
          <div class="detail-row">
            <span class="detail-label">审核状态：</span>
            <el-tag :type="auditTagType(viewRow.auditStatus)" size="small">{{ auditStatusText(viewRow.auditStatus) }}</el-tag>
          </div>
          <div class="detail-row" v-if="viewRow.auditMessage">
            <span class="detail-label">审核意见：</span>
            <span>{{ viewRow.auditMessage }}</span>
          </div>
          <div class="detail-row" v-if="viewRow.auditStatus === 1 && viewRow.bookId">
            <el-button type="primary" size="small" @click="goToBook(viewRow.bookId)">查看已发布作品</el-button>
          </div>
        </template>
        <template v-else>
          <div class="detail-row">
            <span class="detail-label">章节名称：</span>
            <span>{{ viewRow.chapterName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">所属书籍ID：</span>
            <span>{{ viewRow.bookId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">作者：</span>
            <span>{{ viewRow.authorName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">字数：</span>
            <span>{{ viewRow.wordCount || 0 }} 字</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">章节内容：</span>
            <pre class="detail-content">{{ viewRow.chapterContent || '无' }}</pre>
          </div>
          <div class="detail-row">
            <span class="detail-label">审核状态：</span>
            <el-tag :type="auditTagType(viewRow.auditStatus)" size="small">{{ auditStatusText(viewRow.auditStatus) }}</el-tag>
          </div>
          <div class="detail-row" v-if="viewRow.auditMessage">
            <span class="detail-label">审核意见：</span>
            <span>{{ viewRow.auditMessage }}</span>
          </div>
          <div class="detail-row" v-if="viewRow.auditStatus === 1 && viewRow.chapterId">
            <el-button type="primary" size="small" @click="goToChapter(viewRow.bookId, viewRow.chapterId)">查看已发布章节</el-button>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="viewVisible = false">关闭</el-button>
        <el-button
          v-if="viewRow && viewRow.auditStatus != 1"
          type="success"
          @click="approveFromView"
        >通过</el-button>
        <el-button
          v-if="viewRow && viewRow.auditStatus != 2"
          type="warning"
          @click="rejectFromView"
        >驳回</el-button>
      </template>
    </el-dialog>

    <!-- 驳回弹窗 -->
    <el-dialog v-model="rejectVisible" title="驳回审核" width="500px" :close-on-click-modal="false">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="驳回意见">
          <el-input
            v-model="rejectForm.auditMessage"
            type="textarea"
            :rows="4"
            placeholder="请填写驳回原因（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="warning" :loading="auditLoading" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { listBookAudits, listChapterAudits, auditBook, auditChapter } from "@/api/admin";

export default {
  name: "adminBookAudit",
  setup() {
    const state = reactive({
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL || "",
      activeTab: "book",
      list: [],
      total: 0,
      pendingCount: 0,
      loading: false,
      auditLoading: false,
      selectedIds: [],
      searchForm: { keyword: "", auditStatus: null, pageNum: 1, pageSize: 12 },
      viewVisible: false,
      viewRow: null,
      rejectVisible: false,
      rejectForm: { row: null, auditMessage: "" },
    });

    const fetchApi = () => (state.activeTab === "book" ? listBookAudits : listChapterAudits);

    const loadData = async () => {
      state.loading = true;
      try {
        const params = {
          keyword: state.searchForm.keyword || undefined,
          auditStatus: state.searchForm.auditStatus != null ? state.searchForm.auditStatus : undefined,
          pageNum: state.searchForm.pageNum,
          pageSize: state.searchForm.pageSize,
        };
        const res = await fetchApi()(params);
        const result = res?.data || res || {};
        state.list = result.list || [];
        state.total = Number(result.total) || 0;
        state.pendingCount = Number(result.pendingCount) || 0;
      } catch {
        state.list = [];
        state.total = 0;
        state.pendingCount = 0;
      } finally {
        state.loading = false;
      }
    };

    const handleTabChange = () => {
      state.searchForm.pageNum = 1;
      state.selectedIds = [];
      loadData();
    };

    const handleSearch = () => { state.searchForm.pageNum = 1; state.selectedIds = []; loadData(); };
    const handleReset = () => {
      state.searchForm = { keyword: "", auditStatus: null, pageNum: 1, pageSize: 12 };
      state.selectedIds = [];
      loadData();
    };

    const handleSelectionChange = (selection) => {
      state.selectedIds = selection.map((item) => item.id);
    };

    const doAudit = (id, auditStatus, auditMessage) => {
      const params = { auditStatus };
      if (state.activeTab === "book") params.bookId = id;
      else params.chapterId = id;
      if (auditMessage) params.auditMessage = auditMessage;
      const api = state.activeTab === "book" ? auditBook : auditChapter;
      return api(params);
    };

    const handleAudit = async (row, auditStatus) => {
      const label = "通过";
      const name = state.activeTab === "book" ? row.bookName : row.chapterName;
      try {
        await ElMessageBox.confirm(
          `确定${label}《${name}》的审核吗？`,
          `审核${label}`,
          { confirmButtonText: `确定${label}`, cancelButtonText: "取消", type: "warning" }
        );
        await doAudit(row.id, auditStatus);
        ElMessage.success(`审核已${label}`);
        state.viewVisible = false;
        loadData();
      } catch { /* 用户取消 */ }
    };

    const handleReject = (row) => {
      state.rejectForm = { row, auditMessage: "" };
      state.rejectVisible = true;
    };

    const confirmReject = async () => {
      state.auditLoading = true;
      try {
        await doAudit(state.rejectForm.row.id, 2, state.rejectForm.auditMessage);
        ElMessage.success("已驳回");
        state.rejectVisible = false;
        loadData();
      } catch { /* ignore */ } finally {
        state.auditLoading = false;
      }
    };

    const batchAudit = async (auditStatus) => {
      const label = auditStatus === 1 ? "通过" : "驳回";
      try {
        await ElMessageBox.confirm(
          `确定批量${label}选中的 ${state.selectedIds.length} 条记录吗？`,
          `批量审核${label}`,
          { confirmButtonText: `确定${label}`, cancelButtonText: "取消", type: "warning" }
        );
        const tasks = state.selectedIds.map((id) => doAudit(id, auditStatus, ""));
        await Promise.allSettled(tasks);
        ElMessage.success(`批量审核${label}完成`);
        state.selectedIds = [];
        loadData();
      } catch { /* 用户取消 */ }
    };

    const handleView = (row) => {
      state.viewRow = row;
      state.viewVisible = true;
    };

    const approveFromView = () => {
      handleAudit(state.viewRow, 1);
    };

    const rejectFromView = () => {
      state.viewVisible = false;
      handleReject(state.viewRow);
    };

    const goToBook = (bookId) => {
      window.open(`/#/book/${bookId}`, "_blank");
    };

    const goToChapter = (bookId, chapterId) => {
      window.open(`/#/book/${bookId}/${chapterId}`, "_blank");
    };

    const auditStatusText = (status) => {
      const map = { 0: "待审核", 1: "已通过", 2: "未通过" };
      return map[status] || "待审核";
    };
    const auditTagType = (status) => {
      const map = { 0: "info", 1: "success", 2: "danger" };
      return map[status] || "info";
    };

    onMounted(() => loadData());

    return {
      ...toRefs(state),
      loadData, handleTabChange, handleSearch, handleReset,
      handleSelectionChange, handleAudit, handleReject, confirmReject, batchAudit,
      handleView, approveFromView, rejectFromView, goToBook, goToChapter,
      auditStatusText, auditTagType,
    };
  },
};
</script>

<style scoped>
.search-bar {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.search-row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px; }
.search-item { display: flex; align-items: center; gap: 8px; }
.search-item label { font-size: 13px; color: #666; white-space: nowrap; }
.search-input { width: 200px; }
.search-select { width: 140px; }
.search-actions { display: flex; gap: 10px; padding-bottom: 2px; }

.audit-tabs { margin-bottom: 12px; }
:deep(.audit-tabs .el-tabs__header) { margin-bottom: 0; }

.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.toolbar-left { display: flex; gap: 10px; }
.toolbar-tip { font-size: 13px; color: #999; }

.table-panel {
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.table-cover { width: 36px; height: 48px; object-fit: cover; border-radius: 3px; }
.name-cell { font-weight: 500; color: #333; }
.opinion-cell { color: #999; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; }

.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }

:deep(.el-table th) { background: #fafafa; color: #555; font-weight: 500; }
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) { background: #fafbfc; }

/* 查看弹窗 */
.view-detail { padding: 10px 0; }
.detail-row {
  display: flex; align-items: flex-start; margin-bottom: 14px; font-size: 14px;
}
.detail-label { color: #999; min-width: 90px; flex-shrink: 0; }
.detail-cover { width: 80px; height: 106px; object-fit: cover; border-radius: 4px; }
.detail-desc { color: #555; line-height: 1.7; margin: 0; flex: 1; }
.detail-content {
  flex: 1; max-height: 300px; overflow-y: auto; background: #f8f9fa; padding: 12px;
  border-radius: 6px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; word-break: break-word;
  margin: 0; font-family: inherit;
}
</style>
