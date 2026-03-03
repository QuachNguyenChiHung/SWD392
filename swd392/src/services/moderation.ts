// Simple frontend-only moderation mock service using localStorage
// Exports async functions to simulate API calls. Data persists in localStorage.

type ContentItem = {
  id: string;
  author: string;
  authorId?: string;
  source: "user" | "ai";
  text: string;
  flagged?: boolean;
  status?: "pending" | "approved" | "rejected";
};

type UserItem = {
  id: string;
  username: string;
  email?: string;
  suspended?: boolean;
  suspendReason?: string;
};

type Metrics = {
  totalUsers: number;
  activeUsersToday: number;
  totalClasses: number;
  contentsReviewed: number;
  reviewRate: number;
};

const KEY_CONTENTS = "mock_moderation_contents";
const KEY_USERS = "mock_moderation_users";
const KEY_RECENT = "mock_moderation_recent";
const KEY_METRICS = "mock_moderation_metrics";

const now = () => new Date().toISOString();

function seedIfEmpty() {
  if (!localStorage.getItem(KEY_CONTENTS)) {
    const initial: ContentItem[] = [
      {
        id: "c1",
        author: "nguyen.van.a",
        authorId: "u1",
        source: "user",
        text: "Nội dung thử nghiệm cần duyệt: hướng dẫn làm bài",
        flagged: false,
        status: "pending",
      },
      {
        id: "c2",
        author: "ai.bot",
        authorId: "ai-1",
        source: "ai",
        text: "Nội dung do AI tạo - khả năng trùng lặp cao",
        flagged: true,
        status: "pending",
      },
      {
        id: "c3",
        author: "tran.thi.b",
        authorId: "u2",
        source: "user",
        text: "Bài kiểm tra - có dấu hiệu vi phạm chính sách",
        flagged: true,
        status: "pending",
      },
    ];
    localStorage.setItem(KEY_CONTENTS, JSON.stringify(initial));
  }

  if (!localStorage.getItem(KEY_USERS)) {
    const users: UserItem[] = [
      { id: "u1", username: "nguyen.van.a", email: "a@example.com" },
      {
        id: "u2",
        username: "tran.thi.b",
        email: "b@example.com",
        suspended: true,
        suspendReason: "Spam nội dung",
      },
      { id: "u3", username: "le.van.c", email: "c@example.com" },
    ];
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  }

  if (!localStorage.getItem(KEY_METRICS)) {
    const m: Metrics = {
      totalUsers: 12458,
      activeUsersToday: 872,
      totalClasses: 342,
      contentsReviewed: 1234,
      reviewRate: 78,
    };
    localStorage.setItem(KEY_METRICS, JSON.stringify(m));
  }

  if (!localStorage.getItem(KEY_RECENT)) {
    const recent = [
      { id: 1, user: "nguyen.a", action: "Submitted assignment", time: "2h" },
      { id: 2, user: "tran.b", action: "Flagged content", time: "3h" },
      { id: 3, user: "le.c", action: "Account suspended", time: "5h" },
    ];
    localStorage.setItem(KEY_RECENT, JSON.stringify(recent));
  }
}

seedIfEmpty();

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const moderationService = {
  async getPendingContents(showOnlyFlagged = false): Promise<ContentItem[]> {
    await delay();
    const raw = localStorage.getItem(KEY_CONTENTS) || "[]";
    const arr: ContentItem[] = JSON.parse(raw);
    return arr.filter((c) => (showOnlyFlagged ? c.flagged : true));
  },

  async approveContent(id: string) {
    await delay();
    const raw = localStorage.getItem(KEY_CONTENTS) || "[]";
    const arr: ContentItem[] = JSON.parse(raw);
    const idx = arr.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Content not found");
    arr[idx].status = "approved";
    localStorage.setItem(KEY_CONTENTS, JSON.stringify(arr));
    // update metrics and recent
    const recentRaw = localStorage.getItem(KEY_RECENT) || "[]";
    const recent = JSON.parse(recentRaw);
    recent.unshift({
      id: Date.now(),
      user: arr[idx].author,
      action: "Content approved",
      time: now(),
    });
    localStorage.setItem(KEY_RECENT, JSON.stringify(recent.slice(0, 50)));
    const mRaw = localStorage.getItem(KEY_METRICS)!;
    const m: Metrics = JSON.parse(mRaw);
    m.contentsReviewed = (m.contentsReviewed || 0) + 1;
    localStorage.setItem(KEY_METRICS, JSON.stringify(m));
    return arr[idx];
  },

  async rejectContent(id: string, reason?: string) {
    await delay();
    const raw = localStorage.getItem(KEY_CONTENTS) || "[]";
    const arr: ContentItem[] = JSON.parse(raw);
    const idx = arr.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Content not found");
    arr[idx].status = "rejected";
    localStorage.setItem(KEY_CONTENTS, JSON.stringify(arr));
    const recentRaw = localStorage.getItem(KEY_RECENT) || "[]";
    const recent = JSON.parse(recentRaw);
    recent.unshift({
      id: Date.now(),
      user: arr[idx].author,
      action: `Content rejected${reason ? ": " + reason : ""}`,
      time: now(),
    });
    localStorage.setItem(KEY_RECENT, JSON.stringify(recent.slice(0, 50)));
    return arr[idx];
  },

  async getUsers(): Promise<UserItem[]> {
    await delay();
    const raw = localStorage.getItem(KEY_USERS) || "[]";
    return JSON.parse(raw);
  },

  async suspendUser(userIdOrName: string, reason?: string) {
    await delay();
    const raw = localStorage.getItem(KEY_USERS) || "[]";
    const arr: UserItem[] = JSON.parse(raw);
    const idx = arr.findIndex(
      (u) => u.id === userIdOrName || u.username === userIdOrName,
    );
    if (idx === -1) throw new Error("User not found");
    arr[idx].suspended = true;
    arr[idx].suspendReason = reason;
    localStorage.setItem(KEY_USERS, JSON.stringify(arr));
    const recentRaw = localStorage.getItem(KEY_RECENT) || "[]";
    const recent = JSON.parse(recentRaw);
    recent.unshift({
      id: Date.now(),
      user: arr[idx].username,
      action: `Account suspended${reason ? ": " + reason : ""}`,
      time: now(),
    });
    localStorage.setItem(KEY_RECENT, JSON.stringify(recent.slice(0, 50)));
    return arr[idx];
  },

  async unsuspendUser(userIdOrName: string) {
    await delay();
    const raw = localStorage.getItem(KEY_USERS) || "[]";
    const arr: UserItem[] = JSON.parse(raw);
    const idx = arr.findIndex(
      (u) => u.id === userIdOrName || u.username === userIdOrName,
    );
    if (idx === -1) throw new Error("User not found");
    arr[idx].suspended = false;
    arr[idx].suspendReason = undefined;
    localStorage.setItem(KEY_USERS, JSON.stringify(arr));
    const recentRaw = localStorage.getItem(KEY_RECENT) || "[]";
    const recent = JSON.parse(recentRaw);
    recent.unshift({
      id: Date.now(),
      user: arr[idx].username,
      action: `Account unsuspended`,
      time: now(),
    });
    localStorage.setItem(KEY_RECENT, JSON.stringify(recent.slice(0, 50)));
    return arr[idx];
  },

  async getMetrics(): Promise<Metrics> {
    await delay();
    const raw = localStorage.getItem(KEY_METRICS) || "{}";
    return JSON.parse(raw);
  },

  async getRecentActivity() {
    await delay();
    const raw = localStorage.getItem(KEY_RECENT) || "[]";
    return JSON.parse(raw);
  },
};

export default moderationService;
