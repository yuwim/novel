<template>
  <div>
    <div class="search-bar">
      <div class="search-row">
        <div class="search-item">
          <label>小说名称</label>
          <el-input
            v-model="searchForm.bookName"
            placeholder="输入小说名称搜索"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="search-item">
          <label>审核状态</label>
          <el-select v-model="searchForm.auditStatus" placeholder="全部" clearable class="search-select">
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

    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="success" :disabled="!selectedIds.length" @click="batchAudit">批量通过</el-button>
        <el-button type="danger" :disabled="!selectedIds.length" @click="batchDelete">批量删除</el-button>
      </div>
      <span class="toolbar-tip">共 {{ total }} 条评论</span>
    </div>

    <div class="table-panel">
      <el-table
        ref="tableRef"
        :data="list"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无评论"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="44" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="userName" label="用户" width="110" />
        <el-table-column label="评论内容" min-width="220">
          <template #default="{ row }">
            <div class="comment-cell">
              <p class="comment-text">{{ row.commentContent }}</p>
              <span class="comment-book">评《{{ row.bookName || '-' }}》</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="replyCount" label="回复" width="70" align="center" />
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="auditTagType(row.auditStatus)" size="small">
              {{ auditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评论时间" width="170">
          <template #default="{ row }">{{ row.createTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.auditStatus != 1"
              type="success" link size="small"
              @click="handleAudit(row)"
            >通过</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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
    <el-dialog v-model="viewVisible" title="评论详情" width="550px" :close-on-click-modal="false">
      <div v-if="viewRow" class="view-detail">
        <div class="detail-row"><span class="detail-label">用户</span><span>{{ viewRow.userName }}</span></div>
        <div class="detail-row"><span class="detail-label">所属小说</span><span>{{ viewRow.bookName || '-' }}</span></div>
        <div class="detail-row"><span class="detail-label">回复数</span><span>{{ viewRow.replyCount || 0 }}</span></div>
        <div class="detail-row"><span class="detail-label">评论时间</span><span>{{ viewRow.createTime || '-' }}</span></div>
        <div class="detail-row">
          <span class="detail-label">审核状态</span>
          <el-tag :type="auditTagType(viewRow.auditStatus)" size="small">{{ auditStatusText(viewRow.auditStatus) }}</el-tag>
        </div>
        <div class="detail-row"><span class="detail-label">评论内容</span></div>
        <p class="detail-content">{{ viewRow.commentContent }}</p>
      </div>
      <template #footer>
        <el-button @click="viewVisible = false">关闭</el-button>
        <el-button v-if="viewRow && viewRow.auditStatus != 1" type="success" @click="approveFromView">通过</el-button>
        <el-button type="danger" @click="deleteFromView">删除</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { listAllComments, auditComment, deleteComment } from "@/api/admin";

export default {
  name: "adminCommentManage",
  setup() {
    const state = reactive({
      list: [],
      total: 0,
      loading: false,
      selectedIds: [],
      searchForm: { bookName: "", auditStatus: null, pageNum: 1, pageSize: 12 },
      viewVisible: false,
      viewRow: null,
    });

    const loadData = async () => {
      state.loading = true;
      try {
        const params = {
          page: state.searchForm.pageNum,
          size: state.searchForm.pageSize,
        };
        if (state.searchForm.bookName) params.bookName = state.searchForm.bookName;
        if (state.searchForm.auditStatus != null) params.auditStatus = state.searchForm.auditStatus;
        const res = await listAllComments(params);
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

    const handleSearch = () => { state.searchForm.pageNum = 1; state.selectedIds = []; loadData(); };
    const handleReset = () => {
      state.searchForm = { bookName: "", auditStatus: null, pageNum: 1, pageSize: 12 };
      state.selectedIds = [];
      loadData();
    };

    const handleSelectionChange = (selection) => {
      state.selectedIds = selection.map((item) => item.id);
    };

    const handleView = (row) => {
      state.viewRow = row;
      state.viewVisible = true;
    };

    const approveFromView = () => { handleAudit(state.viewRow); state.viewVisible = false; };
    const deleteFromView = () => { state.viewVisible = false; handleDelete(state.viewRow); };

    const handleAudit = async (row) => {
      try {
        await ElMessageBox.confirm("确定通过该评论吗？", "审核通过",
          { confirmButtonText: "确定通过", cancelButtonText: "取消", type: "warning" });
        await auditComment({ id: row.id, auditStatus: 1 });
        ElMessage.success("审核已通过");
        loadData();
      } catch { /* 用户取消 */ }
    };

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确定要删除该评论吗？删除后无法恢复。`, "删除确认",
          { confirmButtonText: "确定删除", cancelButtonText: "取消", type: "warning" });
        await deleteComment(row.id);
        ElMessage.success("已删除");
        if (state.list.length === 1 && state.searchForm.pageNum > 1) state.searchForm.pageNum--;
        loadData();
      } catch { /* 用户取消 */ }
    };

    const batchAudit = async () => {
      try {
        await ElMessageBox.confirm(`确定批量通过选中的 ${state.selectedIds.length} 条评论吗？`, "批量审核通过",
          { confirmButtonText: "确定通过", cancelButtonText: "取消", type: "warning" });
        const tasks = state.selectedIds.map((id) => auditComment({ id, auditStatus: 1 }));
        await Promise.allSettled(tasks);
        ElMessage.success("批量审核通过完成");
        state.selectedIds = [];
        loadData();
      } catch { /* 用户取消 */ }
    };

    const batchDelete = async () => {
      try {
        await ElMessageBox.confirm(`确定要删除选中的 ${state.selectedIds.length} 条评论吗？`, "批量删除",
          { confirmButtonText: "确定删除", cancelButtonText: "取消", type: "warning" });
        const tasks = state.selectedIds.map((id) => deleteComment(id));
        await Promise.allSettled(tasks);
        ElMessage.success("批量删除完成");
        state.selectedIds = [];
        loadData();
      } catch { /* 用户取消 */ }
    };

    const auditStatusText = (s) => ({ 0: "待审核", 1: "已通过", 2: "未通过" }[s] || "待审核");
    const auditTagType = (s) => ({ 0: "info", 1: "success", 2: "danger" }[s] || "info");

    onMounted(() => loadData());

    return {
      ...toRefs(state),
      loadData, handleSearch, handleReset,
      handleSelectionChange, handleView, handleAudit,
      approveFromView, deleteFromView,
      handleDelete, batchAudit, batchDelete,
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
.search-input { width: 240px; }
.search-select { width: 130px; }
.search-actions { display: flex; gap: 10px; padding-bottom: 2px; }

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
.comment-cell { display: flex; flex-direction: column; gap: 4px; }
.comment-text {
  color: #333; font-size: 13px; line-height: 1.6; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.comment-book { font-size: 12px; color: #bbb; }

.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }

:deep(.el-table th) { background: #fafafa; color: #555; font-weight: 500; }
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) { background: #fafbfc; }

.view-detail { padding: 4px 0; }
.detail-row { display: flex; align-items: flex-start; margin-bottom: 12px; font-size: 14px; }
.detail-label { color: #999; min-width: 70px; flex-shrink: 0; }
.detail-content {
  color: #333; line-height: 1.8; background: #f8f9fa; padding: 12px;
  border-radius: 6px; font-size: 14px; white-space: pre-wrap; word-break: break-word; margin: 0;
}
</style>
