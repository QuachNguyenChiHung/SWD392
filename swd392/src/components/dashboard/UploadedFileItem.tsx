import { Fragment } from "react";
import {
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import type { UploadedFileRecord } from "../../types";

type UploadedFileItemProps = {
  file: UploadedFileRecord;
  showDivider: boolean;
};

const UploadedFileItem = ({ file, showDivider }: UploadedFileItemProps) => (
  <Fragment>
    <ListItem
      secondaryAction={
        <IconButton edge="end">
          <MoreVert />
        </IconButton>
      }
    >
      <ListItemText
        primary={<Typography variant="subtitle2">{file.file}</Typography>}
        secondary={
          <Typography variant="body2" color="text.secondary">
            {file.course} · {file.createdAt}
          </Typography>
        }
      />
    </ListItem>
    {showDivider && <Divider component="li" />}
  </Fragment>
);

export default UploadedFileItem;
