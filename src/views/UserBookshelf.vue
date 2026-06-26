<template>
  <Header />

  <div class="main box_center cf">
    <div class="userBox cf">
      <UserMenu />
      <div class="my_r">
        <div class="my_bookshelf">
          <div class="title cf">
            <h2 class="fl">我的书架</h2>
            <div class="fr"></div>
          </div>
          <div v-if="total === 0" class="no_contet no_comment">
            您的书架还是空的，快去收藏喜欢的小说吧！
          </div>
          <div v-else class="updateTable rankTable bookshelf_table">
            <table cellpadding="0" cellspacing="0">
              <thead>
                <tr>
                  <th class="rank">序号</th>
                  <th class="cover">封面</th>
                  <th class="name">书名</th>
                  <th class="chapter">最新章节</th>
                  <th class="author">作者</th>
                  <th class="time">更新时间</th>
                  <th class="action">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in books" :key="item.bookId || index">
                  <td class="rank">
                    <i>{{ (pageNum - 1) * pageSize + index + 1 }}</i>
                  </td>
                  <td class="cover">
                    <a href="javascript:void(0)" @click="readBook(item)">
                      <img
                        :src="imgBaseUrl + item.picUrl"
                        :alt="item.bookName"
                        onerror="this.src='default.gif';this.onerror=null"
                      />
                    </a>
                  </td>
                  <td class="name">
                    <a href="javascript:void(0)" @click="readBook(item)">{{
                      item.bookName
                    }}</a>
                  </td>
                  <td class="chapter">
                    <a href="javascript:void(0)" @click="readBook(item)">{{
                      item.lastChapterName || "开始阅读"
                    }}</a>
                  </td>
                  <td class="author">
                    <span>{{ item.authorName }}</span>
                  </td>
                  <td class="time">
                    <span>{{ item.lastChapterUpdateTime || "-" }}</span>
                  </td>
                  <td class="action">
                    <a
                      href="javascript:void(0)"
                      class="remove_link"
                      @click="handleRemove(item.bookId)"
                      >移出书架</a
                    >
                  </td>
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
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import "@/assets/styles/user.css";
import { listBookshelf, removeBookshelf } from "@/api/user";
import { reactive, toRefs, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import UserMenu from "@/components/user/Menu";

export default {
  name: "userBookshelf",
  components: {
    Header,
    Footer,
    UserMenu,
  },
  setup() {
    const router = useRouter();

    const state = reactive({
      books: [],
      total: 0,
      pageSize: 10,
      pageNum: 1,
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL,
    });

    const loadBookshelf = async (pageNum) => {
      const { data } = await listBookshelf({
        pageNum,
        pageSize: state.pageSize,
      });
      state.books = data.list || [];
      state.total = Number(data.total) || 0;
      state.pageNum = pageNum;
    };

    const handleCurrentChange = (pageNum) => {
      loadBookshelf(pageNum);
    };

    const bookDetail = (bookId) => {
      router.push({ path: `/book/${bookId}` });
    };

    const readBook = (item) => {
      if (item.preContentId) {
        router.push({
          path: `/book/${item.bookId}/${item.preContentId}`,
        });
      } else {
        bookDetail(item.bookId);
      }
    };

    const handleRemove = async (bookId) => {
      try {
        await ElMessageBox.confirm("确定将该书移出书架吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        await removeBookshelf(bookId);
        ElMessage.success("已移出书架");
        const nextPage =
          state.books.length === 1 && state.pageNum > 1
            ? state.pageNum - 1
            : state.pageNum;
        loadBookshelf(nextPage);
      } catch (e) {
        /* 用户取消 */
      }
    };

    onMounted(() => {
      loadBookshelf(1);
    });

    return {
      ...toRefs(state),
      handleCurrentChange,
      bookDetail,
      readBook,
      handleRemove,
    };
  },
};
</script>

<style scoped>
.userBox {
  margin: 0 auto 50px;
  background: #fff;
  border-radius: 6px;
}
.my_l {
  width: 198px;
  float: left;
  font-size: 13px;
  padding-top: 20px;
}
.my_r {
  width: 739px;
  padding: 0 30px 30px;
  float: right;
  border-left: 1px solid #efefef;
  min-height: 470px;
}
.el-pagination {
  justify-content: center;
}
.el-pagination.is-background .el-pager li:not(.is-disabled).is-active {
  background-color: #f80 !important;
}
.el-pagination {
  --el-pagination-hover-color: #f80 !important;
}
.updateTable {
  width: 100%;
  color: #999;
}
.updateTable table {
  width: 100%;
  margin-bottom: 14px;
}
.updateTable th,
.updateTable td {
  height: 40px;
  line-height: 40px;
  vertical-align: middle;
  padding-left: 1px;
  text-align: left;
}
.updateTable .name a,
.updateTable .chapter a {
  max-width: 168px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
.bookshelf_table .cover img {
  width: 40px;
  height: 54px;
  object-fit: cover;
  vertical-align: middle;
}
.bookshelf_table .cover {
  width: 56px;
  text-align: center;
}
.bookshelf_table .action {
  width: 80px;
  text-align: center;
}
.bookshelf_table .remove_link {
  color: #f65167;
}
.bookshelf_table .remove_link:hover {
  color: #f80;
}
.my_bookshelf .title {
  padding: 20px 0 15px;
  line-height: 30px;
}
.my_bookshelf h2 {
  font-size: 18px;
  font-weight: normal;
}
</style>
