<template>
  <div>
    <div class="stat-cards">
      <div class="stat-card card-blue">
        <div class="stat-icon"><span class="icon-inner">📚</span></div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.totalBooks }}</div>
          <div class="stat-label">小说总数</div>
        </div>
      </div>
      <div class="stat-card card-green">
        <div class="stat-icon"><span class="icon-inner">👥</span></div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.totalUsers }}</div>
          <div class="stat-label">用户总数</div>
        </div>
      </div>
      <div class="stat-card card-orange">
        <div class="stat-icon"><span class="icon-inner">👁</span></div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.totalVisits }}</div>
          <div class="stat-label">今日访问</div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="panel">
        <div class="panel-header">
          <h3>最新入库</h3>
        </div>
        <div class="panel-body">
          <table class="data-table" v-if="newestBooks.length">
            <thead>
              <tr>
                <th>封面</th><th>书名</th><th>作者</th><th>分类</th><th>入库时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in newestBooks" :key="book.bookId || book.id">
                <td><img :src="imgBaseUrl + book.picUrl" class="table-cover" onerror="this.style.display='none'" /></td>
                <td class="book-name">{{ book.bookName }}</td>
                <td>{{ book.authorName }}</td>
                <td>{{ book.categoryName || '-' }}</td>
                <td>{{ book.createTime || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-tip">暂无数据</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>最近更新</h3>
        </div>
        <div class="panel-body">
          <table class="data-table" v-if="updateBooks.length">
            <thead>
              <tr>
                <th>书名</th><th>最新章节</th><th>作者</th><th>更新时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in updateBooks" :key="book.bookId || book.id">
                <td class="book-name">{{ book.bookName }}</td>
                <td>{{ book.lastChapterName || '-' }}</td>
                <td>{{ book.authorName }}</td>
                <td>{{ book.updateTime || book.lastChapterUpdateTime || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-tip">暂无数据</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><h3>点击排行</h3></div>
        <div class="panel-body">
          <ul class="rank-list" v-if="visitRankBooks.length">
            <li v-for="(book, index) in visitRankBooks" :key="book.bookId || book.id">
              <span class="rank-num" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</span>
              <span class="rank-book-name">{{ book.bookName }}</span>
              <span class="rank-author">{{ book.authorName }}</span>
            </li>
          </ul>
          <div v-else class="empty-tip">暂无数据</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import {
  getBookCount,
  getUserCount,
  getTodayVisit,
  listNewestRankBooks,
  listVisitRankBooks,
  listUpdateRankBooks,
} from "@/api/admin";

export default {
  name: "adminConsole",
  setup() {
    const state = reactive({
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL || "",
      stats: { totalBooks: 0, totalUsers: 0, totalVisits: 0 },
      newestBooks: [],
      updateBooks: [],
      visitRankBooks: [],
    });

    const loadData = async () => {
      try {
        const [bookCountRes, userCountRes, todayVisitRes, newestRes, visitRes, updateRes] =
          await Promise.allSettled([
            getBookCount(),
            getUserCount(),
            getTodayVisit(),
            listNewestRankBooks(),
            listVisitRankBooks(),
            listUpdateRankBooks(),
          ]);

        if (bookCountRes.status === "fulfilled" && bookCountRes.value) {
          const count = bookCountRes.value?.data != null
            ? bookCountRes.value.data
            : bookCountRes.value;
          state.stats.totalBooks = Number(count) || 0;
        }
        if (userCountRes.status === "fulfilled" && userCountRes.value) {
          const count = userCountRes.value?.data != null
            ? userCountRes.value.data
            : userCountRes.value;
          state.stats.totalUsers = Number(count) || 0;
        }
        if (todayVisitRes.status === "fulfilled" && todayVisitRes.value) {
          const visitData = todayVisitRes.value?.data || todayVisitRes.value || {};
          state.stats.totalVisits = Number(visitData.visitCount) || 0;
        }
        if (newestRes.status === "fulfilled" && newestRes.value?.data) {
          const list = Array.isArray(newestRes.value.data)
            ? newestRes.value.data
            : newestRes.value.data?.list || [];
          state.newestBooks = list.slice(0, 5);
        }
        if (visitRes.status === "fulfilled" && visitRes.value?.data) {
          const list = Array.isArray(visitRes.value.data)
            ? visitRes.value.data
            : visitRes.value.data?.list || [];
          state.visitRankBooks = list.slice(0, 10);
        }
        if (updateRes.status === "fulfilled" && updateRes.value?.data) {
          const list = Array.isArray(updateRes.value.data)
            ? updateRes.value.data
            : updateRes.value.data?.list || [];
          state.updateBooks = list.slice(0, 5);
        }
      } catch { /* ignore */ }
    };

    onMounted(() => loadData());

    return { ...toRefs(state) };
  },
};
</script>

<style scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.stat-icon {
  width: 56px; height: 56px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.icon-inner { font-size: 26px; }
.card-blue .stat-icon { background: #e8f4fd; }
.card-green .stat-icon { background: #e8f8ee; }
.card-orange .stat-icon { background: #fef4e8; }
.stat-info { flex: 1; min-width: 0; }
.stat-num { font-size: 28px; font-weight: 700; color: #1f2a44; line-height: 1; }
.stat-label { margin-top: 6px; font-size: 13px; color: #999; }

.content-grid {
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
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #f0f0f0;
}
.panel-header h3 { font-size: 15px; font-weight: 500; color: #333; }
.panel-body { padding: 0 20px 16px; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; font-size: 12px; font-weight: 500; color: #999;
  padding: 12px 8px; border-bottom: 1px solid #f0f0f0; white-space: nowrap;
}
.data-table td {
  font-size: 13px; color: #555; padding: 10px 8px; border-bottom: 1px solid #fafafa;
}
.data-table tbody tr:hover { background: #f9fafc; }
.table-cover { width: 32px; height: 42px; object-fit: cover; border-radius: 3px; }
.book-name { color: #333; font-weight: 500; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.rank-list { list-style: none; padding: 0; margin: 0; }
.rank-list li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #fafafa; }
.rank-list li:last-child { border-bottom: none; }
.rank-num {
  width: 22px; height: 22px; line-height: 22px; text-align: center;
  font-size: 12px; font-weight: 600; color: #999; background: #f5f5f5;
  border-radius: 4px; flex-shrink: 0;
}
.rank-num.top-three { background: #fff5e6; color: #f80; }
.rank-book-name { flex: 1; font-size: 13px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rank-author { font-size: 12px; color: #bbb; flex-shrink: 0; }

.empty-tip { text-align: center; padding: 40px 0; font-size: 14px; color: #ccc; }
</style>
