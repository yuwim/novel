<template>
  <div>
    <!-- 搜索栏 -->
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
          <label>分类</label>
          <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable class="search-select">
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </div>
        <div class="search-item">
          <label>状态</label>
          <el-select v-model="searchForm.bookStatus" placeholder="全部" clearable class="search-select">
            <el-option label="连载中" :value="0" />
            <el-option label="已完结" :value="1" />
            <el-option label="已下架" :value="2" />
          </el-select>
        </div>
        <div class="search-actions">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">+ 新增小说</el-button>
      <span class="toolbar-tip">共 {{ total }} 条记录</span>
    </div>

    <!-- 数据表格 -->
    <div class="table-panel">
      <el-table
        :data="books"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
      >
        <el-table-column label="封面" width="80" align="center">
          <template #default="{ row }">
            <img
              v-if="row.picUrl"
              :src="imgBaseUrl + row.picUrl"
              class="table-cover"
              @error="(e) => e.target.style.display = 'none'"
            />
            <span v-else class="no-cover">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="bookName" label="书名" min-width="140">
          <template #default="{ row }">
            <span class="book-name-cell">{{ row.bookName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="作者" width="110" />
        <el-table-column prop="categoryName" label="分类" width="90" align="center" />
        <el-table-column prop="visitCount" label="点击量" width="90" align="center" sortable />
        <el-table-column label="总字数" width="100" align="center">
          <template #default="{ row }">{{ formatWordCount(row.wordCount) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="bookStatusTag(row)" size="small">
              {{ bookStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="210" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">查看</el-button>
            <el-button
              v-if="+row.bookStatus !== 2"
              type="danger" link size="small"
              @click="handleShelf(row, 2)"
            >下架</el-button>
            <el-button
              v-if="+row.bookStatus === 2"
              type="success" link size="small"
              @click="handleShelf(row, 0)"
            >上架</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="searchForm.pageNum"
        :page-size="searchForm.pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="loadBooks"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="书名" prop="bookName">
          <el-input v-model="formData.bookName" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="作者" prop="authorName">
          <el-input v-model="formData.authorName" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面">
          <el-input v-model="formData.picUrl" placeholder="封面图片地址" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="formData.bookDesc" type="textarea" :rows="4" placeholder="请输入书籍简介" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">连载中</el-radio>
            <el-radio :label="2">已完结</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { searchBooks, updateBook, updateBookStatus, deleteBook } from "@/api/admin";
import { listCategorys } from "@/api/book";

export default {
  name: "adminBookManage",
  setup() {
    const state = reactive({
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL || "",
      books: [],
      total: 0,
      loading: false,
      categoryList: [],
      searchForm: { keyword: "", categoryId: null, bookStatus: null, pageNum: 1, pageSize: 12 },
      dialogVisible: false,
      dialogTitle: "新增小说",
      submitting: false,
      formData: { id: null, bookName: "", authorName: "", categoryId: null, picUrl: "", bookDesc: "", status: 1 },
    });

    const formRules = {
      bookName: [{ required: true, message: "请输入书名", trigger: "blur" }],
      authorName: [{ required: true, message: "请输入作者", trigger: "blur" }],
      categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
    };

    const loadCategories = async () => {
      try {
        const [res0, res1] = await Promise.allSettled([
          listCategorys({ workDirection: 0 }),
          listCategorys({ workDirection: 1 }),
        ]);
        const list = [];
        if (res0.status === "fulfilled" && res0.value?.data) {
          list.push(...(Array.isArray(res0.value.data) ? res0.value.data : []));
        }
        if (res1.status === "fulfilled" && res1.value?.data) {
          list.push(...(Array.isArray(res1.value.data) ? res1.value.data : []));
        }
        state.categoryList = list;
      } catch { state.categoryList = []; }
    };

    const loadBooks = async () => {
      state.loading = true;
      try {
        const params = {
          keyword: state.searchForm.keyword || undefined,
          categoryId: state.searchForm.categoryId || undefined,
          bookStatus: state.searchForm.bookStatus != null ? state.searchForm.bookStatus : undefined,
          pageNum: state.searchForm.pageNum,
          pageSize: state.searchForm.pageSize,
        };
        const { data } = await searchBooks(params);
        const result = data || {};
        state.books = result.list || [];
        state.total = Number(result.total) || 0;
        state.books.forEach((b) => {
          const bid = b.id || b.bookId;
          if (b.bookStatus === 2 || b.status === 2) {
            state.delistedIds.add(bid);
          }
        });
      } catch {
        state.books = [];
        state.total = 0;
      } finally {
        state.loading = false;
      }
    };

    const handleSearch = () => { state.searchForm.pageNum = 1; loadBooks(); };
    const handleReset = () => {
      state.searchForm = { keyword: "", categoryId: null, bookStatus: null, pageNum: 1, pageSize: 12 };
      loadBooks();
    };

    const handleAdd = () => {
      state.dialogTitle = "新增小说";
      state.formData = { id: null, bookName: "", authorName: "", categoryId: null, picUrl: "", bookDesc: "", status: 1 };
      state.dialogVisible = true;
    };

    const handleEdit = (row) => {
      state.dialogTitle = "编辑小说";
      state.formData = {
        id: row.id, bookName: row.bookName || "", authorName: row.authorName || "",
        categoryId: row.categoryId || null, picUrl: row.picUrl || "",
        bookDesc: row.bookDesc || "", status: row.status || 1,
      };
      state.dialogVisible = true;
    };

    const handleDetail = (row) => {
      window.open(`/#/book/${row.id || row.bookId}`, "_blank");
    };

    const handleShelf = async (row, bookStatus) => {
      const label = bookStatus === 2 ? "下架" : "上架";
      try {
        await ElMessageBox.confirm(
          `确定要${label}《${row.bookName}》吗？`,
          `${label}确认`,
          { confirmButtonText: `确定${label}`, cancelButtonText: "取消", type: "warning" }
        );
        await updateBookStatus({ bookId: row.id || row.bookId, bookStatus });
        ElMessage.success(`${label}成功`);
        loadBooks();
      } catch { /* 用户取消 */ }
    };

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除《${row.bookName}》吗？删除后不可恢复！`,
          "删除确认",
          { confirmButtonText: "确定删除", cancelButtonText: "取消", type: "error" }
        );
        await deleteBook(row.id || row.bookId);
        ElMessage.success("删除成功");
        if (state.books.length === 1 && state.searchForm.pageNum > 1) state.searchForm.pageNum--;
        loadBooks();
      } catch { /* 用户取消 */ }
    };

    const handleSubmit = async () => {
      state.submitting = true;
      try {
        if (state.formData.id) {
          await updateBook(state.formData.id, state.formData);
          ElMessage.success("更新成功");
        } else {
          ElMessage.warning("新增接口暂未对接");
        }
        state.dialogVisible = false;
        loadBooks();
      } catch { /* ignore */ } finally {
        state.submitting = false;
      }
    };

    const bookStatusText = (row) => {
      const map = { 0: "连载中", 1: "已完结", 2: "已下架" };
      return map[+row.bookStatus] || "连载中";
    };
    const bookStatusTag = (row) => {
      const map = { 0: "", 1: "success", 2: "danger" };
      return map[+row.bookStatus] || "";
    };

    const formatWordCount = (count) => {
      const n = Number(count);
      if (!n) return "-";
      if (n >= 10000) return (n / 10000).toFixed(1) + "万字";
      return n + "字";
    };

    onMounted(() => { loadCategories(); loadBooks(); });

    return {
      ...toRefs(state),
      formRules,
      loadBooks, handleSearch, handleReset, handleAdd,
      handleEdit, handleDetail, handleShelf, handleDelete, handleSubmit,
      formatWordCount, bookStatusText, bookStatusTag,
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

.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.toolbar-tip { font-size: 13px; color: #999; }

.table-panel {
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.table-cover { width: 36px; height: 48px; object-fit: cover; border-radius: 3px; }
.no-cover { color: #ccc; font-size: 12px; }
.book-name-cell { font-weight: 500; color: #333; }

.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }

:deep(.el-table th) { background: #fafafa; color: #555; font-weight: 500; }
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) { background: #fafbfc; }
</style>
