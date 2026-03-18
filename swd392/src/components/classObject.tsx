import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { Class } from "../types";

interface ClassItemProps {
  cls: Class;
}

export default function ClassItem({ cls }: ClassItemProps) {
  return (
    <Card sx={{ maxWidth: 345, height: "100%" }}>
      <CardMedia
        sx={{ height: 140 }}
        image={cls.img_cover_link || "../public/placeholder.jpg"}
        title={cls.class_name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {cls.class_name}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}
