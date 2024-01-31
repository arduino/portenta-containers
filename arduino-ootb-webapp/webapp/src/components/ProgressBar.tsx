import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress, {
  LinearProgressProps,
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#58585A",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#DEF154",
  },
}));

export default function ProgressBar(props: LinearProgressProps) {
  return (
    <Box sx={{ flexGrow: 1, padding: "24px 0 12px 0" }}>
      <BorderLinearProgress
        variant={props.value === undefined ? undefined : "determinate"}
        {...props}
      />
    </Box>
  );
}
