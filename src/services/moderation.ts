// Simple frontend-only moderation mock service using localStorage
// Exports async functions to simulate API calls. Data persists in localStorage.
import { teacherClasses } from "../../data/teacherMockData";

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

type ClassItem = {
  class_id: string;
  class_name: string;
  teacher_id?: string;
  status?: string;
  img_cover_link?: string;
};

type MaterialItem = {
  material_id: string;
  class_id: string;
  title: string;
  type?: string; // e.g., "slide", "document", "video"
  dateCreate?: string;
  dateUpdate?: string;
  flagged?: boolean;
  description?: string;
  violations?: string[];
  status?: "pending" | "approved" | "rejected";
  is_ai_material?: boolean;
};

type FileItem = {
  file_id: string;
  material_id: string;
  file_name: string;
  file_path?: string;
};

type SlideItem = {
  slide_id: string;
  file_id: string;
  slide_name: string;
  file_path?: string;
};

type Render2D = {
  render_id: string;
  file_id: string;
  render_data: string;
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
const KEY_CLASSES = "mock_moderation_classes";
const KEY_MATERIALS = "mock_moderation_materials";
const KEY_FILES = "mock_moderation_files";
const KEY_SLIDES = "mock_moderation_slides";
const KEY_RENDERS = "mock_moderation_renders";
const KEY_TEACHERS = "mock_moderation_teachers";

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

  if (!localStorage.getItem(KEY_CLASSES)) {
    // Seed classes from shared teacherMockData to keep names/ids consistent across app
    try {
      const classesFromData = (teacherClasses || []).map((c: any) => ({
        class_id: c.class_id,
        class_name: c.class_name,
        teacher_id: c.teacher_id,
        status: c.status,
        img_cover_link: c.img_cover_link,
      }));
      localStorage.setItem(KEY_CLASSES, JSON.stringify(classesFromData));
    } catch (e) {
      // fallback small set
      const classes: ClassItem[] = [
        {
          class_id: "class1",
          class_name: "Lập trình web - K59",
          teacher_id: "t1",
          status: "active",
          img_cover_link: "/sample/class1-cover.jpg",
        },
        {
          class_id: "class2",
          class_name: "Toán rời rạc",
          teacher_id: "t2",
          status: "active",
          img_cover_link: "/sample/class2-cover.jpg",
        },
      ];
      localStorage.setItem(KEY_CLASSES, JSON.stringify(classes));
    }
  }

  if (!localStorage.getItem(KEY_MATERIALS)) {
    const materials: MaterialItem[] = [
      {
        material_id: "m1",
        class_id: "class1",
        title: "Bài giảng 1 - Giới thiệu",
        type: "slide",
        dateCreate: now(),
        flagged: false,
        status: "pending",
        is_ai_material: false,
      },
      {
        material_id: "m2",
        class_id: "class1",
        title: "Đề thi mẫu",
        type: "document",
        dateCreate: now(),
        flagged: true,
        status: "pending",
        is_ai_material: false,
        description:
          "Đề thi giữa kỳ - có khả năng rò rỉ đáp án từ nguồn không chính thức.",
        violations: [
          "Chứa đáp án kiểm tra",
          "Nội dung có thể vi phạm bản quyền",
        ],
      },
      {
        material_id: "m3",
        class_id: "class2",
        title: "Bài tập tự động tạo",
        type: "ai-content",
        dateCreate: now(),
        flagged: true,
        status: "pending",
        is_ai_material: true,
        description:
          "Bài tập được tạo bởi công cụ AI; có nội dung trùng lặp với nguồn công khai.",
        violations: [
          "Nội dung do AI tạo - cần kiểm tra đạo văn",
          "Nội dung không rõ ràng",
        ],
      },
    ];
    localStorage.setItem(KEY_MATERIALS, JSON.stringify(materials));
  }

  if (!localStorage.getItem(KEY_FILES)) {
    const files: FileItem[] = [
      {
        file_id: "f1",
        material_id: "m1",
        file_name: "slides_m1.pdf",
        file_path: "/sample/slides_m1.pdf",
      },
      {
        file_id: "f2",
        material_id: "m2",
        file_name: "exam_sample.docx",
        file_path: "/sample/exam_sample.docx",
      },
    ];
    localStorage.setItem(KEY_FILES, JSON.stringify(files));
  }

  if (!localStorage.getItem(KEY_SLIDES)) {
    const slides: SlideItem[] = [
      {
        slide_id: "s1",
        file_id: "f1",
        slide_name: "Trang 1",
        file_path: "/sample/slide1.png",
      },
    ];
    localStorage.setItem(KEY_SLIDES, JSON.stringify(slides));
  }

  if (!localStorage.getItem(KEY_RENDERS)) {
    const renders: Render2D[] = [
      { render_id: "r1", file_id: "f1", render_data: "{}" },
    ];
    localStorage.setItem(KEY_RENDERS, JSON.stringify(renders));
  }

  if (!localStorage.getItem(KEY_TEACHERS)) {
    // If teacher info exists in teacherClasses, extract unique teacher IDs and create simple profiles.
    try {
      const tSet: Record<string, any> = {};
      (teacherClasses || []).forEach((c: any) => {
        if (c.teacher_id && !tSet[c.teacher_id]) {
          // we don't have detailed teacher profiles here, create a placeholder name
          tSet[c.teacher_id] = {
            id: c.teacher_id,
            name: `Giáo viên ${c.teacher_id}`,
            email: undefined,
          };
        }
      });
      const teachers = Object.values(tSet);
      if (teachers.length === 0) {
        teachers.push({
          id: "t1",
          name: "Nguyễn Văn A",
          email: "t1@example.com",
        });
        teachers.push({
          id: "t2",
          name: "Trần Thị B",
          email: "t2@example.com",
        });
      }
      localStorage.setItem(KEY_TEACHERS, JSON.stringify(teachers));
    } catch (e) {
      const teachers = [
        { id: "t1", name: "Nguyễn Văn A", email: "t1@example.com" },
        { id: "t2", name: "Trần Thị B", email: "t2@example.com" },
      ];
      localStorage.setItem(KEY_TEACHERS, JSON.stringify(teachers));
    }
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
    // Return only items that are still pending review. Optionally filter to
    // show only flagged items when requested.
    return arr.filter(
      (c) => c.status === "pending" && (showOnlyFlagged ? !!c.flagged : true),
    );
  },

  // --- Materials / Classes API ---
  async getClasses(): Promise<ClassItem[]> {
    await delay();
    const raw = localStorage.getItem(KEY_CLASSES) || "[]";
    return JSON.parse(raw);
  },

  async getTeachers(): Promise<
    Array<{ id: string; name: string; email?: string }>
  > {
    await delay();
    const raw = localStorage.getItem(KEY_TEACHERS) || "[]";
    return JSON.parse(raw);
  },

  async getMaterials(
    classId?: string,
    showOnlyFlagged = false,
  ): Promise<MaterialItem[]> {
    await delay();
    const raw = localStorage.getItem(KEY_MATERIALS) || "[]";
    const arr: MaterialItem[] = JSON.parse(raw);
    return arr.filter((m) => {
      if (classId && m.class_id !== classId) return false;
      if (m.status !== "pending") return false;
      if (showOnlyFlagged) return !!m.flagged;
      return true;
    });
  },

  async getMaterialById(id: string): Promise<MaterialItem | null> {
    await delay();
    const raw = localStorage.getItem(KEY_MATERIALS) || "[]";
    const arr: MaterialItem[] = JSON.parse(raw);
    return arr.find((m) => m.material_id === id) ?? null;
  },

  async getFilesForMaterial(materialId: string): Promise<FileItem[]> {
    await delay();
    const raw = localStorage.getItem(KEY_FILES) || "[]";
    const arr: FileItem[] = JSON.parse(raw);
    return arr.filter((f) => f.material_id === materialId);
  },

  async getSlidesForFile(fileId: string): Promise<SlideItem[]> {
    await delay();
    const raw = localStorage.getItem(KEY_SLIDES) || "[]";
    const arr: SlideItem[] = JSON.parse(raw);
    return arr.filter((s) => s.file_id === fileId);
  },

  async getRendersForFile(fileId: string): Promise<Render2D[]> {
    await delay();
    const raw = localStorage.getItem(KEY_RENDERS) || "[]";
    const arr: Render2D[] = JSON.parse(raw);
    return arr.filter((r) => r.file_id === fileId);
  },

  async approveMaterial(id: string) {
    await delay();
    const raw = localStorage.getItem(KEY_MATERIALS) || "[]";
    const arr: MaterialItem[] = JSON.parse(raw);
    const idx = arr.findIndex((m) => m.material_id === id);
    if (idx === -1) throw new Error("Material not found");
    arr[idx].status = "approved";
    arr[idx].flagged = false;
    localStorage.setItem(KEY_MATERIALS, JSON.stringify(arr));
    const recentRaw = localStorage.getItem(KEY_RECENT) || "[]";
    const recent = JSON.parse(recentRaw);
    recent.unshift({
      id: Date.now(),
      user: arr[idx].class_id,
      action: "Material approved",
      time: now(),
    });
    localStorage.setItem(KEY_RECENT, JSON.stringify(recent.slice(0, 50)));
    // Also update metrics.contentsReviewed to reflect material review activity
    try {
      const mRaw = localStorage.getItem(KEY_METRICS) || "{}";
      const metrics: Metrics = JSON.parse(mRaw);
      metrics.contentsReviewed = (metrics.contentsReviewed || 0) + 1;
      localStorage.setItem(KEY_METRICS, JSON.stringify(metrics));
    } catch (e) {
      // ignore metric update failures in mock
      console.warn("Failed to update metrics", e);
    }

    return arr[idx];
  },

  async rejectMaterial(id: string, reason?: string) {
    await delay();
    const raw = localStorage.getItem(KEY_MATERIALS) || "[]";
    const arr: MaterialItem[] = JSON.parse(raw);
    const idx = arr.findIndex((m) => m.material_id === id);
    if (idx === -1) throw new Error("Material not found");
    arr[idx].status = "rejected";
    localStorage.setItem(KEY_MATERIALS, JSON.stringify(arr));
    const recentRaw = localStorage.getItem(KEY_RECENT) || "[]";
    const recent = JSON.parse(recentRaw);
    recent.unshift({
      id: Date.now(),
      user: arr[idx].class_id,
      action: `Material rejected${reason ? ": " + reason : ""}`,
      time: now(),
    });
    localStorage.setItem(KEY_RECENT, JSON.stringify(recent.slice(0, 50)));
    return arr[idx];
  },

  async flagMaterial(id: string, flag = true) {
    await delay();
    const raw = localStorage.getItem(KEY_MATERIALS) || "[]";
    const arr: MaterialItem[] = JSON.parse(raw);
    const idx = arr.findIndex((m) => m.material_id === id);
    if (idx === -1) throw new Error("Material not found");
    arr[idx].flagged = flag;
    localStorage.setItem(KEY_MATERIALS, JSON.stringify(arr));
    const recentRaw = localStorage.getItem(KEY_RECENT) || "[]";
    const recent = JSON.parse(recentRaw);
    recent.unshift({
      id: Date.now(),
      user: arr[idx].class_id,
      action: `Material ${flag ? "flagged" : "unflagged"}`,
      time: now(),
    });
    localStorage.setItem(KEY_RECENT, JSON.stringify(recent.slice(0, 50)));
    return arr[idx];
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
