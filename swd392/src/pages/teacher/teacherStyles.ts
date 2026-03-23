/**
 * Swiss + Flat Design System for Teacher Pages
 * ─────────────────────────────────────────────
 * Swiss: modular grid, strong typographic hierarchy, clean sans-serif
 * Flat:  no depth effects, solid colors, no gradients, minimal animation
 */

import type { SxProps, Theme } from "@mui/material";

// ── Color Tokens ────────────────────────────────────────────────────────────────

export const COLORS = {
  bg: "#F7F7F8",
  card: "#FFFFFF",
  border: "#E0E0E0",
  borderLight: "#EFEFEF",
  textDark: "#1A1A2E",
  textSecondary: "#6B7280",
  accent: "#667eea",
  accentLight: "#EEF0FB",
  success: "#22C55E",
  successBg: "#F0FDF4",
  warning: "#F59E0B",
  warningBg: "#FFFBEB",
  error: "#EF4444",
  errorBg: "#FEF2F2",
  infoBg: "#EFF6FF",
  info: "#3B82F6",
} as const;

// ── Radius ──────────────────────────────────────────────────────────────────────

export const RADIUS = "2px";

// ── Page Layout ─────────────────────────────────────────────────────────────────

export const pageContainer: SxProps<Theme> = {
  maxWidth: 1200,
  mx: "auto",
};

export const pageHeader: SxProps<Theme> = {
  mb: 4,
};

export const pageTitle: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: "1.75rem", md: "2rem" },
  color: COLORS.textDark,
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
};

export const pageSubtitle: SxProps<Theme> = {
  color: COLORS.textSecondary,
  fontSize: "0.95rem",
  mt: 0.5,
  letterSpacing: "0.01em",
};

export const sectionLabel: SxProps<Theme> = {
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: COLORS.textSecondary,
  mb: 0.5,
};

// ── Cards / Paper ───────────────────────────────────────────────────────────────

export const flatCard: SxProps<Theme> = {
  p: 3,
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS,
  boxShadow: "none",
  bgcolor: COLORS.card,
};

export const flatCardAccentLeft: SxProps<Theme> = {
  ...flatCard,
  borderLeft: `3px solid ${COLORS.accent}`,
};

// ── Section Title (inside cards) ────────────────────────────────────────────────

export const sectionTitle: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: COLORS.textDark,
  mb: 2,
};

// ── Tables ──────────────────────────────────────────────────────────────────────

export const tableContainer: SxProps<Theme> = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS,
  boxShadow: "none",
  overflow: "hidden",
};

export const tableHeadRow: SxProps<Theme> = {
  bgcolor: COLORS.bg,
  "& .MuiTableCell-head": {
    fontWeight: 700,
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: COLORS.textSecondary,
    borderBottom: `2px solid ${COLORS.accent}`,
    py: 1.5,
  },
};

export const tableBodyRow: SxProps<Theme> = {
  "&:hover": {
    bgcolor: COLORS.accentLight,
  },
  "& .MuiTableCell-body": {
    fontSize: "0.875rem",
    color: COLORS.textDark,
    py: 1.5,
    borderBottom: `1px solid ${COLORS.borderLight}`,
  },
};

// ── Buttons ─────────────────────────────────────────────────────────────────────

export const flatButton: SxProps<Theme> = {
  borderRadius: RADIUS,
  boxShadow: "none",
  textTransform: "none",
  fontWeight: 600,
  letterSpacing: "0.02em",
  "&:hover": {
    boxShadow: "none",
  },
};

export const flatButtonContained: SxProps<Theme> = {
  ...flatButton,
  bgcolor: COLORS.accent,
  color: "#fff",
  "&:hover": {
    boxShadow: "none",
    bgcolor: "#5a6fd6",
  },
};

export const flatButtonOutlined: SxProps<Theme> = {
  ...flatButton,
  borderColor: COLORS.border,
  color: COLORS.textDark,
  "&:hover": {
    boxShadow: "none",
    borderColor: COLORS.accent,
    bgcolor: COLORS.accentLight,
  },
};

// ── Modals ──────────────────────────────────────────────────────────────────────

export const flatModal: SxProps<Theme> = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS,
  boxShadow: "none",
  p: 4,
  maxHeight: "85vh",
  overflowY: "auto",
};

// ── Chips / Status ──────────────────────────────────────────────────────────────

export const flatChip = (
  bg: string = COLORS.accentLight,
  textColor: string = COLORS.accent,
): SxProps<Theme> => ({
  borderRadius: RADIUS,
  fontWeight: 600,
  fontSize: "0.75rem",
  letterSpacing: "0.03em",
  bgcolor: bg,
  color: textColor,
  border: "none",
  "& .MuiChip-icon": {
    color: textColor,
  },
});

export const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: COLORS.successBg, text: COLORS.success },
  inactive: { bg: COLORS.warningBg, text: COLORS.warning },
  archived: { bg: COLORS.bg, text: COLORS.textSecondary },
  deleted: { bg: COLORS.errorBg, text: COLORS.error },
  published: { bg: COLORS.successBg, text: COLORS.success },
  draft: { bg: COLORS.warningBg, text: COLORS.warning },
  reviewed: { bg: COLORS.infoBg, text: COLORS.info },
};

// ── Tabs ────────────────────────────────────────────────────────────────────────

export const flatTabs: SxProps<Theme> = {
  "& .MuiTabs-indicator": {
    height: 2,
    borderRadius: 0,
    bgcolor: COLORS.accent,
  },
  "& .MuiTab-root": {
    textTransform: "uppercase",
    fontWeight: 700,
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    color: COLORS.textSecondary,
    "&.Mui-selected": {
      color: COLORS.textDark,
    },
  },
};

// ── Stat Card ───────────────────────────────────────────────────────────────────

export const statValue: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: "2rem",
  color: COLORS.textDark,
  lineHeight: 1,
};

export const statLabel: SxProps<Theme> = {
  fontWeight: 600,
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: COLORS.textSecondary,
};

// ── Loading ─────────────────────────────────────────────────────────────────────

export const loadingContainer: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: 300,
};

// ── Chat bubbles (AI Generator) ─────────────────────────────────────────────────

export const chatBubbleUser: SxProps<Theme> = {
  px: 2,
  py: 1,
  borderRadius: RADIUS,
  bgcolor: COLORS.accent,
  color: "#fff",
};

export const chatBubbleAssistant: SxProps<Theme> = {
  px: 2,
  py: 1,
  borderRadius: RADIUS,
  bgcolor: COLORS.bg,
  color: COLORS.textDark,
  border: `1px solid ${COLORS.border}`,
};
