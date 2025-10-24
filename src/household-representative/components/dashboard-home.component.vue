<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import httpInstance from '@/shared/services/http.instance';

const router = useRouter();
const user = ref(null);
const loading = ref(true);
const totalMembers = ref(0);
const totalContributions = ref(0);
const totalBills = ref(0);
const billsWithContribPct = ref(0);
const memberContribsPct = ref(0);
const memberList = ref([]);
const portfolioChart = ref(null);
let chartInstance = null;

onMounted(async () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
    await loadStats();
    renderChart();
  }
  loading.value = false;
});

async function loadStats() {
  try {
    const [members, contributions, bills, memberContributions] = await Promise.all([
      httpInstance.get(`/users?householdId=${user.value.householdId}&role=member`),
      httpInstance.get(`/contributions?householdId=${user.value.householdId}`),
      httpInstance.get(`/bills?householdId=${user.value.householdId}`),
      httpInstance.get(`/memberContributions`)
    ]);
    totalMembers.value = members.data?.length || 0;
    memberList.value = Array.isArray(members.data) ? members.data : [];
    totalContributions.value = (contributions.data || []).length || 0;
    totalBills.value = (bills.data || []).length || 0;

    const uniqBills = new Set((contributions.data || []).map(c => c.billId)).size;
    billsWithContribPct.value = totalBills.value > 0 ? Math.round((uniqBills / totalBills.value) * 100) : 0;

    const contribIds = new Set((contributions.data || []).map(c => c.id));
    const mcAll = Array.isArray(memberContributions.data) ? memberContributions.data : [];
    const mcForHousehold = mcAll.filter(m => contribIds.has(m.contributionId));
    const mcTotal = mcForHousehold.length;
    const completed = mcForHousehold.filter(m => m.status === 1 || m.status === '1' || m.status === true || String(m.status).toLowerCase() === 'paid').length;
    memberContribsPct.value = mcTotal > 0 ? Math.round((completed / mcTotal) * 100) : 0;
  } catch (e) { console.error(e); }
}

function renderChart(){
  try {
    const el = portfolioChart.value;
    if(!el || !window.Chart) return;
    const ctx = el.getContext('2d');
    if(chartInstance){ chartInstance.destroy(); }
    const gradient = ctx.createLinearGradient(0,0,0,200);
    gradient.addColorStop(0, 'rgba(59,130,246,0.25)');
    gradient.addColorStop(1, 'rgba(59,130,246,0.05)');
    chartInstance = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat'],
        datasets: [{
          label: 'Total Portfolio',
          data: [300, 240, 260, 150, 330, 270],
          borderColor: '#3b82f6',
          backgroundColor: gradient,
          fill: true,
          tension: 0.45,
          pointRadius: 3,
          pointBackgroundColor: '#3b82f6',
          pointBorderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,0.06)' }, beginAtZero: true }
        }
      }
    });
  } catch(e){ console.error(e); }
}
</script>

<template>
  <div class="rep-dashboard">
    <div v-if="loading" class="loader">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando…</p>
    </div>

    <template v-else>
      <div class="shell">
        <div class="shell-left">
          <div class="shell-header">
            <h1 class="dash-title">Dashboard</h1>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="plan-badge" :class="plan.toLowerCase()">{{ plan === 'FREE' ? 'Plan Free' : 'Plan Premium' }}</span>
            <div class="household-pill">Hogar Primario: <strong>{{ user?.householdId }}</strong></div>
            <button class="notif-bell" title="Notificaciones" aria-label="Notificaciones" type="button">
              <i class="pi pi-bell"></i>
              <span class="dot-indicator" />
            </button>
          </div>
        </div>
      </div>

          <div class="welcome">
            <div class="welcome-text">
              <div class="welcome-title">Welcome {{ user?.name }}</div>
              <div class="welcome-sub">Administra tu hogar con claridad</div>
              <div class="chip-row">
                <span class="chip free">Plan Free</span>
                <span class="chip id-chip"><span class="label">ID del Hogar:</span> <span class="value">{{ user?.householdId }}</span></span>
              </div>
            </div>
          </div>

          <div class="tiles">
            <div class="tile tile-orange">
              <div class="tile-icon"><i class="pi pi-users"></i></div>
              <div class="tile-info">
                <div class="tile-title">Members</div>
                <div class="tile-value">{{ totalMembers }}</div>
              </div>
            </div>
            <div class="tile tile-purple">
              <div class="tile-icon"><i class="pi pi-credit-card"></i></div>
              <div class="tile-info">
                <div class="tile-title">Bills</div>
                <div class="tile-value">0</div>
              </div>
            </div>
            <div class="tile tile-cyan">
              <div class="tile-icon"><i class="pi pi-dollar"></i></div>
              <div class="tile-info">
                <div class="tile-title">Contributions</div>
                <div class="tile-value">{{ totalContributions }}</div>
              </div>
            </div>
          </div>

          <div class="big-card">
            <div class="big-card-header">
              <div class="big-card-title"><i class="pi pi-chart-line"></i> Total Portfolio</div>
            </div>
            <div class="big-card-body">
              <canvas ref="portfolioChart"></canvas>
            </div>
          </div>
        </div>
        <div class="shell-right">
          <div class="side-panel">
            <div class="profile-card" v-if="user">
              <img class="profile-avatar" :src="`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name||'User')}`" alt="avatar" />
              <div class="profile-name">{{ user.name }}</div>
              <div class="profile-role">Representative</div>
            </div>

            <div class="mini-cards">
              <div class="mini-card">
                <div>
                  <div class="mini-title">Facturas con contribución</div>
                  <div class="mini-sub">{{ billsWithContribPct }}%</div>
                </div>
                <div class="ring ring-green" :style="{ background: `conic-gradient(#22c55e ${billsWithContribPct}% , #e5e7eb 0)` }"></div>
              </div>
              <div class="mini-card">
                <div>
                  <div class="mini-title">Aportes completados</div>
                  <div class="mini-sub">{{ memberContribsPct }}%</div>
                </div>
                <div class="ring ring-purple" :style="{ background: `conic-gradient(#8b5cf6 ${memberContribsPct}% , #e5e7eb 0)` }"></div>
              </div>
            </div>

            <div class="members-panel">
              <div class="mp-header">
                <span>Members</span>
                <a class="see-all" @click.prevent="router.push('/dashboard/representative/members')">See all</a>
              </div>
              <ul class="member-list">
                <li v-for="m in memberList.slice(0,3)" :key="m.id" class="member-item">
                  <img class="member-avatar" :src="`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(m.name||'Member')}`" alt="avatar" />
                  <div class="mi-info">
                    <div class="mi-name">{{ m.name }}</div>
                    <div class="mi-email">{{ m.email }}</div>
                  </div>
                  <span class="status-dot green"></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
  
</template>

<style scoped>
.rep-dashboard { padding: 24px; background: #ffffff; }
.loader { display:flex; flex-direction:column; align-items:center; gap:.5rem; }
.shell { display:grid; grid-template-columns: 3fr 1fr; gap: 20px; background:#F3F8FF; border:1px solid #e6eef7; border-radius:20px; padding:24px; box-shadow: none; margin-block: 16px; width: 100%; min-height: calc(100vh - 64px); box-sizing: border-box; }
.rep-dashboard > .shell { margin-top: 0; margin-bottom: 0; }
.shell-left { display:flex; flex-direction: column; gap: 20px; margin-left: 40px; margin-right: 40px; margin-top: 40px; margin-bottom: 40px; }
.shell-header { display:flex; align-items:center; justify-content: space-between; gap:12px; margin-bottom: 12px; }
.dash-title { font-size: 2.4rem; font-weight: 800; color:#0f172a; margin: 0; letter-spacing: .5px; }



.shell-right { display:flex; margin: -24px -24px -24px 0; }
.hero-illustration { width: 180px; max-width: 200px; height: auto; object-fit: contain; margin: 0; }

.welcome { display:flex; align-items:center; gap: 16px; background: linear-gradient(180deg, #0B5EF7 0%, #0A53E6 100%); border:0; border-radius:12px; padding:24px; min-height:140px; box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
.welcome-text { flex: 1 1 auto; padding-right: 16px; }
.welcome-title { font-size: 2.4rem; font-weight: 700; color:#ffffff; }
.welcome-sub { color:#ffffff; opacity:.95; margin-top:6px; }
.chip-row { display:flex; gap:12px; margin-top:16px; flex-wrap:wrap; }
.chip { padding:8px 14px; border-radius:999px; font-weight:600; font-size:.9rem; border:1px solid #e2e8f0; color:#334155; }
.chip.free { background:#eaf4ff; color:#1e40af; border-color:#cfe3ff; }
.chip.id-chip { background:#f8fafc; }
.chip.id-chip .label { color:#64748b; margin-right:6px; }
.chip.id-chip .value { color:#0f172a; font-weight:800; }


.tiles { display:grid; grid-template-columns: repeat(3,1fr); gap:20px; margin:16px 0; }
.tile { display:flex; align-items:center; gap:12px; padding:16px; height:88px; border-radius:16px; background:#ffffff; border:1px solid #e7eef6; box-shadow:0 4px 10px rgba(0,0,0,0.06); color:#0f172a; }
.tile-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
.tile-title { font-weight:600; opacity:.95; }
.tile-value { font-weight:700; }
/* Icon background accents per card */
.tile.tile-orange .tile-icon { background: linear-gradient(135deg, #ffe7b8 0%, #ffd59d 100%); color:#a65b00; }
.tile.tile-purple .tile-icon { background: linear-gradient(135deg, #e4ddff 0%, #d9c8ff 100%); color:#5b44d4; }
.tile.tile-cyan .tile-icon { background: linear-gradient(135deg, #c9f4ff 0%, #a7eaff 100%); color:#026b75; }

.big-card { background:#ffffff; border:1px solid #e7eef6; border-radius:16px; min-height:260px; box-shadow:0 4px 10px rgba(0,0,0,0.06); padding:16px; }
.big-card-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; color:#0f172a; font-weight:700; }
.big-card-title i { margin-right:6px; }
.big-card-body { position:relative; width:100%; height:260px; }
.side-panel { width:100%; border-radius:20px; padding:24px; background: linear-gradient(180deg, #0166FB 0%, #FFE7D8 100%); border:0; box-shadow: 0 10px 26px rgba(0,0,0,.08); display:flex; flex-direction:column; gap:20px; color:#ffffff; align-self: stretch; justify-content: flex-start; }

/* Right profile panel styling */
.profile-card { background: transparent; border-radius:20px; padding:20px; display:flex; flex-direction:column; align-items:center; gap:8px; box-shadow: none; text-align: center; margin-top: 50px; }
.profile-avatar { width:120px; height:120px; border-radius:50%; box-shadow: 0 8px 16px rgba(15,23,42,.12); background:#fff; }
.profile-name { font-weight:700; color:#ffffff; }
.profile-role { font-size:.8rem; color:rgba(255,255,255,.85); }

.mini-cards { display:flex; flex-direction:column; gap:20px; }
.mini-card { background:#ffffff; border-radius:14px; padding:12px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 4px 10px rgba(0,0,0,0.06); min-height: 76px; border: 5px solid rgba(255,255,255,0.95); }
.mini-title { font-weight:600; color:#000000; font-size:.9rem; }
.mini-sub { color:#000000; font-size:.8rem; }
.ring { width:34px; height:34px; border-radius:50%; background: conic-gradient(#22c55e 70%, #e5e7eb 0); -webkit-mask: radial-gradient(farthest-side, #0000 60%, #000 61%); mask: radial-gradient(farthest-side, #0000 60%, #000 61%); }
.ring-purple { background: conic-gradient(#8b5cf6 40%, #e5e7eb 0); -webkit-mask: radial-gradient(farthest-side, #0000 60%, #000 61%); }

.members-panel { background: transparent; border-radius:16px; padding:16px; box-shadow:none; color:#000000; }
.mp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; color:#000000; font-weight:700; }
.see-all { color:#000000; font-size:.8rem; cursor:pointer; }
.member-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:20px; }
.member-item { display:flex; align-items:center; gap:10px; }
.member-avatar { width:36px; height:36px; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.06); }
.mi-info { flex:1 1 auto; }
.mi-name { font-weight:600; color:#000000; }
.mi-email { font-size:.8rem; color:#000000; }

/* Horizontal margins for side panel blocks */
.side-panel .profile-card,
.side-panel .mini-card,
.side-panel .members-panel { margin-left: 10px; margin-right: 10px; }
.status-dot { width:8px; height:8px; border-radius:50%; }
.status-dot.green { background:#22c55e; }

@media (max-width: 1024px){ .shell{ grid-template-columns: 1fr; padding:16px; } .welcome{ grid-template-columns: 1fr; } .welcome-img{ width: 220px; margin: 0 auto; } }

/* Exact sizing for 1920x1080 viewports */
@media (min-width: 1920px) and (min-height: 1080px) {
  .rep-dashboard { padding: 16px 14px; }
  .shell {
    max-width: 1518px;
    width: 100%;
    min-height: 1014px; /* asegura altura mínima, pero permite crecer */
    margin: 33px auto; /* simétrico arriba/abajo */
    box-sizing: border-box;
  }
}
</style>
