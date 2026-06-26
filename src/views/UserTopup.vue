<template>
  <Header />

  <div class="main box_center cf">
    <div class="userBox cf">
      <UserMenu />
      <div class="my_r">
        <div class="my_bookshelf">
          <div class="title cf">
            <h2 class="fl">账户充值</h2>
          </div>

          <div class="topup-container">
            <div class="balance-card">
              <div class="balance-label">当前余额</div>
              <div class="balance-num">{{ balance }} <span class="unit">书币</span></div>
            </div>

            <div class="amount-grid">
              <div
                v-for="item in amounts"
                :key="item.value"
                class="amount-card"
                :class="{ selected: selectedAmount === item.value }"
                @click="selectedAmount = item.value"
              >
                <div class="amount-value">{{ item.label }}</div>
                <div class="amount-price">¥{{ item.price }}</div>
              </div>
            </div>

            <el-button
              type="primary"
              size="large"
              class="pay-btn"
              :disabled="!selectedAmount"
              @click="handlePay"
            >立即充值</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<script>
import "@/assets/styles/user.css";
import { reactive, toRefs, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getUserinfo } from "@/api/user";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import UserMenu from "@/components/user/Menu";

export default {
  name: "userTopup",
  components: { Header, Footer, UserMenu },
  setup() {
    const state = reactive({
      balance: 0,
      selectedAmount: null,
      amounts: [
        { label: "100书币", value: 100, price: 10 },
        { label: "500书币", value: 500, price: 50 },
        { label: "1000书币", value: 1000, price: 100 },
        { label: "2000书币", value: 2000, price: 200 },
        { label: "5000书币", value: 5000, price: 500 },
        { label: "10000书币", value: 10000, price: 1000 },
      ],
    });

    const loadBalance = async () => {
      try {
        const res = await getUserinfo();
        const data = res?.data || res || {};
        state.balance = Number(data.balance || data.coin || 0);
      } catch { /* ignore */ }
    };

    const handlePay = () => {
      ElMessage.info("支付功能开发中，敬请期待");
    };

    onMounted(() => loadBalance());

    return { ...toRefs(state), handlePay };
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
.my_bookshelf .title {
  padding: 20px 0 15px;
  line-height: 30px;
}
.my_bookshelf h2 {
  font-size: 18px;
  font-weight: normal;
}

.topup-container {
  max-width: 520px;
  margin: 0 auto;
  padding: 20px 0;
}

.balance-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  padding: 28px 32px;
  color: #fff;
  margin-bottom: 24px;
}
.balance-label {
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 8px;
}
.balance-num {
  font-size: 36px;
  font-weight: 700;
}
.unit {
  font-size: 16px;
  font-weight: 400;
  margin-left: 6px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.amount-card {
  background: #fff;
  border: 2px solid #eee;
  border-radius: 10px;
  padding: 18px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.amount-card:hover {
  border-color: #667eea;
}
.amount-card.selected {
  border-color: #667eea;
  background: #f5f3ff;
}
.amount-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}
.amount-price {
  font-size: 14px;
  color: #999;
}

.pay-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 10px;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #667eea;
  --el-button-border-color: #667eea;
  --el-button-hover-bg-color: #5a6fd6;
  --el-button-hover-border-color: #5a6fd6;
}
</style>
