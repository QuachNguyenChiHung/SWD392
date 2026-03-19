import { Fragment } from "react";
import {
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";

export type FileMaterial = {
  _id: string;
  title: string;
  type: string;
  dateCreate: string;
  status: string;
  class_assign_id: string;
  content_id?: string;
};

type UploadedFileItemProps = {
  file: FileMaterial;
  showDivider: boolean;
  onClick?: () => void;
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "file": return "File";
    case "slide": return "Slide";
    case "2d_render": return "2D Render";
    default: return type;
  }
};

const UploadedFileItem = ({ file, showDivider, onClick }: UploadedFileItemProps) => (
  <Fragment>
    <ListItem
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick ? {
          backgroundColor: "action.hover",
        } : {},
      }}
      secondaryAction={
        <IconButton edge="end">
          <MoreVert />
        </IconButton>
      }
    >
      <ListItemText
        primary={<Typography variant="subtitle2">{file.title}</Typography>}
        secondary={
          <Typography variant="body2" color="text.secondary" component="span">
            {getTypeLabel(file.type)} · {new Date(file.dateCreate).toLocaleDateString()}
          </Typography>
        }
      />
    </ListItem>
    {showDivider && <Divider component="li" />}
  </Fragment>
);

export default UploadedFileItem;
