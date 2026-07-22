import type { Messages } from './en'

export const zhTWMessages = {
  common: {
    ctas: {
      browseTasks: '瀏覽任務',
      becomeWorker: '成為工作者',
      getStarted: '開始使用',
      logIn: '登入',
      postTask: '發布任務',
      seeHowItWorks: '了解流程',
      viewPricing: '查看收費',
    },
  },
  header: {
    skipToContent: '跳到主要內容',
    menuIconTitle: '選單',
    menuTitle: '選單',
    openMenu: '開啟選單',
    languageLabel: '語言',
    languages: {
      en: 'EN',
      zhTW: '繁中',
    },
    nav: {
      pricing: '收費',
      about: '關於',
    },
  },
  landing: {
    metadata: {
      title: 'Slashie — 用可信報價找到本地幫手',
      description:
        '發布任務，取得附近工作者的報價，直接向工作者付款。Slashie 不抽取任務費用。',
    },
    hero: {
      eyebrow: '地圖上的本地幫手',
      heading: '找本地幫手，安心聘用。',
      body: '發布任務，取得附近工作者的報價，選你想聘用的人。你直接向工作者付款，Slashie 不抽取任務費用。',
      trustChips: ['不抽任務費', '本地工作者', '直接付款'],
    },
    howItWorks: {
      heading: '運作方式',
      body: '三步完成任務。',
      steps: [
        {
          step: '01',
          title: '發布',
          body: '說明你需要什麼、時間和地點。',
        },
        {
          step: '02',
          title: '比較報價',
          body: '查看價格、個人檔案、評價和工作者資料。',
        },
        {
          step: '03',
          title: '聘用並直接付款',
          body: '選定工作者，雙方自行完成付款。',
        },
      ],
    },
    audience: {
      heading: '為客戶和工作者而設',
      customer: {
        title: '給客戶',
        items: [
          '免費發布任務',
          '比較附近工作者的報價',
          '按價格、檔案和評價選擇',
        ],
      },
      worker: {
        title: '給工作者',
        items: [
          '在地圖上找到真實任務',
          '發送報價，接附近的工作',
          '保留你與客戶議定的任務收入',
        ],
      },
    },
    trust: {
      points: [
        'Slashie 不從任務抽成',
        '付款由客戶和工作者直接安排',
        '個人檔案、評價和過往作品更清楚',
        '本地任務、本地工作者、清楚報價',
      ],
    },
    pricingTeaser: {
      heading: '簡單收費',
      body: '客戶免費使用 Slashie。工作者每月有免費報價額度，需要更多時可訂閱無限報價。',
      freePlanLabel: '工作者 — 免費',
      freeHeadline: '每月 {count} 個報價',
      freeBody: '用免費方案瀏覽任務並發送報價。',
      unlimitedHeadlineFallback: '無限報價',
      unlimitedSublineFallback: '一個訂閱，無限報價',
      unlimitedSublineWithPrice: '之後 {priceLine} · 無限報價',
    },
    finalCta: {
      heading: '準備找本地幫手？',
      body: '發布任務，或以工作者身份開始報價。只需一分鐘。',
    },
  },
  pricing: {
    metadata: {
      title: '收費方案 | Slashie',
      description:
        '客戶免費使用 Slashie。工作者每月可發送免費報價，或訂閱 Slashie Unlimited。任務付款由客戶和工作者直接安排。',
    },
    header: {
      heading: '簡單方案，清楚報價。',
      body: '客戶免費發布任務。工作者先免費開始，需要無限報價時再升級。',
    },
    error: {
      eyebrow: '收費',
      heading: '暫時無法載入收費',
      body: '目前無法載入方案詳情。請重新整理頁面，或稍後再試。',
      paymentNote: '任務付款一律由客戶和工作者在 Slashie 之外直接安排。',
    },
    trialBanner: {
      defaultBody: '免費試用 Slashie Unlimited，可隨時取消。',
      bodyWithTrial: '免費試用 Slashie Unlimited {trial}，可隨時取消。',
      badgeFallback: '免費試用',
    },
    plans: {
      currentPlan: '目前方案',
      getStarted: '開始使用',
      setUpWorkerProfile: '設定工作者檔案',
      upgrade: '升級',
      free: {
        title: '工作者免費方案',
        subtitle: '開始尋找任務',
        price: '£0',
        priceSuffix: '永久',
        badge: '每月 {count} 個報價',
        features: [
          '在地圖上瀏覽任務',
          '每月最多發送 {count} 個報價',
          '展示工作者檔案和評價',
          '在 Slashie 協調任務細節',
          '可隨時升級',
        ],
      },
      unlimited: {
        descriptionFallback: '適合活躍工作者',
        trialFallback: '免費試用',
        afterTrialLine: '試用後 {price} / {interval}',
        intervals: {
          month: '月',
          year: '年',
        },
        badge: '無限報價',
        ribbon: '最適合活躍工作者',
        features: [
          '每月無限發送報價',
          '地圖優先的任務探索',
          '完整平台使用權',
          '管理帳單並可隨時取消',
          '沿用同一工作者檔案和口碑',
        ],
      },
    },
    detailsLink: '查看所有方案詳情 >',
    faq: {
      heading: '常見問題',
      items: [
        {
          question: '我付費買的是什麼？',
          answer:
            'Slashie Unlimited 是給需要無限報價的工作者使用的訂閱方案。這不是完成任務或收取任務款項的費用。',
        },
        {
          question: '客戶需要付費給 Slashie 嗎？',
          answer:
            '不需要。在目前 MVP 中，客戶可以免費發布任務、比較報價並接受工作者。',
        },
        {
          question: '工作者如何收取任務款項？',
          answer:
            '客戶和工作者在 Slashie 之外直接安排付款。Slashie 不保管、處理或發放任務款項。',
        },
        {
          question: '試用結束後會怎樣？',
          answer:
            '試用期結束後，Slashie Unlimited 會以每月 {price} 繼續訂閱；如不想續用，請在試用期結束前取消。',
        },
        {
          question: '可以取消嗎？',
          answer:
            '可以。帳單管理可用後，你可在工作者方案頁取消。取消後不會再產生之後的訂閱費。',
        },
      ],
    },
    disclaimer: {
      body: '任務付款由客戶和工作者直接安排。Slashie 訂閱只用於平台使用權。',
      terms: '適用條款。',
    },
  },
} as const satisfies Messages
