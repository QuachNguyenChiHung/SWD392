import { Paper, Typography } from "@mui/material";
import type { Announcement } from "../../types";

type AnnouncementCardProps = {
  announcement: Announcement;
};

const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography variant="subtitle2">{announcement.title}</Typography>
    <Typography variant="body2" color="text.secondary" mb={1}>
      {announcement.detail}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {announcement.timestamp}
    </Typography>
  </Paper>
);

export default AnnouncementCard;
